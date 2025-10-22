export type LoginResponse = {
  token: string;
  user: { id: string; email: string; fullName: string };
  tenant: { id: string; name: string; slug: string };
  role: "OWNER" | "ADMIN" | "STAFF";
};
