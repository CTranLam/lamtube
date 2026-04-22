import { useCallback, useEffect, useState } from "react";
import { getAllAdminVideos } from "../api/admin";
import type { AdminVideoSummary } from "../types/admin";

export function useAdminVideos(
  title: string,
  status: string,
  categoryId: string,
  uploader: string,
  page: number,
  size: number,
) {
  const [videos, setVideos] = useState<AdminVideoSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchVideos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllAdminVideos({
        title: title || undefined,
        status: status === "all" ? undefined : status,
        categoryId: categoryId === "all" || !categoryId ? undefined : Number(categoryId),
        uploader: uploader || undefined,
        page,
        size,
      });

      setVideos(response.data.items ?? []);
      setTotalPages(response.data.totalPages ?? 0);
      setTotalElements(response.data.totalElements ?? 0);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Không thể tải danh sách video";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [title, status, categoryId, uploader, page, size]);

  useEffect(() => {
    void fetchVideos();
  }, [fetchVideos]);

  return {
    videos,
    loading,
    error,
    totalPages,
    totalElements,
    refresh: fetchVideos,
  };
}
