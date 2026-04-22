import { httpFetch } from "./http";
import { ApiRequestError } from "./videos";
import type {
  CreatePlaylistPayload,
  PlaylistListItem,
  PlaylistPickerItem,
  PlaylistUpdatePayload,
  PlaylistVideoItem,
  WatchLaterVideo,
} from "../types/playlist";
import type { ApiResponse } from "../types/auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type PlaylistApiItem = {
  id?: number | string;
  name?: string;
  isPrivate?: boolean | string | null;
  containsVideo?: boolean | string | null;
  videoCount?: number | string | null;
};

type PlaylistCreateApiItem = {
  id?: number | string;
};

type WatchLaterVideoApiItem = {
  id?: number | string;
  videoId?: number | string;
  title?: string;
  thumbnailUrl?: string;
  uploaderName?: string;
  viewCount?: number | string | null;
};

type PlaylistVideoApiItem = {
  id?: number | string;
  videoId?: number | string;
  title?: string;
  thumbnailUrl?: string;
  uploaderName?: string;
  viewCount?: number | string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
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

function normalizePlaylistPickerItems(value: unknown): PlaylistPickerItem[] {
  if (!Array.isArray(value)) return [];
  return value.reduce<PlaylistPickerItem[]>((acc, current) => {
    if (!isRecord(current)) return acc;
    const item = current as PlaylistApiItem;
    const id = toNumber(item.id, 0);
    if (!id) return acc;
    acc.push({
      id,
      name: typeof item.name === "string" && item.name.trim() ? item.name : "Untitled",
      isPrivate: toBoolean(item.isPrivate, false),
      containsVideo: toBoolean(item.containsVideo, false),
    });
    return acc;
  }, []);
}

function normalizePlaylistListItems(value: unknown): PlaylistListItem[] {
  if (!Array.isArray(value)) return [];
  return value.reduce<PlaylistListItem[]>((acc, current) => {
    if (!isRecord(current)) return acc;
    const item = current as PlaylistApiItem;
    const id = toNumber(item.id, 0);
    if (!id) return acc;
    acc.push({
      id,
      name: typeof item.name === "string" && item.name.trim() ? item.name : "Untitled",
      isPrivate: toBoolean(item.isPrivate, true),
      videoCount: toNumber(item.videoCount, 0),
    });
    return acc;
  }, []);
}

function normalizePlaylistId(value: unknown): number {
  if (!isRecord(value)) return 0;
  const item = value as PlaylistCreateApiItem;
  return toNumber(item.id, 0);
}

function normalizeWatchLaterVideos(value: unknown): WatchLaterVideo[] {
  const source = isRecord(value) && Array.isArray(value.items) ? value.items : value;
  if (!Array.isArray(source)) return [];

  return source.reduce<WatchLaterVideo[]>((acc, current) => {
    if (!isRecord(current)) return acc;
    const item = current as WatchLaterVideoApiItem;
    const id = toNumber(item.videoId ?? item.id, 0);
    if (!id) return acc;

    acc.push({
      id,
      title: typeof item.title === "string" ? item.title : "Không có tiêu đề",
      thumbnailUrl: typeof item.thumbnailUrl === "string" ? item.thumbnailUrl : "",
      uploaderName:
        typeof item.uploaderName === "string" && item.uploaderName.trim()
          ? item.uploaderName
          : "LamTube",
      viewCount: toNumber(item.viewCount, 0),
    });
    return acc;
  }, []);
}

function normalizePlaylistVideos(value: unknown): PlaylistVideoItem[] {
  const source = isRecord(value) && Array.isArray(value.items) ? value.items : value;
  if (!Array.isArray(source)) return [];

  return source.reduce<PlaylistVideoItem[]>((acc, current) => {
    if (!isRecord(current)) return acc;
    const item = current as PlaylistVideoApiItem;
    const id = toNumber(item.videoId ?? item.id, 0);
    if (!id) return acc;
    acc.push({
      id,
      title: typeof item.title === "string" ? item.title : "Không có tiêu đề",
      thumbnailUrl: typeof item.thumbnailUrl === "string" ? item.thumbnailUrl : "",
      uploaderName:
        typeof item.uploaderName === "string" && item.uploaderName.trim()
          ? item.uploaderName
          : "LamTube",
      viewCount: toNumber(item.viewCount, 0),
    });
    return acc;
  }, []);
}

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function isWatchLaterPlaylistName(name: string): boolean {
  const normalized = normalizeText(name);
  return normalized === "xem sau" || normalized === "watch later";
}

export async function getMyPlaylistsForVideo(videoId: number): Promise<PlaylistPickerItem[]> {
  const response = await httpFetch(`${API_BASE_URL}/user/playlists/me?videoId=${videoId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const body = await parseJsonBody(response);
  if (!response.ok) {
    throwApiError(response, body, "Không thể tải danh sách phát.");
  }

  const raw = unwrapApiData(body);
  return normalizePlaylistPickerItems(raw);
}

export async function getMyPlaylists(): Promise<PlaylistListItem[]> {
  const response = await httpFetch(`${API_BASE_URL}/user/playlists`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const body = await parseJsonBody(response);
  if (!response.ok) {
    throwApiError(response, body, "Không thể tải danh sách playlist.");
  }
  const raw = unwrapApiData(body);
  return normalizePlaylistListItems(raw);
}

export async function createPlaylist(payload: CreatePlaylistPayload): Promise<number> {
  const response = await httpFetch(`${API_BASE_URL}/user/playlists`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const body = await parseJsonBody(response);
  if (!response.ok) {
    throwApiError(response, body, "Không thể tạo danh sách phát.");
  }

  const raw = unwrapApiData(body);
  const playlistId = normalizePlaylistId(raw);
  if (!playlistId) {
    throw new ApiRequestError("Không nhận được playlistId sau khi tạo danh sách phát.");
  }
  return playlistId;
}

export async function addVideoToPlaylist(playlistId: number, videoId: number): Promise<void> {
  const response = await httpFetch(`${API_BASE_URL}/user/playlists/${playlistId}/videos/${videoId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });
  const body = await parseJsonBody(response);
  if (!response.ok) {
    throwApiError(response, body, "Không thể thêm video vào danh sách phát.");
  }
}

export async function removeVideoFromPlaylist(playlistId: number, videoId: number): Promise<void> {
  const response = await httpFetch(`${API_BASE_URL}/user/playlists/${playlistId}/videos/${videoId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  const body = await parseJsonBody(response);
  if (!response.ok) {
    throwApiError(response, body, "Không thể xóa video khỏi danh sách phát.");
  }
}

export async function getPlaylistVideos(playlistId: number): Promise<PlaylistVideoItem[]> {
  const response = await httpFetch(`${API_BASE_URL}/user/playlists/${playlistId}/videos`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const body = await parseJsonBody(response);
  if (!response.ok) {
    throwApiError(response, body, "Không thể tải video của playlist.");
  }
  const raw = unwrapApiData(body);
  return normalizePlaylistVideos(raw);
}

export async function updatePlaylist(
  playlistId: number,
  payload: PlaylistUpdatePayload,
): Promise<void> {
  const response = await httpFetch(`${API_BASE_URL}/user/playlists/${playlistId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const body = await parseJsonBody(response);
  if (!response.ok) {
    throwApiError(response, body, "Không thể cập nhật playlist.");
  }
}

export async function deletePlaylist(playlistId: number): Promise<void> {
  const response = await httpFetch(`${API_BASE_URL}/user/playlists/${playlistId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  const body = await parseJsonBody(response);
  if (!response.ok) {
    throwApiError(response, body, "Không thể xóa playlist.");
  }
}

export async function getWatchLaterVideos(): Promise<WatchLaterVideo[]> {
  const candidateUrls = [
    `${API_BASE_URL}/user/playlists/watch-later/videos`,
    `${API_BASE_URL}/user/playlists/playlists/watch-later/videos`,
  ];

  let lastBody: unknown = null;

  for (const url of candidateUrls) {
    const response = await httpFetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    const body = await parseJsonBody(response);
    lastBody = body;

    if (response.ok) {
      const raw = unwrapApiData(body);
      return normalizeWatchLaterVideos(raw);
    }

    if (response.status === 404) continue;

    throwApiError(response, body, "Không thể tải danh sách Xem sau. Vui lòng thử lại sau.");
  }

  throw new ApiRequestError(
    getErrorMessage(lastBody, "Không thể tải danh sách Xem sau. Vui lòng thử lại sau."),
    { status: 404, code: getErrorCode(lastBody) },
  );
}

export async function removeVideoFromWatchLater(videoId: number): Promise<void> {
  const playlists = await getMyPlaylistsForVideo(videoId);
  const targetPlaylists = playlists.filter(
    (playlist) => playlist.containsVideo && isWatchLaterPlaylistName(playlist.name),
  );

  if (!targetPlaylists.length) {
    throw new ApiRequestError("Không tìm thấy playlist Xem sau chứa video này.", {
      status: 404,
    });
  }

  await Promise.all(
    targetPlaylists.map((playlist) => removeVideoFromPlaylist(playlist.id, videoId)),
  );
}
