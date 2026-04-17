import type {
  HomeVideoListResult,
  UploadVideoCategory,
  UploadVideoPayload,
  UploadVideoResponse,
  Video,
  VideoDetail,
  VideoReactionSummary,
  VideoReactionType,
} from "../types/video";
import type { ApiResponse, PagedResponse } from "../types/auth";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type GetHomeVideosParams = {
  page?: number;
  size?: number;
  categoryId?: number;
  title?: string;
};

type VideoApiItem = {
  id?: number | string;
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  status?: string;
  viewCount?: number;
  categoryName?: string | null;
  categoryId?: number | null;
};

type VideoDetailApiItem = {
  id?: number | string;
  channelId?: number | string | null;
  uploaderId?: number | string | null;
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  status?: string;
  viewCount?: number | string | null;
  categoryName?: string | null;
  categoryId?: number | string | null;
  uploaderName?: string;
  uploaderAvatarUrl?: string;
  subscriberCount?: number | string | null;
  isSubscribed?: boolean | string | null;
  likeCount?: number | string | null;
  dislikeCount?: number | string | null;
  commentCount?: number | string | null;
};

type VideoReactionSummaryApiItem = {
  likeCount?: number | string | null;
  dislikeCount?: number | string | null;
  myReaction?: string | null;
  reactionType?: string | null;
  type?: string | null;
};

type ChannelSubscribeSummary = {
  isSubscribed: boolean;
  subscriberCount: number;
};

export class ApiRequestError extends Error {
  status: number;
  code?: string;

