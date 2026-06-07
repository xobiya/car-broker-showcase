import dotenv from "dotenv";
dotenv.config();

import app from "../backend/app";
import { initDB } from "../backend/db";

// Serverless lazy connection initialization
let dbInitialized = false;

app.use(async (req, res, next) => {
  if (!dbInitialized) {
    try {
      await initDB();
      dbInitialized = true;
    } catch (err) {
      console.error("Database initialization failed during serverless request:", err);
      return res.status(500).json({ error: "Database connection failed" });
    }
  }
  next();
});

export default app;
