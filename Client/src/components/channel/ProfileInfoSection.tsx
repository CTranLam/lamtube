import { Box, Stack, Typography } from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import BadgeIcon from "@mui/icons-material/Badge";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import type { UserProfileDetail } from "../../types/channel";

type ProfileInfoSectionProps = {
  userData: UserProfileDetail;
};

function ProfileInfoSection({ userData }: ProfileInfoSectionProps) {
  return (
    <Stack spacing={3}>
      <ProfileInfoItem
        icon={<EmailIcon fontSize="small" sx={{ color: "text.secondary" }} />}
        label="Địa chỉ Email"
        value={userData.email}
      />
      <ProfileInfoItem
        icon={<BadgeIcon fontSize="small" sx={{ color: "text.secondary" }} />}
        label="Họ và tên"
        value={userData.profile.fullName}
      />
      <ProfileInfoItem
        icon={
          <CalendarMonthIcon
            fontSize="small"
            sx={{ color: "text.secondary" }}
          />
        }
        label="Tiểu sử"
        value={userData.profile.bio || "Không có mô tả"}
      />
    </Stack>
  );
}

function ProfileInfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Box sx={{ display: "flex", gap: 2 }}>
      <Box sx={{ mt: 0.2 }}>{icon}</Box>
      <Box>
        <Typography
          variant="caption"
          sx={{ color: "text.secondary", fontWeight: 500 }}
        >
          {label}
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: "#f1f1f1", wordBreak: "break-word" }}
        >
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

export default ProfileInfoSection;
