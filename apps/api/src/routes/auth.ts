import { Router } from "express";
import { z } from "zod";
import { prisma } from "../services/prisma";
import { hashPassword, comparePassword, signJwt } from "../services/auth";
import { validate } from "../utils/validate";
import { requireAuth } from "../middleware/auth";

const router = Router();

const passwordPolicy = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Must include an uppercase letter")
  .regex(/[a-z]/, "Must include a lowercase letter")
  .regex(/[0-9]/, "Must include a number");

const signupSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  password: passwordPolicy,
  tenantName: z.string().min(1),
  tenantSlug: z.string().min(1).regex(/^[a-z0-9-]+$/i, "Use letters, numbers, dashes"),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  tenantSlug: z.string().min(1),
});

router.post("/signup", validate(signupSchema), async (req, res, next) => {
  try {
    const { fullName, email, password, tenantName, tenantSlug } = (req as any).parsed.body;

    // Create tenant or fail if exists
    const existingTenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
    if (existingTenant) {
      return res.status(409).json({ error: "Tenant slug already taken" });
    }

    const hashed = await hashPassword(password);

    // Create tenant + user + role assignment (OWNER)
    const created = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: { name: tenantName, slug: tenantSlug },
      });

      const user = await tx.user.create({
        data: { email, password: hashed, fullName },
      });

      // Ensure base roles exist (OWNER, ADMIN, STAFF). In case seed wasn't run.
      const [ownerRole] = await Promise.all([
        tx.role.upsert({ where: { name: "OWNER" }, update: {}, create: { name: "OWNER" } }),
        tx.role.upsert({ where: { name: "ADMIN" }, update: {}, create: { name: "ADMIN" } }),
        tx.role.upsert({ where: { name: "STAFF" }, update: {}, create: { name: "STAFF" } }),
      ]);

      await tx.userTenant.create({
        data: { userId: user.id, tenantId: tenant.id, roleId: ownerRole.id },
      });

      return { tenant, user, roleName: "OWNER" };
    });

    const token = signJwt({ sub: created.user.id, ten: created.tenant.id, rol: created.roleName });
    return res.status(201).json({
      token,
      user: { id: created.user.id, email: created.user.email, fullName: created.user.fullName },
      tenant: { id: created.tenant.id, name: created.tenant.name, slug: created.tenant.slug },
      role: created.roleName,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/login", validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password, tenantSlug } = (req as any).parsed.body;

    const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
    if (!tenant) return res.status(404).json({ error: "Tenant not found" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await comparePassword(password, user.password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    // Confirm membership and get role
    const membership = await prisma.userTenant.findFirst({
      where: { userId: user.id, tenantId: tenant.id },
      include: { role: true },
    });
    if (!membership) return res.status(403).json({ error: "No access to this tenant" });

    const token = signJwt({ sub: user.id, ten: tenant.id, rol: membership.role.name });
    return res.json({
      token,
      user: { id: user.id, email: user.email, fullName: user.fullName },
      tenant: { id: tenant.id, name: tenant.name, slug: tenant.slug },
      role: membership.role.name,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const userId = req.auth!.sub;
    const tenantId = req.auth!.ten;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const membership = await prisma.userTenant.findFirst({
      where: { userId, tenantId },
      include: { tenant: true, role: true },
    });

    if (!user || !membership) return res.status(404).json({ error: "Not found" });

    res.json({
      user: { id: user.id, email: user.email, fullName: user.fullName },
      tenant: { id: membership.tenant.id, name: membership.tenant.name, slug: membership.tenant.slug },
      role: membership.role.name,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
