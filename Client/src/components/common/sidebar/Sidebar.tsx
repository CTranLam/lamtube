import { Drawer } from "@mui/material";
import { SidebarFull } from "./SidebarFull";
import { SidebarCollapsed } from "./SidebarCollapsed";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  collapsed?: boolean;
}

export default function Sidebar({ open, onClose, collapsed }: SidebarProps) {
  const isCollapsed = Boolean(collapsed);

  return (
    <Drawer
      variant="permanent"
      open={open}
      onClose={onClose}
      sx={{
        width: isCollapsed ? 80 : 240,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: isCollapsed ? 80 : 240,
          boxSizing: "border-box",
          border: "none",
          top: "64px",
          height: "calc(100vh - 64px)",
          bgcolor: "#0f0f0f",
        },
      }}
    >
      {isCollapsed ? <SidebarCollapsed /> : <SidebarFull />}
    </Drawer>
  );
}
