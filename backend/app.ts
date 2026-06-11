import express from "express";
import path from "path";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import { db } from "./db/index";
import {
  hashPassword,
  comparePassword,
  generateToken,
  authenticateToken,
  requireRole,
  requireSelfOrAdmin,
  AuthenticatedRequest
} from "./auth";
import { validate } from "./middleware/validate";
import {
  registerSchema, loginSchema, vehicleSchema, leadSchema,
  saleSchema, testDriveSchema, reportSchema, documentSchema, inspectionSchema
} from "./validators/index";
import { upload, uploadToCloudinary } from "./services/cloudinary";
import { sendEmail, notifyNewLead, notifyListingApproved, notifyListingRejected } from "./services/notifications";
import { getCached, setCache, clearCache } from "./services/cache";

const app = express();

// --- Security Middleware ---
app.use(helmet({
  // Allow inline scripts/styles needed by React SPA in dev
  contentSecurityPolicy: process.env.NODE_ENV === "production"
    ? undefined  // Helmet default strict CSP in production
    : false,      // Relaxed in development
  crossOriginEmbedderPolicy: false, // Allow embedding images from external CDNs
}));

// Rate limiting — general API
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please slow down and try again shortly." },
  skip: (req) => !req.path.startsWith("/api/"),
});
app.use(apiLimiter);

// Stricter rate limit for auth endpoints (anti-brute-force)
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts. Please wait a minute and try again." },
});
app.use("/api/auth", authLimiter);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(require("cookie-parser")());

if (!process.env.VERCEL) {
  app.use("/assets", express.static(path.join(process.cwd(), "assets")));
}

// Helper: Optional authentication middleware to parse tokens without rejecting anonymous requests
const parseUserOptional = (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers["authorization"];
  let token = authHeader && authHeader.split(" ")[1];
  if (!token && req.cookies?.autobroker_token) token = req.cookies.autobroker_token;
  if (!token) return next();

  const JWT_SECRET = process.env.JWT_SECRET || "super-secret-dev-key-for-autobroker-ethiopia";
  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (!err) {
      req.user = decoded;
    }
    next();
  });
};

