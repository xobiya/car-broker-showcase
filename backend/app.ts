import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import { db } from "./db/index";
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  authenticateToken,
  optionalAuth,
  requireRole,
  requireSelfOrAdmin,
  AuthenticatedRequest,
} from "./auth";
import { validate } from "./middleware/validate";
import {
  registerSchema,
  loginSchema,
  vehicleSchema,
  vehicleUpdateSchema,
  userUpdateSchema,
  leadSchema,
  saleSchema,
  testDriveSchema,
  reportSchema,
  documentSchema,
  inspectionSchema,
  changePasswordSchema,
  contactSchema,
  brokerUpdateSchema,
} from "./validators/index";
import { upload, uploadToCloudinary } from "./services/cloudinary";
import {
  sendEmail,
  notifyNewLead,
  notifyListingApproved,
  notifyListingRejected,
} from "./services/notifications";
import { getCached, setCache, clearCache } from "./services/cache";

const app = express();

app.set("trust proxy", 1);

// CORS middleware
const envOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((s) => s.trim())
  : [];
const allowedOrigins = [
  process.env.APP_URL,
  "http://localhost:3000",
  "http://localhost:5173",
  ...envOrigins,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        process.env.NODE_ENV !== "production" ||
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        origin.endsWith(".onrender.com")
      ) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "X-Client-Platform",
    ],
  }),
);

// --- Security Middleware ---
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "https://images.unsplash.com",
          "https://*.unsplash.com",
          "https://res.cloudinary.com",
          "https://*.cloudinary.com",
          "https:",
        ],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "https:", "'unsafe-inline'"],
        fontSrc: ["'self'", "https:", "data:"],
        connectSrc: ["'self'", "https:", "wss:", "ws:"],
      },
    },
    crossOriginEmbedderPolicy: false, // Allow embedding images from external CDNs
  }),
);

// Rate limiting — general API
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests. Please slow down and try again shortly.",
  },
  skip: (req) => !req.path.startsWith("/api/"),
});
app.use(apiLimiter);

// Stricter rate limit for auth endpoints (anti-brute-force)
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many login attempts. Please wait a minute and try again.",
  },
});
app.use("/api/auth", authLimiter);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

// --- Observability: Structured Request Logger ---
app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    const start = Date.now();
    res.on("finish", () => {
      const duration = Date.now() - start;
      const status = res.statusCode;
      const logLevel =
        status >= 500 ? "ERROR" : status >= 400 ? "WARN" : "INFO";
      if (process.env.NODE_ENV !== "test") {
        console.log(
          `[${logLevel}] ${req.method} ${req.originalUrl || req.url} ${status} - ${duration}ms`,
        );
      }
    });
  }
  next();
});

