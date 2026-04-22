import { useEffect, useRef, useState, type SyntheticEvent } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import {
  BookmarkBorderOutlined as BookmarkIcon,
  ThumbDownAltOutlined as ThumbDownIcon,
  ThumbUpAltOutlined as ThumbUpIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  getVideoReactionSummary,
  registerVideoView,
  removeVideoReaction,
  setVideoReaction,
} from "../../api/videos";
import { registerWatchHistory } from "../../api/watchHistory";
import type { VideoDetail, VideoReactionType } from "../../types/video";
import { useAuth } from "../../hooks/useAuth";
import LoginRequiredModal from "../common/LoginRequiredModal";
import SaveToPlaylistDialog from "./SaveToPlaylistDialog";
import WatchCommentSection from "./comments/WatchCommentSection";

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

function formatCount(value: number): string {
  return new Intl.NumberFormat("vi-VN").format(value);
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
  const [displayViewCount, setDisplayViewCount] = useState(
    Number(video.viewCount) || 0,
  );
  const formattedViewCount = `${new Intl.NumberFormat("vi-VN").format(
    displayViewCount,
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
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const hasCountedViewRef = useRef(false);
  const isCountingViewRef = useRef(false);
  const isReplayAfterEndRef = useRef(false);

  useEffect(() => {
    hasCountedViewRef.current = false;
    isCountingViewRef.current = false;
    isReplayAfterEndRef.current = false;
    setDisplayViewCount(Number(video.viewCount) || 0);
  }, [video.id]);

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
      const summary =
        payload === null
          ? await removeVideoReaction(video.id)
          : await setVideoReaction(video.id, payload);
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

  const handleToggleSubscribe = async () => {
    clearSubscribeError();
    const result = await onToggleSubscribe();
    if (result.requiresLogin) {
      setIsLoginModalOpen(true);
    }
  };

  const handleOpenSaveDialog = () => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    setIsSaveDialogOpen(true);
  };

  const handleVideoTimeUpdate = (event: SyntheticEvent<HTMLVideoElement>) => {
    if (hasCountedViewRef.current || isCountingViewRef.current) {
      return;
    }

    if (event.currentTarget.currentTime < 5) {
      return;
    }

    hasCountedViewRef.current = true;
    isCountingViewRef.current = true;

    void registerVideoView(video.id)
      .then(() => {
        setDisplayViewCount((prev) => prev + 1);
      })
      .catch(() => {
        hasCountedViewRef.current = false;
      })
      .finally(() => {
        isCountingViewRef.current = false;
      });
      
    if (user) {
      void registerWatchHistory(video.id).catch(() => undefined);
    }
  };

  const handleVideoEnded = () => {
    isReplayAfterEndRef.current = true;
  };

  const handleVideoPlay = (event: SyntheticEvent<HTMLVideoElement>) => {
    if (!isReplayAfterEndRef.current) return;
    if (event.currentTarget.currentTime > 0.5) return;

    hasCountedViewRef.current = false;
    isCountingViewRef.current = false;
    isReplayAfterEndRef.current = false;
  };

  return (
    <Box sx={{ width: "100%", p: { xs: 2, lg: 1.5 } }}>
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
          onTimeUpdate={handleVideoTimeUpdate}
          onEnded={handleVideoEnded}
          onPlay={handleVideoPlay}
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
            <Button
              variant="outlined"
              startIcon={<BookmarkIcon />}
              onClick={handleOpenSaveDialog}
              sx={{ textTransform: "none", borderRadius: 99 }}
            >
              Lưu
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
      <WatchCommentSection
        key={video.id}
        videoId={video.id}
        initialCommentCount={Number(video.commentCount) || 0}
        isAuthenticated={Boolean(user)}
        currentUserId={user?.id ?? null}
        videoOwnerId={video.channelId}
        onRequireLogin={() => setIsLoginModalOpen(true)}
      />
      <LoginRequiredModal
        open={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={() => {
          setIsLoginModalOpen(false);
          navigate("/login");
        }}
      />
      <SaveToPlaylistDialog
        open={isSaveDialogOpen}
        videoId={video.id}
        isAuthenticated={Boolean(user)}
        onClose={() => setIsSaveDialogOpen(false)}
        onRequireLogin={() => {
          setIsSaveDialogOpen(false);
          setIsLoginModalOpen(true);
        }}
      />
    </Box>
  );
}
