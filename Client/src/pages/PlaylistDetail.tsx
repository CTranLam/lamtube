import { useMemo } from "react";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  useMyPlaylists,
  usePlaylistVideos,
  useRemoveVideoFromPlaylist,
} from "../hooks/usePlaylists";

function formatViewCount(value: number): string {
  return `${new Intl.NumberFormat("vi-VN").format(value)} lượt xem`;
}

export default function PlaylistDetail() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { playlistId: rawPlaylistId } = useParams();

  const playlistId = Number(rawPlaylistId);
  const validPlaylistId = Number.isFinite(playlistId) && playlistId > 0;

  const playlistsQuery = useMyPlaylists(Boolean(user));
  const videosQuery = usePlaylistVideos(playlistId, Boolean(user) && validPlaylistId);
  const removeMutation = useRemoveVideoFromPlaylist();

  const playlist = useMemo(
    () => playlistsQuery.data?.find((item) => item.id === playlistId),
    [playlistId, playlistsQuery.data],
  );

  if (!user) {
    return (
      <Stack spacing={2} alignItems="flex-start" sx={{ p: { xs: 1, sm: 2 } }}>
        <Typography variant="h5" sx={{ color: "#fff", fontWeight: 700 }}>
          Chi tiết playlist
        </Typography>
        <Typography sx={{ color: "#bdbdbd" }}>
          Bạn cần đăng nhập để xem playlist.
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

  if (!validPlaylistId) {
    return <Typography sx={{ color: "#ff8a80" }}>Playlist không hợp lệ.</Typography>;
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
              "linear-gradient(115deg, rgba(36,36,36,0.96) 0%, rgba(17,17,17,0.96) 100%)",
          }}
        >
          <Stack spacing={1.2}>
            <Button
              variant="text"
              startIcon={<ArrowBackRoundedIcon />}
              onClick={() => {
                navigate("/playlists");
              }}
              sx={{ textTransform: "none", color: "#d0d0d0", alignSelf: "flex-start", px: 0 }}
            >
              Quay lại danh sách playlist
            </Button>

            <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: 20, md: 24 } }}>
              {playlist?.name ?? "Chi tiết playlist"}
            </Typography>

            <Stack direction="row" spacing={1.25} sx={{ color: "#b7b7b7" }} alignItems="center">
              <Typography variant="body2">{playlist?.videoCount ?? videosQuery.data?.length ?? 0} video</Typography>
              <Typography variant="body2">•</Typography>
              <Stack direction="row" spacing={0.5} alignItems="center">
                {playlist?.isPrivate ? (
                  <VisibilityOffRoundedIcon sx={{ fontSize: 15 }} />
                ) : (
                  <PublicRoundedIcon sx={{ fontSize: 15 }} />
                )}
                <Typography variant="body2">{playlist?.isPrivate ? "Riêng tư" : "Công khai"}</Typography>
              </Stack>
            </Stack>
          </Stack>
        </Paper>

        {(playlistsQuery.isLoading || videosQuery.isLoading) && (
          <Typography sx={{ color: "#bdbdbd" }}>Đang tải playlist...</Typography>
        )}

        {(playlistsQuery.error instanceof Error || videosQuery.error instanceof Error) && (
          <Typography sx={{ color: "#ff8a80" }}>
            {playlistsQuery.error instanceof Error
              ? playlistsQuery.error.message
              : videosQuery.error instanceof Error
                ? videosQuery.error.message
                : "Không thể tải chi tiết playlist."}
          </Typography>
        )}

        {!videosQuery.isLoading && !videosQuery.isError && (videosQuery.data?.length ?? 0) === 0 && (
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
              Playlist chưa có video
            </Typography>
            <Typography sx={{ color: "#9f9f9f" }}>
              Hãy lưu video từ trang xem video để thêm vào playlist này.
            </Typography>
          </Paper>
        )}

        {!videosQuery.isLoading &&
          !videosQuery.isError &&
          videosQuery.data?.map((video) => (
            <Paper
              key={video.id}
              sx={{
                p: 1.5,
                borderRadius: 3,
                bgcolor: "#151515",
                border: "1px solid #2b2b2b",
                transition: "all 0.2s ease",
                "&:hover": { borderColor: "#4a4a4a", bgcolor: "#1a1a1a" },
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

                <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
                  <Button
                    variant="outlined"
                    color="inherit"
                    startIcon={<DeleteOutlineRoundedIcon />}
                    onClick={() => {
                      void removeMutation.mutateAsync({ playlistId, videoId: video.id });
                    }}
                    disabled={removeMutation.isPending}
                    sx={{ textTransform: "none", borderColor: "#7a3c3c", color: "#ffb4b4" }}
                  >
                    Xóa khỏi playlist
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          ))}
      </Stack>
    </Box>
  );
}
