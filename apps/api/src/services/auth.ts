import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env";

const SALT_ROUNDS = 12;

export type JwtPayload = {
  sub: string;        // userId
  ten: string;        // tenantId
  rol: string;        // role name (e.g., OWNER, ADMIN, STAFF)
};

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function comparePassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

export function signJwt(payload: JwtPayload, expiresIn = "8h") {
  return jwt.sign(payload, ENV.JWT_SECRET, { expiresIn });
}

export function verifyJwt<T = JwtPayload>(token: string): T {
  return jwt.verify(token, ENV.JWT_SECRET) as T;
}
