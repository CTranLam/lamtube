import { useState } from "react";
import {
  Box,
  CircularProgress,
  Typography,
  Paper,
  Pagination,
} from "@mui/material";
import { useAdminRoles } from "../../hooks/useAdminRoles";
import { useUsers } from "../../hooks/useUsers";
import type { UserSummary } from "../../types/auth";
import { UserTable } from "../../components/admin/UserTable";
import { UserToolbar } from "../../components/admin/UserToolbar";
import { UserModals } from "../../components/admin/UserModals";

export default function UserManagement() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(0);
  const size = 2;

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<null | UserSummary>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const { roles, isLoading: rolesLoading } = useAdminRoles();
  const { users, loading, error, totalPages, refresh, handleDelete } = useUsers(
    search,
    roleFilter,
    page,
    size,
  );

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Quản lý tài khoản
      </Typography>

      <Paper
        elevation={0}
        sx={{
          p: 2,
          bgcolor: "transparent",
        }}
      >
        {loading && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CircularProgress size={20} />
            <Typography variant="body2">
              Đang tải danh sách tài khoản...
            </Typography>
          </Box>
        )}

        {error && !loading && (
          <Typography variant="body2" sx={{ color: "#ef4444", mb: 2 }}>
            {error}
          </Typography>
        )}

        <UserToolbar
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(0);
          }}
          roleFilter={roleFilter}
          onRoleChange={(value) => {
            setRoleFilter(value);
            setPage(0);
          }}
          roles={roles}
          onAddClick={() => setIsAddOpen(true)}
        />

        {!loading && !error && (
          <UserTable
            users={users}
            onView={(u) => {
              setSelectedUser(u);
              setIsDetailsOpen(true);
            }}
            onEdit={(u) => {
              setSelectedUser(u);
              setIsEditOpen(true);
            }}
            onDelete={handleDelete}
          />
        )}

        {totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Pagination
              count={totalPages}
              page={page + 1}
              onChange={(_, newPage) => setPage(newPage - 1)}
              color="primary"
              size="small"
              sx={{
                "& .MuiPaginationItem-root": {
                  color: "#0f172a",
                },
              }}
            />
          </Box>
        )}
      </Paper>

      <UserModals
        isAddOpen={isAddOpen}
        onCloseAdd={() => setIsAddOpen(false)}
        isDetailsOpen={isDetailsOpen}
        onCloseDetails={() => setIsDetailsOpen(false)}
        isEditOpen={isEditOpen}
        onCloseEdit={() => setIsEditOpen(false)}
        selectedUser={selectedUser}
        roles={roles}
        rolesLoading={rolesLoading}
        onRefresh={refresh}
      />
    </Box>
  );
}
