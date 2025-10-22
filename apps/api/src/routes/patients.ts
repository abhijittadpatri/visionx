import { Router } from "express";
import { z } from "zod";
import { prisma } from "../services/prisma";
import { requireAuth } from "../middleware/auth";
import { validate } from "../utils/validate";
import { parsePagination } from "../utils/pagination";

const router = Router();

const createSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  dob: z.string().datetime().optional(),
  notes: z.string().optional()
});

router.post("/", requireAuth, validate(createSchema), async (req, res, next) => {
  try {
    const ten = req.auth!.ten;
    const body = (req as any).parsed.body;
    const patient = await prisma.patient.create({
      data: {
        tenantId: ten,
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone,
        dob: body.dob ? new Date(body.dob) : null,
        notes: body.notes
      }
    });
    res.status(201).json(patient);
  } catch (err) { next(err); }
});

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const ten = req.auth!.ten;
    const { skip, take, page, pageSize } = parsePagination(req.query);
    const search = String(req.query.q ?? "").trim();

    const where = {
      tenantId: ten,
      ...(search
        ? {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } }
            ]
          }
        : {})
    };

    const [items, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        skip,
        take,
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }]
      }),
      prisma.patient.count({ where })
    ]);

    res.json({ page, pageSize, total, items });
  } catch (err) { next(err); }
});

router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const ten = req.auth!.ten;
    const { id } = req.params;
    const patient = await prisma.patient.findFirst({
      where: { id, tenantId: ten }
    });
    if (!patient) return res.status(404).json({ error: "Patient not found" });
    res.json(patient);
  } catch (err) { next(err); }
});

export default router;
