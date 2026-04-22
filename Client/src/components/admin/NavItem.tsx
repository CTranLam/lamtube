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
          color: "#a1a1aa",
          transition: "all 0.2s ease-in-out",
          "&.active": {
            bgcolor: "rgba(255,255,255,0.08)",
            color: "#f4f4f5",
            borderLeft: "3px solid #f4f4f5",
            pl: "13px",
          },

          "&:hover": {
            bgcolor: "rgba(255,255,255,0.05)",
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
