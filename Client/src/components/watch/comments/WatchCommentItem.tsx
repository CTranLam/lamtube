import { Avatar, Box, Button, Stack, TextField, Typography } from "@mui/material";
import { useState, type ReactNode } from "react";
import type { VideoComment } from "../../../types/comment";

type ActionResult = {
  ok: boolean;
  error?: string;
  requiresLogin?: boolean;
};

type WatchCommentItemProps = {
  comment: VideoComment;
  depth: number;
  isActionLoading: boolean;
  canReply: boolean;
  canEdit: boolean;
  canDelete: boolean;
  onRequireLogin: () => void;
  onReply: (parentId: number, content: string) => Promise<ActionResult>;
  onEdit: (commentId: number, content: string) => Promise<ActionResult>;
  onDelete: (commentId: number) => Promise<ActionResult>;
  children?: ReactNode;
};

function formatCommentTime(value: string): string {
  if (!value.trim()) return "Không rõ thời gian";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Không rõ thời gian";

  const now = Date.now();
  const diffSeconds = Math.max(0, Math.floor((now - date.getTime()) / 1000));

  if (diffSeconds < 60) return "Vừa xong";

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} ngày trước`;

  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function WatchCommentItem({
  comment,
  depth: _depth,
  isActionLoading,
  canReply,
  canEdit,
  canDelete,
  onRequireLogin,
  onReply,
  onEdit,
  onDelete,
  children,
}: WatchCommentItemProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyInput, setReplyInput] = useState("");
  const [replyError, setReplyError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editInput, setEditInput] = useState(comment.content);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleReplySubmit = async () => {
    setReplyError(null);
    const result = await onReply(comment.id, replyInput);
    if (!result.ok) {
      if (result.requiresLogin) {
        onRequireLogin();
        return;
      }
      setReplyError(result.error || "Không thể trả lời bình luận.");
      return;
    }

    setReplyInput("");
    setIsReplying(false);
  };

  const handleEditSubmit = async () => {
    setEditError(null);
    const result = await onEdit(comment.id, editInput);
    if (!result.ok) {
      if (result.requiresLogin) {
        onRequireLogin();
        return;
      }
      setEditError(result.error || "Không thể sửa bình luận.");
      return;
    }

    setIsEditing(false);
  };

  const handleDelete = async () => {
    setDeleteError(null);
    const confirmed = window.confirm("Bạn có chắc muốn xóa bình luận này?");
    if (!confirmed) return;

    const result = await onDelete(comment.id);
    if (!result.ok) {
      if (result.requiresLogin) {
        onRequireLogin();
        return;
      }
      setDeleteError(result.error || "Không thể xóa bình luận.");
    }
  };

  return (
    <Box>
      <Stack direction="row" spacing={1.5} sx={{ py: 0.75 }}>
        <Avatar src={comment.authorAvatarUrl || undefined} sx={{ width: 40, height: 40 }}>
            {comment.authorName.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography sx={{ fontWeight: 600 }} noWrap>
                {comment.authorName}
              </Typography>
              <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                {formatCommentTime(comment.createdAt)}
              </Typography>
            </Stack>

            {isEditing ? (
              <Stack spacing={1} sx={{ mt: 1 }}>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  value={editInput}
                  onChange={(event) => setEditInput(event.target.value)}
                />
                {editError ? (
                  <Typography variant="caption" sx={{ color: "#ef4444" }}>
                    {editError}
                  </Typography>
                ) : null}
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="contained"
                    sx={{ textTransform: "none" }}
                    onClick={handleEditSubmit}
                    disabled={isActionLoading || !editInput.trim()}
                  >
                    Lưu
                  </Button>
                  <Button
                    size="small"
                    variant="text"
                    sx={{ textTransform: "none" }}
                    onClick={() => {
                      setIsEditing(false);
                      setEditInput(comment.content);
                      setEditError(null);
                    }}
                  >
                    Hủy
                  </Button>
                </Stack>
              </Stack>
            ) : (
              <Typography variant="body2" sx={{ color: "#e5e5e5", whiteSpace: "pre-wrap", mt: 0.5 }}>
                {comment.content}
              </Typography>
            )}

            <Stack direction="row" spacing={0.75} sx={{ mt: 1 }}>
              {canReply ? (
                <Button
                  size="small"
                  variant="text"
                  sx={{
                    textTransform: "none",
                    minWidth: 0,
                    px: 0.5,
                    color: "#9ca3af",
                    fontWeight: 600,
                  }}
                  onClick={() => {
                    setIsReplying((prev) => !prev);
                    setReplyError(null);
                  }}
                >
                  Trả lời
                </Button>
              ) : null}
              {canEdit ? (
                <Button
                  size="small"
                  variant="text"
                  sx={{
                    textTransform: "none",
                    minWidth: 0,
                    px: 0.5,
                    color: "#9ca3af",
                    fontWeight: 600,
                  }}
                  onClick={() => {
                    setIsEditing((prev) => !prev);
                    setEditError(null);
                    setEditInput(comment.content);
                  }}
                >
                  Sửa
                </Button>
              ) : null}
              {canDelete ? (
                <Button
                  size="small"
                  variant="text"
                  color="error"
                  sx={{ textTransform: "none", minWidth: 0, px: 0.5, fontWeight: 600 }}
                  onClick={() => {
                    void handleDelete();
                  }}
                  disabled={isActionLoading}
                >
                  Xóa
                </Button>
              ) : null}
            </Stack>

            {deleteError ? (
              <Typography variant="caption" sx={{ color: "#ef4444", display: "block", mt: 0.5 }}>
                {deleteError}
              </Typography>
            ) : null}

            {isReplying && canReply ? (
              <Stack spacing={1} sx={{ mt: 1, maxWidth: 760 }}>
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  placeholder="Viết trả lời..."
                  value={replyInput}
                  onChange={(event) => setReplyInput(event.target.value)}
                />
                {replyError ? (
                  <Typography variant="caption" sx={{ color: "#ef4444" }}>
                    {replyError}
                  </Typography>
                ) : null}
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="contained"
                    sx={{ textTransform: "none", borderRadius: 99 }}
                    onClick={() => {
                      void handleReplySubmit();
                    }}
                    disabled={isActionLoading || !replyInput.trim()}
                  >
                    Gửi trả lời
                  </Button>
                  <Button
                    size="small"
                    variant="text"
                    sx={{ textTransform: "none", color: "#9ca3af" }}
                    onClick={() => {
                      setIsReplying(false);
                      setReplyInput("");
                      setReplyError(null);
                    }}
                  >
                    Hủy
                  </Button>
                </Stack>
              </Stack>
            ) : null}
        </Box>
      </Stack>
      {children ? (
        <Box
          sx={{
            mt: 0.25,
            ml: _depth > 0 ? 2 : 2.5,
            pl: 1.75,
            borderLeft: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          <Stack spacing={1.25}>{children}</Stack>
        </Box>
      ) : null}
    </Box>
  );
}
