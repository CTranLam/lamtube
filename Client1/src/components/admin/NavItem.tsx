import { NavLink } from "react-router-dom";
import { ListItem, ListItemButton, ListItemText } from "@mui/material";
import type { NavItemProps } from "@/types/admin";

const NavItem = ({ item }: NavItemProps) => {
  return (
    <ListItem disablePadding>
      <ListItemButton
        component={NavLink}
        to={item.path}
        end={item.path === "/admin"}
        sx={{
          px: 2,
          py: 1,
          color: "#9ca3af",
          transition: "all 0.2s ease-in-out",
          "&.active": {
            bgcolor: "rgba(59, 130, 246, 0.15)",
            color: "#e5e7eb",
            borderLeft: "3px solid #3b82f6",
            pl: "13px",
          },

          "&:hover": {
            bgcolor: "rgba(15, 23, 42, 0.85)",
            color: "#ffffff",
          },
        }}
      >
        <ListItemText
          primary={item.label}
          slotProps={{
            primary: {
              fontSize: 14,
              fontWeight: 500,
              sx: { transition: "color 0.2s" },
            },
          }}
        />
      </ListItemButton>
    </ListItem>
  );
};

export default NavItem;
