import { Box, Typography } from "@mui/material";

export function UploadVideoHeader() {
  return (
    <Box>
      <Typography
        variant="overline"
        sx={{ color: "#f97316", letterSpacing: 1.4 }}
      >
        Studio Upload
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
        Đăng video mới
      </Typography>
    </Box>
  );
}
