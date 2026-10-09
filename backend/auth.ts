import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../shared/types";

const DEFAULT_DEV_SECRET = "super-secret-dev-key-for-autobroker-ethiopia";

// Fatal error in production if using insecure or missing secret
if (process.env.NODE_ENV === "production") {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === DEFAULT_DEV_SECRET || secret.length < 32) {
    console.error(
      "\n❌ FATAL SECURITY ERROR: JWT_SECRET must be set to a secure, random string (at least 32 characters) in production.\n"
    );
    process.exit(1);
  }
}

const JWT_SECRET = process.env.JWT_SECRET || DEFAULT_DEV_SECRET;

// Request extension to hold authenticated user info
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    role: "buyer" | "broker" | "seller" | "admin";
  };
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
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
  let token = authHeader && authHeader.split(" ")[1];

  if (!token && req.cookies?.autobroker_token) {
    token = req.cookies.autobroker_token;
  }

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

export function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  let token = authHeader && authHeader.split(" ")[1];

  if (!token && req.cookies?.autobroker_token) {
    token = req.cookies.autobroker_token;
  }

  if (!token) return next();

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (!err) req.user = decoded;
    next();
  });
}

export function requireRole(roles: Array<"buyer" | "broker" | "seller" | "admin">) {
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
