import {
  Avatar,
  Box,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import { MAIN_NAV, YOU_NAV, SETTINGS_NAV } from "../../constants/navigation.constant";
import { SidebarNavItemComponent } from "./SidebarNavItem";
import { useAuth } from "../../hooks/useAuth";
import { useSubscribedChannels } from "../../hooks/useSubscribedChannels";

export function SidebarFull() {
  const { user } = useAuth();
  const { data: subscribedChannels = [], isLoading } = useSubscribedChannels(
    Boolean(user),
  );

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

        {/* Subscribed channels section */}
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
          Kênh đã đăng ký
        </Typography>
        <List>
          {!user ? (
            <ListItem sx={{ px: 2 }}>
              <Typography variant="body2" sx={{ color: "#777" }}>
                Đăng nhập để xem kênh đã đăng ký
              </Typography>
            </ListItem>
          ) : isLoading ? (
            <ListItem sx={{ px: 2 }}>
              <Typography variant="body2" sx={{ color: "#777" }}>
                Đang tải...
              </Typography>
            </ListItem>
          ) : subscribedChannels.length === 0 ? (
            <ListItem sx={{ px: 2 }}>
              <Typography variant="body2" sx={{ color: "#777" }}>
                Chưa có kênh đăng ký
              </Typography>
            </ListItem>
          ) : (
            subscribedChannels.slice(0, 8).map((channel) => (
              <ListItem key={`${channel.channelId}-${channel.channelHandle}`} disablePadding>
                <ListItemButton
                  component={Link}
                  to="/subscriptions"
                  sx={{
                    py: 1,
                    px: 2,
                    color: "#aaa",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.08)",
                      color: "#fff",
                    },
                  }}
                >
                  <Avatar
                    src={channel.avatarUrl || undefined}
                    sx={{
                      width: 24,
                      height: 24,
                      mr: 1.5,
                      fontSize: 12,
                      bgcolor: "#d32f2f",
                    }}
                  >
                    {channel.channelName.charAt(0).toUpperCase()}
                  </Avatar>
                  <ListItemText
                    primary={channel.channelName}
                    slotProps={{
                      primary: {
                        fontSize: "14px",
                        fontWeight: 500,
                        noWrap: true,
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))
          )}
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
