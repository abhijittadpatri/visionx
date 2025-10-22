import { Router } from "express";
import { z } from "zod";
import { prisma } from "../services/prisma";
import { requireAuth } from "../middleware/auth";
import { validate } from "../utils/validate";
import { parsePagination } from "../utils/pagination";

const router = Router();

const createSchema = z.object({
  patientId: z.string().min(1),
  prescriptionId: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string().min(1),
      quantity: z.number().int().min(1),
      priceCents: z.number().int().min(0)
    })
  ).min(1)
});

router.post("/", requireAuth, validate(createSchema), async (req, res, next) => {
  try {
    const ten = req.auth!.ten;
    const b = (req as any).parsed.body;

    // Guards
    const patient = await prisma.patient.findFirst({ where: { id: b.patientId, tenantId: ten } });
    if (!patient) return res.status(400).json({ error: "Invalid patient for tenant" });

    if (b.prescriptionId) {
      const rx = await prisma.prescription.findFirst({ where: { id: b.prescriptionId, tenantId: ten, patientId: b.patientId } });
      if (!rx) return res.status(400).json({ error: "Invalid prescription for patient/tenant" });
    }

    // Validate products belong to tenant
    const productIds = b.items.map((i: any) => i.productId);
    const products = await prisma.product.findMany({ where: { id: { in: productIds }, tenantId: ten } });
    if (products.length !== productIds.length) return res.status(400).json({ error: "One or more products not found for tenant" });

    const totalCents = b.items.reduce((sum: number, it: any) => sum + it.quantity * it.priceCents, 0);

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          tenantId: ten,
          patientId: b.patientId,
          prescriptionId: b.prescriptionId ?? null,
          totalCents
        }
      });

      await tx.orderItem.createMany({
        data: b.items.map((it: any) => ({
          tenantId: ten,
          orderId: created.id,
          productId: it.productId,
          quantity: it.quantity,
          priceCents: it.priceCents
        }))
      });

      return created;
    });

    const withItems = await prisma.order.findFirst({
      where: { id: order.id, tenantId: ten },
      include: { items: true }
    });

    res.status(201).json(withItems);
  } catch (err) { next(err); }
});

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const ten = req.auth!.ten;
    const { skip, take, page, pageSize } = parsePagination(req.query);
    const status = req.query.status ? String(req.query.status) : undefined;
    const patientId = req.query.patientId ? String(req.query.patientId) : undefined;

    const where: any = { tenantId: ten };
    if (status) where.status = status;
    if (patientId) where.patientId = patientId;

    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take,
        orderBy: [{ createdAt: "desc" }],
        include: {
          patient: { select: { id: true, firstName: true, lastName: true } },
          items: true
        }
      }),
      prisma.order.count({ where })
    ]);

    res.json({ page, pageSize, total, items });
  } catch (err) { next(err); }
});

router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const ten = req.auth!.ten;
    const order = await prisma.order.findFirst({
      where: { id: req.params.id, tenantId: ten },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        items: { include: { product: { select: { id: true, sku: true, name: true } } } }
      }
    });
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) { next(err); }
});

export default router;
