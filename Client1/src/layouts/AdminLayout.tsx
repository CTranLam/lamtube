import { Outlet } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import { AdminSidebar } from "../components/admin/AdminSidebar";

export default function AdminLayout() {
  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "#020617",
        color: "#0f172a",
      }}
    >
      <AdminSidebar />
      <Box
        component="main"
        sx={{
          flex: 1,
          p: 4,
          ml: { xs: 0, sm: 30 },
          bgcolor: "#f8fafc",
        }}
      >
        <Box
          sx={{
            mb: 3,
            pb: 1.5,
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600, color: "#0f172a" }}>
            Admin Dashboard
          </Typography>
        </Box>
        <Outlet />
      </Box>
    </Box>
  );
}
