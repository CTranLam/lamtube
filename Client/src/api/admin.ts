import { httpFetch } from "./http";
import type {
  ApiResponse,
  UserSummary,
  UserInfoAdmin,
  CategorySummary,
  PagedResponse,
} from "../types/auth";
import type { AdminVideoSummary } from "../types/admin";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function getAllUsers(params?: {
  email?: string;
  role?: string;
  page?: number;
  size?: number;
}): Promise<ApiResponse<PagedResponse<UserSummary>>> {
  const token = localStorage.getItem("access_token");

  const searchParams = new URLSearchParams();
  if (params?.email) {
    searchParams.append("email", params.email);
  }
  if (params?.role) {
    searchParams.append("role", params.role);
  }
  if (typeof params?.page === "number") {
    searchParams.append("page", String(params.page));
  }
  if (typeof params?.size === "number") {
    searchParams.append("size", String(params.size));
  }

  const url = `${API_BASE_URL}/admin/users${
    searchParams.toString() ? `?${searchParams.toString()}` : ""
  }`;

  const response = await httpFetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const body = (await response.json()) as ApiResponse<unknown>;

  if (!response.ok) {
    throw new Error(body.message || "Không thể tải danh sách tài khoản");
  }

  return body as ApiResponse<PagedResponse<UserSummary>>;
}

export async function createUser(payload: {
  email: string;
  fullname: string;
  password: string;
  role: string;
}): Promise<ApiResponse<UserSummary>> {
  const token = localStorage.getItem("access_token");

  const response = await httpFetch(`${API_BASE_URL}/admin/user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  const body = (await response.json()) as ApiResponse<unknown>;

  if (!response.ok) {
    throw new Error(body.message || "Không thể tạo người dùng");
  }

  return body as ApiResponse<UserSummary>;
}

export async function getRoles(): Promise<ApiResponse<string[]>> {
  const token = localStorage.getItem("access_token");

  const response = await httpFetch(`${API_BASE_URL}/admin/roles`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const body = (await response.json()) as ApiResponse<unknown>;

  if (!response.ok) {
    throw new Error(body.message || "Không thể tải danh sách role");
  }

  return body as ApiResponse<string[]>;
}

export async function getUser(
  userId: number,
): Promise<ApiResponse<UserInfoAdmin>> {
  const token = localStorage.getItem("access_token");

  const response = await httpFetch(`${API_BASE_URL}/admin/user/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const body = (await response.json()) as ApiResponse<unknown>;

  if (!response.ok) {
    throw new Error(body.message || "Không thể tải thông tin người dùng");
  }

  return body as ApiResponse<UserInfoAdmin>;
}

export async function updateUser(
  userId: number,
  payload: Partial<{
    fullname: string;
    role: string;
    password: string;
    bio: string;
    avatarUrl: string;
  }>,
): Promise<ApiResponse<UserSummary>> {
  const token = localStorage.getItem("access_token");

  const response = await httpFetch(`${API_BASE_URL}/admin/user/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  const body = (await response.json()) as ApiResponse<unknown>;

  if (!response.ok) {
    throw new Error(body.message || "Không thể cập nhật người dùng");
  }

  return body as ApiResponse<UserSummary>;
}

export async function deleteUser(userId: number): Promise<void> {
  const token = localStorage.getItem("access_token");

  const response = await httpFetch(`${API_BASE_URL}/admin/user/${userId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    try {
      const body = (await response.json()) as ApiResponse<unknown>;
      throw new Error(body.message || "Không thể xóa người dùng");
    } catch (e) {
      throw new Error("Không thể xóa người dùng" + (e as Error).message);
    }
  }
}

export async function getAllCategories(params?: {
  keyword?: string;
  page?: number;
  size?: number;
}): Promise<ApiResponse<PagedResponse<CategorySummary>>> {
  const token = localStorage.getItem("access_token");

  const searchParams = new URLSearchParams();
  if (params?.keyword) {
    searchParams.append("keyword", params.keyword);
  }
  if (typeof params?.page === "number") {
    searchParams.append("page", String(params.page));
  }
  if (typeof params?.size === "number") {
    searchParams.append("size", String(params.size));
  }

  const url = `${API_BASE_URL}/admin/categories${
    searchParams.toString() ? `?${searchParams.toString()}` : ""
  }`;

  const response = await httpFetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const body = (await response.json()) as ApiResponse<unknown>;

  if (!response.ok) {
    throw new Error(body.message || "Không thể tải danh sách danh mục");
  }

  return body as ApiResponse<PagedResponse<CategorySummary>>;
}

export async function createCategory(payload: {
  name: string;
}): Promise<ApiResponse<CategorySummary>> {
  const token = localStorage.getItem("access_token");

  const response = await httpFetch(`${API_BASE_URL}/admin/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  const body = (await response.json()) as ApiResponse<unknown>;

  if (!response.ok) {
    throw new Error(body.message || "Không thể tạo danh mục");
  }

  return body as ApiResponse<CategorySummary>;
}

export async function updateCategory(
  categoryId: number,
  payload: { name: string },
): Promise<ApiResponse<CategorySummary>> {
  const token = localStorage.getItem("access_token");

  const response = await httpFetch(
    `${API_BASE_URL}/admin/categories/${categoryId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    },
  );

  const body = (await response.json()) as ApiResponse<unknown>;

  if (!response.ok) {
    throw new Error(body.message || "Không thể cập nhật danh mục");
  }

  return body as ApiResponse<CategorySummary>;
}

export async function deleteCategory(categoryId: number): Promise<void> {
  const token = localStorage.getItem("access_token");

  const response = await httpFetch(
    `${API_BASE_URL}/admin/categories/${categoryId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    },
  );

  if (!response.ok) {
    try {
      const body = (await response.json()) as ApiResponse<unknown>;
      throw new Error(body.message || "Không thể xóa danh mục");
    } catch (e) {
      throw new Error("Không thể xóa danh mục" + (e as Error).message);
    }
  }
}

function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toNullableNumber(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeAdminVideo(value: unknown): AdminVideoSummary | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  const id = toNumber(item.id);
  if (!id) return null;

  return {
    id,
    title: typeof item.title === "string" ? item.title : "Không có tiêu đề",
    description: typeof item.description === "string" ? item.description : "",
    thumbnailUrl: typeof item.thumbnailUrl === "string" ? item.thumbnailUrl : "",
    videoUrl: typeof item.videoUrl === "string" ? item.videoUrl : "",
    status: typeof item.status === "string" ? item.status : "private",
    viewCount: toNumber(item.viewCount),
    categoryName: typeof item.categoryName === "string" ? item.categoryName : null,
    categoryId: toNullableNumber(item.categoryId),
    uploaderName:
      typeof item.uploaderName === "string" && item.uploaderName.trim()
        ? item.uploaderName
        : "Unknown",
    createdAt: typeof item.createdAt === "string" ? item.createdAt : null,
  };
}

export async function getAllAdminVideos(params?: {
  title?: string;
  status?: string;
  categoryId?: number;
  uploader?: string;
  page?: number;
  size?: number;
}): Promise<ApiResponse<PagedResponse<AdminVideoSummary>>> {
  const token = localStorage.getItem("access_token");

  const searchParams = new URLSearchParams();
  if (params?.title) {
    searchParams.append("title", params.title);
  }
  if (params?.status) {
    searchParams.append("status", params.status);
  }
  if (typeof params?.categoryId === "number") {
    searchParams.append("categoryId", String(params.categoryId));
  }
  if (params?.uploader) {
    searchParams.append("uploader", params.uploader);
  }
  if (typeof params?.page === "number") {
    searchParams.append("page", String(params.page));
  }
  if (typeof params?.size === "number") {
    searchParams.append("size", String(params.size));
  }

  const response = await httpFetch(
    `${API_BASE_URL}/admin/videos${searchParams.toString() ? `?${searchParams.toString()}` : ""}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    },
  );

  const body = (await response.json()) as ApiResponse<unknown>;
  if (!response.ok) {
    throw new Error(body.message || "Không thể tải danh sách video");
  }

  const raw = body.data as Partial<PagedResponse<unknown>> | unknown[] | undefined;
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as Partial<PagedResponse<unknown>> | undefined)?.items)
      ? ((raw as Partial<PagedResponse<unknown>>).items ?? [])
      : [];

  const items = list
    .map((item) => normalizeAdminVideo(item))
    .filter((item): item is AdminVideoSummary => item !== null);

  const page = !Array.isArray(raw) && typeof raw?.page === "number" ? raw.page : params?.page ?? 0;
  const size = !Array.isArray(raw) && typeof raw?.size === "number" ? raw.size : params?.size ?? items.length;
  const totalElements =
    !Array.isArray(raw) && typeof raw?.totalElements === "number" ? raw.totalElements : items.length;
  const totalPages =
    !Array.isArray(raw) && typeof raw?.totalPages === "number" ? raw.totalPages : items.length > 0 ? 1 : 0;

  return {
    message: body.message || "Danh sách video",
    data: {
      items,
      page,
      size,
      totalElements,
      totalPages,
    },
  };
}

