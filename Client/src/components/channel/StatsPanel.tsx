import { useMemo } from "react";
import {
  Alert,
  Box,
  Button,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { useChannelStats } from "../../hooks/useChannelStats";

export default function StatsPanel() {
  const { data, isLoading, isError, error, refetch, isFetching } =
    useChannelStats();

  const stats = useMemo(() => {
    const totalViews = Number(data?.totalViews ?? 0);
    const totalSubscribers = Number(data?.totalSubscribers ?? 0);
    const totalLikes = Number(data?.totalLikes ?? 0);
    const totalDislikes = Number(data?.totalDislikes ?? 0);

    const monthlyViews = Number(data?.monthlyViews ?? data?.last30DaysViews ?? 0);
    const monthlyLikes = Number(data?.monthlyLikes ?? 0);
    const monthlyDislikes = Number(data?.monthlyDislikes ?? 0);

    return {
      totalViews,
      totalSubscribers,
      totalLikes,
      totalDislikes,
      monthlyViews,
      monthlyLikes,
      monthlyDislikes,
    };
  }, [data]);

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Thống kê kênh
        </Typography>
        <Typography variant="body2" sx={{ color: "#a3a3a3", mt: 0.5 }}>
          Theo dõi số người theo dõi, lượt xem, like và dislike.
        </Typography>
      </Box>

      {isLoading ? <LoadingSection /> : null}

      {isError ? (
        <Alert
          severity="error"
          action={
            <Button
              size="small"
              color="inherit"
              onClick={() => {
                void refetch();
              }}
            >
              Thử lại
            </Button>
          }
        >
          {(error as Error | null)?.message || "Không tải được thống kê kênh."}
        </Alert>
      ) : null}

      {!isLoading && !isError ? (
        <Stack spacing={2}>
          <Typography variant="subtitle2" sx={{ color: "#d4d4d4", fontWeight: 700 }}>
            Tổng quan
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(4, minmax(0, 1fr))",
              },
              gap: 1.25,
            }}
          >
            <StatCard label="Follower" value={formatNumber(stats.totalSubscribers)} />
            <StatCard label="Tổng lượt xem" value={formatNumber(stats.totalViews)} />
            <StatCard label="Tổng lượt thích" value={formatNumber(stats.totalLikes)} />
            <StatCard
              label="Tổng lượt không thích"
              value={formatNumber(stats.totalDislikes)}
            />
          </Box>

          <Typography variant="subtitle2" sx={{ color: "#d4d4d4", fontWeight: 700 }}>
            Tháng hiện tại
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(3, minmax(0, 1fr))",
              },
              gap: 1.25,
            }}
          >
            <StatCard label="View trong tháng" value={formatNumber(stats.monthlyViews)} />
            <StatCard label="Like trong tháng" value={formatNumber(stats.monthlyLikes)} />
            <StatCard
              label="Dislike trong tháng"
              value={formatNumber(stats.monthlyDislikes)}
            />
          </Box>
          {isFetching ? (
            <Typography variant="caption" sx={{ color: "#9ca3af" }}>
              Đang làm mới dữ liệu...
            </Typography>
          ) : null}
        </Stack>
      ) : null}
    </Stack>
  );
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("vi-VN").format(Math.max(0, value));
}

function LoadingSection() {
  return (
    <Stack spacing={2}>
      <Skeleton width={140} height={24} sx={{ bgcolor: "rgba(255,255,255,0.12)" }} />
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(4, minmax(0, 1fr))",
          },
          gap: 1.25,
        }}
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <LoadingCard key={`total-${index}`} />
        ))}
      </Box>

      <Skeleton width={170} height={24} sx={{ bgcolor: "rgba(255,255,255,0.12)" }} />
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(3, minmax(0, 1fr))",
          },
          gap: 1.25,
        }}
      >
        {Array.from({ length: 3 }).map((_, index) => (
          <LoadingCard key={`month-${index}`} />
        ))}
      </Box>
    </Stack>
  );
}

function LoadingCard() {
  return (
    <Paper sx={{ p: 1.75, bgcolor: "#181818", borderRadius: 2 }}>
      <Skeleton width="60%" height={18} sx={{ bgcolor: "rgba(255,255,255,0.12)" }} />
      <Skeleton width="45%" height={32} sx={{ bgcolor: "rgba(255,255,255,0.12)" }} />
    </Paper>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Paper
      sx={{
        p: 1.75,
        bgcolor: "#181818",
        borderRadius: 2,
        border: "1px solid rgba(255,255,255,0.06)",
      }}
      elevation={0}
    >
      <Typography variant="caption" sx={{ color: "#9ca3af", display: "block", mb: 0.4 }}>
        {label}
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
        {value}
      </Typography>
    </Paper>
  );
}
