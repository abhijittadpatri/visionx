import React from "react";
import { AppBar as MAppBar, Toolbar, Typography, Button } from "@mui/material";
import { useAuth } from "../providers/AuthProvider";

export default function AppBar() {
  const { session, logout } = useAuth();
  return (
    <MAppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>VisionX</Typography>
        {session && (
          <>
            <Typography sx={{ mr: 2 }}>
              {session.tenant.name} • {session.user.fullName}
            </Typography>
            <Button color="inherit" onClick={logout}>Logout</Button>
          </>
        )}
      </Toolbar>
    </MAppBar>
  );
}
