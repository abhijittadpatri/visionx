import React, { useState } from "react";
import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import api from "../api/client";
import { useNavigate } from "react-router-dom";

export default function NewPatient() {
  const nav = useNavigate();
  const [firstName, setFirst] = useState("");
  const [lastName, setLast] = useState("");
  const [email, setEmail] = useState("");

  const save = async () => {
    await api.post("/patients", { firstName, lastName, email });
    nav("/patients");
  };

  return (
    <Box sx={{ p: 2, display: "grid", placeItems: "center" }}>
      <Paper sx={{ p: 3, width: 480, display: "grid", gap: 2 }}>
        <Typography variant="h6">New patient</Typography>
        <TextField label="First name" value={firstName} onChange={e => setFirst(e.target.value)} />
        <TextField label="Last name" value={lastName} onChange={e => setLast(e.target.value)} />
        <TextField label="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <Button variant="contained" onClick={save}>Save</Button>
      </Paper>
    </Box>
  );
}
