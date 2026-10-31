import path from "path";
import fs from "fs";
import express from "express";
import app from "./app";
import { initDB } from "./db/index";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

async function startServer() {
  try {
    await initDB();

    const webRoot = fs.existsSync(path.join(process.cwd(), "apps", "web"))
      ? path.join(process.cwd(), "apps", "web")
      : path.resolve(__dirname, "../web");

    if (process.env.NODE_ENV !== "production") {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        root: webRoot,
        server: {
          middlewareMode: true,
        },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(webRoot, "dist");
      app.use(express.static(distPath));
      app.get("*", (_req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }

    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`\n🚀 Arif Car Sell — server ready at http://localhost:${PORT}\n`);
    });

    const shutdown = async (signal: string) => {
      console.log(`\n[Server] Received ${signal}. Starting graceful shutdown...`);
      server.close(async () => {
        console.log("[Server] HTTP server closed.");
        try {
          const mongoose = await import("mongoose");
          await mongoose.default.connection.close();
          console.log("[MongoDB] Connection closed safely.");
          process.exit(0);
        } catch (err) {
          console.error("[MongoDB] Error during disconnect:", err);
          process.exit(1);
        }
      });

      // Force exit if shutdown hangs over 10s
      setTimeout(() => {
        console.error("[Server] Graceful shutdown timed out. Forcing process exit.");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));

    server.on("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE") {
        console.error(
          `\n❌  Port ${PORT} is already in use.\n` +
          `   Run this command to free it, then try again:\n\n` +
          `   npx kill-port ${PORT}\n`
        );
      } else {
        console.error("Server error:", err);
      }
      process.exit(1);
    });

  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
