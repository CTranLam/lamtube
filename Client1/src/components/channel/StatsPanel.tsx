import { Paper, Typography, Box } from "@mui/material";
import { useChannelStats } from "../../hooks/useChannelStats";

export default function StatsPanel() {
  const { data, isLoading, error } = useChannelStats();

  return (
    <Paper sx={{ p: 2, bgcolor: "#181818" }} elevation={2}>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Thống kê
      </Typography>

      {isLoading && (
        <Typography variant="body2" color="text.secondary">
          Đang tải thống kê kênh...
        </Typography>
      )}

      {error && (
        <Typography variant="body2" color="error">
          Không tải được thống kê kênh.
        </Typography>
      )}

      {data && !isLoading && !error && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mt: 1 }}>
          <StatItem
            label="Tổng lượt xem"
            value={data.totalViews.toLocaleString()}
          />
          <StatItem
            label="Số người đăng ký"
            value={data.totalSubscribers.toLocaleString()}
          />
          <StatItem label="Tổng số video" value={data.totalVideos.toString()} />
          <StatItem
            label="Lượt xem 30 ngày qua"
            value={data.last30DaysViews.toLocaleString()}
          />
        </Box>
      )}
    </Paper>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h6">{value}</Typography>
    </Box>
  );
}
