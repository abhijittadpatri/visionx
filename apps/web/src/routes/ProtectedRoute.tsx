import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";

export default function ProtectedRoute() {
  const { session, ready } = useAuth();
  if (!ready) return null; // or a loader
  if (!session) return <Navigate to="/login" replace />;
  return <Outlet />;
}
