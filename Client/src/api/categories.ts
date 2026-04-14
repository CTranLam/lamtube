import type { ApiResponse, PagedResponse } from "../types/auth";
import type { HomeCategory, HomeCategoryListResult } from "../types/category";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type GetCategoriesParams = {
  page?: number;
  size?: number;
  q?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeCategoryArray(value: unknown): HomeCategory[] {
  if (!Array.isArray(value)) return [];

  return value.reduce<HomeCategory[]>((acc, item) => {
    if (!isRecord(item)) return acc;

    const id = item.id;
    const name = item.name;
    if (typeof id !== "number" || typeof name !== "string") {
      return acc;
    }

    const category: HomeCategory = { id, name };

    acc.push(category);
    return acc;
  }, []);
}

function normalizeCategoryList(value: unknown): HomeCategoryListResult {
  const defaultResult: HomeCategoryListResult = {
    items: [],
    page: 0,
    size: 0,
    totalElements: 0,
    totalPages: 0,
  };

  if (Array.isArray(value)) {
    const items = normalizeCategoryArray(value);
    return {
      items,
      page: 0,
      size: items.length,
      totalElements: items.length,
      totalPages: items.length > 0 ? 1 : 0,
    };
  }

  if (!isRecord(value)) {
    return defaultResult;
  }

  const paged = value as Partial<PagedResponse<HomeCategory>>;
  const items = normalizeCategoryArray(paged.items);
  if (Array.isArray(paged.items)) {
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

  const itemsFallback = normalizeCategoryArray(value);
  return {
    items: itemsFallback,
    page: 0,
    size: itemsFallback.length,
    totalElements: itemsFallback.length,
    totalPages: itemsFallback.length > 0 ? 1 : 0,
  };
}

export async function getCategories(
  params?: GetCategoriesParams,
): Promise<HomeCategoryListResult> {
  const query = new URLSearchParams();
  if (typeof params?.page === "number") {
    query.append("page", String(params.page));
  }
  if (typeof params?.size === "number") {
    query.append("size", String(params.size));
  }
  if (params?.q) {
    query.append("q", params.q);
  }

  const response = await fetch(
    `${API_BASE_URL}/categories${query.toString() ? `?${query.toString()}` : ""}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

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
        "Không thể tải danh mục",
    );
  }

  const data = body && "data" in body ? body.data : parsed;
  return normalizeCategoryList(data);
}
