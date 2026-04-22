import { Outlet } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import { AdminSidebar } from "../components/admin/AdminSidebar";

export default function AdminLayout() {
  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "#0f0f0f",
        color: "#f4f4f5",
      }}
    >
      <AdminSidebar />
      <Box
        component="main"
        sx={{
          flex: 1,
          p: 4,
          ml: { xs: 0, sm: 30 },
          bgcolor: "#0f0f0f",
        }}
      >
        <Box
          sx={{
            mb: 3,
            pb: 1.5,
            borderBottom: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600, color: "#fafafa" }}>
            Admin Dashboard
          </Typography>
        </Box>
        <Outlet />
      </Box>
    </Box>
  );
}
