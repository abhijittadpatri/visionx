import { Request, Response, NextFunction } from "express";
import { verifyJwt, JwtPayload } from "../services/auth";

declare global {
  namespace Express {
    interface Request {
      auth?: JwtPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }
  const token = auth.substring("Bearer ".length);
  try {
    const payload = verifyJwt(token);
    req.auth = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.auth?.rol;
    if (!userRole) return res.status(403).json({ error: "Forbidden" });
    if (!roles.includes(userRole)) return res.status(403).json({ error: "Insufficient role" });
    next();
  };
}
