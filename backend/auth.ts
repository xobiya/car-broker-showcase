import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../shared/types";

const DEFAULT_DEV_SECRET = "super-secret-dev-key-for-autobroker-ethiopia";
const JWT_SECRET = process.env.JWT_SECRET || DEFAULT_DEV_SECRET;

// Warn loudly in production if using the insecure default secret
if (process.env.NODE_ENV === "production" && JWT_SECRET === DEFAULT_DEV_SECRET) {
  console.error(
    "\n⚠️  SECURITY WARNING: JWT_SECRET is not set. " +
    "The application is using an insecure default key in production. " +
    "Set JWT_SECRET in your environment variables immediately!\n"
  );
}

// Request extension to hold authenticated user info
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    role: "buyer" | "broker" | "admin";
  };
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function generateToken(user: User): string {
  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required. Please log in." });
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired session. Please log in again." });
    }
    req.user = decoded;
    next();
  });
}

export function requireRole(roles: Array<"buyer" | "broker" | "admin">) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized." });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied. Insufficient permissions." });
    }
    next();
  };
}

export function requireSelfOrAdmin(paramName: string = "id") {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized." });
    }
    const targetId = req.params[paramName];
    if (req.user.id !== targetId && req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied." });
    }
    next();
  };
}
