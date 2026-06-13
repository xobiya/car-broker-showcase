import path from "path";
import express from "express";
import app from "./app";
import { initDB } from "./db/index";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

async function startServer() {
  try {
    await initDB();

    if (process.env.NODE_ENV !== "production") {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        root: path.join(process.cwd(), "frontend"),
        server: {
          middlewareMode: true,
          hmr: { port: 24678 },
        },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), "frontend", "dist");
      app.use(express.static(distPath));
      app.get("*", (_req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }

    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`\n🚀 Arif Car Sell — server ready at http://localhost:${PORT}\n`);
    });

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
