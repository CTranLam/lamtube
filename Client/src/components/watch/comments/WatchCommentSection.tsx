import { Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { useVideoComments } from "../../../hooks/useVideoComments";
import WatchCommentForm from "./WatchCommentForm";
import WatchCommentList from "./WatchCommentList";

type WatchCommentSectionProps = {
  videoId: number;
  initialCommentCount: number;
  isAuthenticated: boolean;
  currentUserId: number | null;
  videoOwnerId: number | null;
  onRequireLogin: () => void;
};

function formatCount(value: number): string {
  return new Intl.NumberFormat("vi-VN").format(value);
}

export default function WatchCommentSection({
  videoId,
  initialCommentCount,
  isAuthenticated,
  currentUserId,
  videoOwnerId,
  onRequireLogin,
}: WatchCommentSectionProps) {
  const [commentInput, setCommentInput] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    comments,
    totalCount,
    hasLoaded,
    isLoading,
    isError,
    error,
    hasMore,
    isLoadingMore,
    isSubmitting,
    isEditing,
    isDeleting,
    loadMore,
    refetch,
    submitComment,
    editComment,
    removeComment,
  } = useVideoComments(videoId);

  const commentCount = useMemo(() => {
    if (!hasLoaded) return Math.max(0, initialCommentCount);
    return Math.max(0, totalCount);
  }, [hasLoaded, initialCommentCount, totalCount]);

  const handleSubmitComment = async () => {
    if (!isAuthenticated) {
      onRequireLogin();
      return;
    }

    setSubmitError(null);
    const result = await submitComment(commentInput);

    if (!result.ok) {
      if (result.requiresLogin) {
        onRequireLogin();
      } else {
        setSubmitError(result.error || "Không thể gửi bình luận.");
      }
      return;
    }

    setCommentInput("");
  };

  const handleReply = async (parentId: number, content: string) => {
    if (!isAuthenticated) {
      onRequireLogin();
      return { ok: false, requiresLogin: true };
    }
    return submitComment(content, { parentId });
  };

  const handleEdit = async (commentId: number, content: string) => {
    if (!isAuthenticated) {
      onRequireLogin();
      return { ok: false, requiresLogin: true };
    }
    return editComment(commentId, content);
  };

  const handleDelete = async (commentId: number) => {
    if (!isAuthenticated) {
      onRequireLogin();
      return { ok: false, requiresLogin: true };
    }
    return removeComment(commentId);
  };

  return (
    <>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
        Bình luận ({formatCount(commentCount)})
      </Typography>

      <WatchCommentForm
        value={commentInput}
        onChange={setCommentInput}
        onSubmit={handleSubmitComment}
        isSubmitting={isSubmitting}
        error={submitError}
      />

      <WatchCommentList
        comments={comments}
        isLoading={isLoading}
        isError={isError}
        error={error}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        isActionLoading={isSubmitting || isEditing || isDeleting}
        onLoadMore={() => {
          void loadMore();
        }}
        onRetry={() => {
          void refetch();
        }}
        currentUserId={currentUserId}
        videoOwnerId={videoOwnerId}
        onRequireLogin={onRequireLogin}
        onReply={handleReply}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </>
  );
}
