import { Box, Divider, List, Typography } from "@mui/material";
import {
  MAIN_NAV,
  YOU_NAV,
  EXPLORE_NAV,
  SETTINGS_NAV,
} from "../../constants/navigation.constant";
import { SidebarNavItemComponent } from "./SidebarNavItem";

export function SidebarFull() {
  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#0f0f0f",
        color: "#fff",
      }}
    >
      <Box
        sx={{
          overflowY: "auto",
          flex: 1,
          "&::-webkit-scrollbar": { width: "8px" },
          "&::-webkit-scrollbar-thumb": { bgcolor: "transparent" },
          "&:hover::-webkit-scrollbar-thumb": {
            bgcolor: "rgba(255,255,255,0.2)",
          },
        }}
      >
        <List>
          {MAIN_NAV.map((item) => (
            <SidebarNavItemComponent key={item.id} item={item} color="#fff" />
          ))}
        </List>
        <Divider sx={{ my: 1, borderColor: "rgba(255,255,255,0.1)" }} />

        {/* You section */}
        <Typography
          variant="caption"
          sx={{
            px: 2,
            pt: 1,
            pb: 0.5,
            fontWeight: 600,
            textTransform: "uppercase",
            color: "#aaa",
          }}
        >
          Bạn
        </Typography>
        <List>
          {YOU_NAV.map((item) => (
            <SidebarNavItemComponent key={item.id} item={item} />
          ))}
        </List>
        <Divider sx={{ my: 1, borderColor: "rgba(255,255,255,0.1)" }} />

        {/* Explore section */}
        <Typography
          variant="caption"
          sx={{
            px: 2,
            pt: 1,
            pb: 0.5,
            fontWeight: 600,
            textTransform: "uppercase",
            color: "#aaa",
          }}
        >
          Khám phá
        </Typography>
        <List>
          {EXPLORE_NAV.map((item) => (
            <SidebarNavItemComponent key={item.id} item={item} />
          ))}
        </List>
        <Divider sx={{ my: 1, borderColor: "rgba(255,255,255,0.1)" }} />

        {/* Settings */}
        <List>
          {SETTINGS_NAV.map((item) => (
            <SidebarNavItemComponent key={item.id} item={item} />
          ))}
        </List>

        <Box sx={{ p: 2.5, color: "#777" }}>
          <Typography variant="caption" display="block">
            © 2026 LamTube
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
