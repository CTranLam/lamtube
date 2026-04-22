import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import type { PlaylistPickerItem } from "../../types/playlist";
import { usePlaylistPicker } from "../../hooks/usePlaylistPicker";

type SaveToPlaylistDialogProps = {
  open: boolean;
  videoId: number;
  isAuthenticated: boolean;
  onClose: () => void;
  onRequireLogin: () => void;
};

function playlistMetaText(item: PlaylistPickerItem): string {
  return item.isPrivate ? "Riêng tư" : "Công khai";
}

export default function SaveToPlaylistDialog({
  open,
  videoId,
  isAuthenticated,
  onClose,
  onRequireLogin,
}: SaveToPlaylistDialogProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);

  const {
    data: playlists = [],
    isLoading,
    isError,
    error,
    togglePlaylistVideo,
    isToggling,
    toggleError,
    createPlaylistWithVideo,
    isCreatingPlaylist,
    createPlaylistError,
  } = usePlaylistPicker(videoId, open && isAuthenticated);

  const submitting = isToggling;

  const displayError = useMemo(() => {
    if (localError) return localError;
    if (toggleError instanceof Error) return toggleError.message;
    if (createPlaylistError instanceof Error) return createPlaylistError.message;
    if (isError && error instanceof Error) return error.message;
    return null;
  }, [createPlaylistError, error, isError, localError, toggleError]);

  const handleToggle = async (playlist: PlaylistPickerItem) => {
    if (!isAuthenticated) {
      onRequireLogin();
      return;
    }

    setLocalError(null);
    try {
      await togglePlaylistVideo({
        playlistId: playlist.id,
        containsVideo: playlist.containsVideo,
      });
    } catch {
      return;
    }
  };

  const handleCreateAndAdd = async () => {
    if (!isAuthenticated) {
      onRequireLogin();
      return;
    }
    const name = newPlaylistName.trim();
    if (!name) {
      setLocalError("Vui lòng nhập tên danh sách phát.");
      return;
    }

    setLocalError(null);
    try {
      await createPlaylistWithVideo({ name, isPrivate });
      setNewPlaylistName("");
      setIsPrivate(true);
      setIsCreateDialogOpen(false);
    } catch {
      return;
    }
  };

  const handleOpenCreateDialog = () => {
    if (!isAuthenticated) {
      onRequireLogin();
      return;
    }
    setLocalError(null);
    onClose();
    setIsCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    if (isCreatingPlaylist) return;
    setIsCreateDialogOpen(false);
    setNewPlaylistName("");
    setIsPrivate(true);
    setLocalError(null);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            bgcolor: "#252525",
            color: "#fff",
            borderRadius: 3,
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pr: 6 }}>
          Lưu vào...
          <IconButton
            aria-label="Đóng"
            onClick={onClose}
            sx={{ position: "absolute", top: 10, right: 10, color: "#bbb" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 0.5, pb: 2 }}>
          {isLoading ? (
            <Typography sx={{ color: "#bdbdbd", mb: 1.5 }}>
              Đang tải danh sách phát...
            </Typography>
          ) : null}

          {!isLoading && playlists.length === 0 ? (
            <Typography sx={{ color: "#bdbdbd", mb: 1.5 }}>
              Chưa có danh sách phát nào.
            </Typography>
          ) : null}

          <Stack spacing={0.5}>
            {playlists.map((playlist) => (
              <Button
                key={playlist.id}
                variant="text"
                onClick={() => {
                  void handleToggle(playlist);
                }}
                disabled={submitting}
                sx={{
                  textTransform: "none",
                  justifyContent: "space-between",
                  alignItems: "center",
                  py: 1,
                  px: 0.5,
                  color: "#fff",
                }}
              >
                <Box sx={{ textAlign: "left", minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 600 }} noWrap>
                    {playlist.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#9e9e9e" }}>
                    {playlistMetaText(playlist)}
                  </Typography>
                </Box>
                <Checkbox
                  checked={playlist.containsVideo}
                  disabled={submitting}
                  tabIndex={-1}
                  sx={{ color: "#d1d5db", "&.Mui-checked": { color: "#fff" } }}
                />
              </Button>
            ))}
          </Stack>

          <Divider sx={{ borderColor: "rgba(255,255,255,0.12)", my: 1.5 }} />

          <Button
            fullWidth
            startIcon={<AddIcon />}
            variant="outlined"
            onClick={handleOpenCreateDialog}
            sx={{
              textTransform: "none",
              borderRadius: 99,
              color: "#fff",
              borderColor: "rgba(255,255,255,0.2)",
            }}
          >
            Danh sách phát mới
          </Button>
          {displayError ? (
            <Typography variant="caption" sx={{ color: "#ef4444", display: "block", mt: 1.25 }}>
              {displayError}
            </Typography>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={isCreateDialogOpen}
        onClose={handleCloseCreateDialog}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            bgcolor: "#252525",
            color: "#fff",
            borderRadius: 3,
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pr: 6 }}>
          Danh sách phát mới
          <IconButton
            aria-label="Đóng"
            onClick={handleCloseCreateDialog}
            sx={{ position: "absolute", top: 10, right: 10, color: "#bbb" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 0.5, pb: 2 }}>
          <Stack spacing={1.2}>
            <Typography variant="body2" sx={{ color: "#cfcfcf", fontWeight: 600 }}>
              Tên danh sách phát
            </Typography>
            <TextField
              fullWidth
              size="small"
              autoFocus
              placeholder="Nhập tên danh sách phát"
              value={newPlaylistName}
              onChange={(event) => setNewPlaylistName(event.target.value)}
              sx={{
                "& .MuiInputBase-input": { color: "#fff" },
                "& .MuiInputBase-input::placeholder": { color: "#9e9e9e", opacity: 1 },
              }}
            />
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="body2" sx={{ color: "#cfcfcf" }}>
                Riêng tư
              </Typography>
              <Switch
                checked={isPrivate}
                onChange={(event) => setIsPrivate(event.target.checked)}
              />
            </Stack>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button
                onClick={handleCloseCreateDialog}
                sx={{ textTransform: "none", color: "#d1d5db" }}
              >
                Hủy
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  void handleCreateAndAdd();
                }}
                disabled={isCreatingPlaylist}
                sx={{ textTransform: "none" }}
              >
                {isCreatingPlaylist ? "Đang tạo..." : "Tạo và lưu video"}
              </Button>
            </Stack>
          </Stack>
          {displayError ? (
            <Typography variant="caption" sx={{ color: "#ef4444", display: "block", mt: 1.25 }}>
              {displayError}
            </Typography>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
