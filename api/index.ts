import dotenv from "dotenv";
dotenv.config();

import app from "../backend/app";
import { initDB } from "../backend/db/index";

// Serverless lazy connection initialization
let dbPromise: Promise<void> | null = null;

export default async function handler(req: any, res: any) {
  if (!dbPromise) {
    dbPromise = initDB().catch((err) => {
      console.error("Database initialization failed during serverless request:", err);
      dbPromise = null;
      throw err;
    });
  }
  try {
    await dbPromise;
    return app(req, res);
  } catch (err: any) {
    return res.status(500).json({ error: "Database connection failed" });
  }
}
