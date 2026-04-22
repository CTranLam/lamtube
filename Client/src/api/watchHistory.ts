import { httpFetch } from "./http";
import type { ApiResponse } from "../types/auth";
import type { WatchHistoryGroup, WatchHistoryVideo } from "../types/watchHistory";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
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

function unwrapApiData(body: unknown): unknown {
  const wrapped = isRecord(body)
    ? (body as Partial<ApiResponse<unknown>>)
    : null;
  return wrapped && "data" in wrapped ? wrapped.data : body;
}

function normalizeWatchHistoryVideo(
  item: unknown,
  fallbackWatchedAt = "",
): WatchHistoryVideo | null {
  if (!isRecord(item)) return null;

  const rawVideo = isRecord(item.video) ? item.video : item;
  const rawVideoId = rawVideo.videoId ?? rawVideo.id;
  const videoId = toNumber(rawVideoId, 0);
  if (!videoId) return null;

  const rawWatchedAt = item.watchedAt ?? item.lastWatchedAt ?? fallbackWatchedAt;
  const watchedAt = typeof rawWatchedAt === "string" ? rawWatchedAt : "";

  return {
    videoId,
    title: typeof rawVideo.title === "string" ? rawVideo.title : "Không có tiêu đề",
    thumbnailUrl:
      typeof rawVideo.thumbnailUrl === "string" ? rawVideo.thumbnailUrl : "",
    uploaderName:
      typeof rawVideo.uploaderName === "string" && rawVideo.uploaderName.trim()
        ? rawVideo.uploaderName
        : "LamTube",
    viewCount: toNumber(rawVideo.viewCount, 0),
    watchedAt,
  };
}

function toDateKey(watchedAt: string): string {
  if (!watchedAt.trim()) return "unknown";
  const date = new Date(watchedAt);
  if (Number.isNaN(date.getTime())) return "unknown";
  return date.toISOString().slice(0, 10);
}

function toDateLabel(dateKey: string): string {
  if (dateKey === "unknown") return "Không xác định";
  const now = new Date();
  const todayKey = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  )
    .toISOString()
    .slice(0, 10);
  if (dateKey === todayKey) return "Hôm nay";

  const date = new Date(`${dateKey}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateKey;
  return `${date.getDate()} thg ${date.getMonth() + 1}`;
}

function groupFromFlatItems(items: WatchHistoryVideo[]): WatchHistoryGroup[] {
  const grouped = new Map<string, WatchHistoryVideo[]>();
  for (const item of items) {
    const key = toDateKey(item.watchedAt);
    const existing = grouped.get(key);
    if (existing) {
      existing.push(item);
    } else {
      grouped.set(key, [item]);
    }
  }

  return Array.from(grouped.entries()).map(([date, groupItems]) => ({
    date,
    label: toDateLabel(date),
    items: groupItems,
  }));
}

function normalizeWatchHistoryGroups(value: unknown): WatchHistoryGroup[] {
  if (Array.isArray(value)) {
    if (
      value.length > 0 &&
      isRecord(value[0]) &&
      Array.isArray((value[0] as { items?: unknown }).items)
    ) {
      return value.reduce<WatchHistoryGroup[]>((acc, current) => {
        if (!isRecord(current)) return acc;
        const date = typeof current.date === "string" ? current.date : "unknown";
        const fallbackWatchedAt =
          typeof current.watchedAt === "string" ? current.watchedAt : "";
        const items = Array.isArray(current.items)
          ? current.items
              .map((item) => normalizeWatchHistoryVideo(item, fallbackWatchedAt))
              .filter((item): item is WatchHistoryVideo => item !== null)
          : [];
        if (!items.length) return acc;
        acc.push({
          date,
          label:
            typeof current.label === "string" && current.label.trim()
              ? current.label
              : toDateLabel(date),
          items,
        });
        return acc;
      }, []);
    }

    const flatItems = value
      .map((item) => normalizeWatchHistoryVideo(item))
      .filter((item): item is WatchHistoryVideo => item !== null);
    return groupFromFlatItems(flatItems);
  }

  if (isRecord(value) && Array.isArray(value.groups)) {
    return normalizeWatchHistoryGroups(value.groups);
  }

  return [];
}

export async function getWatchHistory(): Promise<WatchHistoryGroup[]> {
  const response = await httpFetch(`${API_BASE_URL}/user/watch-history`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const body = await parseJsonBody(response);
  if (!response.ok) {
    throw new Error(
      getErrorMessage(body, "Không thể tải danh sách lịch sử xem."),
    );
  }
  const raw = unwrapApiData(body);
  return normalizeWatchHistoryGroups(raw);
}

export async function registerWatchHistory(videoId: number): Promise<void> {
  const response = await httpFetch(`${API_BASE_URL}/user/watch-history/${videoId}`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  const body = await parseJsonBody(response);
  if (!response.ok) {
    throw new Error(
      getErrorMessage(body, "Không thể cập nhật lịch sử xem video."),
    );
  }
}

export async function clearWatchHistory(): Promise<void> {
  const response = await httpFetch(`${API_BASE_URL}/user/watch-history`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  const body = await parseJsonBody(response);
  if (!response.ok) {
    throw new Error(getErrorMessage(body, "Không thể xóa toàn bộ lịch sử xem."));
  }
}

export async function deleteWatchHistoryVideo(videoId: number): Promise<void> {
  const response = await httpFetch(`${API_BASE_URL}/user/watch-history/${videoId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  const body = await parseJsonBody(response);
  if (!response.ok) {
    throw new Error(getErrorMessage(body, "Không thể xóa video khỏi lịch sử."));
  }
}
