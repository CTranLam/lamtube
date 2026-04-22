import { Paper, Skeleton, Stack, alpha } from "@mui/material";

export function MyVideosLoading() {
  return (
    <Stack spacing={1.5}>
      {Array.from({ length: 3 }).map((_, idx) => (
        <Paper
          key={idx}
          elevation={0}
          sx={{
            p: 1.5,
            bgcolor: alpha("#fff", 0.03),
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Skeleton
              variant="rounded"
              sx={{
                width: { xs: "100%", sm: 220 },
                height: { xs: 170, sm: 124 },
                flexShrink: 0,
              }}
            />
            <Stack spacing={1} sx={{ minWidth: 0, width: "100%" }}>
              <Skeleton variant="text" width="58%" height={32} />
              <Skeleton variant="text" width="100%" />
              <Skeleton variant="text" width="84%" />
              <Stack direction="row" spacing={1}>
                <Skeleton variant="rounded" width={90} height={24} />
                <Skeleton variant="rounded" width={110} height={24} />
                <Skeleton variant="rounded" width={130} height={24} />
              </Stack>
            </Stack>
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
}
