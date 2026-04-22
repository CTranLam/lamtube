import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Paper, Typography } from "@mui/material";
import { getUploadCategories } from "../../api/videos";
import { useDeleteMyVideo } from "../../hooks/useDeleteMyVideo";
import { useMyVideos } from "../../hooks/useMyVideos";
import { useUpdateMyVideo } from "../../hooks/useUpdateMyVideo";
import type { MyVideo } from "../../types/channel";
import type { UploadVideoCategory } from "../../types/video";
import { DeleteVideoDialog } from "./DeleteVideoDialog";
import { EditVideoDialog } from "./EditVideoDialog";
import { MyVideosEmpty } from "./MyVideosEmpty";
import { MyVideosList } from "./MyVideosList";
import { MyVideosLoading } from "./MyVideosLoading";
import { MyVideosSnackbar } from "./MyVideosSnackbar";
import type { EditFormState, MyVideosSnackbarState } from "../../types/types";
import { toInitialForm } from "../../utils/utils";

export default function MyVideosPanel() {
  const { data, isLoading, error } = useMyVideos();
  const updateMutation = useUpdateMyVideo();
  const deleteMutation = useDeleteMyVideo();

  const [categories, setCategories] = useState<UploadVideoCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const [editVideo, setEditVideo] = useState<MyVideo | null>(null);
  const [deleteVideo, setDeleteVideo] = useState<MyVideo | null>(null);
  const [form, setForm] = useState<EditFormState | null>(null);

  const [snackbar, setSnackbar] = useState<MyVideosSnackbarState>({
    open: false,
    severity: "success",
    message: "",
  });

  useEffect(() => {
    let active = true;

    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const items = await getUploadCategories();
        if (!active) return;
        setCategories(items);
      } catch {
        if (!active) return;
        setCategories([]);
      } finally {
        if (active) {
          setLoadingCategories(false);
        }
      }
    };

    void loadCategories();

    return () => {
      active = false;
    };
  }, []);

  const busyVideoIds = useMemo(() => {
    const ids = new Set<number>();
    if (updateMutation.pendingVideoId != null) {
      ids.add(updateMutation.pendingVideoId);
    }
    if (deleteMutation.pendingVideoId != null) {
      ids.add(deleteMutation.pendingVideoId);
    }
    return ids;
  }, [deleteMutation.pendingVideoId, updateMutation.pendingVideoId]);

  const handleEditOpen = (video: MyVideo) => {
    setEditVideo(video);
    setForm(toInitialForm(video));
  };

  const handleEditClose = () => {
    if (updateMutation.isLoading) return;
    setEditVideo(null);
    setForm(null);
  };

  const handleDeleteOpen = (video: MyVideo) => {
    setDeleteVideo(video);
  };

  const handleDeleteClose = () => {
    if (deleteMutation.isLoading) return;
    setDeleteVideo(null);
  };

  const handleFieldChange =
    (field: keyof EditFormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setForm((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          [field]: value,
        };
      });
    };

  const handleUpdateVideo = async () => {
    if (!editVideo || !form) return;

    if (!form.title.trim()) {
      setSnackbar({
        open: true,
        severity: "error",
        message: "Tiêu đề video không được để trống.",
      });
      return;
    }

    try {
      await updateMutation.update(editVideo.id, {
        title: form.title.trim(),
        description: form.description.trim(),
        categoryId: form.categoryId ? Number(form.categoryId) : null,
        status: form.status,
      });

      setSnackbar({
        open: true,
        severity: "success",
        message: "Cập nhật video thành công.",
      });
      setEditVideo(null);
      setForm(null);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Không thể cập nhật video.";
      setSnackbar({
        open: true,
        severity: "error",
        message,
      });
    }
  };

  const handleDeleteVideo = async () => {
    if (!deleteVideo) return;

    try {
      await deleteMutation.remove(deleteVideo.id);
      setSnackbar({
        open: true,
        severity: "success",
        message: "Đã xóa video khỏi kênh của bạn.",
      });
      setDeleteVideo(null);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Không thể xóa video.";
      setSnackbar({
        open: true,
        severity: "error",
        message,
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <>
      <Paper sx={{ p: { xs: 2, md: 3 }, bgcolor: "#181818" }} elevation={2}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
          Video của tôi
        </Typography>

        {isLoading && <MyVideosLoading />}

        {error && (
          <Typography variant="body2" color="error">
            Không tải được danh sách video.
          </Typography>
        )}

        {data && data.length === 0 && !isLoading && !error && <MyVideosEmpty />}

        {data && data.length > 0 && (
          <MyVideosList
            videos={data}
            busyVideoIds={busyVideoIds}
            onEdit={handleEditOpen}
            onDelete={handleDeleteOpen}
          />
        )}
      </Paper>

      <EditVideoDialog
        open={Boolean(editVideo && form)}
        form={form}
        categories={categories}
        loadingCategories={loadingCategories}
        submitting={updateMutation.isLoading}
        onClose={handleEditClose}
        onSubmit={handleUpdateVideo}
        onFieldChange={handleFieldChange}
      />

      <DeleteVideoDialog
        open={Boolean(deleteVideo)}
        videoTitle={deleteVideo?.title}
        submitting={deleteMutation.isLoading}
        onClose={handleDeleteClose}
        onConfirm={handleDeleteVideo}
      />

      <MyVideosSnackbar state={snackbar} onClose={handleCloseSnackbar} />
    </>
  );
}
