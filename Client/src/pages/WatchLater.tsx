import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useWatchLaterVideos } from "../hooks/useWatchLaterVideos";

function formatViewCount(value: number): string {
  return `${new Intl.NumberFormat("vi-VN").format(value)} lượt xem`;
}

export default function WatchLater() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [localError, setLocalError] = useState<string | null>(null);

  const {
    data: videos = [],
    isLoading,
    isError,
    error,
    removeFromWatchLater,
    isRemoving,
    removingVideoId,
    removeError,
  } = useWatchLaterVideos(Boolean(user));

  const displayError = useMemo(() => {
    if (localError) return localError;
    if (removeError instanceof Error) return removeError.message;
    if (error instanceof Error) return error.message;
    return null;
  }, [error, localError, removeError]);

  const handleRemoveVideo = async (videoId: number) => {
    setLocalError(null);
    try {
      await removeFromWatchLater(videoId);
    } catch {
      setLocalError("Không thể xóa video khỏi danh sách Xem sau.");
    }
  };

  if (!user) {
    return (
      <Stack spacing={2} alignItems="flex-start" sx={{ p: { xs: 1, sm: 2 } }}>
        <Typography variant="h5" sx={{ color: "#fff", fontWeight: 700 }}>
          Xem sau
        </Typography>
        <Typography sx={{ color: "#bdbdbd" }}>
          Bạn cần đăng nhập để xem danh sách Xem sau.
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            navigate("/login");
          }}
          sx={{ textTransform: "none", fontWeight: 600 }}
        >
          Đăng nhập
        </Button>
      </Stack>
    );
  }

  return (
    <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
      <Stack
        spacing={2}
        sx={{
          width: "100%",
          maxWidth: 1220,
          px: { xs: 1, sm: 2, md: 3 },
          py: { xs: 1, sm: 2 },
        }}
      >
        <Paper
          sx={{
            p: { xs: 2, md: 2.5 },
            borderRadius: 3,
            color: "#fff",
            border: "1px solid #2f2f2f",
            background:
              "linear-gradient(120deg, rgba(32,32,32,0.96) 0%, rgba(22,22,22,0.96) 100%)",
          }}
        >
          <Stack spacing={1.5}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <AccessTimeRoundedIcon sx={{ color: "#ffcc80" }} />
              <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: 20, md: 24 } }}>
                Xem sau
              </Typography>
            </Stack>
          </Stack>
        </Paper>

        {isLoading && (
          <Typography sx={{ color: "#bdbdbd" }}>Đang tải danh sách Xem sau...</Typography>
        )}

        {(isError || displayError) && (
          <Typography sx={{ color: "#ff8a80" }}>
            {displayError ?? "Không thể tải danh sách Xem sau."}
          </Typography>
        )}

        {!isLoading && !isError && videos.length === 0 && (
          <Paper
            sx={{
              p: { xs: 2, md: 3 },
              textAlign: "center",
              borderRadius: 3,
              border: "1px dashed #3f3f3f",
              bgcolor: "#141414",
            }}
          >
            <Typography sx={{ color: "#d0d0d0", fontWeight: 700, mb: 0.75 }}>
              Danh sách Xem sau đang trống
            </Typography>
            <Typography sx={{ color: "#9f9f9f" }}>
              Khi bạn lưu video vào danh sách Xem sau, chúng sẽ hiển thị tại đây.
            </Typography>
          </Paper>
        )}

        {!isLoading &&
          !isError &&
          videos.map((video) => {
            const isRemovingCurrent = isRemoving && removingVideoId === video.id;
            return (
              <Paper
                key={video.id}
                sx={{
                  p: 1.5,
                  borderRadius: 3,
                  bgcolor: "#151515",
                  border: "1px solid #2b2b2b",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: "#4a4a4a",
                    bgcolor: "#1a1a1a",
                  },
                }}
              >
                <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
                  <Box
                    component={Link}
                    to={`/watch/${video.id}`}
                    sx={{
                      display: "flex",
                      flex: 1,
                      gap: 1.5,
                      textDecoration: "none",
                      color: "inherit",
                      minWidth: 0,
                      flexDirection: { xs: "column", sm: "row" },
                    }}
                  >
                    <Box
                      component="img"
                      src={video.thumbnailUrl}
                      alt={video.title}
                      sx={{
                        width: { xs: "100%", sm: 240 },
                        aspectRatio: "16/9",
                        borderRadius: 1.5,
                        objectFit: "cover",
                        flexShrink: 0,
                      }}
                    />
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography
                        sx={{
                          fontSize: { xs: 15, sm: 19 },
                          fontWeight: 700,
                          mb: 0.75,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {video.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#c2c2c2", mb: 0.4 }}>
                        {video.uploaderName}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#8f8f8f" }}>
                        {formatViewCount(video.viewCount)}
                      </Typography>
                    </Box>
                  </Box>

                  <Stack
                    direction={{ xs: "row", md: "column" }}
                    spacing={1}
                    justifyContent="center"
                    sx={{ minWidth: { xs: "auto", md: 190 } }}
                  >
                    <Button
                      component={Link}
                      to={`/watch/${video.id}`}
                      variant="contained"
                      startIcon={<PlayArrowRoundedIcon />}
                      sx={{ textTransform: "none", fontWeight: 700 }}
                    >
                      Xem ngay
                    </Button>
                    <Button
                      variant="outlined"
                      color="inherit"
                      startIcon={<DeleteOutlineRoundedIcon />}
                      disabled={isRemovingCurrent}
                      onClick={() => {
                        void handleRemoveVideo(video.id);
                      }}
                      sx={{ textTransform: "none", borderColor: "#525252" }}
                    >
                      {isRemovingCurrent ? "Đang xóa..." : "Xóa khỏi Xem sau"}
                    </Button>
                  </Stack>
                </Stack>
              </Paper>
            );
          })}
      </Stack>
    </Box>
  );
}
