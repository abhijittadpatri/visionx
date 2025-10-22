import { Router } from "express";
import { z } from "zod";
import { prisma } from "../services/prisma";
import { requireAuth, requireRole } from "../middleware/auth";
import { validate } from "../utils/validate";
import { parsePagination } from "../utils/pagination";

const router = Router();

const createSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  category: z.enum(["FRAME", "LENS", "ACCESSORY", "SERVICE"]),
  priceCents: z.number().int().min(0)
});

router.post("/", requireAuth, requireRole("OWNER", "ADMIN"), validate(createSchema), async (req, res, next) => {
  try {
    const ten = req.auth!.ten;
    const b = (req as any).parsed.body;
    const prod = await prisma.product.create({
      data: { tenantId: ten, ...b }
    });
    res.status(201).json(prod);
  } catch (err) { next(err); }
});

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const ten = req.auth!.ten;
    const { skip, take, page, pageSize } = parsePagination(req.query);
    const cat = req.query.category ? String(req.query.category) : undefined;
    const q = String(req.query.q ?? "").trim();

    const where: any = { tenantId: ten };
    if (cat) where.category = cat;
    if (q) where.OR = [{ name: { contains: q, mode: "insensitive" } }, { sku: { contains: q, mode: "insensitive" } }];

    const [items, total] = await Promise.all([
      prisma.product.findMany({ where, skip, take, orderBy: [{ name: "asc" }] }),
      prisma.product.count({ where })
    ]);

    res.json({ page, pageSize, total, items });
  } catch (err) { next(err); }
});

export default router;
