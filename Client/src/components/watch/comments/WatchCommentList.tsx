import { Button, Stack, Typography } from "@mui/material";
import { useMemo, type ReactNode } from "react";
import type { VideoComment } from "../../../types/comment";
import WatchCommentItem from "./WatchCommentItem";

type ActionResult = {
  ok: boolean;
  error?: string;
  requiresLogin?: boolean;
};

type WatchCommentListProps = {
  comments: VideoComment[];
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  hasMore: boolean;
  isLoadingMore: boolean;
  isActionLoading: boolean;
  currentUserId: number | null;
  videoOwnerId: number | null;
  onLoadMore: () => void;
  onRetry: () => void;
  onRequireLogin: () => void;
  onReply: (parentId: number, content: string) => Promise<ActionResult>;
  onEdit: (commentId: number, content: string) => Promise<ActionResult>;
  onDelete: (commentId: number) => Promise<ActionResult>;
};

function toTimestamp(value: string): number {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function WatchCommentList({
  comments,
  isLoading,
  isError,
  error,
  hasMore,
  isLoadingMore,
  isActionLoading,
  currentUserId,
  videoOwnerId,
  onLoadMore,
  onRetry,
  onRequireLogin,
  onReply,
  onEdit,
  onDelete,
}: WatchCommentListProps) {
  const childrenByParent = useMemo(() => {
    const map = new Map<number, VideoComment[]>();

    for (const comment of comments) {
      if (comment.parentId == null) continue;
      const existing = map.get(comment.parentId);
      if (existing) {
        existing.push(comment);
      } else {
        map.set(comment.parentId, [comment]);
      }
    }

    for (const entries of map.values()) {
      entries.sort((a, b) => toTimestamp(b.createdAt) - toTimestamp(a.createdAt));
    }

    return map;
  }, [comments]);

  const topLevelComments = useMemo(
    () =>
      comments
        .filter((comment) => comment.parentId == null)
        .sort((a, b) => toTimestamp(b.createdAt) - toTimestamp(a.createdAt)),
    [comments],
  );

  const renderCommentTree = (comment: VideoComment, depth: number): ReactNode => {
    const collectAllReplies = (rootId: number): VideoComment[] => {
      const queue = [...(childrenByParent.get(rootId) ?? [])];
      const result: VideoComment[] = [];

      while (queue.length > 0) {
        const current = queue.shift();
        if (!current) continue;
        result.push(current);
        const nested = childrenByParent.get(current.id) ?? [];
        queue.push(...nested);
      }

      return result.sort((a, b) => toTimestamp(b.createdAt) - toTimestamp(a.createdAt));
    };

    const children = depth === 0 ? collectAllReplies(comment.id) : [];
    const isCommentAuthor =
      comment.authorId != null && currentUserId != null && comment.authorId === currentUserId;
    const isVideoOwner = currentUserId != null && videoOwnerId != null && currentUserId === videoOwnerId;

    return (
      <WatchCommentItem
        key={comment.id}
        comment={comment}
        depth={depth}
        isActionLoading={isActionLoading}
        canReply
        canEdit={isCommentAuthor}
        canDelete={isCommentAuthor || isVideoOwner}
        onRequireLogin={onRequireLogin}
        onReply={onReply}
        onEdit={onEdit}
        onDelete={onDelete}
      >
        {children.map((child) => renderCommentTree(child, 1))}
      </WatchCommentItem>
    );
  };

  if (isLoading) {
    return (
      <Typography variant="body2" sx={{ color: "#b3b3b3" }}>
        Đang tải bình luận...
      </Typography>
    );
  }

  if (isError && comments.length === 0) {
    return (
      <Stack spacing={1}>
        <Typography variant="body2" sx={{ color: "#ef4444" }}>
          {error || "Không tải được bình luận."}
        </Typography>
        <Stack direction="row">
          <Button variant="outlined" sx={{ textTransform: "none" }} onClick={onRetry}>
            Thử lại
          </Button>
        </Stack>
      </Stack>
    );
  }

  if (topLevelComments.length === 0) {
    return (
      <Typography variant="body2" sx={{ color: "#b3b3b3" }}>
        Chưa có bình luận nào.
      </Typography>
    );
  }

  return (
    <Stack spacing={1.5}>
      {topLevelComments.map((comment) => renderCommentTree(comment, 0))}
      {hasMore ? (
        <Stack direction="row">
          <Button
            variant="outlined"
            sx={{ textTransform: "none" }}
            onClick={onLoadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? "Đang tải..." : "Xem thêm bình luận"}
          </Button>
        </Stack>
      ) : null}
    </Stack>
  );
}
