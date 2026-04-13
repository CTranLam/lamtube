import { useState } from "react";
import { Box, Tabs, Tab, Typography, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import MyVideosPanel from "../components/channel/MyVideosPanel";
import StatsPanel from "../components/channel/StatsPanel";
import ProfilePanel from "../components/channel/ProfilePanel";
import { useAuth } from "../hooks/useAuth";
import LoginRequiredModal from "../components/common/LoginRequiredModal";

export default function Channel() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [tab, setTab] = useState(0);

  if (!isAuthenticated) {
    return (
      <LoginRequiredModal
        open
        onLogin={() => navigate("/login")}
        onClose={() => navigate("/")}
      />
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2 }, maxWidth: 1200, mx: "auto" }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
        Quản lý kênh
      </Typography>

      <Paper sx={{ bgcolor: "#181818", borderRadius: 2, mb: 3 }} elevation={0}>
        <Tabs
          value={tab}
          onChange={(_, value) => setTab(value)}
          textColor="primary"
          indicatorColor="primary"
          variant="scrollable"
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label="Video của tôi" sx={{ textTransform: "none" }} />
          <Tab label="Thống kê" sx={{ textTransform: "none" }} />
          <Tab label="Thông tin cá nhân" sx={{ textTransform: "none" }} />
        </Tabs>
      </Paper>

      <Box sx={{ mt: 2 }}>
        {tab === 0 && <MyVideosPanel />}
        {tab === 1 && <StatsPanel />}
        {tab === 2 && <ProfilePanel />}
      </Box>
    </Box>
  );
}
