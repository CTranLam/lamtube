import type { ApiResponse, PagedResponse } from "../types/auth";
import type {
  SubscribedChannelSummary,
  SubscribedVideosPage,
} from "../types/subscription";
import type { Video } from "../types/video";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type SubscribedVideoApiItem = {
  id?: number | string;
  title?: string;
  thumbnailUrl?: string;
  description?: string;
  channelName?: string;
  uploaderName?: string;
  viewCount?: number | string;
  publishedAt?: string;
};

type SubscribedChannelApiItem = {
  channelId?: number | string;
  id?: number | string;
  channelName?: string;
  name?: string;
  channelHandle?: string;
  handle?: string;
  avatarUrl?: string;
  description?: string;
  subscriberCount?: number | string;
  isSubscribed?: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseJson(text: string): unknown {
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("access_token");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

function unwrapData(body: unknown): unknown {
  if (!isRecord(body)) return body;
  const wrapped = body as Partial<ApiResponse<unknown>>;
  return "data" in wrapped ? wrapped.data : body;
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

function toVideo(item: SubscribedVideoApiItem): Video {
  const id = item.id != null ? String(item.id) : "";
  const viewCount = toNumber(item.viewCount, 0);
  return {
    id,
    title: item.title || "Không có tiêu đề",
    thumbnailUrl: item.thumbnailUrl || "",
    description: item.description || "",
    embedUrl: "",
    duration: "",
    channelName: item.channelName || item.uploaderName || "Kênh chưa xác định",
    views: `${new Intl.NumberFormat("vi-VN").format(viewCount)} lượt xem`,
    publishedAt: item.publishedAt || "Mới đăng",
  };
}

function normalizeVideos(value: unknown): Video[] {
  if (!Array.isArray(value)) return [];
  return value.reduce<Video[]>((acc, current) => {
    if (!isRecord(current)) return acc;
    acc.push(toVideo(current as SubscribedVideoApiItem));
    return acc;
  }, []);
}

function normalizeVideosPage(value: unknown): SubscribedVideosPage {
  const fallback: SubscribedVideosPage = {
    items: [],
    page: 0,
    size: 0,
    totalElements: 0,
    totalPages: 0,
  };

  if (Array.isArray(value)) {
    const items = normalizeVideos(value);
    return {
      items,
      page: 0,
      size: items.length,
      totalElements: items.length,
      totalPages: items.length > 0 ? 1 : 0,
    };
  }

  if (!isRecord(value)) return fallback;
  const paged = value as Partial<PagedResponse<SubscribedVideoApiItem>>;
  const items = normalizeVideos(paged.items);
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

function normalizeSubscribedChannels(
  value: unknown,
): SubscribedChannelSummary[] {
  if (!Array.isArray(value)) return [];
  return value.reduce<SubscribedChannelSummary[]>((acc, current) => {
    if (!isRecord(current)) return acc;
    const item = current as SubscribedChannelApiItem;
    const channelId = toNumber(item.channelId ?? item.id, 0);
    acc.push({
      channelId,
      channelName: item.channelName || item.name || "Kênh chưa đặt tên",
      channelHandle:
        item.channelHandle ||
        item.handle ||
        `@channel_${channelId || "unknown"}`,
      avatarUrl: item.avatarUrl || "",
      description: item.description || "Chưa có mô tả cho kênh này.",
      subscriberCount: toNumber(item.subscriberCount, 0),
      isSubscribed: item.isSubscribed ?? true,
    });
    return acc;
  }, []);
}

export async function getSubscribedVideos(params?: {
  page?: number;
  size?: number;
}): Promise<SubscribedVideosPage> {
  const query = new URLSearchParams();
  query.set("page", String(params?.page ?? 0));
  query.set("size", String(params?.size ?? 12));

  const response = await fetch(
    `${API_BASE_URL}/user/subscriptions/videos?${query.toString()}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    },
  );

  const body = parseJson(await response.text());
  if (!response.ok) {
    throw new Error(
      getErrorMessage(body, "Không thể tải video từ các kênh đã đăng ký."),
    );
  }

  return normalizeVideosPage(unwrapData(body));
}

export async function getSubscribedChannels(): Promise<
  SubscribedChannelSummary[]
> {
  const response = await fetch(`${API_BASE_URL}/user/subscriptions/channels`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const body = parseJson(await response.text());
  if (!response.ok) {
    throw new Error(
      getErrorMessage(body, "Không thể tải danh sách kênh đã đăng ký."),
    );
  }

  return normalizeSubscribedChannels(unwrapData(body));
}
