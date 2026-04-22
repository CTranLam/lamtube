import { useNavigate } from "react-router-dom";
import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import NavItem from "./NavItem";

const adminNav = [
  { label: "Dashboard", path: "/admin" },
  { label: "Quản lý tài khoản", path: "/admin/users" },
  { label: "Quản lý danh mục", path: "/admin/categories" },
  { label: "Quản lý video", path: "/admin/videos" },
];

export function AdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_info");
    navigate("/login");
  };

  return (
    <Box
      sx={{
        width: 240,
        flexShrink: 0,
        bgcolor: "#181818",
        borderRight: "1px solid rgba(255,255,255,0.1)",
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        boxShadow: "4px 0 24px rgba(0,0,0,0.45)",
      }}
    >
      <Toolbar
        sx={{
          px: 2,
          borderBottom: "1px solid rgba(255,255,255,0.12)",
          color: "#f4f4f5",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Admin Panel
        </Typography>
      </Toolbar>
      <List>
        {adminNav.map((item) => (
          <NavItem key={item.path} item={item} />
        ))}

        <Divider sx={{ my: 1, opacity: 0.1 }} />

        <ListItem disablePadding sx={{ mt: 1 }}>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              px: 2,
              py: 1,
              color: "#fca5a5",
              "&:hover": {
                bgcolor: "rgba(239,68,68,0.16)",
                color: "#fecaca",
              },
            }}
          >
            <ListItemText
              primary="Đăng xuất"
              slotProps={{
                primary: {
                  fontSize: 14,
                  fontWeight: 500,
                },
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
}
