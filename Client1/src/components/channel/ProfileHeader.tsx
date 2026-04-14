import { Avatar, Box, Button, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import type { UserProfileDetail } from "../../types/channel";

type ProfileHeaderProps = {
  userData: UserProfileDetail;
  onEdit: () => void;
};

function ProfileHeader({ userData, onEdit }: ProfileHeaderProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 3,
        mb: 4,
      }}
    >
      <Avatar
        src={userData.profile.avatarUrl}
        sx={{
          width: { xs: 80, md: 100 },
          height: { xs: 80, md: 100 },
          bgcolor: "secondary.main",
          fontSize: "2.5rem",
          border: "2px solid #ef4444",
        }}
      >
        {userData.profile.fullName?.charAt(0).toUpperCase()}
      </Avatar>

      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {userData.profile.fullName}
        </Typography>
      </Box>

      <Button
        variant="contained"
        startIcon={<EditIcon />}
        onClick={onEdit}
        sx={{
          borderRadius: "18px",
          textTransform: "none",
          fontWeight: 600,
          bgcolor: "#fff",
          color: "#000",
          "&:hover": { bgcolor: "#d9d9d9" },
          px: 3,
        }}
      >
        Chỉnh sửa hồ sơ
      </Button>
    </Box>
  );
}

export default ProfileHeader;
