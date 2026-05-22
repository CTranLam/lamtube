import { useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import { Notifications as NotificationsIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { useMyProfile } from "../../../hooks/useMyProfile";
import { useNavbarNotifications } from "../../../hooks/useNavbarNotifications";
import { NotificationMenu } from "../navbar/NotificationMenu";
import { NotificationToasts } from "../navbar/NotificationToasts";
import type { AccountMenuItem } from "../../../types/navbar";

export function NavbarActions() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { isAuthenticated, signOut, user } = useAuth();
  const { userData } = useMyProfile(isAuthenticated, user?.email);
  const {
    notificationAnchorEl,
    notificationOpen,
    notificationItems,
    notificationRequest,
    unreadTotal,
    toastItems,
    handleNotificationMenuOpen,
    handleNotificationMenuClose,
    handleNotificationAction,
    handleClearAll,
    closeToast,
  } = useNavbarNotifications({ isAuthenticated });
  const open = Boolean(anchorEl);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleAction = (path: string) => {
    handleMenuClose();
    navigate(path);
  };

  const handleSignOut = () => {
    handleMenuClose();
    signOut();
    navigate("/");
  };

  const accountMenuItems: AccountMenuItem[] = [];
  if (isAuthenticated) {
    accountMenuItems.push({
      key: "logout",
      label: "Đăng xuất",
      onClick: handleSignOut,
      sx: { color: "#fca5a5" },
    });
  } else {
    accountMenuItems.push(
      {
        key: "login",
        label: "Đăng nhập",
        onClick: () => handleAction("/login"),
      },
      {
        key: "register",
        label: "Đăng ký",
        onClick: () => handleAction("/register"),
      },
    );
  }

  let avatarContent = null;
  if (isAuthenticated) {
    avatarContent = (
      <Avatar
        src={userData?.profile.avatarUrl || undefined}
        sx={{
          width: 32,
          height: 32,
          bgcolor: "#3b82f6",
          fontSize: 14,
        }}
      >
        {(userData?.profile.fullName || user?.email || "U")
          .charAt(0)
          .toUpperCase()}
      </Avatar>
    );
  } else {
    avatarContent = (
      <Avatar
        sx={{
          width: 32,
          height: 32,
          bgcolor: "#3b82f6",
          fontSize: 14,
        }}
      />
    );
  }

  return (
    <>
      <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
        <Tooltip title="Tạo">
          <IconButton
            onClick={() => navigate("/upload")}
            sx={{
              display: { xs: "none", sm: "flex" },
              borderRadius: 5,
              border: "1px solid rgba(255,255,255,0.2)",
              color: "#fff",
              px: 2,
              gap: 1,
              "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
            }}
          >
            <span style={{ fontSize: 20 }}>+</span>
            <Box component="span" sx={{ fontSize: 14, fontWeight: 500 }}>
              Tạo
            </Box>
          </IconButton>
        </Tooltip>

        <Tooltip title="Thông báo">
          <IconButton
            sx={{ color: "#fff" }}
            onClick={handleNotificationMenuOpen}
          >
            <Badge color="error" badgeContent={unreadTotal} max={99}>
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Tooltip>

        <Tooltip title="Tài khoản">
          <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0.5 }}>
            {avatarContent}
          </IconButton>
        </Tooltip>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              mt: 1.5,
              bgcolor: "#282828",
              color: "#fff",
              minWidth: 220,
              boxShadow: "0px 8px 16px rgba(0,0,0,0.4)",
              "& .MuiMenuItem-root": {
                py: 1.5,
                fontSize: 14,
                "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
              },
            },
          },
        }}
      >
        <MenuItem onClick={() => handleAction("/channel")}>
          Kênh của bạn
        </MenuItem>

        <Box sx={{ my: 1, borderBottom: "1px solid rgba(255,255,255,0.1)" }} />

        {accountMenuItems.map((item) => (
          <MenuItem key={item.key} onClick={item.onClick} sx={item.sx}>
            {item.label}
          </MenuItem>
        ))}
      </Menu>

      <NotificationMenu
        anchorEl={notificationAnchorEl}
        open={notificationOpen}
        unreadTotal={unreadTotal}
        items={notificationItems}
        request={notificationRequest}
        onClose={handleNotificationMenuClose}
        onNotificationAction={handleNotificationAction}
        onMarkAllRead={handleClearAll}
      />

      <NotificationToasts items={toastItems} onClose={closeToast} />
    </>
  );
}
