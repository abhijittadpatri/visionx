import React, { useEffect, useState } from "react";
import api from "../api/client";
import { Box, Button, Paper, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { Link } from "react-router-dom";

type Patient = {
  id: string; firstName: string; lastName: string; email?: string;
};

export default function Patients() {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const res = await api.get("/patients", { params: { q } });
    setRows(res.data.items);
    setLoading(false);
  };

  useEffect(() => { fetchData(); /* eslint-disable-next-line */ }, []);

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <Typography variant="h5" sx={{ flexGrow: 1 }}>Patients</Typography>
        <TextField size="small" placeholder="Search…" value={q} onChange={e => setQ(e.target.value)} />
        <Button variant="outlined" onClick={fetchData} disabled={loading}>Refresh</Button>
        <Button variant="contained" component={Link} to="/patients/new">New patient</Button>
      </Box>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell><TableCell>Email</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(r => (
              <TableRow key={r.id}>
                <TableCell>{r.lastName}, {r.firstName}</TableCell>
                <TableCell>{r.email ?? "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