// --- Status ---
app.get("/api/status", async (req, res) => {
  try {
    const connected = await db.isConnected();
    res.json({
      configured: true,
      dbConnected: connected,
      dbType: "MongoDB"
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- Auth ---
app.post("/api/auth/register", validate(registerSchema), async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;
    const existing = await db.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: "User with this email already exists." });
    }

    const password_hash = hashPassword(password);
    const newUser = await db.addUser({
      name,
      email,
      password_hash,
      phone: phone || "",
      role
    });

    const token = generateToken(db.mapUser(newUser));
    const { password_hash: _, ...userWithoutPassword } = newUser;

    res.cookie("autobroker_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ user: db.mapUser(userWithoutPassword as any), token });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/login", validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.getUserByEmail(email);
    if (!user || !user.password_hash) {
      return res.status(404).json({ error: "Invalid email or password." });
    }

    const match = comparePassword(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = generateToken(db.mapUser(user));
    const { password_hash: _, ...userWithoutPassword } = user;

    res.cookie("autobroker_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ user: db.mapUser(userWithoutPassword as any), token });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/logout", (_req, res) => {
  res.clearCookie("autobroker_token");
  res.json({ message: "Logged out successfully" });
});

app.get("/api/auth/me", async (req: AuthenticatedRequest, res) => {
  try {
    const token = req.cookies?.autobroker_token;
    if (!token) return res.status(401).json({ error: "Not authenticated" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "super-secret-dev-key-for-autobroker-ethiopia") as any;
    const user = await db.getUserById(decoded.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    const { password_hash: _, ...userWithoutPassword } = user;
    res.json({ user: db.mapUser(userWithoutPassword as any) });
  } catch {
    res.clearCookie("autobroker_token");
    res.status(401).json({ error: "Invalid or expired session" });
  }
});

// --- Vehicles ---
app.get("/api/vehicles", parseUserOptional, async (req: AuthenticatedRequest, res) => {
  try {
    const cacheKey = "vehicles_all";
    const cached = getCached<any[]>(cacheKey);
    if (cached) return res.json(cached);

    const vehicles = await db.getVehicles();
    const brokers = await db.getBrokers();
    const users = await db.getUsers();

    let filteredVehicles = vehicles;
    // Public/Buyers can only see approved and sold vehicles
    if (!req.user || req.user.role === "buyer") {
      filteredVehicles = vehicles.filter(v => v.status === "approved" || v.status === "sold");
    } else if (req.user.role === "broker") {
      // Brokers see approved, sold, and their own listings
      const broker = brokers.find(b => b.userId === req.user?.id);
      const brokerId = broker ? broker.id : null;
      filteredVehicles = vehicles.filter(v => v.status === "approved" || v.status === "sold" || v.brokerId === brokerId);
    }
    // Admins see all listings

    const enriched = filteredVehicles.map(v => {
      const broker = brokers.find(b => b.id === v.brokerId);
      const user = broker ? users.find(u => u.id === broker.userId) : null;
      const isOwner = req.user && broker && broker.userId === req.user.id;
      const isAdmin = req.user && req.user.role === "admin";

      const item: any = {
        ...v,
        brokerName: user?.name || "Unknown Broker",
        brokerPhone: user?.phone || "",
        brokerLicense: broker?.licenseNumber || "",
        brokerVerified: broker?.verified || false,
      };

      // Sanitize sensitive info for non-owner and non-admin users
      if (!isOwner && !isAdmin) {
        delete item.chassisNumber;
        delete item.commissionRate;
        delete item.rejectionReason;
      }
      return item;
    });

    setCache(cacheKey, enriched, 120);
    res.json(enriched);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/vehicles", authenticateToken, requireRole(["broker", "admin"]), validate(vehicleSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const brokers = await db.getBrokers();
    let brokerId = req.body.broker_id;

    if (req.user!.role === "broker") {
      const broker = brokers.find(b => b.userId === req.user!.id);
      if (!broker) return res.status(403).json({ error: "Broker profile not found. Complete your profile registration first." });
      brokerId = broker.id;
    } else if (req.user!.role === "admin" && !brokerId) {
      brokerId = "brk-1"; // fallback for admin
    }

    const newVehicle = await db.addVehicle({
      broker_id: brokerId,
      brand: req.body.brand,
      model: req.body.model,
      year: parseInt(req.body.year),
      mileage: parseInt(req.body.mileage) || 0,
      price: parseFloat(req.body.price),
      original_price: parseFloat(req.body.original_price || req.body.price),
      image_url: req.body.image_url || "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
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
      gallery: req.body.gallery,
      cover_photo_index: req.body.cover_photo_index,
    });
    clearCache("vehicles");
    res.status(201).json(newVehicle);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Helper checking vehicle ownership
const verifyVehicleOwnership = async (vehicleId: string, reqUser: any) => {
  if (reqUser.role === "admin") return true;
  const vehicles = await db.getVehicles();
  const vehicle = vehicles.find(v => v.id === vehicleId);
  if (!vehicle) return false;
  const brokers = await db.getBrokers();
  const broker = brokers.find(b => b.id === vehicle.brokerId);
  return broker && broker.userId === reqUser.id;
};

app.put("/api/vehicles/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const isOwnerOrAdmin = await verifyVehicleOwnership(req.params.id, req.user!);
    if (!isOwnerOrAdmin) {
      return res.status(403).json({ error: "Access denied. You do not own this vehicle listing." });
    }

    const success = await db.updateVehicle(req.params.id, req.body);
    if (success) res.json({ message: "Vehicle updated successfully" });
    else res.status(404).json({ error: "Vehicle not found" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/vehicles/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const isOwnerOrAdmin = await verifyVehicleOwnership(req.params.id, req.user!);
    if (!isOwnerOrAdmin) {
      return res.status(403).json({ error: "Access denied. You do not own this vehicle listing." });
    }

    const success = await db.deleteVehicle(req.params.id);
    if (success) res.json({ message: "Vehicle deleted successfully" });
    else res.status(404).json({ error: "Vehicle not found" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/vehicles/:id/approve", authenticateToken, requireRole(["admin"]), async (req: AuthenticatedRequest, res) => {
  try {
    const success = await db.updateVehicle(req.params.id, { status: "approved" });
    if (success) {
      await db.addAuditLog({
        action: "approve_listing",
        admin_id: req.user!.id,
        admin_name: req.user!.name,
        target_type: "vehicle",
        target_id: req.params.id,
        details: "Approved vehicle listing"
      });
      clearCache("vehicles");
      const vehicles = await db.getVehicles();
      const vehicle = vehicles.find(v => v.id === req.params.id);
      if (vehicle) {
        const brokers = await db.getBrokers();
        const broker = brokers.find(b => b.id === vehicle.brokerId);
        if (broker) {
          const users = await db.getUsers();
          const brokerUser = users.find(u => u.id === broker.userId);
          if (brokerUser?.email) {
            notifyListingApproved(vehicle.brand, vehicle.model, brokerUser.email);
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
});

app.put("/api/vehicles/:id/reject", authenticateToken, requireRole(["admin"]), async (req: AuthenticatedRequest, res) => {
  try {
    const { reason } = req.body;
    const success = await db.updateVehicle(req.params.id, { status: "rejected", rejection_reason: reason || "" });
    if (success) {
      await db.addAuditLog({
        action: "reject_listing",
        admin_id: req.user!.id,
        admin_name: req.user!.name,
        target_type: "vehicle",
        target_id: req.params.id,
        details: `Rejected listing: ${reason || "No reason specified"}`
      });
      clearCache("vehicles");
      const vehicles = await db.getVehicles();
      const vehicle = vehicles.find(v => v.id === req.params.id);
      if (vehicle) {
        const brokers = await db.getBrokers();
        const broker = brokers.find(b => b.id === vehicle.brokerId);
        if (broker) {
          const users = await db.getUsers();
          const brokerUser = users.find(u => u.id === broker.userId);
          if (brokerUser?.email) {
            notifyListingRejected(vehicle.brand, vehicle.model, reason || "No reason specified", brokerUser.email);
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
});

app.put("/api/vehicles/:id/submit", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const isOwnerOrAdmin = await verifyVehicleOwnership(req.params.id, req.user!);
    if (!isOwnerOrAdmin) {
      return res.status(403).json({ error: "Access denied. You do not own this vehicle listing." });
    }

    const success = await db.updateVehicle(req.params.id, { status: "pending" });
    if (success) res.json({ message: "Vehicle submitted for approval" });
    else res.status(404).json({ error: "Vehicle not found" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- Leads ---
app.get("/api/leads", authenticateToken, requireRole(["broker", "admin"]), async (req: AuthenticatedRequest, res) => {
  try {
    const leads = await db.getLeads();
    const vehicles = await db.getVehicles();
    const brokers = await db.getBrokers();

    let filteredLeads = leads;

    if (req.user!.role === "broker") {
      const broker = brokers.find(b => b.userId === req.user!.id);
      const brokerId = broker ? broker.id : null;
      const brokerVehicles = vehicles.filter(v => v.brokerId === brokerId).map(v => v.id);
      filteredLeads = leads.filter(l => brokerVehicles.includes(l.vehicleId));
    }

    const enriched = filteredLeads.map(l => {
      const v = vehicles.find(veh => veh.id === l.vehicleId);
      return { ...l, vehicleBrand: v?.brand, vehicleModel: v?.model, vehiclePrice: v?.price };
    });

    res.json(enriched);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/leads", parseUserOptional, validate(leadSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { vehicle_id, buyer_name, buyer_email, buyer_phone, message } = req.body;
    const buyer_id = req.user ? req.user.id : null;

    const vehicles = await db.getVehicles();
    const vehicle = vehicles.find(v => v.id === vehicle_id);
    if (vehicle) {
      const brokers = await db.getBrokers();
      const broker = brokers.find(b => b.id === vehicle.brokerId);
      if (broker) {
        const users = await db.getUsers();
        const brokerUser = users.find(u => u.id === broker.userId);
        if (brokerUser?.email) {
          notifyNewLead(
            { buyerName: buyer_name, buyerEmail: buyer_email, vehicleBrand: vehicle.brand, vehicleModel: vehicle.model },
            brokerUser.email
          );
        }
      }
    }

    const newLead = await db.addLead({
      vehicle_id,
      buyer_id,
      buyer_name,
      buyer_email,
      buyer_phone,
      message: message || ""
    });
    res.status(201).json(newLead);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/leads/:id/status", authenticateToken, requireRole(["broker", "admin"]), async (req: AuthenticatedRequest, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: "Status is required." });

    const leads = await db.getLeads();
    const lead = leads.find(l => l.id === req.params.id);
    if (!lead) return res.status(404).json({ error: "Lead not found." });

    const isOwnerOrAdmin = await verifyVehicleOwnership(lead.vehicleId, req.user!);
    if (!isOwnerOrAdmin) {
      return res.status(403).json({ error: "Access denied. You do not own the vehicle associated with this lead." });
    }

    const success = await db.updateLeadStatus(req.params.id, status);
    if (success) res.json({ message: "Lead status updated" });
    else res.status(404).json({ error: "Lead not found" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- Sales ---
app.get("/api/sales", authenticateToken, requireRole(["broker", "admin"]), async (req: AuthenticatedRequest, res) => {
  try {
    const sales = await db.getSales();
    const vehicles = await db.getVehicles();
    const brokers = await db.getBrokers();

    let filteredSales = sales;

    if (req.user!.role === "broker") {
      const broker = brokers.find(b => b.userId === req.user!.id);
      const brokerId = broker ? broker.id : null;
      filteredSales = sales.filter(s => s.brokerId === brokerId);
    }

    const enriched = filteredSales.map(s => {
      const v = vehicles.find(veh => veh.id === s.vehicleId);
      return { ...s, vehicleBrand: v?.brand, vehicleModel: v?.model };
    });
    res.json(enriched);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/sales", authenticateToken, requireRole(["broker", "admin"]), validate(saleSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { vehicle_id, sale_price, commission, buyer_name, leadId } = req.body;

    const isOwnerOrAdmin = await verifyVehicleOwnership(vehicle_id, req.user!);
    if (!isOwnerOrAdmin) {
      return res.status(403).json({ error: "Access denied. You do not own this vehicle." });
    }

    const vehicles = await db.getVehicles();
    const vehicle = vehicles.find(v => v.id === vehicle_id);
    if (!vehicle) return res.status(404).json({ error: "Vehicle not found." });

    const newSale = await db.addSale({
      vehicle_id,
      broker_id: vehicle.brokerId,
      buyer_id: null,
      sale_price: parseFloat(sale_price),
      commission: parseFloat(commission),
      buyer_name: buyer_name || ""
    });

    await db.updateVehicle(vehicle_id, { status: "sold" });
    if (leadId) {
      await db.updateLeadStatus(leadId, "sold");
    }

    res.status(201).json(newSale);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- Payments & Commissions ---
app.get("/api/payments", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const brokerId = req.query.brokerId as string | undefined;
    const payments = await db.getPayments(brokerId);
    res.json(payments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/commissions/calculate", authenticateToken, async (req, res) => {
  try {
    const { sale_price, commission_rate, commission_type } = req.body;
    if (!sale_price || !commission_rate) {
      return res.status(400).json({ error: "sale_price and commission_rate are required." });
    }
    const result = db.calculateCommission(
      parseFloat(sale_price),
      parseFloat(commission_rate),
      commission_type || "percentage"
    );
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- Brokers ---
app.get("/api/brokers", async (req, res) => {
  try {
    const [brokers, users] = await Promise.all([db.getBrokers(), db.getUsers()]);
    const enriched = brokers.map(b => {
      const user = users.find(u => u.id === b.userId);
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
    const broker = brokers.find(b => b.id === req.params.id);
    if (!broker) return res.status(404).json({ error: "Broker not found" });
    const users = await db.getUsers();
    const user = users.find(u => u.id === broker.userId);
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

app.put("/api/brokers/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const brokers = await db.getBrokers();
    const broker = brokers.find(b => b.id === req.params.id);
    if (!broker) return res.status(404).json({ error: "Broker profile not found." });

    if (req.user!.role !== "admin" && broker.userId !== req.user!.id) {
      return res.status(403).json({ error: "Access denied. You cannot modify another broker's profile." });
    }

    const success = await db.updateBroker(req.params.id, req.body);
    res.json({ success });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Approve/Verify a broker
app.put("/api/brokers/:id/approve", authenticateToken, requireRole(["admin"]), async (req: AuthenticatedRequest, res) => {
  try {
    const brokers = await db.getBrokers();
    const broker = brokers.find(b => b.id === req.params.id);
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
});

// Admin: Reject/Suspend a broker
app.put("/api/brokers/:id/reject", authenticateToken, requireRole(["admin"]), async (req: AuthenticatedRequest, res) => {
  try {
    const brokers = await db.getBrokers();
    const broker = brokers.find(b => b.id === req.params.id);
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
});



// --- Users ---
app.get("/api/users", authenticateToken, requireRole(["admin"]), async (req, res) => {
  try {
    const users = await db.getUsers();
    const sanitised = users.map(u => {
      const { password_hash: _, ...userWithoutPassword } = u as any;
      return userWithoutPassword;
    });
    res.json(sanitised);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/users/:id", authenticateToken, requireSelfOrAdmin("id"), async (req, res) => {
  try {
    const user = await db.getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    const { password_hash: _, ...userWithoutPassword } = user as any;
    res.json(userWithoutPassword);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/users/:id", authenticateToken, requireSelfOrAdmin("id"), async (req, res) => {
  try {
    const success = await db.updateUser(req.params.id, req.body);
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
});

// --- Stats ---
app.get("/api/stats", authenticateToken, requireRole(["admin"]), async (req, res) => {
  try {
    res.json(await db.getStats());
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- Audit Logs ---
app.get("/api/audit-logs", authenticateToken, requireRole(["admin"]), async (req, res) => {
  try {
    res.json(await db.getAuditLogs());
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/audit-logs", authenticateToken, requireRole(["admin"]), async (req: AuthenticatedRequest, res) => {
  try {
    const log = await db.addAuditLog({
      action: req.body.action,
      admin_id: req.user!.id,
      admin_name: req.user!.name,
      target_type: req.body.target_type,
      target_id: req.body.target_id,
      details: req.body.details || ""
    });
    res.status(201).json(log);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- Documents ---
app.get("/api/documents", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const vehicleId = req.query.vehicleId as string | undefined;
    if (!vehicleId) return res.status(400).json({ error: "vehicleId query param is required." });

    const isOwnerOrAdmin = await verifyVehicleOwnership(vehicleId, req.user!);
    if (!isOwnerOrAdmin) {
      return res.status(403).json({ error: "Access denied. You do not own this vehicle." });
    }

    const docs = await db.getDocuments(vehicleId);
    res.json(docs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/documents", authenticateToken, validate(documentSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { vehicle_id, name, type, file_url } = req.body;

    const isOwnerOrAdmin = await verifyVehicleOwnership(vehicle_id, req.user!);
    if (!isOwnerOrAdmin) {
      return res.status(403).json({ error: "Access denied. You do not own this vehicle." });
    }

    const doc = await db.addDocument({ vehicle_id, name, type, file_url });
    res.status(201).json(doc);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/documents/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const all = await db.getDocuments();
    const doc = all.find(d => d.id === req.params.id);
    if (!doc) return res.status(404).json({ error: "Document not found." });

    const isOwnerOrAdmin = await verifyVehicleOwnership(doc.vehicleId, req.user!);
    if (!isOwnerOrAdmin) {
      return res.status(403).json({ error: "Access denied. You do not own the vehicle associated with this document." });
    }

    const success = await db.deleteDocument(req.params.id);
    if (success) res.json({ message: "Document deleted" });
    else res.status(404).json({ error: "Document not found" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- Inspections ---
app.get("/api/inspections", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const vehicleId = req.query.vehicleId as string | undefined;
    if (!vehicleId) return res.status(400).json({ error: "vehicleId query param is required." });

    const isOwnerOrAdmin = await verifyVehicleOwnership(vehicleId, req.user!);
    if (!isOwnerOrAdmin) {
      return res.status(403).json({ error: "Access denied. You do not have permissions to view this inspection record." });
    }

    const inspections = await db.getInspections(vehicleId);
    res.json(inspections);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/inspections", authenticateToken, requireRole(["admin"]), validate(inspectionSchema), async (req, res) => {
  try {
    const { vehicle_id, inspector_name, status, notes } = req.body;
    const inspection = await db.addInspection({ vehicle_id, inspector_name, status, notes: notes || "" });
    await db.updateVehicle(vehicle_id, { inspection_status: status, inspection_notes: notes || "", inspection_date: inspection.inspectedAt });
    res.status(201).json(inspection);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/inspections/:id", authenticateToken, requireRole(["admin"]), async (req, res) => {
  try {
    const success = await db.updateInspection(req.params.id, req.body);
    if (success) res.json({ message: "Inspection updated" });
    else res.status(404).json({ error: "Inspection not found" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- Upload (Cloudinary) ---
app.post("/api/upload", authenticateToken, upload.single("file"), async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file provided." });
    const folder = (req.body.folder as string) || "autobroker";
    const url = await uploadToCloudinary(req.file.buffer, folder);
    res.json({ url, filename: req.file.originalname });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/upload/multiple", authenticateToken, upload.array("files", 10), async (req: AuthenticatedRequest, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) return res.status(400).json({ error: "No files provided." });
    const folder = (req.body.folder as string) || "autobroker";
    const urls = await Promise.all(files.map(f => uploadToCloudinary(f.buffer, folder)));
    res.json({ urls });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- Saved Vehicles ---
app.get("/api/saved-vehicles", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) return res.status(400).json({ error: "userId query param is required." });

    if (req.user!.role !== "admin" && userId !== req.user!.id) {
      return res.status(403).json({ error: "Access denied. You can only view your own saved vehicles." });
    }

    const items = await db.getSavedVehicles(userId);
    const vehicles = await db.getVehicles();
    const enriched = items
      .map(s => ({ ...s, vehicle: vehicles.find(v => v.id === s.vehicleId) }))
      .filter(s => s.vehicle !== undefined);

    res.json(enriched);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/saved-vehicles", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { userId, vehicleId } = req.body;
    if (!userId || !vehicleId) return res.status(400).json({ error: "userId and vehicleId are required." });

    if (req.user!.role !== "admin" && userId !== req.user!.id) {
      return res.status(403).json({ error: "Access denied." });
    }

    const existing = await db.isVehicleSaved(userId, vehicleId);
    if (existing) return res.status(409).json({ error: "Vehicle already saved." });

    const item = await db.addSavedVehicle(userId, vehicleId);
    res.status(201).json(item);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/saved-vehicles", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { userId, vehicleId } = req.body;
    if (!userId || !vehicleId) return res.status(400).json({ error: "userId and vehicleId are required." });

    if (req.user!.role !== "admin" && userId !== req.user!.id) {
      return res.status(403).json({ error: "Access denied." });
    }

    const success = await db.removeSavedVehicle(userId, vehicleId);
    res.json({ success });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- Test Drives ---
app.get("/api/test-drives", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const all = await db.getTestDrives();
    const vehicles = await db.getVehicles();
    const brokers = await db.getBrokers();

    let filtered = all;
    if (req.user!.role === "buyer") {
      filtered = all.filter(t => t.userId === req.user!.id);
    } else if (req.user!.role === "broker") {
      const broker = brokers.find(b => b.userId === req.user!.id);
      const brokerId = broker ? broker.id : null;
      const brokerVehicles = vehicles.filter(v => v.brokerId === brokerId).map(v => v.id);
      filtered = all.filter(t => brokerVehicles.includes(t.vehicleId));
    }

    const enriched = filtered.map(t => {
      const v = vehicles.find(veh => veh.id === t.vehicleId);
      return { ...t, vehicleBrand: v?.brand, vehicleModel: v?.model, vehiclePrice: v?.price };
    });

    res.json(enriched);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/test-drives", parseUserOptional, validate(testDriveSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { vehicle_id, name, email, phone, preferred_date, preferred_time, message } = req.body;
    const user_id = req.user ? req.user.id : null;

    const td = await db.addTestDrive({
      vehicle_id,
      user_id,
      name,
      email: email || "",
      phone,
      preferred_date,
      preferred_time,
      message: message || ""
    });
    res.status(201).json(td);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/test-drives/:id/status", authenticateToken, requireRole(["broker", "admin"]), async (req: AuthenticatedRequest, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: "Status is required." });

    const all = await db.getTestDrives();
    const drive = all.find(d => d.id === req.params.id);
    if (!drive) return res.status(404).json({ error: "Test drive request not found." });

    const isOwnerOrAdmin = await verifyVehicleOwnership(drive.vehicleId, req.user!);
    if (!isOwnerOrAdmin) {
      return res.status(403).json({ error: "Access denied. You do not own the vehicle associated with this request." });
    }

    const success = await db.updateTestDriveStatus(req.params.id, status);
    res.json({ success });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- Reports ---
app.get("/api/reports", authenticateToken, requireRole(["admin"]), async (req, res) => {
  try {
    const reports = await db.getReports();
    const vehicles = await db.getVehicles();
    const brokers = await db.getBrokers();
    const users = await db.getUsers();

    const enriched = reports.map(r => {
      let summary = "";
      if (r.targetType === "listing") {
        const v = vehicles.find(veh => veh.id === r.targetId);
        summary = v ? `${v.brand} ${v.model} (${v.year})` : "Unknown listing";
      } else if (r.targetType === "broker") {
        const b = brokers.find(bk => bk.id === r.targetId);
        const u = b ? users.find(usr => usr.id === b.userId) : null;
        summary = u?.name || "Unknown broker";
      } else {
        const u = users.find(usr => usr.id === r.targetId);
        summary = u?.name || "Unknown user";
      }
      return { ...r, targetSummary: summary };
    });

    res.json(enriched);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/reports", parseUserOptional, validate(reportSchema), async (req: AuthenticatedRequest, res) => {
  try {
    const { reporter_name, target_type, target_id, reason, description } = req.body;
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
});

app.put("/api/reports/:id/status", authenticateToken, requireRole(["admin"]), async (req: AuthenticatedRequest, res) => {
  try {
    const { status, admin_notes } = req.body;
    const validStatuses = ["pending", "investigating", "resolved", "dismissed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status. Must be one of: " + validStatuses.join(", ") });
    }

    const success = await db.updateReportStatus(req.params.id, status, admin_notes || "", req.user!.name);
    if (success) res.json({ message: "Report status updated" });
    else res.status(404).json({ error: "Report not found" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default app;
