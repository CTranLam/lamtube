import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Pagination,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { VideoToolbar } from "../../components/admin/VideoToolbar";
import { VideoTable } from "../../components/admin/VideoTable";
import { VideoDetailModal } from "../../components/admin/VideoDetailModal";
import { VideoConfirmDialog } from "../../components/admin/VideoConfirmDialog";
import { getUploadCategories } from "../../api/videos";
import { deleteAdminVideo, updateAdminVideoStatus } from "../../api/admin";
import { useAdminVideos } from "../../hooks/useAdminVideos";
import type { AdminVideoSummary } from "../../types/admin";
import type { UploadVideoCategory } from "../../types/video";

export default function VideoManagement() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [categoryId, setCategoryId] = useState("all");
  const [uploader, setUploader] = useState("");
  const [page, setPage] = useState(0);
  const size = 8;

  const [categories, setCategories] = useState<UploadVideoCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const [selectedVideo, setSelectedVideo] = useState<AdminVideoSummary | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [confirmMode, setConfirmMode] = useState<"toggle" | "delete" | null>(null);
  const [confirmVideo, setConfirmVideo] = useState<AdminVideoSummary | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { videos, loading, error, totalPages, totalElements, refresh } = useAdminVideos(
    search,
    status,
    categoryId,
    uploader,
    page,
    size,
  );

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
        if (active) setLoadingCategories(false);
      }
    };

    void loadCategories();

    return () => {
      active = false;
    };
  }, []);

  const busyVideoIds = useMemo(() => {
    const ids = new Set<number>();
    if (actionLoading && confirmVideo) {
      ids.add(confirmVideo.id);
    }
    return ids;
  }, [actionLoading, confirmVideo]);

  const handleOpenDetail = (video: AdminVideoSummary) => {
    setSelectedVideo(video);
    setDetailOpen(true);
  };

  const handleOpenToggle = (video: AdminVideoSummary) => {
    setConfirmMode("toggle");
    setConfirmVideo(video);
  };

  const handleOpenDelete = (video: AdminVideoSummary) => {
    setConfirmMode("delete");
    setConfirmVideo(video);
  };

  const handleCloseConfirm = () => {
    if (actionLoading) return;
    setConfirmMode(null);
    setConfirmVideo(null);
  };

  const handleConfirm = async () => {
    if (!confirmMode || !confirmVideo) return;

    try {
      setActionLoading(true);
      if (confirmMode === "toggle") {
        const nextStatus = confirmVideo.status === "public" ? "private" : "public";
        await updateAdminVideoStatus(confirmVideo.id, nextStatus);
      } else {
        await deleteAdminVideo(confirmVideo.id);
      }
      await refresh();
      handleCloseConfirm();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Không thể xử lý yêu cầu";
      window.alert(message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: "#f4f4f5" }}>
        Quản lý video
      </Typography>
      <Typography variant="body2" sx={{ mb: 2, color: "#a1a1aa" }}>
        Tổng cộng {totalElements} video
      </Typography>

      <Paper elevation={0} sx={{ p: 2, bgcolor: "transparent" }}>
        <VideoToolbar
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(0);
          }}
          status={status}
          onStatusChange={(value) => {
            setStatus(value);
            setPage(0);
          }}
          categoryId={categoryId}
          onCategoryChange={(value) => {
            setCategoryId(value);
            setPage(0);
          }}
          uploader={uploader}
          onUploaderChange={(value) => {
            setUploader(value);
            setPage(0);
          }}
          categories={categories}
          loadingCategories={loadingCategories}
          onReset={() => {
            setSearch("");
            setStatus("all");
            setCategoryId("all");
            setUploader("");
            setPage(0);
          }}
        />

        {loading && (
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" sx={{ color: "#d4d4d8" }}>
              Đang tải danh sách video...
            </Typography>
          </Stack>
        )}

        {error && !loading && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && videos.length === 0 && (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: "1px dashed",
              borderColor: "divider",
              bgcolor: "#181818",
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5, color: "#f4f4f5" }}>
              Không có video phù hợp
            </Typography>
            <Typography variant="body2" sx={{ color: "#a1a1aa" }}>
              Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.
            </Typography>
          </Paper>
        )}

        {!loading && !error && videos.length > 0 && (
          <VideoTable
            videos={videos}
            busyVideoIds={busyVideoIds}
            onView={handleOpenDetail}
            onToggleStatus={handleOpenToggle}
            onDelete={handleOpenDelete}
          />
        )}

        {totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Pagination
              count={totalPages}
              page={page + 1}
              onChange={(_, nextPage) => setPage(nextPage - 1)}
              color="primary"
              size="small"
              sx={{
                "& .MuiPaginationItem-root": {
                  color: "#f4f4f5",
                },
              }}
            />
          </Box>
        )}
      </Paper>

      <VideoDetailModal open={detailOpen} video={selectedVideo} onClose={() => setDetailOpen(false)} />

      <VideoConfirmDialog
        open={Boolean(confirmMode && confirmVideo)}
        title={confirmMode === "delete" ? "Xóa video" : "Cập nhật trạng thái video"}
        content={
          confirmMode === "delete"
            ? `Bạn có chắc muốn xóa video "${confirmVideo?.title}"?`
            : `Bạn có chắc muốn chuyển video "${confirmVideo?.title}" sang ${
                confirmVideo?.status === "public" ? "riêng tư" : "công khai"
              }?`
        }
        confirmLabel={confirmMode === "delete" ? "Xóa video" : "Xác nhận"}
        confirmColor={confirmMode === "delete" ? "error" : "primary"}
        loading={actionLoading}
        onClose={handleCloseConfirm}
        onConfirm={handleConfirm}
      />
    </Box>
  );
}
