import { Router } from "express";
import { z } from "zod";
import { prisma } from "../services/prisma";
import { requireAuth } from "../middleware/auth";
import { validate } from "../utils/validate";
import { parsePagination } from "../utils/pagination";

const router = Router();

const createSchema = z.object({
  patientId: z.string().min(1),
  sphereLeft: z.number().optional(),
  sphereRight: z.number().optional(),
  cylinderLeft: z.number().optional(),
  cylinderRight: z.number().optional(),
  axisLeft: z.number().int().min(0).max(180).optional(),
  axisRight: z.number().int().min(0).max(180).optional(),
  addLeft: z.number().optional(),
  addRight: z.number().optional(),
  pd: z.number().optional(),
  issuedAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
  notes: z.string().optional()
});

router.post("/", requireAuth, validate(createSchema), async (req, res, next) => {
  try {
    const ten = req.auth!.ten;
    const b = (req as any).parsed.body;

    // ensure patient belongs to tenant
    const patient = await prisma.patient.findFirst({ where: { id: b.patientId, tenantId: ten } });
    if (!patient) return res.status(400).json({ error: "Invalid patient for tenant" });

    const rx = await prisma.prescription.create({
      data: {
        tenantId: ten,
        patientId: b.patientId,
        sphereLeft: b.sphereLeft,
        sphereRight: b.sphereRight,
        cylinderLeft: b.cylinderLeft,
        cylinderRight: b.cylinderRight,
        axisLeft: b.axisLeft,
        axisRight: b.axisRight,
        addLeft: b.addLeft,
        addRight: b.addRight,
        pd: b.pd,
        issuedAt: b.issuedAt ? new Date(b.issuedAt) : undefined,
        expiresAt: b.expiresAt ? new Date(b.expiresAt) : undefined,
        notes: b.notes
      }
    });
    res.status(201).json(rx);
  } catch (err) { next(err); }
});

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const ten = req.auth!.ten;
    const { skip, take, page, pageSize } = parsePagination(req.query);
    const patientId = req.query.patientId ? String(req.query.patientId) : undefined;

    const where = { tenantId: ten, ...(patientId ? { patientId } : {}) };

    const [items, total] = await Promise.all([
      prisma.prescription.findMany({
        where,
        skip,
        take,
        orderBy: [{ issuedAt: "desc" }],
        include: {
          patient: { select: { id: true, firstName: true, lastName: true } }
        }
      }),
      prisma.prescription.count({ where })
    ]);

    res.json({ page, pageSize, total, items });
  } catch (err) { next(err); }
});

router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const ten = req.auth!.ten;
    const rx = await prisma.prescription.findFirst({
      where: { id: req.params.id, tenantId: ten },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } }
      }
    });
    if (!rx) return res.status(404).json({ error: "Prescription not found" });
    res.json(rx);
  } catch (err) { next(err); }
});

export default router;
