import { Paper, Typography, alpha } from "@mui/material";

export function MyVideosEmpty() {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        bgcolor: alpha("#fff", 0.03),
        border: "1px dashed",
        borderColor: "divider",
      }}
    >
      <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
        Bạn chưa có video nào
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Hãy đăng video đầu tiên để bắt đầu xây dựng kênh của bạn.
      </Typography>
    </Paper>
  );
}
