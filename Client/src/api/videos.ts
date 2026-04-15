import type {
  HomeVideoListResult,
  UploadVideoCategory,
  UploadVideoPayload,
  UploadVideoResponse,
  Video,
  VideoDetail,
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
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
    const token = localStorage.getItem("access_token");
    const response = await fetch(`${API_BASE_URL}/videos/${id}`, {
      method: "GET",
      headers: token
        ? {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          }
        : {
            "Content-Type": "application/json",
          },
    });

    const text = await response.text();
    let body: unknown;
    if (text) {
      try {
        body = JSON.parse(text) as unknown;
      } catch {
        body = null;
      }
    }

    if (response.status === 404) {
      return undefined;
    }

    if (!response.ok) {
      const message =
        typeof body === "object" &&
        body !== null &&
        "message" in body &&
        typeof body.message === "string"
          ? body.message
          : "Không thể tải video";
      throw new Error(message);
    }

    const wrapped = body as ApiResponse<VideoDetail> | null;
    const raw = wrapped?.data ?? (body as VideoDetail | null);
    if (!raw) return undefined;
    return normalizeVideoDetail(raw);
  }

  return undefined;
}

function normalizeVideoDetail(video: VideoDetail): VideoDetail {
  const streamUrl = buildVideoStreamUrl(video.id);
  const uploaderName = video.uploaderName?.trim() || "LamTube";
  const uploaderAvatarUrl = normalizeMediaUrl(video.uploaderAvatarUrl);
  const subscriberCount = Number(video.subscriberCount);
  const likeCount = Number(video.likeCount);
  const dislikeCount = Number(video.dislikeCount);
  const commentCount = Number(video.commentCount);

  return {
    id: Number(video.id),
    title: video.title || "",
    description: video.description || "",
    thumbnailUrl: normalizeMediaUrl(video.thumbnailUrl),
    videoUrl: streamUrl || normalizeMediaUrl(video.videoUrl),
    status: video.status || "public",
    viewCount: Number(video.viewCount) || 0,
    categoryName: video.categoryName ?? null,
    categoryId: video.categoryId ?? null,
    uploaderName,
    uploaderAvatarUrl,
    subscriberCount: Number.isFinite(subscriberCount) ? subscriberCount : 0,
    likeCount: Number.isFinite(likeCount) ? likeCount : 0,
    dislikeCount: Number.isFinite(dislikeCount) ? dislikeCount : 0,
    commentCount: Number.isFinite(commentCount) ? commentCount : 0,
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
