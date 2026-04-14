import { memo, useState } from "react";
import { Typography } from "@mui/material";
import EditProfileModal from "./EditProfileModal";
import ProfileSkeleton from "./ProfileSkeleton";
import ProfileCard from "./ProfileCard";
import { useAuth } from "../../hooks/useAuth";
import { useMyProfile } from "../../hooks/useMyProfile";
import LoginRequiredModal from "../common/LoginRequiredModal";

const ProfilePanel = memo(function ProfilePanel() {
  const [isEditing, setIsEditing] = useState(false);

  const { isAuthenticated } = useAuth();
  const { user } = useAuth();
  const { userData, isLoading, error, refresh } = useMyProfile(
    isAuthenticated,
    user?.email,
  );
  if (!isAuthenticated) {
    return (
      <LoginRequiredModal
        open
        onLogin={() => window.location.assign("/login")}
        onClose={() => window.location.assign("/")}
      />
    );
  }

  if (isLoading || !userData) {
    return <ProfileSkeleton />;
  }

  if (error) {
    return (
      <Typography variant="body2" color="error">
        Không tải được thông tin cá nhân.
      </Typography>
    );
  }

  return (
    <>
      <ProfileCard userData={userData} onEdit={() => setIsEditing(true)} />
      <EditProfileModal
        open={isEditing}
        onClose={() => setIsEditing(false)}
        initialData={userData}
        onSuccess={refresh}
      />
    </>
  );
});

export default ProfilePanel;
