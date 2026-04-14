import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { Box, Paper, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getUploadCategories } from "../api/videos";
import LoginRequiredModal from "../components/common/LoginRequiredModal";
import { useAuth } from "../hooks/useAuth";
import { useUploadVideo } from "../hooks/useUploadVideo";
import type {
  UploadVideoCategory,
  UploadVideoFormState,
} from "../types/video";
import { UploadVideoHeader } from "../components/video/UploadVideoHeader";
import { UploadVideoAlerts } from "../components/video/UploadVideoAlerts";
import { UploadVideoDetailsForm } from "../components/video/UploadVideoDetailsForm";
import { UploadVideoFileCard } from "../components/video/UploadVideoFileCard";
import { UploadThumbnailCard } from "../components/video/UploadThumbnailCard";
import { UploadVideoActionsCard } from "../components/video/UploadVideoActionsCard";

const initialFormState: UploadVideoFormState = {
  title: "",
  description: "",
  categoryId: "",
  status: "public",
};

export default function UploadVideo() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [form, setForm] = useState<UploadVideoFormState>(initialFormState);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [categories, setCategories] = useState<UploadVideoCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { uploadVideo, isUploading, reset } = useUploadVideo();

  useEffect(() => {
    let active = true;

    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const items = await getUploadCategories();
        if (!active) return;
        setCategories(items);
      } catch (e) {
        if (!active) return;
        const message =
          e instanceof Error ? e.message : "Không thể tải danh mục";
        setError(message);
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

  useEffect(() => {
    if (!thumbnailFile) {
      setThumbnailPreview("");
      return;
    }

    const preview = URL.createObjectURL(thumbnailFile);
    setThumbnailPreview(preview);

    return () => {
      URL.revokeObjectURL(preview);
    };
  }, [thumbnailFile]);

  const videoSummary = useMemo(() => {
    if (!videoFile) return "Chưa chọn video";

    const sizeMb = (videoFile.size / (1024 * 1024)).toFixed(2);
    return `${videoFile.name} • ${sizeMb} MB`;
  }, [videoFile]);

  const handleFieldChange =
    (field: keyof UploadVideoFormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleVideoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setVideoFile(file);
    setError(null);
    setSuccess(null);
  };

  const handleThumbnailChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setThumbnailFile(file);
    setError(null);
    setSuccess(null);
  };

  const validateForm = (): string | null => {
    if (!form.title.trim()) return "Tiêu đề video không được để trống.";
    if (!videoFile) return "Bạn cần chọn file video để đăng.";
    if (videoFile.type && !videoFile.type.startsWith("video/")) {
      return "File video không hợp lệ.";
    }
    if (
      thumbnailFile &&
      thumbnailFile.type &&
      !thumbnailFile.type.startsWith("image/")
    ) {
      return "Thumbnail phải là file ảnh.";
    }

    return null;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!videoFile) return;

    try {
      await uploadVideo(
        {
          title: form.title.trim(),
          description: form.description.trim(),
          categoryId: form.categoryId ? Number(form.categoryId) : undefined,
          status: form.status,
          videoFile,
          thumbnailFile,
        },
        {
          onSuccess: () => {
            setSuccess(
              "Đăng video thành công. Bạn có thể kiểm tra lại trong kênh của mình.",
            );
            setForm(initialFormState);
            setVideoFile(null);
            setThumbnailFile(null);
            reset();
          },
        },
      );
    } catch (e) {
      const message = e instanceof Error ? e.message : "Không thể đăng video";
      setError(message);
    }
  };

  if (!isAuthenticated) {
    return (
      <LoginRequiredModal
        open
        onLogin={() => navigate("/login")}
        onClose={() => navigate("/")}
      />
    );
  }

  return (
    <Box
      sx={{
        px: { xs: 2, md: 4 },
        py: { xs: 2, md: 3 },
        maxWidth: 1100,
        mx: "auto",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 4 },
          borderRadius: 4,
          background:
            "linear-gradient(180deg, rgba(28,28,28,0.95) 0%, rgba(15,15,15,1) 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          color: "#fff",
        }}
      >
        <Stack spacing={3}>
          <UploadVideoHeader />

          <UploadVideoAlerts error={error} success={success} />

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "1.4fr 0.9fr" },
              gap: 3,
            }}
          >
            <Stack spacing={2.5}>
              <UploadVideoDetailsForm
                form={form}
                categories={categories}
                loadingCategories={loadingCategories}
                onFieldChange={handleFieldChange}
              />

              <UploadVideoFileCard
                videoSummary={videoSummary}
                onVideoChange={handleVideoChange}
              />
            </Stack>

            <Stack spacing={2.5}>
              <UploadThumbnailCard
                thumbnailPreview={thumbnailPreview}
                onThumbnailChange={handleThumbnailChange}
              />

              <UploadVideoActionsCard
                submitting={isUploading}
                onGoToChannel={() => navigate("/channel")}
              />
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
