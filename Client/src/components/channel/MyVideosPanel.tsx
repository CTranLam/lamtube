import {
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
  alpha,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { useMyVideos } from "../../hooks/useMyVideos";

function toStatusLabel(status: "public" | "private") {
  return status === "public" ? "Công khai" : "Riêng tư";
}

export default function MyVideosPanel() {
  const { data, isLoading, error } = useMyVideos();

  return (
    <Paper sx={{ p: { xs: 2, md: 3 }, bgcolor: "#181818" }} elevation={2}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
        Video của tôi
      </Typography>

      {isLoading && (
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
      )}

      {error && (
        <Typography variant="body2" color="error">
          Không tải được danh sách video.
        </Typography>
      )}

      {data && data.length === 0 && !isLoading && !error && (
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
      )}

      {data && data.length > 0 && (
        <Stack spacing={1.5}>
          {data.map((video) => (
            <Paper
              key={video.id}
              elevation={0}
              component="a"
              href={video.videoUrl}
              target="_blank"
              rel="noreferrer"
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
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                          }}
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa video">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
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

                  <Stack
                    direction="row"
                    spacing={1}
                    useFlexGap
                    sx={{ flexWrap: "wrap" }}
                  >
                    <Chip
                      size="small"
                      label={toStatusLabel(video.status)}
                      color={video.status === "public" ? "success" : "default"}
                    />
                    <Chip
                      size="small"
                      variant="outlined"
                      label={`${video.viewCount} lượt xem`}
                    />
                    <Chip
                      size="small"
                      variant="outlined"
                      label={
                        video.categoryName?.trim()
                          ? video.categoryName
                          : "Chưa có danh mục"
                      }
                    />
                  </Stack>

                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Mở video ở tab mới">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={(event) => {
                          event.preventDefault();
                          window.open(
                            video.videoUrl,
                            "_blank",
                            "noopener,noreferrer",
                          );
                        }}
                      >
                        Xem video
                      </Button>
                    </Tooltip>
                  </Stack>
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </Paper>
  );
}
