import {
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
  alpha,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { Link } from "react-router-dom";
import type { MyVideo } from "../../types/channel";
import { toStatusLabel } from "../../utils/utils";

interface MyVideoItemProps {
  video: MyVideo;
  disabled?: boolean;
  onEdit: (video: MyVideo) => void;
  onDelete: (video: MyVideo) => void;
}

export function MyVideoItem({ video, disabled = false, onEdit, onDelete }: MyVideoItemProps) {
  return (
    <Paper
      elevation={0}
      component={Link}
      to={`/watch/${video.id}`}
      sx={{
        display: "block",
        p: 1.5,
        bgcolor: alpha("#fff", 0.03),
        border: "1px solid",
        borderColor: "divider",
        textDecoration: "none",
        color: "inherit",
        transition: "border-color 0.2s ease, background-color 0.2s ease",
        "&:hover": {
          borderColor: "primary.main",
          bgcolor: alpha("#fff", 0.05),
        },
      }}
    >
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
        <Box
          component="img"
          src={video.thumbnailUrl}
          alt={video.title}
          sx={{
            width: { xs: "100%", sm: 220 },
            height: { xs: 170, sm: 124 },
            borderRadius: 1.5,
            objectFit: "cover",
            flexShrink: 0,
            bgcolor: alpha("#fff", 0.08),
          }}
        />

        <Stack spacing={1} sx={{ minWidth: 0, width: "100%" }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            spacing={1}
          >
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, minWidth: 0 }}
              noWrap
              title={video.title}
            >
              {video.title}
            </Typography>
            <Stack direction="row" spacing={0.5}>
              <Tooltip title="Sửa video">
                <IconButton
                  size="small"
                  color="default"
                  disabled={disabled}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    onEdit(video);
                  }}
                >
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Xóa video">
                <IconButton
                  size="small"
                  color="error"
                  disabled={disabled}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    onDelete(video);
                  }}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {video.description || "Không có mô tả"}
          </Typography>

          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
            <Chip
              size="small"
              label={toStatusLabel(video.status)}
              color={video.status === "public" ? "success" : "default"}
            />
            <Chip size="small" variant="outlined" label={`${video.viewCount} lượt xem`} />
            <Chip
              size="small"
              variant="outlined"
              label={video.categoryName?.trim() ? video.categoryName : "Chưa có danh mục"}
            />
          </Stack>

          <Stack direction="row" spacing={1}>
            <Tooltip title="Mở trang xem chi tiết video">
              <Button size="small" variant="outlined">
                Xem video
              </Button>
            </Tooltip>
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  );
}
