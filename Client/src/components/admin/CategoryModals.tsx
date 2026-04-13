import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import type { CategorySummary } from "../../types/auth";
import { createCategory, updateCategory } from "../../api/admin";

interface CategoryModalsProps {
  isAddOpen: boolean;
  onCloseAdd: () => void;
  isEditOpen: boolean;
  onCloseEdit: () => void;
  selectedCategory: CategorySummary | null;
  onRefresh: () => void | Promise<void>;
}

export const CategoryModals = ({
  isAddOpen,
  onCloseAdd,
  isEditOpen,
  onCloseEdit,
  selectedCategory,
  onRefresh,
}: CategoryModalsProps) => {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEditOpen && selectedCategory) {
      setName(selectedCategory.name);
    } else if (isAddOpen) {
      setName("");
    }
    setError(null);
  }, [isAddOpen, isEditOpen, selectedCategory]);

  const handleCreate = async () => {
    if (!name.trim()) {
      setError("Tên danh mục không được để trống");
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      await createCategory({ name: name.trim() });
      await onRefresh();
      onCloseAdd();
      setName("");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Không thể tạo danh mục";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedCategory) return;
    if (!name.trim()) {
      setError("Tên danh mục không được để trống");
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      await updateCategory(selectedCategory.id, { name: name.trim() });
      await onRefresh();
      onCloseEdit();
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Không thể cập nhật danh mục";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={isAddOpen} onClose={onCloseAdd} fullWidth maxWidth="xs">
        <DialogTitle>Thêm danh mục</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Tên danh mục"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={!!error}
            helperText={error || ""}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseAdd} disabled={submitting}>
            Hủy
          </Button>
          <Button onClick={handleCreate} disabled={submitting}>
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isEditOpen} onClose={onCloseEdit} fullWidth maxWidth="xs">
        <DialogTitle>Chỉnh sửa danh mục</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Tên danh mục"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={!!error}
            helperText={error || ""}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseEdit} disabled={submitting}>
            Hủy
          </Button>
          <Button onClick={handleUpdate} disabled={submitting}>
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
