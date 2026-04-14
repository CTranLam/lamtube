import { useState } from "react";
import {
  Box,
  CircularProgress,
  Paper,
  Typography,
  Pagination,
} from "@mui/material";
import { useCategories } from "../../hooks/useCategories";
import { CategoryToolbar } from "../../components/admin/CategoryToolbar";
import { CategoryTable } from "../../components/admin/CategoryTable";
import { CategoryModals } from "../../components/admin/CategoryModals";
import type { CategorySummary } from "../../types/auth";

export default function CategoryManagement() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const size = 2;
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<CategorySummary | null>(null);

  const { categories, loading, error, totalPages, refresh, handleDelete } =
    useCategories(search, page, size);

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Quản lý danh mục
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
              Đang tải danh sách danh mục...
            </Typography>
          </Box>
        )}

        {error && !loading && (
          <Typography variant="body2" sx={{ color: "#ef4444", mb: 2 }}>
            {error}
          </Typography>
        )}

        <CategoryToolbar
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(0);
          }}
          onAddClick={() => setIsAddOpen(true)}
        />

        {!loading && !error && (
          <CategoryTable
            categories={categories}
            onEdit={(c) => {
              setSelectedCategory(c);
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

      <CategoryModals
        isAddOpen={isAddOpen}
        onCloseAdd={() => setIsAddOpen(false)}
        isEditOpen={isEditOpen}
        onCloseEdit={() => setIsEditOpen(false)}
        selectedCategory={selectedCategory}
        onRefresh={refresh}
      />
    </Box>
  );
}
