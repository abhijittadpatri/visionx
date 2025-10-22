import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

router.get("/dashboard", requireAuth, requireRole("OWNER", "ADMIN"), async (_req, res) => {
  res.json({ message: "Admin dashboard data" });
});

export default router;
