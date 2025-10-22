import React, { useEffect, useState } from "react";
import api from "../api/client";
import { Box, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";

type Order = {
  id: string;
  totalCents: number;
  patient: { firstName: string; lastName: string };
  createdAt: string;
  status: string;
};

export default function Orders() {
  const [rows, setRows] = useState<Order[]>([]);

  useEffect(() => {
    (async () => {
      const res = await api.get("/orders");
      setRows(res.data.items);
    })();
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Orders</Typography>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Created</TableCell>
              <TableCell>Patient</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(r => (
              <TableRow key={r.id}>
                <TableCell>{new Date(r.createdAt).toLocaleString()}</TableCell>
                <TableCell>{r.patient.lastName}, {r.patient.firstName}</TableCell>
                <TableCell align="right">${(r.totalCents/100).toFixed(2)}</TableCell>
                <TableCell>{r.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
