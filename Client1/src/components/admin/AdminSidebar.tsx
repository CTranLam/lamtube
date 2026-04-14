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
        bgcolor: "#111827",
        borderRight: "1px solid #020617",
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        boxShadow: "4px 0 30px rgba(15,23,42,0.6)",
      }}
    >
      <Toolbar
        sx={{
          px: 2,
          borderBottom: "1px solid rgba(148,163,184,0.3)",
          color: "#e5e7eb",
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
              color: "#fecaca",
              "&:hover": {
                bgcolor: "rgba(239,68,68,0.18)",
                color: "#fee2e2",
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
