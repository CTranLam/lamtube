import {
  Box,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { NavLink } from "react-router-dom";
import { MAIN_NAV } from "../../constants/navigation.constant";

export function SidebarCollapsed() {
  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#0f0f0f",
        color: "#fff",
        pt: 1,
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          gap: 0.5,
        }}
      >
        {MAIN_NAV.map((item) => (
          <ListItem
            key={item.id}
            disablePadding
            sx={{ justifyContent: "center" }}
          >
            <ListItemButton
              component={NavLink}
              to={item.path}
              sx={{
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 0.5,
                py: 1,
                minHeight: 64,
                color: "#aaa",
                "&.active": {
                  bgcolor: "rgba(255,255,255,0.1)",
                  color: "#fff",
                  "& .MuiListItemIcon-root": { color: "#fff" },
                },
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.08)",
                  color: "#fff",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mb: 0.5,
                  color: "inherit",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <item.icon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                slotProps={{
                  primary: {
                    fontSize: 10,
                    textAlign: "center",
                    whiteSpace: "normal",
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </Box>
    </Box>
  );
}
