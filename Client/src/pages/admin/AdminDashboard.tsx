import { Box, Typography, Paper } from "@mui/material";

export default function AdminDashboard() {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "#f4f4f5" }}>
        Tổng quan
      </Typography>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 2,
          bgcolor: "#181818",
          border: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <Typography variant="body2" sx={{ color: "#d4d4d8", fontWeight: 500 }}>
          Khu vực Dashboard admin
        </Typography>
      </Paper>
    </Box>
  );
}
