import dotenv from "dotenv";
dotenv.config();

export interface AppConfig {
  port: number;
  nodeEnv: "development" | "production" | "test";
  jwtSecret: string;
  jwtRefreshSecret: string;
  mongodbUri: string;
  appUrl: string;
  allowedOrigins: string[];
}

export function loadConfig(): AppConfig {
  const nodeEnv = (process.env.NODE_ENV || "development") as AppConfig["nodeEnv"];
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const jwtSecret = process.env.JWT_SECRET || "local-development-only-jwt-secret";
  const jwtRefreshSecret =
    process.env.JWT_REFRESH_SECRET ||
    (nodeEnv === "production"
      ? ""
      : `${jwtSecret}_refresh`);
  const mongodbUri = process.env.MONGODB_URI || "mongodb://localhost:27017/autobroker_ethiopia";
  const appUrl = process.env.APP_URL || `http://localhost:${port}`;
  const envOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map(s => s.trim()).filter(Boolean)
    : [];

  const allowedOrigins = Array.from(new Set([
    appUrl,
    "http://localhost:3000",
    "http://localhost:5173",
    ...envOrigins,
  ].filter(Boolean)));

  if (nodeEnv === "production") {
    if (
      !process.env.JWT_SECRET ||
      process.env.JWT_SECRET.length < 32 ||
      !process.env.JWT_REFRESH_SECRET ||
      process.env.JWT_REFRESH_SECRET.length < 32
    ) {
      console.error(
        "\n❌ FATAL CONFIG ERROR: JWT_SECRET and JWT_REFRESH_SECRET must be set to secure, random strings (at least 32 characters) in production.\n"
      );
      process.exit(1);
    }
  }

  return {
    port,
    nodeEnv,
    jwtSecret,
    jwtRefreshSecret,
    mongodbUri,
    appUrl,
    allowedOrigins,
  };
}

export const config = loadConfig();
