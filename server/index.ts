console.log("[server] Starting Wonke POS server...");
console.log("[server] Node version:", process.version);
console.log("[server] NODE_ENV:", process.env.NODE_ENV);
console.log("[server] PORT:", process.env.PORT || "5000 (default)");

import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import cors from "cors";
import path from "path";
import fs from "fs";

console.log("[server] Core imports completed");

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const reqPath = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (reqPath.startsWith("/api")) {
      let logLine = `${req.method} ${reqPath} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      log(logLine);
    }
  });

  next();
});

// Health check endpoint - must respond before database is ready
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Start the server FIRST, then initialize database
const port = parseInt(process.env.PORT || "5000", 10);

httpServer.listen(port, "0.0.0.0", async () => {
  log(`serving on port ${port}`);
  
  // Now that server is running, initialize everything else
  try {
    console.log("[server] Loading routes and database...");
    
    const { registerRoutes } = await import("./routes");
    const { seedDatabase } = await import("./seed");
    const { initializeDatabase } = await import("./db-init");
    
    // Initialize database tables
    try {
      await initializeDatabase();
    } catch (dbErr) {
      console.error("[server] Database init failed (non-fatal):", dbErr);
    }
    
    // Register API routes
    await registerRoutes(httpServer, app);
    
    // Seed database
    seedDatabase().catch(err => {
      console.error("[server] Seeding failed (non-fatal):", err);
    });
    
    // Serve static files in production
    if (process.env.NODE_ENV === "production") {
      const distPath = path.resolve(__dirname, "public");
      if (fs.existsSync(distPath)) {
        app.use(express.static(distPath));
        app.use("*", (_req, res) => {
          res.sendFile(path.resolve(distPath, "index.html"));
        });
        console.log("[server] Static files configured from:", distPath);
      } else {
        console.error("[server] Static files not found at:", distPath);
      }
    } else {
      const { setupVite } = await import("./vite");
      await setupVite(httpServer, app);
    }
    
    console.log("[server] Full initialization complete!");
    
  } catch (err) {
    console.error("[server] Error during initialization:", err);
  }
});

// Error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  console.error("[server] Error:", message);
  res.status(status).json({ message });
});
