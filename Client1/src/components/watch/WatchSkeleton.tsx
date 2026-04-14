import { Box, Paper, Skeleton } from "@mui/material";

export default function WatchSkeleton() {
  return (
    <Box sx={{ maxWidth: 1200, margin: "0 auto" }}>
      <Paper sx={{ backgroundColor: "#212121", aspectRatio: "16/9", mb: 2 }}>
        <Skeleton
          variant="rectangular"
          width="100%"
          height="100%"
          sx={{ backgroundColor: "#333" }}
        />
      </Paper>
      <Box sx={{ p: 2 }}>
        <Skeleton
          width="80%"
          height={32}
          sx={{ backgroundColor: "#333", mb: 1 }}
        />
        <Skeleton
          width="40%"
          height={20}
          sx={{ backgroundColor: "#333", mb: 2 }}
        />
        <Skeleton width="100%" height={100} sx={{ backgroundColor: "#333" }} />
      </Box>
    </Box>
  );
}
