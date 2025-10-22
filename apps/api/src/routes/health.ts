import { Router } from "express";
import { prisma } from "../services/prisma";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, service: "visionx-api" });
  } catch (err) {
    next(err);
  }
});

export default router;