import React from "react";
import { Outlet } from "react-router-dom";
import AppBar from "./components/AppBar";
import { Container } from "@mui/material";

export default function App() {
  return (
    <>
      <AppBar />
      <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
        <Outlet />
      </Container>
    </>
  );
}
