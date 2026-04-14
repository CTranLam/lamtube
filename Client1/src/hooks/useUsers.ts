import { useState, useEffect, useCallback } from "react";
import { getAllUsers, deleteUser } from "../api/admin";
import type { UserSummary } from "../types/auth";

export function useUsers(
  search: string,
  roleFilter: string,
  page: number,
  size: number,
) {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllUsers({
        email: search || undefined,
        role: roleFilter === "all" ? undefined : roleFilter,
        page,
        size,
      });
      setUsers(response.data.items ?? []);
      setTotalPages(response.data.totalPages ?? 0);
      setTotalElements(response.data.totalElements ?? 0);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Không thể tải danh sách tài khoản";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, page, size]);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async (user: UserSummary) => {
    const ok = window.confirm(`Xác nhận xóa tài khoản ${user.email}?`);
    if (!ok) return;

    try {
      setLoading(true);
      setError(null);
      await deleteUser(user.userId);
      await fetchUsers();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Lỗi khi xóa tài khoản";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    loading,
    error,
    totalPages,
    totalElements,
    refresh: fetchUsers,
    handleDelete,
  };
}
