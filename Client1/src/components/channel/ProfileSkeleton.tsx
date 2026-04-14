import { Paper, Stack, Skeleton } from "@mui/material";
import { memo } from "react";

const ProfileSkeleton = memo(function ProfileSkeleton() {
  return (
    <Paper sx={{ p: 4, bgcolor: "#181818", borderRadius: 3 }}>
      <Stack spacing={2}>
        <Skeleton
          variant="circular"
          width={100}
          height={100}
          sx={{ bgcolor: "#333" }}
        />
        <Skeleton
          variant="text"
          width="40%"
          height={40}
          sx={{ bgcolor: "#333" }}
        />
        <Skeleton
          variant="rectangular"
          height={100}
          sx={{ bgcolor: "#333", borderRadius: 2 }}
        />
      </Stack>
    </Paper>
  );
});

export default ProfileSkeleton;
