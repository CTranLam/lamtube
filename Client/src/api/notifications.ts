import type { RealtimeNotification } from "../types/notification/notification";
import type { ApiResponse } from "../types/auth";
const toNotificationsBaseUrl = (): string => {
  const explicitSocketUrl = import.meta.env.VITE_SOCKET_BASE_URL as
    | string
    | undefined;
  if (explicitSocketUrl?.trim()) {
    return explicitSocketUrl.trim();
  }
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  return `${protocol}//${hostname}:3000`;
};
const getAuthHeaders = (): HeadersInit => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = localStorage.getItem("access_token");
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};
const parseJsonBody = async (response: Response): Promise<unknown> => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
};
const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};
const toMessage = (body: unknown, fallback: string): string => {
  if (
    isRecord(body) &&
    typeof body.message === "string" &&
    body.message.trim()
  ) {
    return body.message;
  }
  return fallback;
};
const normalizeList = (value: unknown): RealtimeNotification[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is RealtimeNotification => isRecord(item));
};
const toApiResponse = <T>(
  body: unknown,
  fallbackMessage: string,
): ApiResponse<T> => {
  if (!isRecord(body)) {
    throw new Error(fallbackMessage);
  }
  const message = toMessage(body, fallbackMessage);
  const data = body.data as T;
  return { message, data };
};
export const getNotifications = async (
  limit = 20,
): Promise<RealtimeNotification[]> => {
  const baseUrl = toNotificationsBaseUrl();
  const response = await fetch(
    `${baseUrl}/notifications?limit=${encodeURIComponent(String(limit))}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
      credentials: "include",
    },
  );
  const body = await parseJsonBody(response);
  if (!response.ok) {
    throw new Error(toMessage(body, "Không thể tải thông báo."));
  }
  const parsed = toApiResponse<unknown>(body, "Không thể tải thông báo.");
  return normalizeList(parsed.data);
};

export const markAllNotificationsRead = async (): Promise<number> => {
  const baseUrl = toNotificationsBaseUrl();
  const response = await fetch(`${baseUrl}/notifications/read-all`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    credentials: "include",
  });
  const body = await parseJsonBody(response);
  if (!response.ok) {
    throw new Error(toMessage(body, "Không thể đánh dấu thông báo đã đọc."));
  }
  const parsed = toApiResponse<Record<string, unknown> | null>(
    body,
    "Không thể đánh dấu thông báo đã đọc.",
  );
  const data = isRecord(parsed.data) ? parsed.data : null;
  const rawCount = data?.updatedCount;
  const updatedCount = Number(rawCount);
  return Number.isFinite(updatedCount) ? updatedCount : 0;
};

export const markOneNotificationRead = async (
  eventId: string,
): Promise<boolean> => {
  const baseUrl = toNotificationsBaseUrl();
  const response = await fetch(
    `${baseUrl}/notifications/${encodeURIComponent(eventId)}/read`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
      credentials: "include",
    },
  );
  const body = await parseJsonBody(response);
  if (!response.ok) {
    throw new Error(toMessage(body, "Không thể đánh dấu thông báo đã đọc."));
  }
  const parsed = toApiResponse<Record<string, unknown> | null>(
    body,
    "Không thể đánh dấu thông báo đã đọc.",
  );
  const data = isRecord(parsed.data) ? parsed.data : null;
  return Boolean(data?.updated);
};
