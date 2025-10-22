import * as dotenv from "dotenv";
dotenv.config();

const required = (name: string, val: string | undefined) => {
  if (!val) throw new Error(`Missing required env var: ${name}`);
  return val;
};

export const ENV = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT ?? 4000),
  DATABASE_URL: required("DATABASE_URL", process.env.DATABASE_URL),
  JWT_SECRET: required("JWT_SECRET", process.env.JWT_SECRET),
};
