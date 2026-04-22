import { httpFetch } from "./http";
import type { ApiResponse } from "../types/auth";
import type {
  CreateVideoCommentPayload,
  UpdateVideoCommentPayload,
  VideoComment,
  VideoCommentListResult,
} from "../types/comment";
import { ApiRequestError } from "./videos";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type CommentApiItem = {
  id?: number | string;
  commentId?: number | string;
  content?: string;
  createdAt?: string | null;
  created_at?: string | null;
  parentId?: number | string | null;
  parent_id?: number | string | null;
  authorName?: string;
  userName?: string;
  username?: string;
  fullName?: string;
  fullname?: string;
  avatarUrl?: string;
  authorAvatarUrl?: string;
  userId?: number | string | null;
  authorId?: number | string | null;
  user?: unknown;
  author?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toNullableNumber(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("access_token");
  return token
    ? {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }
    : {
        "Content-Type": "application/json",
      };
}

async function parseJsonBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function getErrorMessage(body: unknown, fallback: string): string {
  if (isRecord(body) && typeof body.message === "string" && body.message.trim()) {
    return body.message;
  }
  return fallback;
}

function getErrorCode(body: unknown): string | undefined {
  if (isRecord(body) && typeof body.code === "string" && body.code.trim()) {
    return body.code;
  }
  return undefined;
}

function throwApiError(
  response: Response,
  body: unknown,
  fallback: string,
): never {
  throw new ApiRequestError(getErrorMessage(body, fallback), {
    status: response.status,
    code: getErrorCode(body),
  });
}

function unwrapApiData(body: unknown): unknown {
  const wrapped = isRecord(body)
    ? (body as Partial<ApiResponse<unknown>>)
    : null;
  return wrapped && "data" in wrapped ? wrapped.data : body;
}

function normalizeMediaUrl(url: unknown): string {
  const raw = typeof url === "string" ? url.trim() : "";
  if (!raw) return "";
  try {
    return encodeURI(raw);
  } catch {
    return raw;
  }
}

function normalizeCreatedAt(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString();
}

function resolveAuthorInfo(raw: CommentApiItem): {
  authorName: string;
  authorAvatarUrl: string;
  authorId: number | null;
} {
  const nestedAuthor = isRecord(raw.author)
    ? raw.author
    : isRecord(raw.user)
      ? raw.user
      : {};

  const candidates = [
    raw.authorName,
    raw.userName,
    raw.username,
    raw.fullName,
    raw.fullname,
    typeof nestedAuthor.username === "string" ? nestedAuthor.username : "",
    typeof nestedAuthor.fullName === "string" ? nestedAuthor.fullName : "",
    typeof nestedAuthor.fullname === "string" ? nestedAuthor.fullname : "",
    typeof nestedAuthor.email === "string" ? nestedAuthor.email : "",
  ];

  const authorName =
    candidates.find((value) => typeof value === "string" && value.trim())?.trim() ||
    "Người dùng LamTube";

  const authorAvatarUrl = normalizeMediaUrl(
    raw.authorAvatarUrl ??
      raw.avatarUrl ??
      (typeof nestedAuthor.avatarUrl === "string" ? nestedAuthor.avatarUrl : ""),
  );

  const authorId = toNullableNumber(
    raw.authorId ??
      raw.userId ??
      (isRecord(raw.author) ? raw.author.id : undefined) ??
      (isRecord(raw.user) ? raw.user.id : undefined),
  );

  return { authorName, authorAvatarUrl, authorId };
}

function normalizeComment(value: unknown): VideoComment | null {
  if (!isRecord(value)) return null;

  const raw = value as CommentApiItem;
  const id = toNumber(raw.id ?? raw.commentId);
  if (!id) return null;

  const content = typeof raw.content === "string" ? raw.content : "";
  const { authorName, authorAvatarUrl, authorId } = resolveAuthorInfo(raw);

  return {
    id,
    content,
    createdAt: normalizeCreatedAt(raw.createdAt ?? raw.created_at),
    authorName,
    authorAvatarUrl,
    authorId,
    parentId: toNullableNumber(raw.parentId ?? raw.parent_id),
  };
}

function normalizeCommentList(
  value: unknown,
  fallbackPage: number,
  fallbackSize: number,
): VideoCommentListResult {
  const defaultResult: VideoCommentListResult = {
    items: [],
    page: fallbackPage,
    size: fallbackSize,
    totalElements: 0,
    totalPages: 0,
  };

  if (Array.isArray(value)) {
    const items = value
      .map((item) => normalizeComment(item))
      .filter((item): item is VideoComment => item !== null);

    return {
      items,
      page: fallbackPage,
      size: fallbackSize,
      totalElements: items.length,
      totalPages: items.length > 0 ? 1 : 0,
    };
  }

  if (!isRecord(value)) return defaultResult;

  const sourceItems =
    Array.isArray(value.items)
      ? value.items
      : Array.isArray(value.content)
        ? value.content
        : Array.isArray(value.comments)
          ? value.comments
          : [];

  const items = sourceItems
    .map((item) => normalizeComment(item))
    .filter((item): item is VideoComment => item !== null);

  const page = toNumber(value.page ?? value.number, fallbackPage);
  const size = toNumber(value.size ?? value.pageSize, fallbackSize);
  const totalElements = toNumber(
    value.totalElements ?? value.totalItems ?? value.total,
    items.length,
  );
  const derivedTotalPages =
    size > 0 ? Math.ceil(Math.max(totalElements, 0) / size) : items.length > 0 ? 1 : 0;
  const totalPages = toNumber(value.totalPages ?? value.pages, derivedTotalPages);

  return {
    items,
    page,
    size,
    totalElements,
    totalPages,
  };
}

function normalizeCommentOrFallback(
  raw: unknown,
  fallback: { id: number; content: string; parentId: number | null },
): VideoComment {
  const normalized = normalizeComment(raw);
  if (normalized) return normalized;

  return {
    id: fallback.id,
    content: fallback.content,
    createdAt: new Date().toISOString(),
    authorName: "Người dùng LamTube",
    authorAvatarUrl: "",
    authorId: null,
    parentId: fallback.parentId,
  };
}

export async function getVideoComments(
  videoId: string | number,
  params?: { page?: number; size?: number },
): Promise<VideoCommentListResult> {
  const page = params?.page ?? 0;
  const size = params?.size ?? 10;
  const query = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  const response = await httpFetch(
    `${API_BASE_URL}/videos/${videoId}/comments?${query.toString()}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    },
  );

  const body = await parseJsonBody(response);

  if (!response.ok) {
    throwApiError(response, body, "Không thể tải danh sách bình luận.");
  }

  const raw = unwrapApiData(body);
  return normalizeCommentList(raw, page, size);
}

export async function createVideoComment(
  videoId: string | number,
  payload: CreateVideoCommentPayload,
): Promise<VideoComment> {
  const response = await httpFetch(`${API_BASE_URL}/videos/${videoId}/comments`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const body = await parseJsonBody(response);

  if (!response.ok) {
    if (response.status === 401) {
      throwApiError(response, body, "Vui lòng đăng nhập để bình luận.");
    }
    throwApiError(response, body, "Không thể gửi bình luận.");
  }

  const raw = unwrapApiData(body);
  const normalized = normalizeComment(raw);
  if (normalized) {
    return {
      ...normalized,
      parentId:
        normalized.parentId == null && payload.parentId != null
          ? payload.parentId
          : normalized.parentId,
    };
  }

  return normalizeCommentOrFallback(raw, {
    id: Date.now(),
    content: payload.content,
    parentId: payload.parentId ?? null,
  });
}

export async function updateVideoComment(
  videoId: number,
  commentId: number,
  payload: UpdateVideoCommentPayload,
): Promise<VideoComment> {
  const response = await httpFetch(`${API_BASE_URL}/videos/${videoId}/comments/${commentId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const body = await parseJsonBody(response);

  if (!response.ok) {
    if (response.status === 401) {
      throwApiError(response, body, "Vui lòng đăng nhập để sửa bình luận.");
    }
    if (response.status === 403) {
      throwApiError(response, body, "Bạn không có quyền sửa bình luận này.");
    }
    throwApiError(response, body, "Không thể sửa bình luận.");
  }

  const raw = unwrapApiData(body);
  return normalizeCommentOrFallback(raw, {
    id: commentId,
    content: payload.content,
    parentId: null,
  });
}

export async function deleteVideoComment(
  videoId: number,
  commentId: number,
): Promise<void> {
  const response = await httpFetch(`${API_BASE_URL}/videos/${videoId}/comments/${commentId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  const body = await parseJsonBody(response);

  if (!response.ok) {
    if (response.status === 401) {
      throwApiError(response, body, "Vui lòng đăng nhập để xóa bình luận.");
    }
    if (response.status === 403) {
      throwApiError(response, body, "Bạn không có quyền xóa bình luận này.");
    }
    throwApiError(response, body, "Không thể xóa bình luận.");
  }
}