  constructor(message: string, options?: { status?: number; code?: string }) {
    super(message);
    this.name = "ApiRequestError";
    this.status = options?.status ?? 0;
    this.code = options?.code;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getErrorMessage(body: unknown, fallback: string): string {
  if (
    isRecord(body) &&
    typeof body.message === "string" &&
    body.message.trim()
  ) {
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

function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toNullableNumber(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }
  return fallback;
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

function unwrapApiData(body: unknown): unknown {
  const wrapped = isRecord(body)
    ? (body as Partial<ApiResponse<unknown>>)
    : null;
  return wrapped && "data" in wrapped ? wrapped.data : body;
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

function normalizeMediaUrl(url: string | undefined): string {
  const raw = (url ?? "").trim();
  if (!raw) return "";

  try {
    return encodeURI(raw);
  } catch {
    return raw;
  }
}

function buildVideoStreamUrl(videoId: number | string | undefined): string {
  const id = videoId != null ? String(videoId).trim() : "";
  if (!id || !API_BASE_URL?.trim()) return "";
  return `${API_BASE_URL.replace(/\/+$/, "")}/videos/${encodeURIComponent(id)}/stream`;
}

function toHomeVideoItem(item: VideoApiItem): Video {
  const id = item.id != null ? String(item.id) : "";
  const views = Number(item.viewCount) || 0;
  return {
    id,
    title: item.title || "Không có tiêu đề",
    channelName: "LamTube",
    views: `${new Intl.NumberFormat("vi-VN").format(views)} lượt xem`,
    publishedAt: "Mới đăng",
    duration: "",
    thumbnailUrl: item.thumbnailUrl || "",
    description: item.description || "",
    embedUrl: normalizeMediaUrl(item.videoUrl),
  };
}

function normalizeHomeVideoArray(value: unknown): Video[] {
  if (!Array.isArray(value)) return [];
  return value.reduce<Video[]>((acc, current) => {
    if (!isRecord(current)) return acc;
    acc.push(toHomeVideoItem(current as VideoApiItem));
    return acc;
  }, []);
}

function normalizeHomeVideoList(value: unknown): HomeVideoListResult {
  const defaultResult: HomeVideoListResult = {
    items: [],
    page: 0,
    size: 0,
    totalElements: 0,
    totalPages: 0,
  };

  if (Array.isArray(value)) {
    const items = normalizeHomeVideoArray(value);
    return {
      items,
      page: 0,
      size: items.length,
      totalElements: items.length,
      totalPages: items.length > 0 ? 1 : 0,
    };
  }

  if (!isRecord(value)) return defaultResult;

  const paged = value as Partial<PagedResponse<VideoApiItem>>;
  if (Array.isArray(paged.items)) {
    const items = normalizeHomeVideoArray(paged.items);
    return {
      items,
      page: typeof paged.page === "number" ? paged.page : 0,
      size: typeof paged.size === "number" ? paged.size : items.length,
      totalElements:
        typeof paged.totalElements === "number"
          ? paged.totalElements
          : items.length,
      totalPages:
        typeof paged.totalPages === "number"
          ? paged.totalPages
          : items.length > 0
            ? 1
            : 0,
    };
  }

  const fallbackItems = normalizeHomeVideoArray(value);
  return {
    items: fallbackItems,
    page: 0,
    size: fallbackItems.length,
    totalElements: fallbackItems.length,
    totalPages: fallbackItems.length > 0 ? 1 : 0,
  };
}

export async function getHomeVideos(
  params?: GetHomeVideosParams,
): Promise<HomeVideoListResult> {
  if (API_BASE_URL?.trim()) {
    const query = new URLSearchParams();
    query.set("page", String(params?.page ?? 0));
    query.set("size", String(params?.size ?? 16));
    if (typeof params?.categoryId === "number") {
      query.set("categoryId", String(params.categoryId));
    }
    if (params?.title?.trim()) {
      query.set("title", params.title.trim());
    }

    const response = await fetch(`${API_BASE_URL}/videos?${query.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const text = await response.text();
    let parsed: unknown = null;
    if (text) {
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = null;
      }
    }

    const body = isRecord(parsed)
      ? (parsed as Partial<ApiResponse<unknown>>)
      : null;

    if (!response.ok) {
      throw new Error(
        (typeof body?.message === "string" && body.message) ||
          "Không thể tải danh sách video",
      );
    }

    const data = body && "data" in body ? body.data : parsed;
    return normalizeHomeVideoList(data);
  }

  return {
    items: [],
    page: params?.page ?? 0,
    size: params?.size ?? 0,
    totalElements: 0,
    totalPages: 0,
  };
}

export async function getVideoById(
  id: string | undefined,
): Promise<VideoDetail | undefined> {
  if (!id) return undefined;

  if (API_BASE_URL?.trim()) {
    const response = await fetch(`${API_BASE_URL}/videos/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const body = await parseJsonBody(response);

    if (response.status === 404) {
      return undefined;
    }

    if (!response.ok) {
      throwApiError(response, body, "Không thể tải video");
    }

    const raw = unwrapApiData(body);
    if (!raw) return undefined;
    return normalizeVideoDetail(raw);
  }

  return undefined;
}

function normalizeVideoDetail(value: unknown): VideoDetail {
  const video = isRecord(value) ? (value as VideoDetailApiItem) : {};
  const rawId = toNumber(video.id);
  const streamUrl = buildVideoStreamUrl(video.id);
  const uploaderName = video.uploaderName?.trim() || "LamTube";
  const uploaderAvatarUrl = normalizeMediaUrl(video.uploaderAvatarUrl);
  const subscriberCount = toNumber(video.subscriberCount);
  const likeCount = toNumber(video.likeCount);
  const dislikeCount = toNumber(video.dislikeCount);
  const commentCount = toNumber(video.commentCount);
  const channelId =
    toNullableNumber(video.channelId) ?? toNullableNumber(video.uploaderId);

  return {
    id: rawId,
    channelId,
    title: video.title || "",
    description: video.description || "",
    thumbnailUrl: normalizeMediaUrl(video.thumbnailUrl),
    videoUrl: streamUrl || normalizeMediaUrl(video.videoUrl),
    status: video.status || "public",
    viewCount: toNumber(video.viewCount),
    categoryName: video.categoryName ?? null,
    categoryId: toNullableNumber(video.categoryId),
    uploaderName,
    uploaderAvatarUrl,
    isSubscribed: toBoolean(video.isSubscribed),
    subscriberCount,
    likeCount,
    dislikeCount,
    commentCount,
  };
}

function normalizeReactionType(value: unknown): VideoReactionType | null {
  if (value === "like" || value === "dislike") return value;
  return null;
}

function normalizeReactionSummary(
  value: unknown,
  fallback?: Partial<VideoReactionSummary>,
): VideoReactionSummary {
  const summary = isRecord(value) ? (value as VideoReactionSummaryApiItem) : {};
  const rawReaction =
    summary.myReaction ?? summary.reactionType ?? summary.type;
  const likeCount = Number(summary.likeCount);
  const dislikeCount = Number(summary.dislikeCount);

  return {
    likeCount: Number.isFinite(likeCount)
      ? likeCount
      : (fallback?.likeCount ?? 0),
    dislikeCount: Number.isFinite(dislikeCount)
      ? dislikeCount
      : (fallback?.dislikeCount ?? 0),
    myReaction:
      normalizeReactionType(rawReaction) ?? fallback?.myReaction ?? null,
  };
}

export async function getVideoReactionSummary(
  videoId: string | number,
): Promise<VideoReactionSummary> {
  const response = await fetch(
    `${API_BASE_URL}/videos/${videoId}/reaction-summary`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    },
  );

  const body = await parseJsonBody(response);

  if (!response.ok) {
    if (response.status === 401) {
      throwApiError(
        response,
        body,
        "Vui lòng đăng nhập để sử dụng chức năng phản hồi.",
      );
    }
    throwApiError(response, body, "Không thể tải dữ liệu phản hồi.");
  }

  const raw = unwrapApiData(body);
  return normalizeReactionSummary(raw);
}

export async function setVideoReaction(
  videoId: string | number,
  reactionType: VideoReactionType | null,
): Promise<VideoReactionSummary> {
  const response = await fetch(`${API_BASE_URL}/videos/${videoId}/reaction`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ type: reactionType }),
  });

  const body = await parseJsonBody(response);

  if (!response.ok) {
    if (response.status === 401) {
      throwApiError(
        response,
        body,
        "Vui lòng đăng nhập để sử dụng chức năng phản hồi.",
      );
    }
    throwApiError(response, body, "Không thể cập nhật phản hồi.");
  }

  const raw = unwrapApiData(body);
  return normalizeReactionSummary(raw);
}

function normalizeChannelSubscribeSummary(
  value: unknown,
): ChannelSubscribeSummary {
  const summary = isRecord(value)
    ? (value as Partial<ChannelSubscribeSummary>)
    : {};
  return {
    isSubscribed: toBoolean(summary.isSubscribed, true),
    subscriberCount: toNumber(summary.subscriberCount, 0),
  };
}

async function mutateChannelSubscription(
  channelId: string | number,
  method: "POST" | "DELETE",
  fallbackMessage: string,
): Promise<ChannelSubscribeSummary> {
  const response = await fetch(
    `${API_BASE_URL}/channels/${channelId}/subscribe`,
    {
      method,
      headers: getAuthHeaders(),
    },
  );

  const body = await parseJsonBody(response);
  if (!response.ok) {
    if (response.status === 401) {
      throwApiError(
        response,
        body,
        "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
      );
    }
    throwApiError(response, body, fallbackMessage);
  }

  const raw = unwrapApiData(body);
  return normalizeChannelSubscribeSummary(raw);
}

export async function subscribeChannel(
  channelId: string | number,
): Promise<ChannelSubscribeSummary> {
  return mutateChannelSubscription(
    channelId,
    "POST",
    "Không thể đăng ký kênh vào lúc này.",
  );
}

export async function unsubscribeChannel(
  channelId: string | number,
): Promise<ChannelSubscribeSummary> {
  const summary = await mutateChannelSubscription(
    channelId,
    "DELETE",
    "Không thể hủy đăng ký kênh vào lúc này.",
  );
  return {
    isSubscribed: false,
    subscriberCount: summary.subscriberCount,
  };
}

export async function getUploadCategories(): Promise<UploadVideoCategory[]> {
  const response = await fetch(`${API_BASE_URL}/categories`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const body = (await response.json()) as ApiResponse<UploadVideoCategory[]>;

  if (!response.ok) {
    throw new Error(body.message || "Không thể tải danh mục");
  }

  return body.data ?? [];
}

export async function createVideo(
  payload: UploadVideoPayload,
): Promise<ApiResponse<UploadVideoResponse>> {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("description", payload.description);
  formData.append("status", payload.status);
  formData.append("video", payload.videoFile);
  if (payload.categoryId != null) {
    formData.append("categoryId", String(payload.categoryId));
  }
  if (payload.thumbnailFile) {
    formData.append("thumbnail", payload.thumbnailFile);
  }

  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_BASE_URL}/user/upload/video`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });

  if (!response.ok) {
    let message = "Không thể đăng video";

    try {
      const body = (await response.json()) as { message?: string };
      message = body.message || message;
    } catch {
      if (response.status === 404) {
        message = "Backend upload video chưa được triển khai.";
      }
    }

    throw new Error(message);
  }

  return (await response.json()) as ApiResponse<UploadVideoResponse>;
}
