import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { jwtDecode } from "jwt-decode";
import api, { setAuthToken } from "../api/client";

type JwtPayload = { sub: string; ten: string; rol: string; exp?: number };
type User = { id: string; email: string; fullName: string };
type Tenant = { id: string; name: string; slug: string };

type Session = {
  token: string;
  user: User;
  tenant: Tenant;
  role: string;
};

type AuthContextType = {
  session: Session | null;
  login: (args: { email: string; password: string; tenantSlug: string }) => Promise<void>;
  signup: (args: { fullName: string; email: string; password: string; tenantName: string; tenantSlug: string }) => Promise<void>;
  logout: () => void;
  ready: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  // hydrate from localStorage
  useEffect(() => {
    const raw = localStorage.getItem("visionx:session");
    if (raw) {
      try {
        const s = JSON.parse(raw) as Session;
        if (s?.token) {
          const decoded = jwtDecode<JwtPayload>(s.token);
          if (!decoded.exp || decoded.exp * 1000 > Date.now()) {
            setSession(s);
            setAuthToken(s.token);
          } else {
            localStorage.removeItem("visionx:session");
          }
        }
      } catch { /* ignore */ }
    }
    setReady(true);
  }, []);

  const login: AuthContextType["login"] = async ({ email, password, tenantSlug }) => {
    const res = await api.post("/auth/login", { email, password, tenantSlug });
    const data = res.data as Session;
    setSession(data);
    setAuthToken(data.token);
    localStorage.setItem("visionx:session", JSON.stringify(data));
  };

  const signup: AuthContextType["signup"] = async (payload) => {
    const res = await api.post("/auth/signup", payload);
    const data = res.data as Session;
    setSession(data);
    setAuthToken(data.token);
    localStorage.setItem("visionx:session", JSON.stringify(data));
  };

  const logout = () => {
    setSession(null);
    setAuthToken(undefined);
    localStorage.removeItem("visionx:session");
  };

  const value = useMemo(() => ({ session, login, signup, logout, ready }), [session, ready]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
