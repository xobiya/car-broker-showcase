import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import app from "./app";
import { initDB } from "./db/index";

export default async function handler(req: any, res: any) {
  try {
    if (mongoose.connection.readyState !== 1) {
      await initDB();
    }
    return app(req, res);
  } catch (err: any) {
    console.error("[Vercel API Handler] Database connection failed:", err);
    return res.status(500).json({
      error: "Database connection failed",
      message: err?.message,
      suggestion: "Check MONGODB_URI and verify MongoDB Atlas Network Access allows 0.0.0.0/0."
    });
  }
}

export { app, initDB };
