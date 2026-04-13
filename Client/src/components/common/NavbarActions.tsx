import { useState } from "react";
import {
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import { Notifications as NotificationsIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useMyProfile } from "../../hooks/useMyProfile";

export function NavbarActions() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const { isAuthenticated, signOut, user } = useAuth();
  const { userData } = useMyProfile(isAuthenticated, user?.email);
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
          <IconButton sx={{ color: "#fff" }}>
            <NotificationsIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Tài khoản">
          <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0.5 }}>
            {isAuthenticated ? (
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
            ) : (
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: "#3b82f6",
                  fontSize: 14,
                }}
              ></Avatar>
            )}
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

        {isAuthenticated ? (
          <MenuItem onClick={handleSignOut} sx={{ color: "#fca5a5" }}>
            Đăng xuất
          </MenuItem>
        ) : (
          [
            <MenuItem key="login" onClick={() => handleAction("/login")}>
              Đăng nhập
            </MenuItem>,
            <MenuItem key="register" onClick={() => handleAction("/register")}>
              Đăng ký
            </MenuItem>,
          ]
        )}
      </Menu>
    </>
  );
}
