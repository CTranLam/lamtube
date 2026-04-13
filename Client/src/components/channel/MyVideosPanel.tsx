import { Paper, Typography, List, ListItem, ListItemText } from "@mui/material";
import { useMyVideos } from "../../hooks/useMyVideos";

export default function MyVideosPanel() {
  const { data, isLoading, error } = useMyVideos();

  return (
    <Paper sx={{ p: 2, bgcolor: "#181818" }} elevation={2}>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Video của tôi
      </Typography>

      {isLoading && (
        <Typography variant="body2" color="text.secondary">
          Đang tải danh sách video...
        </Typography>
      )}

      {error && (
        <Typography variant="body2" color="error">
          Không tải được danh sách video.
        </Typography>
      )}

      {data && data.length === 0 && !isLoading && !error && (
        <Typography variant="body2" color="text.secondary">
          Bạn chưa có video nào.
        </Typography>
      )}

      {data && data.length > 0 && (
        <List dense>
          {data.map((video) => (
            <ListItem key={video.id} disableGutters>
              <ListItemText
                primary={video.title}
                secondary={video.views}
                primaryTypographyProps={{ noWrap: true }}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
}
