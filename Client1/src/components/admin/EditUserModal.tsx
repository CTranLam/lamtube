import { useEffect, useState, type ChangeEvent } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Stack,
  IconButton,
  Typography,
  Avatar,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { UserSummary } from "../../types/auth";
import { useUpdateUser } from "../../hooks/useUpdateUser";
import { useUserDetails } from "../../hooks/useUserDetails";
import { deleteUser } from "../../api/admin";
import { uploadAvatar } from "../../api/channel";

type Props = {
  open: boolean;
  onClose: () => void;
  user: UserSummary | null;
  roles: string[];
  rolesLoading?: boolean;
  onUpdated?: (user: UserSummary) => void;
  onDeleted?: (userId: number) => void;
};

export default function EditUserModal({
  open,
  onClose,
  user,
  roles,
  rolesLoading,
  onUpdated,
  onDeleted,
}: Props) {
  const { data: userDetailResponse, isLoading: detailLoading } = useUserDetails(
    open ? (user?.userId ?? null) : null,
  );
  const userDetail = userDetailResponse?.data ?? null;
  const [role, setRole] = useState(() => {
    return user?.role || (roles.length > 0 ? roles[0] : "");
  });
  const [fullname, setFullname] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(
    undefined,
  );
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { update, isLoading: updating } = useUpdateUser();
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!open || !user) return;

    setRole(userDetail?.role || user.role || (roles.length > 0 ? roles[0] : ""));
    setFullname(userDetail?.fullname || "");
    setBio(userDetail?.bio || "");
    setAvatarUrl(userDetail?.avatarUrl || undefined);
    setAvatarPreview(userDetail?.avatarUrl || undefined);
    setPassword("");
    setError(null);
  }, [open, user, userDetail, roles]);

  const handleSave = async () => {
    if (!user) return;
    setError(null);
    try {
      const payload: Partial<{
        fullname: string;
        role: string;
        password: string;
        bio: string;
        avatarUrl: string;
      }> = {};
      if (role) payload.role = role;
      if (password) payload.password = password;
      if (fullname) payload.fullname = fullname;
      if (bio) payload.bio = bio;
      if (avatarUrl) payload.avatarUrl = avatarUrl;

      const resp = await update({ userId: user.userId, payload });
      onUpdated?.(resp.data as unknown as UserSummary);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi khi cập nhật người dùng");
    }
  };

  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (avatarPreview && avatarPreview.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview);
    }
    const urlPreview = URL.createObjectURL(file);
    setAvatarPreview(urlPreview);

    setIsUploadingAvatar(true);
    try {
      const uploadedUrl = await uploadAvatar(file);
      setAvatarUrl(uploadedUrl);
    } catch (err) {
      console.error("Upload avatar thất bại:", err);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const handleDelete = async () => {
    if (!user) return;
    const ok = window.confirm(`Xác nhận xóa tài khoản ${user.email}?`);
    if (!ok) return;
    setError(null);
    setDeleting(true);
    try {
      await deleteUser(user.userId);
      onDeleted?.(user.userId);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi khi xóa người dùng");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        Chỉnh sửa người dùng
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {!user ? (
          <Typography variant="body2">Không có dữ liệu.</Typography>
        ) : detailLoading ? (
          <Typography variant="body2">Đang tải dữ liệu người dùng...</Typography>
        ) : (
          <Stack spacing={2} sx={{ mt: 1 }}>
            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}

            <TextField label="Email" value={user.email} fullWidth disabled />

            <TextField
              label="Họ và tên"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              fullWidth
            />

            <TextField
              select
              label="Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              fullWidth
              disabled={rolesLoading || roles.length === 0}
            >
              {roles.map((r) => (
                <MenuItem key={r} value={r}>
                  {r}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Mật khẩu mới (để trống nếu không đổi)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              fullWidth
            />

            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <Avatar
                src={avatarPreview ?? avatarUrl}
                alt={fullname || user.email}
                sx={{ width: 64, height: 64 }}
              />

              <Box sx={{ flex: 1 }}>
                <TextField
                  label="Avatar URL"
                  value={avatarUrl ?? ""}
                  onChange={(e) => setAvatarUrl(e.target.value || undefined)}
                  fullWidth
                />

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ marginTop: 8 }}
                  disabled={isUploadingAvatar}
                />
              </Box>
            </Box>

            <TextField
              label="Giới thiệu (bio)"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              fullWidth
              multiline
              minRows={3}
            />
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={updating || deleting}>
          Hủy
        </Button>
        <Button
          color="error"
          onClick={handleDelete}
          disabled={updating || deleting}
          sx={{ mr: 1 }}
        >
          {deleting ? "Đang xóa..." : "Xóa"}
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={updating || deleting}
        >
          {updating ? "Đang lưu..." : "Lưu"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
