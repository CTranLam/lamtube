import { Box, Skeleton } from "@mui/material";

export default function HomeVideoItem() {
  return (
    <Box
      sx={{
        backgroundColor: "#212121",
        borderRadius: 2,
        overflow: "hidden",
        border: "1px solid #333",
      }}
    >
      <Skeleton
        variant="rectangular"
        width="100%"
        height={180}
        animation="wave"
        sx={{ bgcolor: "#333" }}
      />
      <Box sx={{ p: 1.5 }}>
        <Skeleton
          width="100%"
          height={24}
          animation="wave"
          sx={{ bgcolor: "#333", mb: 1 }}
        />
        <Skeleton
          width="60%"
          height={18}
          animation="wave"
          sx={{ bgcolor: "#333" }}
        />
      </Box>
    </Box>
  );
}