// --- Media Serving Directly from Database ---
app.get("/api/media/:id", async (req, res) => {
  try {
    const media = await db.getMedia(req.params.id);
    if (!media) {
      return res.status(404).json({ error: "Media not found in database." });
    }
    res.setHeader("Content-Type", media.mimetype);
    res.setHeader("Content-Length", media.buffer.length);
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.send(media.buffer);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Database-first fallback for legacy /uploads/:filename URLs
app.get("/uploads/:filename", async (req, res, next) => {
  try {
    const media = await db.getMedia(req.params.filename);
    if (media) {
      res.setHeader("Content-Type", media.mimetype);
      res.setHeader("Content-Length", media.buffer.length);
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      return res.send(media.buffer);
    }
    next();
  } catch {
    next();
  }
});

if (!process.env.VERCEL) {
  app.use("/assets", express.static(path.join(process.cwd(), "assets")));
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
}

// Helper to sanitize regex user input and prevent ReDoS attacks
export function escapeRegex(text: string): string {
  return String(text).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

// Helper to persist base64 data URLs (images and PDF documents) directly into MongoDB
async function persistBase64Media(
  dataUri: string,
  folder = "vehicles",
): Promise<string> {
  if (!dataUri || typeof dataUri !== "string") return dataUri;
  if (
    !dataUri.startsWith("data:image/") &&
    !dataUri.startsWith("data:application/pdf")
  )
    return dataUri;
  try {
    const match = dataUri.match(
      /^data:(image\/[a-zA-Z0-9+.-]+|application\/pdf);base64,(.+)$/,
    );
    if (!match) return dataUri;
    const mimetype = match[1];
    const buffer = Buffer.from(match[2], "base64");
    const rawExt = mimetype.split("/")[1] || "jpg";
    const ext = rawExt.includes("pdf")
      ? "pdf"
      : rawExt.includes("jpeg")
        ? "jpg"
        : rawExt;
    const filename = `${folder}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;
    const url = await db.saveMedia({
      filename,
      mimetype,
      folder,
      buffer,
    });
    return url;
  } catch (err) {
    console.warn("[Media] Failed to persist base64 media into database:", err);
    return dataUri;
  }
}
const persistBase64Image = persistBase64Media;

// --- Status ---
app.get("/api/status", async (req, res) => {
  try {
    const connected = await db.isConnected();
    res.json({
      configured: true,
      dbConnected: connected,
      dbType: "MongoDB",
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- Auth Lifecycle & Token Management ---
const isProduction = process.env.NODE_ENV === "production";

function setAuthCookies(
  res: express.Response,
  user: {
    id: string;
    name: string;
    email: string;
    role: any;
    token_version?: number;
  },
) {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Short-lived access token cookie (15 minutes)
  res.cookie("autobroker_token", accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 15 * 60 * 1000,
  });

  // Long-lived rotating refresh token cookie (7 days) scoped to auth endpoints
  res.cookie("autobroker_refresh_token", refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/api/auth",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return { accessToken, refreshToken };
}

function clearAuthCookies(res: express.Response) {
  res.clearCookie("autobroker_token");
  res.clearCookie("autobroker_refresh_token", { path: "/api/auth" });
}

function isNativeClient(req: express.Request) {
  return req.header("X-Client-Platform") === "native";
}

app.post("/api/auth/register", validate(registerSchema), async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;
    const existing = await db.getUserByEmail(email);
    if (existing) {
      return res
        .status(400)
        .json({ error: "User with this email already exists." });
    }

    const password_hash = await hashPassword(password);
    const newUser = await db.addUser({
      name,
      email,
      password_hash,
      phone: phone || "",
      role,
      token_version: 0,
    });

    const { accessToken, refreshToken } = setAuthCookies(res, newUser);
    const { password_hash: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      user: db.mapUser(userWithoutPassword as any),
      token: accessToken,
      accessToken,
      ...(isNativeClient(req) ? { refreshToken } : {}),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/login", validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.getUserByEmail(email);
    if (!user || !user.password_hash) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const match = await comparePassword(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const { accessToken, refreshToken } = setAuthCookies(res, user);
    const { password_hash: _, ...userWithoutPassword } = user;

    res.json({
      user: db.mapUser(userWithoutPassword as any),
      token: accessToken,
      accessToken,
      ...(isNativeClient(req) ? { refreshToken } : {}),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/refresh", async (req, res) => {
  try {
    const refreshToken =
      req.cookies?.autobroker_refresh_token || req.body?.refreshToken;
    if (!refreshToken) {
      return res
        .status(401)
        .json({ error: "Refresh token required. Please log in." });
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded || !decoded.id) {
      clearAuthCookies(res);
      return res
        .status(401)
        .json({
          error: "Invalid or expired refresh token. Please log in again.",
        });
    }

    const user = await db.getUserById(decoded.id);
    if (!user) {
      clearAuthCookies(res);
      return res.status(401).json({ error: "User account no longer exists." });
    }

    if ((user.token_version ?? 0) !== decoded.tokenVersion) {
      clearAuthCookies(res);
      return res
        .status(401)
        .json({ error: "Session has been invalidated. Please log in again." });
    }

    // Refresh access token & rotate refresh token
    const { accessToken, refreshToken: rotatedRefreshToken } = setAuthCookies(
      res,
      user,
    );
    const { password_hash: _, ...userWithoutPassword } = user;

    res.json({
      user: db.mapUser(userWithoutPassword as any),
      token: accessToken,
      accessToken,
      ...(isNativeClient(req) ? { refreshToken: rotatedRefreshToken } : {}),
    });
  } catch (error: any) {
    clearAuthCookies(res);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/logout", async (req, res) => {
  try {
    const refreshToken =
      req.cookies?.autobroker_refresh_token || req.body?.refreshToken;
    if (refreshToken) {
      const decoded = verifyRefreshToken(refreshToken);
      if (decoded?.id) {
        const user = await db.getUserById(decoded.id);
        if (user) {
          await db.updateUser(user.id, {
            token_version: (user.token_version ?? 0) + 1,
          });
        }
      }
    }
  } catch {
    // Non-fatal, cleanup cookies regardless
  } finally {
    clearAuthCookies(res);
    res.json({ message: "Logged out successfully" });
  }
});

app.post(
  "/api/auth/change-password",
  authenticateToken,
  validate(changePasswordSchema),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await db.getUserById(req.user!.id);
      if (!user || !user.password_hash) {
        return res.status(404).json({ error: "User not found." });
      }

      const match = await comparePassword(currentPassword, user.password_hash);
      if (!match) {
        return res
          .status(401)
          .json({ error: "Current password is incorrect." });
      }

      const password_hash = await hashPassword(newPassword);
      const nextTokenVersion = (user.token_version ?? 0) + 1;
      // Invalidate all existing sessions by bumping token_version
      await db.updateUser(req.user!.id, {
        password_hash,
        token_version: nextTokenVersion,
      });

      // Issue fresh tokens for the current caller
      const updatedUser = { ...user, token_version: nextTokenVersion };
      const { accessToken, refreshToken } = setAuthCookies(res, updatedUser);

      res.json({
        message: "Password changed successfully.",
        token: accessToken,
        accessToken,
        ...(isNativeClient(req) ? { refreshToken } : {}),
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

app.get(
  "/api/auth/me",
  authenticateToken,
  async (req: AuthenticatedRequest, res) => {
    try {
      const user = await db.getUserById(req.user!.id);
      if (!user) return res.status(404).json({ error: "User not found" });
      const { password_hash: _, ...userWithoutPassword } = user;
      res.json({ user: db.mapUser(userWithoutPassword as any) });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

app.post(
  "/api/devices",
  authenticateToken,
  async (req: AuthenticatedRequest, res) => {
    const token =
      typeof req.body?.token === "string" ? req.body.token.trim() : "";
    if (!token || token.length > 512) {
      return res.status(400).json({ error: "A valid push token is required." });
    }
    try {
      const user = await db.getUserById(req.user!.id);
      if (!user) return res.status(404).json({ error: "User not found." });
      const tokens = Array.from(
        new Set([...(user.push_tokens ?? []), token]),
      ).slice(-5);
      await db.updateUser(user.id, { push_tokens: tokens });
      return res.status(204).send();
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  },
);

app.delete(
  "/api/devices",
  authenticateToken,
  async (req: AuthenticatedRequest, res) => {
    try {
      const user = await db.getUserById(req.user!.id);
      if (!user) return res.status(404).json({ error: "User not found." });
      const token = typeof req.body?.token === "string" ? req.body.token : "";
      await db.updateUser(user.id, {
        push_tokens: (user.push_tokens ?? []).filter((item) => item !== token),
      });
      return res.status(204).send();
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  },
);

// --- Vehicles ---
app.get(
  "/api/vehicles",
  optionalAuth,
  async (req: AuthenticatedRequest, res) => {
    try {
      const isUnauthenticated = !req.user;
      const hasQueryParams = Object.keys(req.query).length > 0;
      const publicCacheKey = "vehicles:public:approved";

      if (isUnauthenticated && !hasQueryParams) {
        const cached = getCached<any[]>(publicCacheKey);
        if (cached) return res.json(cached);
      }

      let dbFilter: any = {};
      if (isUnauthenticated) {
        dbFilter = { status: { $in: ["approved", "sold"] } };
      } else if (req.user!.role === "buyer" || req.user!.role === "seller") {
        dbFilter = {
          $or: [
            { status: { $in: ["approved", "sold"] } },
            { broker_id: req.user!.id },
          ],
        };
      } else if (req.user!.role === "broker") {
        const broker = await db.getBrokerByUserId(req.user!.id);
        const brokerId = broker ? broker.id : null;
        dbFilter = brokerId
          ? {
              $or: [
                { status: { $in: ["approved", "sold"] } },
                { broker_id: brokerId },
                { broker_id: req.user!.id },
              ],
            }
          : { status: { $in: ["approved", "sold"] } };
      }

      // Server-side filtering parameters (sanitized against ReDoS)
      if (req.query.status && req.query.status !== "all") {
        const requestedStatus = String(req.query.status);
        if (
          req.user &&
          (req.user.role === "admin" || req.user.role === "broker")
        ) {
          dbFilter.status = requestedStatus;
        }
      }

      if (req.query.brand && req.query.brand !== "Any Brand")
        dbFilter.brand = req.query.brand;
      if (req.query.model && req.query.model !== "Any Model")
        dbFilter.model = req.query.model;
      if (req.query.condition && req.query.condition !== "all")
        dbFilter.condition = req.query.condition;

      const bodyType = req.query.bodyType || req.query.body_type;
      if (bodyType && bodyType !== "Any Type") {
        dbFilter.body_type = {
          $regex: new RegExp(`^${escapeRegex(String(bodyType))}$`, "i"),
        };
      }

      const fuelType = req.query.fuelType || req.query.fuel_type;
      if (fuelType && fuelType !== "Any Fuel") {
        dbFilter.fuel_type = {
          $regex: new RegExp(`^${escapeRegex(String(fuelType))}$`, "i"),
        };
      }

      if (req.query.location && req.query.location !== "Any Location") {
        dbFilter.location = {
          $regex: new RegExp(escapeRegex(String(req.query.location)), "i"),
        };
      }

      if (req.query.year) {
        dbFilter.year = parseInt(req.query.year as string);
      }

      if (req.query.minPrice || req.query.maxPrice) {
        dbFilter.price = dbFilter.price || {};
        if (req.query.minPrice)
          dbFilter.price.$gte = Number(req.query.minPrice);
        if (req.query.maxPrice)
          dbFilter.price.$lte = Number(req.query.maxPrice);
      }

      if (req.query.search) {
        const s = escapeRegex(String(req.query.search).trim());
        const regex = new RegExp(s, "i");
        dbFilter.$or = [
          { brand: regex },
          { model: regex },
          { description: regex },
          { location: regex },
          { body_type: regex },
        ];
      }

      // Server-side pagination & sorting options
      let options: { limit?: number; skip?: number; sort?: any } | undefined;
      const page = parseInt(req.query.page as string);
      const requestedLimit = parseInt(req.query.limit as string);
      const limit =
        Number.isFinite(requestedLimit) && requestedLimit > 0
          ? Math.min(requestedLimit, 50)
          : undefined;
      if (page > 0 && limit) {
        options = { limit, skip: (page - 1) * limit };
      } else if (limit) {
        options = { limit };
      }

      const sortParam = req.query.sort as string;
      if (sortParam) {
        options = options || {};
        if (sortParam === "price_asc") options.sort = { price: 1 };
        else if (sortParam === "price_desc") options.sort = { price: -1 };
        else if (sortParam === "year_desc") options.sort = { year: -1 };
        else if (sortParam === "newest") options.sort = { created_at: -1 };
      }

      const filteredVehicles = await db.getVehicles(dbFilter, options);

      const relevantBrokerIds = Array.from(
        new Set(
          filteredVehicles.map((v) => v.brokerId).filter(Boolean) as string[],
        ),
      );
      const brokers = await db.getBrokersByIds(relevantBrokerIds);
      const relevantUserIds = Array.from(
        new Set([...brokers.map((b) => b.userId), ...relevantBrokerIds]),
      );
      const users = await db.getUsersByIds(relevantUserIds);

      const enriched = filteredVehicles.map((v) => {
        const broker = brokers.find((b) => b.id === v.brokerId);
        const sellerUser = broker
          ? null
          : users.find((u) => u.id === v.brokerId);
        const user = broker
          ? users.find((u) => u.id === broker.userId)
          : sellerUser || null;
        const isOwner =
          req.user &&
          (broker ? broker.userId === req.user.id : v.brokerId === req.user.id);
        const isAdmin = req.user && req.user.role === "admin";
        const isBroker = req.user && req.user.role === "broker";

        const item: any = {
          ...v,
          sellerName: sellerUser
            ? sellerUser.name
            : broker
              ? user?.name || "Broker"
              : "Direct Owner",
          sellerEmail: sellerUser
            ? sellerUser.email
            : broker
              ? user?.email || ""
              : "",
          sellerPhone: sellerUser
            ? sellerUser.phone || v.phone || ""
            : user?.phone || v.phone || "",
          sellerRole: sellerUser
            ? sellerUser.role
            : broker
              ? "broker"
              : "seller",
          brokerName: broker
            ? user?.name || "Unknown Broker"
            : sellerUser?.name
              ? `${sellerUser.name} (Direct Seller)`
              : "Customer Seller",
          brokerPhone: user?.phone || v.phone || "",
          brokerLicense: broker?.licenseNumber || "",
          brokerVerified: broker?.verified || false,
        };

        // Sanitize sensitive info for non-owner, non-admin, non-broker users
        if (!isOwner && !isAdmin && !isBroker) {
          delete item.chassisNumber;
          delete item.commissionRate;
          delete item.rejectionReason;
          delete item.ownershipDocumentUrl;
          delete item.ownershipDocumentName;
        }
        return item;
      });

      if (isUnauthenticated && !hasQueryParams) {
        setCache(publicCacheKey, enriched, 120);
      }

      res.json(enriched);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

app.get(
  "/api/vehicles/:id",
  optionalAuth,
  async (req: AuthenticatedRequest, res) => {
    try {
      const v = await db.getVehicleById(req.params.id);
      if (!v) return res.status(404).json({ error: "Vehicle not found" });

      let broker: any = null;
      let user: any = null;
      let sellerUser: any = null;

      if (v.brokerId) {
        broker = (await db.getBrokersByIds([v.brokerId]))[0] || null;
        if (broker) {
          user = (await db.getUsersByIds([broker.userId]))[0] || null;
        } else {
          sellerUser = (await db.getUsersByIds([v.brokerId]))[0] || null;
          if (sellerUser) {
            user = sellerUser;
          }
        }
      }

      const isOwner =
        req.user &&
        (broker ? broker.userId === req.user.id : v.brokerId === req.user.id);
      const isAdmin = req.user && req.user.role === "admin";

      // Non-owner/non-admin public users can only view approved or sold vehicles
      if (
        !isOwner &&
        !isAdmin &&
        v.status !== "approved" &&
        v.status !== "sold"
      ) {
        return res.status(404).json({ error: "Vehicle not found" });
      }

      const item: any = {
        ...v,
        sellerName: sellerUser
          ? sellerUser.name
          : broker
            ? user?.name || "Broker"
            : "Direct Owner",
        sellerEmail: sellerUser
          ? sellerUser.email
          : broker
            ? user?.email || ""
            : "",
        sellerPhone: sellerUser
          ? sellerUser.phone || v.phone || ""
          : user?.phone || v.phone || "",
        sellerRole: sellerUser ? sellerUser.role : broker ? "broker" : "seller",
        brokerName: broker
          ? user?.name || "Unknown Broker"
          : sellerUser?.name
            ? `${sellerUser.name} (Direct Seller)`
            : "Customer Seller",
        brokerPhone: user?.phone || v.phone || "",
        brokerLicense: broker?.licenseNumber || "",
        brokerVerified: broker?.verified || false,
      };

      const isBroker = req.user && req.user.role === "broker";

      if (!isOwner && !isAdmin && !isBroker) {
        delete item.chassisNumber;
        delete item.commissionRate;
        delete item.rejectionReason;
        delete item.ownershipDocumentUrl;
        delete item.ownershipDocumentName;
      }

      res.json(item);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

app.post(
  "/api/vehicles",
  authenticateToken,
  requireRole(["broker", "seller", "buyer", "admin"]),
  validate(vehicleSchema),
  async (req: AuthenticatedRequest, res) => {
    try {
      let brokerId = req.body.broker_id;

      if (req.user!.role === "broker") {
        const broker = await db.getBrokerByUserId(req.user!.id);
        if (!broker)
          return res
            .status(403)
            .json({
              error:
                "Broker profile not found. Complete your profile registration first.",
            });
        brokerId = broker.id;
      } else if (req.user!.role === "seller" || req.user!.role === "buyer") {
        brokerId = req.user!.id;
      } else if (req.user!.role === "admin" && !brokerId) {
        brokerId = "brk-1";
      }

      let finalImageUrl = req.body.image_url;
      if (finalImageUrl && finalImageUrl.startsWith("data:image/")) {
        finalImageUrl = await persistBase64Image(finalImageUrl, "vehicles");
      }

      let finalGallery: string[] | undefined = undefined;
      if (req.body.gallery_images) {
        try {
          const raw =
            typeof req.body.gallery_images === "string"
              ? JSON.parse(req.body.gallery_images)
              : req.body.gallery_images;
          if (Array.isArray(raw) && raw.length > 0) {
            finalGallery = await Promise.all(
              raw.map((img: string) => persistBase64Image(img, "vehicles")),
            );
          }
        } catch {}
      } else if (
        Array.isArray(req.body.gallery) &&
        req.body.gallery.length > 0
      ) {
        finalGallery = await Promise.all(
          req.body.gallery.map((img: string) =>
            persistBase64Image(img, "vehicles"),
          ),
        );
      }

      let finalOwnershipDoc = req.body.ownership_document_url;
      if (finalOwnershipDoc && finalOwnershipDoc.startsWith("data:")) {
        finalOwnershipDoc = await persistBase64Image(
          finalOwnershipDoc,
          "documents",
        );
      }
      const ownershipDocName =
        req.body.ownership_document_name || "Ownership Certificate (Libre)";

      // Customer listings (buyer/seller/broker) default to pending approval by admin
      const initialStatus:
        "draft" | "pending" | "approved" | "rejected" | "sold" =
        req.user!.role === "admin" ? req.body.status || "approved" : "pending";

      const newVehicle = await db.addVehicle({
        broker_id: brokerId,
        brand: req.body.brand,
        model: req.body.model,
        year: parseInt(req.body.year),
        mileage: parseInt(req.body.mileage) || 0,
        price: parseFloat(req.body.price),
        original_price: parseFloat(req.body.original_price || req.body.price),
        image_url:
          finalImageUrl ||
          "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
        description: req.body.description || "",
        fuel_type: req.body.fuel_type || "Benzine",
        transmission: req.body.transmission || "Automatic",
        location: req.body.location || "Addis Ababa",
        condition: req.body.condition,
        body_type: req.body.body_type,
        drive_type: req.body.drive_type,
        color: req.body.color,
        doors: req.body.doors,
        seats: req.body.seats,
        engine_size: req.body.engine_size,
        engine_type: req.body.engine_type,
        horsepower: req.body.horsepower,
        chassis_number: req.body.chassis_number,
        commission_rate: req.body.commission_rate,
        commission_type: req.body.commission_type,
        video_url: req.body.video_url,
        gallery: finalGallery,
        cover_photo_index: req.body.cover_photo_index,
        ownership_document_url: finalOwnershipDoc,
        ownership_document_name: ownershipDocName,
        status: initialStatus,
      });

      if (finalOwnershipDoc) {
        try {
          await db.addDocument({
            vehicle_id: newVehicle.id,
            name: ownershipDocName,
            type: "title",
            file_url: finalOwnershipDoc,
          });
        } catch (docErr) {
          console.warn("[Document] Auto-link notice:", docErr);
        }
      }

      if (initialStatus === "pending") {
        try {
          await db.addAuditLog({
            action: "listing_submitted",
            admin_id: req.user!.id,
            admin_name: req.user!.name || "Customer",
            target_type: "vehicle",
            target_id: newVehicle.id,
            details: `New listing submitted by ${req.user!.name || "Customer"} (${req.user!.email || ""}): ${newVehicle.brand} ${newVehicle.model} (${newVehicle.year}) awaiting admin review.`,
          });
        } catch (logErr) {
          console.warn("[AuditLog] Failed to record submission log:", logErr);
        }
      }

      clearCache("vehicles");
      res.status(201).json(newVehicle);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Helper checking vehicle ownership
const verifyVehicleOwnership = async (vehicleId: string, reqUser: any) => {
  if (!reqUser) return false;
  if (reqUser.role === "admin") return true;
  if (!vehicleId || vehicleId === "general-inquiry") return false;
  const vehicle = await db.getVehicleById(vehicleId);
  if (!vehicle) return false;
  if (reqUser.role === "seller" || reqUser.role === "buyer") {
    return vehicle.brokerId === reqUser.id;
  }
  const broker = await db.getBrokerByUserId(reqUser.id);
  return !!broker && broker.id === vehicle.brokerId;
};

app.put(
  "/api/vehicles/:id",
  authenticateToken,
  validate(vehicleUpdateSchema),
  async (req: AuthenticatedRequest, res) => {
    try {
      const isOwnerOrAdmin = await verifyVehicleOwnership(
        req.params.id,
        req.user!,
      );
      if (!isOwnerOrAdmin) {
        return res
          .status(403)
          .json({
            error: "Access denied. You do not own this vehicle listing.",
          });
      }

      const updates = { ...req.body };
      if (
        updates.image_url &&
        typeof updates.image_url === "string" &&
        updates.image_url.startsWith("data:image/")
      ) {
        updates.image_url = await persistBase64Image(
          updates.image_url,
          "vehicles",
        );
      }
      if (updates.gallery_images) {
        try {
          const raw =
            typeof updates.gallery_images === "string"
              ? JSON.parse(updates.gallery_images)
              : updates.gallery_images;
          if (Array.isArray(raw) && raw.length > 0) {
            updates.gallery = await Promise.all(
              raw.map((img: string) => persistBase64Image(img, "vehicles")),
            );
          }
        } catch {}
        delete updates.gallery_images;
      } else if (Array.isArray(updates.gallery) && updates.gallery.length > 0) {
        updates.gallery = await Promise.all(
          updates.gallery.map((img: string) =>
            persistBase64Image(img, "vehicles"),
          ),
        );
      }

      // Non-admins cannot alter system approval status, rejection reasons, or broker assignment
      if (req.user!.role !== "admin") {
        delete updates.status;
        delete updates.rejection_reason;
        delete updates.rejectionReason;
        delete updates.broker_id;
        delete updates.brokerId;
        delete updates.inspection_status;
        delete updates.inspection_notes;
        delete updates.inspection_date;
      }

      const success = await db.updateVehicle(req.params.id, updates);
      if (success) {
        clearCache("vehicles");
        res.json({ message: "Vehicle updated successfully" });
      } else {
        res.status(404).json({ error: "Vehicle not found" });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

app.delete(
  "/api/vehicles/:id",
  authenticateToken,
  async (req: AuthenticatedRequest, res) => {
    try {
      const isOwnerOrAdmin = await verifyVehicleOwnership(
        req.params.id,
        req.user!,
      );
      if (!isOwnerOrAdmin) {
        return res
          .status(403)
          .json({
            error: "Access denied. You do not own this vehicle listing.",
          });
      }

      const success = await db.deleteVehicle(req.params.id);
      if (success) {
        clearCache("vehicles");
        res.json({ message: "Vehicle deleted successfully" });
      } else {
        res.status(404).json({ error: "Vehicle not found" });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

app.put(
  "/api/vehicles/:id/approve",
  authenticateToken,
  requireRole(["admin", "broker"]),
  async (req: AuthenticatedRequest, res) => {
    try {
      const success = await db.updateVehicle(req.params.id, {
        status: "approved",
      });
      if (success) {
        await db.addAuditLog({
          action: "approve_listing",
          admin_id: req.user!.id,
          admin_name: req.user!.name,
          target_type: "vehicle",
          target_id: req.params.id,
          details: `Approved vehicle listing by ${req.user!.role}`,
        });
        clearCache("vehicles");
        const vehicle = await db.getVehicleById(req.params.id);
        if (vehicle) {
          const broker = (await db.getBrokersByIds([vehicle.brokerId]))[0];
          if (broker) {
            const brokerUser = await db.getUserById(broker.userId);
            if (brokerUser?.email) {
              notifyListingApproved(
                vehicle.brand,
                vehicle.model,
                brokerUser.email,
              );
            }
          } else {
            const customerUser = await db.getUserById(vehicle.brokerId);
            if (customerUser?.email) {
              notifyListingApproved(
                vehicle.brand,
                vehicle.model,
                customerUser.email,
              );
            }
          }
        }
        res.json({ message: "Vehicle approved successfully" });
      } else {
        res.status(404).json({ error: "Vehicle not found" });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

app.put(
  "/api/vehicles/:id/reject",
  authenticateToken,
  requireRole(["admin", "broker"]),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { reason } = req.body;
      const success = await db.updateVehicle(req.params.id, {
        status: "rejected",
        rejection_reason: reason || "",
      });
      if (success) {
        await db.addAuditLog({
          action: "reject_listing",
          admin_id: req.user!.id,
          admin_name: req.user!.name,
          target_type: "vehicle",
          target_id: req.params.id,
          details: `Rejected listing: ${reason || "No reason specified"}`,
        });
        clearCache("vehicles");
        const vehicle = await db.getVehicleById(req.params.id);
        if (vehicle) {
          const broker = (await db.getBrokersByIds([vehicle.brokerId]))[0];
          if (broker) {
            const brokerUser = await db.getUserById(broker.userId);
            if (brokerUser?.email) {
              notifyListingRejected(
                vehicle.brand,
                vehicle.model,
                reason || "No reason specified",
                brokerUser.email,
              );
            }
          } else {
            const customerUser = await db.getUserById(vehicle.brokerId);
            if (customerUser?.email) {
              notifyListingRejected(
                vehicle.brand,
                vehicle.model,
                reason || "No reason specified",
                customerUser.email,
              );
            }
          }
        }
        res.json({ message: "Vehicle rejected" });
      } else {
        res.status(404).json({ error: "Vehicle not found" });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

app.put(
  "/api/vehicles/:id/submit",
  authenticateToken,
  async (req: AuthenticatedRequest, res) => {
    try {
      const isOwnerOrAdmin = await verifyVehicleOwnership(
        req.params.id,
        req.user!,
      );
      if (!isOwnerOrAdmin) {
        return res
          .status(403)
          .json({
            error: "Access denied. You do not own this vehicle listing.",
          });
      }

      const success = await db.updateVehicle(req.params.id, {
        status: "pending",
      });
      if (success) {
        clearCache("vehicles");
        res.json({ message: "Vehicle submitted for approval" });
      } else {
        res.status(404).json({ error: "Vehicle not found" });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// --- Leads ---
app.get(
  "/api/leads",
  authenticateToken,
  requireRole(["broker", "seller", "buyer", "admin"]),
  async (req: AuthenticatedRequest, res) => {
    try {
      let filteredLeads: any[] = [];

      if (req.user!.role === "broker") {
        const broker = await db.getBrokerByUserId(req.user!.id);
        const brokerId = broker ? broker.id : null;
        if (!brokerId) return res.json([]);
        const brokerVehicles = await db.getVehicles({ broker_id: brokerId });
        const vehicleIds = brokerVehicles.map((v) => v.id);
        filteredLeads = await db.getLeads({ vehicle_id: { $in: vehicleIds } });
      } else if (req.user!.role === "seller" || req.user!.role === "buyer") {
        const customerVehicles = await db.getVehicles({
          broker_id: req.user!.id,
        });
        const vehicleIds = customerVehicles.map((v) => v.id);
        filteredLeads = await db.getLeads({
          $or: [
            { vehicle_id: { $in: vehicleIds } },
            { buyer_id: req.user!.id },
          ],
        });
      } else {
        filteredLeads = await db.getLeads();
      }

      const leadVehicleIds = Array.from(
        new Set(filteredLeads.map((l) => l.vehicleId).filter(Boolean)),
      );
      const relevantVehicles =
        leadVehicleIds.length > 0
          ? await db.getVehicles({ id: { $in: leadVehicleIds } })
          : [];

      const enriched = filteredLeads.map((l) => {
        const v = relevantVehicles.find((veh) => veh.id === l.vehicleId);
        return {
          ...l,
          vehicleBrand: v?.brand || "Archived Vehicle",
          vehicleModel: v?.model || "",
          vehiclePrice: v?.price || 0,
        };
      });

      res.json(enriched);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

app.post(
  "/api/leads",
  optionalAuth,
  validate(leadSchema),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { vehicle_id, buyer_name, buyer_email, buyer_phone, message } =
        req.body;
      const buyer_id = req.user ? req.user.id : null;

      const vehicle = await db.getVehicleById(vehicle_id);
      if (!vehicle) {
        return res.status(404).json({ error: "Vehicle listing not found." });
      }

      const broker = (await db.getBrokersByIds([vehicle.brokerId]))[0];
      if (broker) {
        const brokerUser = await db.getUserById(broker.userId);
        if (brokerUser?.email) {
          notifyNewLead(
            {
              buyerName: buyer_name,
              buyerEmail: buyer_email,
              vehicleBrand: vehicle.brand,
              vehicleModel: vehicle.model,
            },
            brokerUser.email,
          );
        }
      }

      const newLead = await db.addLead({
        vehicle_id,
        buyer_id,
        buyer_name,
        buyer_email,
        buyer_phone,
        message: message || "",
      });
      res.status(201).json(newLead);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

app.put(
  "/api/leads/:id/status",
  authenticateToken,
  requireRole(["broker", "seller", "buyer", "admin"]),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { status } = req.body;
      if (!status)
        return res.status(400).json({ error: "Status is required." });

      const lead = await db.getLeadById(req.params.id);
      if (!lead) return res.status(404).json({ error: "Lead not found." });

      const isOwnerOrAdmin = await verifyVehicleOwnership(
        lead.vehicleId,
        req.user!,
      );
      if (!isOwnerOrAdmin) {
        return res
          .status(403)
          .json({
            error:
              "Access denied. You do not own the vehicle associated with this lead.",
          });
      }

      const success = await db.updateLeadStatus(req.params.id, status);
      if (success) res.json({ message: "Lead status updated" });
      else res.status(404).json({ error: "Lead not found" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// --- General Contact Inquiries ---
app.post(
  "/api/contact",
  optionalAuth,
  validate(contactSchema),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { name, phone, email, topic, vehicleRef, message } = req.body;

      const lead = await db.addLead({
        vehicle_id: vehicleRef || "general-inquiry",
        buyer_id: req.user ? req.user.id : null,
        buyer_name: name,
        buyer_email: email || "inquiry@autobroker.et",
        buyer_phone: phone || "",
        message: `[Topic: ${topic || "General"}] ${message || "No message provided."}`,
      });

      res
        .status(201)
        .json({
          message:
            "Inquiry received. Our concierge team will reach out shortly.",
          lead,
        });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// --- Sales ---
app.get(
  "/api/sales",
  authenticateToken,
  requireRole(["broker", "admin"]),
  async (req: AuthenticatedRequest, res) => {
    try {
      let sales: any[] = [];

      if (req.user!.role === "broker") {
        const broker = await db.getBrokerByUserId(req.user!.id);
        const brokerId = broker ? broker.id : null;
        if (!brokerId) return res.json([]);
        sales = await db.getSales({ broker_id: brokerId });
      } else {
        sales = await db.getSales();
      }

      const saleVehicleIds = Array.from(
        new Set(sales.map((s) => s.vehicleId).filter(Boolean)),
      );
      const relevantVehicles =
        saleVehicleIds.length > 0
          ? await db.getVehicles({ id: { $in: saleVehicleIds } })
          : [];

      const enriched = sales.map((s) => {
        const v = relevantVehicles.find((veh) => veh.id === s.vehicleId);
        return { ...s, vehicleBrand: v?.brand, vehicleModel: v?.model };
      });
      res.json(enriched);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

app.post(
  "/api/sales",
  authenticateToken,
  requireRole(["broker", "admin"]),
  validate(saleSchema),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { vehicle_id, sale_price, commission, buyer_name, leadId } =
        req.body;

      const isOwnerOrAdmin = await verifyVehicleOwnership(
        vehicle_id,
        req.user!,
      );
      if (!isOwnerOrAdmin) {
        return res
          .status(403)
          .json({ error: "Access denied. You do not own this vehicle." });
      }

      const vehicle = await db.getVehicleById(vehicle_id);
      if (!vehicle)
        return res.status(404).json({ error: "Vehicle not found." });

      const newSale = await db.addSale({
        vehicle_id,
        broker_id: vehicle.brokerId,
        buyer_id: null,
        sale_price: parseFloat(sale_price),
        commission: parseFloat(commission),
        buyer_name: buyer_name || "",
      });

      await db.updateVehicle(vehicle_id, { status: "sold" });
      clearCache("vehicles");
      if (leadId) {
        const targetLead = await db.getLeadById(leadId);
        if (targetLead && targetLead.vehicleId === vehicle_id) {
          await db.updateLeadStatus(leadId, "sold");
        }
      }

      res.status(201).json(newSale);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// --- Payments & Commissions ---
app.get(
  "/api/payments",
  authenticateToken,
  requireRole(["broker", "admin"]),
  async (req: AuthenticatedRequest, res) => {
    try {
      let brokerId: string | undefined;
      if (req.user!.role === "broker") {
        const me = await db.getBrokerByUserId(req.user!.id);
        if (!me) {
          return res.status(403).json({ error: "Broker profile not found." });
        }
        brokerId = me.id;
      } else {
        brokerId = req.query.brokerId as string | undefined;
      }
      const payments = await db.getPayments(brokerId);
      res.json(payments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

app.post("/api/commissions/calculate", authenticateToken, async (req, res) => {
  try {
    const { sale_price, commission_rate, commission_type } = req.body;
    if (!sale_price || !commission_rate) {
      return res
        .status(400)
        .json({ error: "sale_price and commission_rate are required." });
    }
    const result = db.calculateCommission(
      parseFloat(sale_price),
      parseFloat(commission_rate),
      commission_type || "percentage",
    );
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- Brokers ---
app.get("/api/brokers", async (req, res) => {
  try {
    const [brokers, users] = await Promise.all([
      db.getBrokers(),
      db.getUsers(),
    ]);
    const enriched = brokers.map((b) => {
      const user = users.find((u) => u.id === b.userId);
      return {
        id: b.id,
        userId: b.userId,
        name: user?.name || "Unknown Broker",
        email: user?.email || "",
        phone: user?.phone || "",
        avatar: user?.avatar || "",
        bio: b.bio || user?.bio || "",
        licenseNumber: b.licenseNumber,
        verified: b.verified || false,
        joinDate: user?.joinDate || "",
      };
    });
    res.json(enriched);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/brokers/:id", async (req, res) => {
  try {
    const brokers = await db.getBrokers();
    const broker = brokers.find((b) => b.id === req.params.id);
    if (!broker) return res.status(404).json({ error: "Broker not found" });
    const users = await db.getUsers();
    const user = users.find((u) => u.id === broker.userId);
    res.json({
      id: broker.id,
      userId: broker.userId,
      name: user?.name || "Unknown Broker",
      email: user?.email || "",
      phone: user?.phone || "",
      avatar: user?.avatar || "",
      bio: broker.bio || user?.bio || "",
      licenseNumber: broker.licenseNumber,
      verified: broker.verified || false,
      joinDate: user?.joinDate || "",
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put(
  "/api/brokers/:id",
  authenticateToken,
  validate(brokerUpdateSchema),
  async (req: AuthenticatedRequest, res) => {
    try {
      const broker = await db.getBrokerById(req.params.id);
      if (!broker)
        return res.status(404).json({ error: "Broker profile not found." });

      if (req.user!.role !== "admin" && broker.userId !== req.user!.id) {
        return res
          .status(403)
          .json({
            error: "Access denied. You cannot modify another broker's profile.",
          });
      }

      const updates = { ...req.body };
      if (
        updates.avatar &&
        typeof updates.avatar === "string" &&
        updates.avatar.startsWith("data:image/")
      ) {
        updates.avatar = await persistBase64Image(updates.avatar, "avatars");
      }
      if (req.user!.role !== "admin") {
        delete updates.verified;
        delete updates.userId;
        delete updates.id;
      }

      const success = await db.updateBroker(req.params.id, updates);
      res.json({ success });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Admin: Approve/Verify a broker
app.put(
  "/api/brokers/:id/approve",
  authenticateToken,
  requireRole(["admin"]),
  async (req: AuthenticatedRequest, res) => {
    try {
      const broker = await db.getBrokerById(req.params.id);
      if (!broker) return res.status(404).json({ error: "Broker not found." });

      const success = await db.updateBroker(req.params.id, { verified: true });
      if (success) {
        res.json({ message: "Broker approved and verified successfully." });
      } else {
        res.status(500).json({ error: "Failed to approve broker." });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Admin: Reject/Suspend a broker
app.put(
  "/api/brokers/:id/reject",
  authenticateToken,
  requireRole(["admin"]),
  async (req: AuthenticatedRequest, res) => {
    try {
      const broker = await db.getBrokerById(req.params.id);
      if (!broker) return res.status(404).json({ error: "Broker not found." });

      const success = await db.updateBroker(req.params.id, { verified: false });
      if (success) {
        res.json({ message: "Broker verification revoked." });
      } else {
        res.status(500).json({ error: "Failed to update broker status." });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// --- Users ---
app.get(
  "/api/users",
  authenticateToken,
  requireRole(["admin"]),
  async (req, res) => {
    try {
      const users = await db.getUsers();
      const sanitised = users.map((u) => {
        const { password_hash: _, ...userWithoutPassword } = u as any;
        return userWithoutPassword;
      });
      res.json(sanitised);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

app.get(
  "/api/users/:id",
  authenticateToken,
  requireSelfOrAdmin("id"),
  async (req, res) => {
    try {
      const user = await db.getUserById(req.params.id);
      if (!user) return res.status(404).json({ error: "User not found" });
      const { password_hash: _, ...userWithoutPassword } = user as any;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

app.put(
  "/api/users/:id",
  authenticateToken,
  requireSelfOrAdmin("id"),
  validate(userUpdateSchema),
  async (req: AuthenticatedRequest, res) => {
    try {
      const allowedUpdates: Record<string, any> = {};
      if (req.body.name !== undefined) allowedUpdates.name = req.body.name;
      if (req.body.phone !== undefined) allowedUpdates.phone = req.body.phone;
      if (req.body.bio !== undefined) allowedUpdates.bio = req.body.bio;
      if (req.body.avatar !== undefined) {
        let avatar = req.body.avatar;
        if (typeof avatar === "string" && avatar.startsWith("data:image/")) {
          avatar = await persistBase64Image(avatar, "avatars");
        }
        allowedUpdates.avatar = avatar;
      }

      // Only administrative accounts can alter role or verification status
      if (req.user!.role === "admin") {
        if (req.body.role !== undefined) allowedUpdates.role = req.body.role;
        if (req.body.verified !== undefined)
          allowedUpdates.verified = req.body.verified;
        if (req.body.verification_status !== undefined)
          allowedUpdates.verification_status = req.body.verification_status;
      }

      const success = await db.updateUser(req.params.id, allowedUpdates);
      if (success) {
        const u = await db.getUserById(req.params.id);
        const { password_hash: _, ...userWithoutPassword } = u as any;
        res.json(userWithoutPassword);
      } else {
        res.status(404).json({ error: "User not found" });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

app.delete(
  "/api/users/:id",
  authenticateToken,
  requireSelfOrAdmin("id"),
  async (req: AuthenticatedRequest, res) => {
    try {
      const success = await db.deleteUser(req.params.id);
      if (success) {
        if (req.user?.id === req.params.id) {
          res.clearCookie("autobroker_token");
        }
        res.json({ message: "User account deleted successfully." });
      } else {
        res.status(404).json({ error: "User not found" });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// --- Stats ---
app.get(
  "/api/stats",
  authenticateToken,
  requireRole(["admin"]),
  async (req, res) => {
    try {
      res.json(await db.getStats());
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// Public Marketplace Stats for Homepage & Marketing
app.get("/api/stats/public", async (_req, res) => {
  try {
    const stats = await db.getStats();
    res.json({
      totalVehicles: stats.totals.approvedVehicles || stats.totals.vehicles,
      totalBrokers: stats.totals.brokers,
      totalSales: stats.totals.sales,
      totalUsers: stats.totals.users,
      clearanceRate: "99.4%",
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Dynamic Brand Catalog aggregated from Database Listings
app.get("/api/brands", async (_req, res) => {
  try {
    const vehicles = await db.getVehicles({
      status: { $in: ["approved", "sold"] },
    });
    const brandMap: Record<string, { count: number; models: Set<string> }> = {};
    vehicles.forEach((v) => {
      if (!v.brand) return;
      if (!brandMap[v.brand])
        brandMap[v.brand] = { count: 0, models: new Set() };
      brandMap[v.brand].count++;
      if (v.model) brandMap[v.brand].models.add(v.model);
    });
    const brands = Object.entries(brandMap)
      .map(([name, data]) => ({
        name,
        count: `${data.count} ${data.count === 1 ? "Car" : "Cars"}`,
        tagline: Array.from(data.models).slice(0, 3).join(", "),
      }))
      .sort((a, b) => parseInt(b.count) - parseInt(a.count));
    res.json(brands);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Audit Logs ---
app.get(
  "/api/audit-logs",
  authenticateToken,
  requireRole(["admin"]),
  async (req, res) => {
    try {
      res.json(await db.getAuditLogs());
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

app.post(
  "/api/audit-logs",
  authenticateToken,
  requireRole(["admin"]),
  async (req: AuthenticatedRequest, res) => {
    try {
      const log = await db.addAuditLog({
        action: req.body.action,
        admin_id: req.user!.id,
        admin_name: req.user!.name,
        target_type: req.body.target_type,
        target_id: req.body.target_id,
        details: req.body.details || "",
      });
      res.status(201).json(log);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// --- Documents ---
app.get(
  "/api/documents",
  authenticateToken,
  async (req: AuthenticatedRequest, res) => {
    try {
      const vehicleId = req.query.vehicleId as string | undefined;
      if (!vehicleId)
        return res
          .status(400)
          .json({ error: "vehicleId query param is required." });

      const isOwnerOrAdmin = await verifyVehicleOwnership(vehicleId, req.user!);
      if (!isOwnerOrAdmin) {
        return res
          .status(403)
          .json({ error: "Access denied. You do not own this vehicle." });
      }

      const docs = await db.getDocuments(vehicleId);
      res.json(docs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

app.post(
  "/api/documents",
  authenticateToken,
  validate(documentSchema),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { vehicle_id, name, type, file_url } = req.body;

      const isOwnerOrAdmin = await verifyVehicleOwnership(
        vehicle_id,
        req.user!,
      );
      if (!isOwnerOrAdmin) {
        return res
          .status(403)
          .json({ error: "Access denied. You do not own this vehicle." });
      }

      let finalFileUrl = file_url;
      if (
        finalFileUrl &&
        typeof finalFileUrl === "string" &&
        finalFileUrl.startsWith("data:")
      ) {
        finalFileUrl = await persistBase64Image(finalFileUrl, "documents");
      }

      const doc = await db.addDocument({
        vehicle_id,
        name,
        type,
        file_url: finalFileUrl,
      });
      res.status(201).json(doc);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

app.delete(
  "/api/documents/:id",
  authenticateToken,
  async (req: AuthenticatedRequest, res) => {
    try {
      const all = await db.getDocuments();
      const doc = all.find((d) => d.id === req.params.id);
      if (!doc) return res.status(404).json({ error: "Document not found." });

      const isOwnerOrAdmin = await verifyVehicleOwnership(
        doc.vehicleId,
        req.user!,
      );
      if (!isOwnerOrAdmin) {
        return res
          .status(403)
          .json({
            error:
              "Access denied. You do not own the vehicle associated with this document.",
          });
      }

      const success = await db.deleteDocument(req.params.id);
      if (success) res.json({ message: "Document deleted" });
      else res.status(404).json({ error: "Document not found" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// --- Inspections ---
app.get(
  "/api/inspections",
  authenticateToken,
  async (req: AuthenticatedRequest, res) => {
    try {
      const vehicleId = req.query.vehicleId as string | undefined;
      if (!vehicleId)
        return res
          .status(400)
          .json({ error: "vehicleId query param is required." });

      const isOwnerOrAdmin = await verifyVehicleOwnership(vehicleId, req.user!);
      if (!isOwnerOrAdmin) {
        return res
          .status(403)
          .json({
            error:
              "Access denied. You do not have permissions to view this inspection record.",
          });
      }

      const inspections = await db.getInspections(vehicleId);
      res.json(inspections);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

app.post(
  "/api/inspections",
  authenticateToken,
  requireRole(["admin"]),
  validate(inspectionSchema),
  async (req, res) => {
    try {
      const { vehicle_id, inspector_name, status, notes } = req.body;
      const inspection = await db.addInspection({
        vehicle_id,
        inspector_name,
        status,
        notes: notes || "",
      });
      await db.updateVehicle(vehicle_id, {
        inspection_status: status,
        inspection_notes: notes || "",
        inspection_date: inspection.inspectedAt,
      });
      clearCache("vehicles");
      res.status(201).json(inspection);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

app.put(
  "/api/inspections/:id",
  authenticateToken,
  requireRole(["admin"]),
  async (req, res) => {
    try {
      const success = await db.updateInspection(req.params.id, req.body);
      if (success) res.json({ message: "Inspection updated" });
      else res.status(404).json({ error: "Inspection not found" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// --- Upload (Stored directly in MongoDB Database) ---
app.post(
  "/api/upload",
  authenticateToken,
  upload.single("file"),
  async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.file)
        return res.status(400).json({ error: "No file provided." });
      const folder = (req.body.folder as string) || "autobroker";
      const url = await uploadToCloudinary(
        req.file.buffer,
        folder,
        undefined,
        req.file.mimetype,
        req.file.originalname,
      );
      res.json({ url, filename: req.file.originalname });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

app.post(
  "/api/upload/multiple",
  authenticateToken,
  upload.array("files", 5),
  async (req: AuthenticatedRequest, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0)
        return res.status(400).json({ error: "No files provided." });
      const folder = (req.body.folder as string) || "autobroker";
      const urls = await Promise.all(
        files.map((f) =>
          uploadToCloudinary(
            f.buffer,
            folder,
            undefined,
            f.mimetype,
            f.originalname,
          ),
        ),
      );
      res.json({ urls });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// --- Saved Vehicles ---
app.get(
  "/api/saved-vehicles",
  authenticateToken,
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId)
        return res
          .status(400)
          .json({ error: "userId query param is required." });

      if (req.user!.role !== "admin" && userId !== req.user!.id) {
        return res
          .status(403)
          .json({
            error: "Access denied. You can only view your own saved vehicles.",
          });
      }

      const items = await db.getSavedVehicles(userId);
      const vehicleIds = items.map((s) => s.vehicleId);
      const vehicles =
        vehicleIds.length > 0
          ? await db.getVehicles({ id: { $in: vehicleIds } })
          : [];
      const enriched = items
        .map((s) => ({
          ...s,
          vehicle: vehicles.find((v) => v.id === s.vehicleId),
        }))
        .filter((s) => s.vehicle !== undefined);

      res.json(enriched);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

app.post(
  "/api/saved-vehicles",
  authenticateToken,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { userId, vehicleId } = req.body;
      if (!userId || !vehicleId)
        return res
          .status(400)
          .json({ error: "userId and vehicleId are required." });

      if (req.user!.role !== "admin" && userId !== req.user!.id) {
        return res.status(403).json({ error: "Access denied." });
      }

      const existing = await db.isVehicleSaved(userId, vehicleId);
      if (existing)
        return res.status(409).json({ error: "Vehicle already saved." });

      const item = await db.addSavedVehicle(userId, vehicleId);
      res.status(201).json(item);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

app.delete(
  "/api/saved-vehicles",
  authenticateToken,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { userId, vehicleId } = req.body;
      if (!userId || !vehicleId)
        return res
          .status(400)
          .json({ error: "userId and vehicleId are required." });

      if (req.user!.role !== "admin" && userId !== req.user!.id) {
        return res.status(403).json({ error: "Access denied." });
      }

      const success = await db.removeSavedVehicle(userId, vehicleId);
      res.json({ success });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// --- Test Drives ---
app.get(
  "/api/test-drives",
  authenticateToken,
  async (req: AuthenticatedRequest, res) => {
    try {
      let filtered: any[] = [];
      if (req.user!.role === "buyer") {
        filtered = await db.getTestDrives({ user_id: req.user!.id });
      } else if (req.user!.role === "broker") {
        const broker = await db.getBrokerByUserId(req.user!.id);
        const brokerId = broker ? broker.id : null;
        if (!brokerId) return res.json([]);
        const brokerVehicles = await db.getVehicles({ broker_id: brokerId });
        const vehicleIds = brokerVehicles.map((v) => v.id);
        filtered = await db.getTestDrives({ vehicle_id: { $in: vehicleIds } });
      } else {
        filtered = await db.getTestDrives();
      }

      const testVehicleIds = Array.from(
        new Set(filtered.map((t) => t.vehicleId).filter(Boolean)),
      );
      const relevantVehicles =
        testVehicleIds.length > 0
          ? await db.getVehicles({ id: { $in: testVehicleIds } })
          : [];

      const enriched = filtered.map((t) => {
        const v = relevantVehicles.find((veh) => veh.id === t.vehicleId);
        return {
          ...t,
          vehicleBrand: v?.brand,
          vehicleModel: v?.model,
          vehiclePrice: v?.price,
        };
      });

      res.json(enriched);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

app.post(
  "/api/test-drives",
  optionalAuth,
  validate(testDriveSchema),
  async (req: AuthenticatedRequest, res) => {
    try {
      const {
        vehicle_id,
        name,
        email,
        phone,
        preferred_date,
        preferred_time,
        message,
      } = req.body;
      const user_id = req.user ? req.user.id : null;

      const td = await db.addTestDrive({
        vehicle_id,
        user_id,
        name,
        email: email || "",
        phone,
        preferred_date,
        preferred_time,
        message: message || "",
      });
      res.status(201).json(td);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

app.put(
  "/api/test-drives/:id/status",
  authenticateToken,
  requireRole(["broker", "admin"]),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { status } = req.body;
      if (!status)
        return res.status(400).json({ error: "Status is required." });

      const drive = await db.getTestDriveById(req.params.id);
      if (!drive)
        return res.status(404).json({ error: "Test drive request not found." });

      const isOwnerOrAdmin = await verifyVehicleOwnership(
        drive.vehicleId,
        req.user!,
      );
      if (!isOwnerOrAdmin) {
        return res
          .status(403)
          .json({
            error:
              "Access denied. You do not own the vehicle associated with this request.",
          });
      }

      const success = await db.updateTestDriveStatus(req.params.id, status);
      res.json({ success });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// --- Reports ---
app.get(
  "/api/reports",
  authenticateToken,
  requireRole(["admin"]),
  async (req, res) => {
    try {
      const reports = await db.getReports();
      const vehicles = await db.getVehicles();
      const brokers = await db.getBrokers();
      const users = await db.getUsers();

      const enriched = reports.map((r) => {
        let summary = "";
        if (r.targetType === "listing") {
          const v = vehicles.find((veh) => veh.id === r.targetId);
          summary = v ? `${v.brand} ${v.model} (${v.year})` : "Unknown listing";
        } else if (r.targetType === "broker") {
          const b = brokers.find((bk) => bk.id === r.targetId);
          const u = b ? users.find((usr) => usr.id === b.userId) : null;
          summary = u?.name || "Unknown broker";
        } else {
          const u = users.find((usr) => usr.id === r.targetId);
          summary = u?.name || "Unknown user";
        }
        return { ...r, targetSummary: summary };
      });

      res.json(enriched);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

app.post(
  "/api/reports",
  optionalAuth,
  validate(reportSchema),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { reporter_name, target_type, target_id, reason, description } =
        req.body;
      const reporter_id = req.user ? req.user.id : null;

      const report = await db.addReport({
        reporter_id,
        reporter_name,
        target_type,
        target_id,
        reason,
        description: description || "",
      });
      res.status(201).json(report);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

app.put(
  "/api/reports/:id/status",
  authenticateToken,
  requireRole(["admin"]),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { status, admin_notes } = req.body;
      const validStatuses = [
        "pending",
        "investigating",
        "resolved",
        "dismissed",
      ];
      if (!validStatuses.includes(status)) {
        return res
          .status(400)
          .json({
            error:
              "Invalid status. Must be one of: " + validStatuses.join(", "),
          });
      }

      const success = await db.updateReportStatus(
        req.params.id,
        status,
        admin_notes || "",
        req.user!.name,
      );
      if (success) res.json({ message: "Report status updated" });
      else res.status(404).json({ error: "Report not found" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

// --- Site Settings Endpoints ---
app.get("/api/settings", async (_req, res) => {
  try {
    const settings = await db.getAllSettings();
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to load settings" });
  }
});

app.get("/api/settings/:key", async (req, res) => {
  try {
    const value = await db.getSetting(req.params.key);
    res.json({ key: req.params.key, value });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to get setting" });
  }
});

app.put(
  "/api/settings/:key",
  authenticateToken,
  requireRole(["admin"]),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { value } = req.body;
      if (typeof value !== "string") {
        return res.status(400).json({ error: "Value must be a string" });
      }
      await db.setSetting(req.params.key, value);
      res.json({
        message: "Setting updated successfully",
        key: req.params.key,
        value,
      });
    } catch (err: any) {
      res
        .status(500)
        .json({ error: err.message || "Failed to update setting" });
    }
  },
);

// --- SEO Endpoints: robots.txt & dynamic sitemap.xml ---
app.get("/robots.txt", (_req, res) => {
  const host = process.env.APP_URL || "https://arifcarsell.com";
  res.type("text/plain");
  res.send(
    `# robots.txt for Arif Car Sell — https://arifcarsell.com
User-agent: *
Allow: /
Allow: /showroom
Allow: /vehicle/
Allow: /services
Allow: /about
Allow: /contact
Allow: /compare
Allow: /help
Allow: /terms
Allow: /privacy
Allow: /images/

Disallow: /admin
Disallow: /admin/
Disallow: /broker-dashboard
Disallow: /broker-dashboard/
Disallow: /buyer-dashboard
Disallow: /buyer-dashboard/
Disallow: /api/
Disallow: /uploads/temp/

Sitemap: ${host}/sitemap.xml
`,
  );
});

app.get("/sitemap.xml", async (req, res) => {
  try {
    const host =
      process.env.APP_URL ||
      (req.get("host")?.includes("localhost")
        ? `http://${req.get("host")}`
        : "https://arifcarsell.com");
    const today = new Date().toISOString().split("T")[0];

    const staticRoutes = [
      { path: "", changefreq: "daily", priority: "1.0" },
      { path: "showroom", changefreq: "daily", priority: "0.9" },
      { path: "services", changefreq: "weekly", priority: "0.8" },
      { path: "compare", changefreq: "weekly", priority: "0.7" },
      { path: "about", changefreq: "monthly", priority: "0.7" },
      { path: "contact", changefreq: "monthly", priority: "0.7" },
      { path: "help", changefreq: "monthly", priority: "0.6" },
      { path: "terms", changefreq: "yearly", priority: "0.3" },
      { path: "privacy", changefreq: "yearly", priority: "0.3" },
    ];

    let vehicleUrls = "";
    try {
      const vehicles = await db.getVehicles({
        status: { $in: ["approved", "sold"] },
      });
      if (Array.isArray(vehicles)) {
        vehicleUrls = vehicles
          .map((v: any) => {
            const lastmod = v.updated_at
              ? new Date(v.updated_at).toISOString().split("T")[0]
              : today;
            return `  <url>\n    <loc>${host}/vehicle/${v.id}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`;
          })
          .join("\n");
      }
    } catch (dbErr) {
      console.warn(
        "[Sitemap] Failed to fetch vehicles for dynamic sitemap:",
        dbErr,
      );
    }

    const staticUrls = staticRoutes
      .map(
        (r) =>
          `  <url>\n    <loc>${host}/${r.path}</loc>\n    <xhtml:link rel="alternate" hreflang="en" href="${host}/${r.path}" />\n    <xhtml:link rel="alternate" hreflang="am" href="${host}/${r.path}" />\n    <xhtml:link rel="alternate" hreflang="om" href="${host}/${r.path}" />\n    <xhtml:link rel="alternate" hreflang="x-default" href="${host}/${r.path}" />\n    <lastmod>${today}</lastmod>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority}</priority>\n  </url>`,
      )
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${staticUrls}\n${vehicleUrls}\n</urlset>`;

    res.header("Content-Type", "application/xml");
    res.header("Cache-Control", "public, max-age=3600");
    res.send(xml);
  } catch (error: any) {
    res.status(500).type("text/plain").send("Error generating sitemap");
  }
});

// Centralized Error Handling Middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error(`[Unhandled Error] ${req.method} ${req.path}:`, err);
    if (res.headersSent) {
      return next(err);
    }
    const status = err.status || err.statusCode || 500;
    const message =
      process.env.NODE_ENV === "production" && status === 500
        ? "Internal Server Error"
        : err.message || "An unexpected error occurred";
    res.status(status).json({ error: message });
  },
);

export default app;
