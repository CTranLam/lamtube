import type { ApiResponse } from "../types/auth";
import type {
  MyVideo,
  ChannelStats,
  UserProfileDetail,
} from "../types/channel";
import type { UserInfoResponse } from "../types/auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function getAuthHeaders() {
  const token = localStorage.getItem("access_token");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  let body: ApiResponse<unknown> | null = null;
  if (text) {
    try {
      body = JSON.parse(text) as ApiResponse<unknown>;
    } catch (e) {
      console.log("Không thể parse JSON response:", e);
    }
  }

  if (!response.ok) {
    const message =
      body?.message || response.statusText || `HTTP ${response.status}`;
    throw new Error(message);
  }

  if (!body) return undefined as unknown as T;

  return body.data as T;
}

export async function getMyVideos(): Promise<MyVideo[]> {
  const response = await fetch(`${API_BASE_URL}/user/channel/videos`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleResponse<MyVideo[]>(response);
}

export async function getChannelStats(): Promise<ChannelStats> {
  const response = await fetch(`${API_BASE_URL}/user/channel/stats`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleResponse<ChannelStats>(response);
}

export async function getMyProfile(): Promise<UserProfileDetail> {
  const response = await fetch(`${API_BASE_URL}/user/channel/profile`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const raw = await handleResponse<UserInfoResponse>(response);
  const avatarUrl = raw.avatarUrl?.trim() || "";
  const mapped: UserProfileDetail = {
    email: raw.email || "",
    profile: {
      fullName: raw.fullname || "Người dùng mới",
      bio: raw.bio || "Chưa có tiểu sử",
      avatarUrl,
    },
  };

  return mapped;
}

export async function updateMyProfile(update: {
  fullname?: string;
  bio?: string;
  avatarUrl?: string;
}): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/user/channel/profile`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(update),
  });

  await handleResponse<unknown>(response);
}

export async function uploadAvatar(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const token = localStorage.getItem("access_token");
  const headers: HeadersInit = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/user/upload-avatar`, {
    method: "POST",
    headers,
    body: formData,
  });

  const url = await handleResponse<string>(response);
  return url;
}