export async function updateAdminVideoStatus(
  videoId: number,
  status: "public" | "private",
): Promise<ApiResponse<AdminVideoSummary>> {
  const token = localStorage.getItem("access_token");
  const response = await httpFetch(`${API_BASE_URL}/admin/videos/${videoId}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ status }),
  });

  const body = (await response.json()) as ApiResponse<unknown>;
  if (!response.ok) {
    throw new Error(body.message || "Không thể cập nhật trạng thái video");
  }

  const mapped = normalizeAdminVideo(body.data);
  return {
    message: body.message || "Cập nhật trạng thái video thành công",
    data:
      mapped ??
      ({
        id: videoId,
        title: "",
        description: "",
        thumbnailUrl: "",
        videoUrl: "",
        status,
        viewCount: 0,
        categoryName: null,
        categoryId: null,
        uploaderName: "Unknown",
      } as AdminVideoSummary),
  };
}

export async function deleteAdminVideo(videoId: number): Promise<void> {
  const token = localStorage.getItem("access_token");
  const response = await httpFetch(`${API_BASE_URL}/admin/videos/${videoId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    try {
      const body = (await response.json()) as ApiResponse<unknown>;
      throw new Error(body.message || "Không thể xóa video");
    } catch (e) {
      throw new Error("Không thể xóa video " + (e as Error).message);
    }
  }
}
