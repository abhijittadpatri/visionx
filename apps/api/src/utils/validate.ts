import { ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";

export function validate<T extends ZodSchema<any>>(schema: T, pick: "body" | "query" | "params" = "body") {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req[pick]);
    if (!parsed.success) {
      return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
    }
    // attach parsed data for downstream handlers
    (req as any).parsed = (req as any).parsed || {};
    (req as any).parsed[pick] = parsed.data;
    next();
  };
}
