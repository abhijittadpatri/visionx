import React, { useState } from "react";
import { Box, Button, Paper, Tab, Tabs, TextField, Typography } from "@mui/material";
import { useAuth } from "../providers/AuthProvider";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [tab, setTab] = useState(0);
  const nav = useNavigate();
  const { login, signup } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tenantSlug, setTenantSlug] = useState("");

  const [fullName, setFullName] = useState("");
  const [tenantName, setTenantName] = useState("");

  const onLogin = async () => {
    await login({ email, password, tenantSlug });
    nav("/");
  };

  const onSignup = async () => {
    await signup({ fullName, email, password, tenantName, tenantSlug });
    nav("/");
  };

  return (
    <Box sx={{ display: "grid", placeItems: "center", minHeight: "100vh", bgcolor: "#f7f7f7" }}>
      <Paper sx={{ p: 3, width: 420 }}>
        <Typography variant="h5" sx={{ mb: 2, textAlign: "center" }}>VisionX Access</Typography>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} centered>
          <Tab label="Login" />
          <Tab label="Sign up (new clinic)" />
        </Tabs>

        {tab === 0 && (
          <Box sx={{ mt: 3, display: "grid", gap: 2 }}>
            <TextField label="Tenant slug" value={tenantSlug} onChange={e => setTenantSlug(e.target.value)} />
            <TextField label="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <TextField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            <Button variant="contained" onClick={onLogin}>Login</Button>
          </Box>
        )}

        {tab === 1 && (
          <Box sx={{ mt: 3, display: "grid", gap: 2 }}>
            <TextField label="Full name" value={fullName} onChange={e => setFullName(e.target.value)} />
            <TextField label="Tenant (clinic) name" value={tenantName} onChange={e => setTenantName(e.target.value)} />
            <TextField label="Tenant slug" value={tenantSlug} onChange={e => setTenantSlug(e.target.value)} />
            <TextField label="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <TextField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            <Button variant="contained" onClick={onSignup}>Create clinic & sign in</Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
