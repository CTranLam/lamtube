import { Box, Typography, Paper } from "@mui/material";

export default function AdminDashboard() {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Tổng quan
      </Typography>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 2,
          bgcolor: "#0ea5e9",
          border: "none",
        }}
      >
        <Typography variant="body2" sx={{ color: "#e0f2fe", fontWeight: 500 }}>
          Khu vực Dashboard admin
        </Typography>
      </Paper>
    </Box>
  );
}
