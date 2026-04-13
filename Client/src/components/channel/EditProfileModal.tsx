import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
  IconButton,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { UserProfileDetail } from "../../types/channel";
import { useUpdateProfile } from "../../hooks/useUpdateProfile";
import { uploadAvatar } from "../../api/channel";
import AvatarSection from "./ProfileModalAvatarSection";
import FormFields from "./ProfileModalFormFields";
import Actions from "./ProfileModalActions";

type EditProfileModalProps = {
  open: boolean;
  onClose: () => void;
  initialData: UserProfileDetail;
  onSuccess?: () => void;
};

export default function EditProfileModal({
  open,
  onClose,
  initialData,
  onSuccess,
}: EditProfileModalProps) {
  // Nhờ key từ bên ngoài, state này sẽ tự động reset khi initialData thay đổi.
  const [formData, setFormData] = useState(() => ({
    fullName: initialData.profile.fullName || "",
    bio: initialData.profile.bio || "",
  }));

  const [avatarPreview, setAvatarPreview] = useState<string>(
    initialData.profile.avatarUrl || "",
  );
  const [avatarUrl, setAvatarUrl] = useState<string>(
    initialData.profile.avatarUrl || "",
  );
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const { update, isLoading } = useUpdateProfile();

  const prefix = "edit-profile";

  useEffect(() => {
    if (!open) return;

    setFormData({
      fullName: initialData.profile.fullName || "",
      bio: initialData.profile.bio || "",
    });
    setAvatarPreview(initialData.profile.avatarUrl || "");
    setAvatarUrl(initialData.profile.avatarUrl || "");
  }, [initialData, open]);

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (avatarPreview.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview);
    }
    const urlPreview = URL.createObjectURL(file);
    setAvatarPreview(urlPreview);

    setIsUploadingAvatar(true);
    try {
      const uploadedUrl = await uploadAvatar(file);
      setAvatarPreview(uploadedUrl);
      setAvatarUrl(uploadedUrl);
    } catch (error) {
      console.error("Upload avatar thất bại:", error);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    try {
      await update({
        fullname: formData.fullName,
        bio: formData.bio,
        avatarUrl: avatarUrl || initialData.profile.avatarUrl,
      });
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: { bgcolor: "#1e1e1e", color: "#fff", borderRadius: 3 },
      }}
    >
      <Box key={initialData.email}>
        <DialogTitle sx={{ m: 0, p: 2, fontWeight: "bold" }}>
          Chỉnh sửa hồ sơ
          <IconButton
            onClick={onClose}
            sx={{ position: "absolute", right: 8, top: 8, color: "grey.500" }}
            disabled={isLoading}
            data-testid={`${prefix}-close`}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ borderColor: "#333" }}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <AvatarSection
              prefix={prefix}
              avatarPreview={avatarPreview}
              fullName={formData.fullName}
              isLoading={isLoading || isUploadingAvatar}
              onAvatarChange={handleAvatarChange}
            />
            <FormFields
              prefix={prefix}
              formData={formData}
              setFormData={setFormData}
              isLoading={isLoading || isUploadingAvatar}
            />
          </Stack>
        </DialogContent>

        <Actions
          prefix={prefix}
          onClose={onClose}
          onSave={handleSave}
          isLoading={isLoading || isUploadingAvatar}
        />
      </Box>
    </Dialog>
  );
}
