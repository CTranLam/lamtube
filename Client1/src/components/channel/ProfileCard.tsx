import { Divider, Paper } from "@mui/material";
import type { UserProfileDetail } from "../../types/channel";
import ProfileHeader from "./ProfileHeader";
import ProfileInfoSection from "./ProfileInfoSection";

type ProfileCardProps = {
  userData: UserProfileDetail;
  onEdit: () => void;
};

function ProfileCard({ userData, onEdit }: ProfileCardProps) {
  return (
    <Paper
      sx={{
        p: { xs: 2, md: 4 },
        bgcolor: "#0f0f0f",
        borderRadius: 3,
        border: "1px solid #2d2d2d",
        color: "#fff",
      }}
      elevation={0}
    >
      <ProfileHeader userData={userData} onEdit={onEdit} />
      <Divider sx={{ mb: 4, borderColor: "#2d2d2d" }} />
      <ProfileInfoSection userData={userData} />
    </Paper>
  );
}

export default ProfileCard;
