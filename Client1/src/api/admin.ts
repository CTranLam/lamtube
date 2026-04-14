import type {
  ApiResponse,
  UserSummary,
  UserInfoAdmin,
  CategorySummary,
  PagedResponse,
} from "../types/auth";

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

  const response = await fetch(url, {
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

  const response = await fetch(`${API_BASE_URL}/admin/user`, {
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

  const response = await fetch(`${API_BASE_URL}/admin/roles`, {
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

  const response = await fetch(`${API_BASE_URL}/admin/user/${userId}`, {
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

  const response = await fetch(`${API_BASE_URL}/admin/user/${userId}`, {
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

  const response = await fetch(`${API_BASE_URL}/admin/user/${userId}`, {
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

  const response = await fetch(url, {
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

  const response = await fetch(`${API_BASE_URL}/admin/categories`, {
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

  const response = await fetch(
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

  const response = await fetch(
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
