import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { NavLink } from "react-router-dom";
import type { SidebarNavItem } from "../../constants/navigation.constant";

interface SidebarNavItemProps {
  item: SidebarNavItem;
  color?: string;
}

export function SidebarNavItemComponent({
  item,
  color = "#aaa",
}: SidebarNavItemProps) {
  return (
    <ListItem disablePadding>
      <ListItemButton
        component={NavLink}
        to={item.path}
        sx={{
          py: 1,
          px: 2,
          color: color,
          "&.active": {
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            color: "#fff",
            "& .MuiListItemIcon-root": { color: "#ff0000" },
          },
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.08)",
            color: "#fff",
          },
        }}
      >
        <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
          <item.icon fontSize="small" />
        </ListItemIcon>
        <ListItemText
          primary={item.label}
          slotProps={{ primary: { fontSize: "14px", fontWeight: 500 } }}
        />
      </ListItemButton>
    </ListItem>
  );
}
