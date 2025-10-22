import express from "express";
import cors from "cors";
import health from "./routes/health";
import auth from "./routes/auth";
import { errorHandler } from "./middleware/error";
import admin from "./routes/admin";

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use("/health", health);
  app.use("/auth", auth);
  app.use("/admin", admin);

  app.use(errorHandler);
  return app;
}
