import { useEffect, useState } from "react";
import { getAllCategories, deleteCategory } from "../api/admin";
import type { CategorySummary } from "../types/auth";

export const useCategories = (keyword: string, page: number, size: number) => {
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAllCategories({
        keyword: keyword || undefined,
        page,
        size,
      });
      setCategories(res.data.items ?? []);
      setTotalPages(res.data.totalPages ?? 0);
      setTotalElements(res.data.totalElements ?? 0);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Không thể tải danh sách danh mục";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, page, size]);

  const handleDelete = async (category: CategorySummary) => {
    const ok = window.confirm(`Xác nhận xóa danh mục ${category.name}?`);
    if (!ok) return;

    try {
      setLoading(true);
      setError(null);
      await deleteCategory(category.id);
      await fetchCategories();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Lỗi khi xóa danh mục";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return {
    categories,
    loading,
    error,
    totalPages,
    totalElements,
    refresh: fetchCategories,
    handleDelete,
  };
};
