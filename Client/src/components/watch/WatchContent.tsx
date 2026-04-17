import { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  ThumbDownAltOutlined as ThumbDownIcon,
  ThumbUpAltOutlined as ThumbUpIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { getVideoReactionSummary, setVideoReaction } from "../../api/videos";
import type { VideoDetail, VideoReactionType } from "../../types/video";
import { useAuth } from "../../hooks/useAuth";
import LoginRequiredModal from "../common/LoginRequiredModal";

type WatchContentProps = {
  video: VideoDetail;
  isSubscribed: boolean;
  subscriberCount: number;
  isSubscribing: boolean;
  subscribeError: string | null;
  clearSubscribeError: () => void;
  onToggleSubscribe: () => Promise<{
    ok: boolean;
    requiresLogin?: boolean;
  }>;
};

type ReactionType = VideoReactionType | null;

type WatchComment = {
  id: number;
  authorName: string;
  avatarUrl?: string;
  content: string;
  createdAt: string;
};

function formatCount(value: number): string {
  return new Intl.NumberFormat("vi-VN").format(value);
}

function buildDefaultComments(video: VideoDetail): WatchComment[] {
  return [
    {
      id: 1,
      authorName: "Người xem LamTube",
      content: `Video "${video.title}" rất ổn, mong có thêm nội dung tương tự.`,
      createdAt: "Vừa xong",
    },
  ];
}

export default function WatchContent({
  video,
  isSubscribed,
  subscriberCount,
  isSubscribing,
  subscribeError,
  clearSubscribeError,
  onToggleSubscribe,
}: WatchContentProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const formattedViewCount = `${new Intl.NumberFormat("vi-VN").format(
    video.viewCount,
  )} lượt xem`;
  const normalizedStatus =
    video.status?.toLowerCase() === "private" ? "Riêng tư" : "Công khai";
  const uploaderName = video.uploaderName?.trim() || "LamTube";
  const uploaderAvatarUrl = video.uploaderAvatarUrl || "";
  const baseLikeCount = Number(video.likeCount) || 0;
  const baseDislikeCount = Number(video.dislikeCount) || 0;

  const [reaction, setReaction] = useState<ReactionType>(null);
  const [likeCount, setLikeCount] = useState(baseLikeCount);
  const [dislikeCount, setDislikeCount] = useState(baseDislikeCount);
  const [isReacting, setIsReacting] = useState(false);
  const [reactionError, setReactionError] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [comments, setComments] = useState<WatchComment[]>(() =>
    buildDefaultComments(video),
  );

  const commentCount = comments.length;

  useEffect(() => {
    let isCancelled = false;

    setReaction(null);
    setLikeCount(baseLikeCount);
    setDislikeCount(baseDislikeCount);
    setReactionError(null);

    const loadReactionSummary = async () => {
      try {
        const summary = await getVideoReactionSummary(video.id);
        if (isCancelled) return;
        setReaction(summary.myReaction);
        setLikeCount(summary.likeCount);
        setDislikeCount(summary.dislikeCount);
      } catch {
        if (isCancelled) return;
      }
    };

    void loadReactionSummary();

    return () => {
      isCancelled = true;
    };
  }, [baseDislikeCount, baseLikeCount, user?.id, video.id]);

  const toggleReaction = async (nextReaction: Exclude<ReactionType, null>) => {
    if (!user) {
      setReactionError("Vui lòng đăng nhập để thực hiện phản hồi.");
      return;
    }

    if (isReacting) return;

    setIsReacting(true);
    setReactionError(null);

    const payload: ReactionType =
      reaction === nextReaction ? null : nextReaction;

    try {
      const summary = await setVideoReaction(video.id, payload);
      setReaction(summary.myReaction);
      setLikeCount(summary.likeCount);
      setDislikeCount(summary.dislikeCount);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Không thể cập nhật phản hồi.";
      setReactionError(message);
    } finally {
      setIsReacting(false);
    }
  };

  const handleSubmitComment = () => {
    const trimmed = commentInput.trim();
    if (!trimmed) return;

    const nextComment: WatchComment = {
      id: Date.now(),
      authorName: user?.email || "Khách",
      content: trimmed,
      createdAt: "Vừa xong",
    };

    setComments((prev) => [nextComment, ...prev]);
    setCommentInput("");
  };

  const handleToggleSubscribe = async () => {
    clearSubscribeError();
    const result = await onToggleSubscribe();
    if (result.requiresLogin) {
      setIsLoginModalOpen(true);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, margin: "0 auto", p: 2 }}>
      <Box
        sx={{
          position: "relative",
          width: "100%",
          pt: "56.25%",
          mb: 2,
          bgcolor: "#000",
        }}
      >
        <Box
          component="video"
          src={video.videoUrl}
          controls
          poster={video.thumbnailUrl}
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            border: 0,
            backgroundColor: "#000",
          }}
        />
      </Box>

      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
        {video.title}
      </Typography>
      <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: "wrap" }}>
        <Chip size="small" variant="outlined" label={formattedViewCount} />
        <Chip size="small" variant="outlined" label={normalizedStatus} />
        <Chip
          size="small"
          variant="outlined"
          label={video.categoryName?.trim() || "Chưa có danh mục"}
        />
      </Stack>

      <Typography
        variant="body2"
        sx={{ whiteSpace: "pre-line", color: "#ddd", mb: 2.5 }}
      >
        {video.description || "Không có mô tả"}
      </Typography>
      <Paper
        sx={{
          bgcolor: "#181818",
          p: { xs: 2, sm: 2.5 },
          borderRadius: 3,
          mb: 2,
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.5}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", md: "center" }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              src={uploaderAvatarUrl || undefined}
              sx={{ width: 48, height: 48 }}
            >
              {uploaderName.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700 }} noWrap>
                {uploaderName}
              </Typography>
              <Typography variant="body2" sx={{ color: "#b3b3b3" }}>
                {formatCount(subscriberCount)} người đăng ký
              </Typography>
            </Box>
            <Button
              variant={isSubscribed ? "outlined" : "contained"}
              onClick={() => {
                void handleToggleSubscribe();
              }}
              disabled={isSubscribing}
              sx={{ textTransform: "none", borderRadius: 99 }}
            >
              {isSubscribing
                ? "Đang xử lý..."
                : isSubscribed
                  ? "Đã đăng ký"
                  : "Đăng ký"}
            </Button>
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            justifyContent={{ xs: "flex-start", md: "flex-end" }}
          >
            <Button
              variant={reaction === "like" ? "contained" : "outlined"}
              startIcon={<ThumbUpIcon />}
              onClick={() => {
                void toggleReaction("like");
              }}
              disabled={isReacting}
              sx={{ textTransform: "none", borderRadius: 99 }}
            >
              Thích {formatCount(likeCount)}
            </Button>
            <Button
              variant={reaction === "dislike" ? "contained" : "outlined"}
              startIcon={<ThumbDownIcon />}
              onClick={() => {
                void toggleReaction("dislike");
              }}
              disabled={isReacting}
              sx={{ textTransform: "none", borderRadius: 99 }}
            >
              Không thích {formatCount(dislikeCount)}
            </Button>
          </Stack>
        </Stack>
      </Paper>
      {reactionError ? (
        <Typography
          variant="caption"
          sx={{ color: "#ef4444", display: "block", mb: 2 }}
        >
          {reactionError}
        </Typography>
      ) : null}
      {subscribeError ? (
        <Typography
          variant="caption"
          sx={{ color: "#ef4444", display: "block", mb: 2 }}
        >
          {subscribeError}
        </Typography>
      ) : null}

      <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", mb: 2.5 }} />

      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
        Bình luận ({formatCount(commentCount)})
      </Typography>

      <Stack spacing={1.25} sx={{ mb: 2 }}>
        <TextField
          fullWidth
          multiline
          minRows={3}
          placeholder="Viết bình luận của bạn..."
          value={commentInput}
          onChange={(event) => setCommentInput(event.target.value)}
        />
        <Stack direction="row" justifyContent="flex-end">
          <Button
            variant="contained"
            sx={{ textTransform: "none" }}
            onClick={handleSubmitComment}
            disabled={!commentInput.trim()}
          >
            Gửi bình luận
          </Button>
        </Stack>
      </Stack>

      <Stack spacing={1.5}>
        {comments.map((comment) => (
          <Paper
            key={comment.id}
            sx={{
              bgcolor: "#181818",
              p: 1.5,
              borderRadius: 2,
            }}
          >
            <Stack direction="row" spacing={1.5}>
              <Avatar src={comment.avatarUrl || undefined}>
                {comment.authorName.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography sx={{ fontWeight: 600 }} noWrap>
                    {comment.authorName}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                    {comment.createdAt}
                  </Typography>
                </Stack>
                <Typography
                  variant="body2"
                  sx={{ color: "#e5e5e5", whiteSpace: "pre-wrap" }}
                >
                  {comment.content}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        ))}
      </Stack>
      <LoginRequiredModal
        open={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={() => {
          setIsLoginModalOpen(false);
          navigate("/login");
        }}
      />
    </Box>
  );
}
