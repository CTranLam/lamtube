import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import PlaylistPlayRoundedIcon from "@mui/icons-material/PlaylistPlayRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  useCreatePlaylist,
  useDeletePlaylist,
  useMyPlaylists,
  useUpdatePlaylist,
} from "../hooks/usePlaylists";
import type { PlaylistListItem } from "../types/playlist";

function privacyLabel(isPrivate: boolean): string {
  return isPrivate ? "Riêng tư" : "Công khai";
}

export default function Playlists() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: playlists = [], isLoading, isError, error } = useMyPlaylists(Boolean(user));
  const createMutation = useCreatePlaylist();
  const updateMutation = useUpdatePlaylist();
  const deleteMutation = useDeletePlaylist();

  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrivate, setNewPrivate] = useState(true);

  const [editing, setEditing] = useState<PlaylistListItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrivate, setEditPrivate] = useState(true);

  const [localError, setLocalError] = useState<string | null>(null);

  const displayError = useMemo(() => {
    if (localError) return localError;
    if (createMutation.error instanceof Error) return createMutation.error.message;
    if (updateMutation.error instanceof Error) return updateMutation.error.message;
    if (deleteMutation.error instanceof Error) return deleteMutation.error.message;
    if (error instanceof Error) return error.message;
    return null;
  }, [createMutation.error, deleteMutation.error, error, localError, updateMutation.error]);

  if (!user) {
    return (
      <Stack spacing={2} alignItems="flex-start" sx={{ p: { xs: 1, sm: 2 } }}>
        <Typography variant="h5" sx={{ color: "#fff", fontWeight: 700 }}>
          Danh sách phát
        </Typography>
        <Typography sx={{ color: "#bdbdbd" }}>
          Bạn cần đăng nhập để xem playlist của mình.
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

  const openEditDialog = (playlist: PlaylistListItem) => {
    setLocalError(null);
    setEditing(playlist);
    setEditName(playlist.name);
    setEditPrivate(playlist.isPrivate);
  };

  const closeEditDialog = () => {
    if (updateMutation.isPending) return;
    setEditing(null);
    setEditName("");
    setEditPrivate(true);
  };

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) {
      setLocalError("Vui lòng nhập tên playlist.");
      return;
    }
    setLocalError(null);
    try {
      await createMutation.mutateAsync({ name, isPrivate: newPrivate });
      setCreateOpen(false);
      setNewName("");
      setNewPrivate(true);
    } catch {
      return;
    }
  };

  const handleUpdate = async () => {
    if (!editing) return;
    const name = editName.trim();
    if (!name) {
      setLocalError("Vui lòng nhập tên playlist.");
      return;
    }
    setLocalError(null);
    try {
      await updateMutation.mutateAsync({
        playlistId: editing.id,
        payload: { name, isPrivate: editPrivate },
      });
      closeEditDialog();
    } catch {
      return;
    }
  };

  const handleDelete = async (playlist: PlaylistListItem) => {
    const confirmed = window.confirm(`Bạn có chắc muốn xóa playlist "${playlist.name}"?`);
    if (!confirmed) return;

    setLocalError(null);
    try {
      await deleteMutation.mutateAsync(playlist.id);
    } catch {
      return;
    }
  };

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
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <PlaylistPlayRoundedIcon sx={{ color: "#9ad0ff" }} />
              <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: 20, md: 24 } }}>
                Danh sách phát
              </Typography>
            </Stack>
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={() => {
                setLocalError(null);
                setCreateOpen(true);
              }}
              sx={{ textTransform: "none", fontWeight: 700 }}
            >
              Tạo playlist
            </Button>
          </Stack>
        </Paper>

        {isLoading && <Typography sx={{ color: "#bdbdbd" }}>Đang tải playlist...</Typography>}

        {(isError || displayError) && (
          <Typography sx={{ color: "#ff8a80" }}>
            {displayError ?? "Không thể tải playlist."}
          </Typography>
        )}

        {!isLoading && !isError && playlists.length === 0 && (
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
              Bạn chưa có playlist nào
            </Typography>
            <Typography sx={{ color: "#9f9f9f" }}>
              Tạo playlist mới để lưu video bạn muốn xem lại.
            </Typography>
          </Paper>
        )}

        {!isLoading &&
          !isError &&
          playlists.map((playlist) => (
            <Paper
              key={playlist.id}
              sx={{
                p: 1.5,
                borderRadius: 3,
                bgcolor: "#151515",
                border: "1px solid #2b2b2b",
                transition: "all 0.2s ease",
                "&:hover": { borderColor: "#4a4a4a", bgcolor: "#1a1a1a" },
              }}
            >
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={1.5}
                alignItems={{ xs: "stretch", md: "center" }}
                justifyContent="space-between"
              >
                <Box
                  onClick={() => {
                    navigate(`/playlists/${playlist.id}`);
                  }}
                  sx={{ cursor: "pointer", minWidth: 0, flex: 1 }}
                >
                  <Typography
                    sx={{
                      fontSize: { xs: 17, md: 20 },
                      fontWeight: 700,
                      mb: 0.35,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {playlist.name}
                  </Typography>
                  <Stack direction="row" spacing={1.25} alignItems="center" sx={{ color: "#a8a8a8" }}>
                    <Typography variant="body2">{playlist.videoCount} video</Typography>
                    <Typography variant="body2">•</Typography>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      {playlist.isPrivate ? (
                        <VisibilityOffRoundedIcon sx={{ fontSize: 15 }} />
                      ) : (
                        <PublicRoundedIcon sx={{ fontSize: 15 }} />
                      )}
                      <Typography variant="body2">{privacyLabel(playlist.isPrivate)}</Typography>
                    </Stack>
                  </Stack>
                </Box>

                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    color="inherit"
                    startIcon={<EditRoundedIcon />}
                    onClick={() => {
                      openEditDialog(playlist);
                    }}
                    sx={{ textTransform: "none", borderColor: "#525252" }}
                  >
                    Sửa
                  </Button>
                  <Button
                    variant="outlined"
                    color="inherit"
                    startIcon={<DeleteOutlineRoundedIcon />}
                    disabled={deleteMutation.isPending}
                    onClick={() => {
                      void handleDelete(playlist);
                    }}
                    sx={{ textTransform: "none", borderColor: "#7a3c3c", color: "#ffb4b4" }}
                  >
                    Xóa
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          ))}

        <Dialog
          open={createOpen}
          onClose={() => {
            if (createMutation.isPending) return;
            setCreateOpen(false);
          }}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle>Tạo playlist mới</DialogTitle>
          <DialogContent>
            <Stack spacing={1.2} sx={{ pt: 0.5 }}>
              <TextField
                fullWidth
                size="small"
                label="Tên playlist"
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
              />
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography>Riêng tư</Typography>
                <Switch
                  checked={newPrivate}
                  onChange={(event) => setNewPrivate(event.target.checked)}
                />
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                if (createMutation.isPending) return;
                setCreateOpen(false);
              }}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                void handleCreate();
              }}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Đang tạo..." : "Tạo"}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={Boolean(editing)} onClose={closeEditDialog} fullWidth maxWidth="xs">
          <DialogTitle>Chỉnh sửa playlist</DialogTitle>
          <DialogContent>
            <Stack spacing={1.2} sx={{ pt: 0.5 }}>
              <TextField
                fullWidth
                size="small"
                label="Tên playlist"
                value={editName}
                onChange={(event) => setEditName(event.target.value)}
              />
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography>Riêng tư</Typography>
                <Switch
                  checked={editPrivate}
                  onChange={(event) => setEditPrivate(event.target.checked)}
                />
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeEditDialog}>Hủy</Button>
            <Button
              variant="contained"
              onClick={() => {
                void handleUpdate();
              }}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Đang lưu..." : "Lưu"}
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </Box>
  );
}
