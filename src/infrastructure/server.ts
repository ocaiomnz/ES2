import express, { type Express, type Router } from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import "dotenv/config";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger/swaggerConfig.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcPublic = path.join(__dirname, "..", "public");
const distPublic = path.join(__dirname, "public");
const staticDir = fs.existsSync(srcPublic) ? srcPublic : distPublic;

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

class Server {
  private app: Express;
  private port: number;

  constructor(port: number, apiRouter: Router) {
    this.app = express();
    this.port = port;
    this.setupMiddlewares();
    this.setupRoutes(apiRouter);
  }

  private setupMiddlewares(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    this.app.use(express.static(staticDir));
  }

  private setupRoutes(apiRouter: Router): void {
    this.app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: "SAPEA API - Documentação",
    }));

    this.app.get("/api-docs.json", (req, res) => {
      res.setHeader("Content-Type", "application/json");
      res.send(swaggerSpec);
    });

    this.app.get("/api/health", (req, res) => {
      res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
      });
    });

    this.app.use("/api", apiRouter);

    this.app.use((req, res) => {
      res.sendFile(path.join(staticDir, "index.html"));
    });
  }

  public start(): void {
    this.app.listen(this.port, () => {
      console.log("SAPEA Server");
      console.log(`API: http://localhost:${this.port}/api`);
      console.log(`Swagger: http://localhost:${this.port}/api-docs`);
      console.log(`Frontend: http://localhost:${this.port}`);
    });
  }

  public getApp(): Express {
    return this.app;
  }
}

const PORT = Number(process.env.PORT) || 3000;
(async () => {
  try {
    const { default: apiRouter } = await import("./http/routes/index.js");
    const server = new Server(PORT, apiRouter);
    server.start();
  } catch (err: any) {
    console.error("Startup error:", err?.stack || err);
    process.exit(1);
  }
})();
