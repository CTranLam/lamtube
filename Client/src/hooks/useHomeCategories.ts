import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getCategories } from "../api/categories";
import type { HomeCategoryListResult } from "../types/category";

type UseHomeCategoriesParams = {
  page?: number;
  size?: number;
  q?: string;
};

export function useHomeCategories(params?: UseHomeCategoriesParams) {
  return useQuery<HomeCategoryListResult>({
    queryKey: [
      "home",
      "categories",
      params?.page ?? null,
      params?.size ?? null,
      params?.q ?? "",
    ],
    queryFn: () => getCategories(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
    placeholderData: keepPreviousData,
  });
}
