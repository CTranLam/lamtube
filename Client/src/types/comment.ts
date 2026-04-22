export interface VideoComment {
  id: number;
  content: string;
  createdAt: string;
  authorName: string;
  authorAvatarUrl: string;
  authorId?: number | null;
  parentId: number | null;
}

export interface VideoCommentListResult {
  items: VideoComment[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface CreateVideoCommentPayload {
  content: string;
  parentId?: number | null;
}

export interface UpdateVideoCommentPayload {
  content: string;
}
