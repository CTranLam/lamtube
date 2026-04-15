import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  FormControlLabel,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useAuth } from "../hooks/useAuth";

type AppSettings = {
  displayName: string;
  language: "vi" | "en";
  autoplay: boolean;
  emailNotifications: boolean;
};

const SETTINGS_STORAGE_KEY = "lamtube_settings_v1";

function buildDefaultSettings(email: string | undefined): AppSettings {
  return {
    displayName: email ? email.split("@")[0] : "",
    language: "vi",
    autoplay: true,
    emailNotifications: true,
  };
}

function readStoredSettings(): Partial<AppSettings> | null {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<AppSettings>;
  } catch {
    return null;
  }
}

export default function Settings() {
  const { user } = useAuth();
  const defaultSettings = buildDefaultSettings(user?.email);
  const [settings, setSettings] = useState<AppSettings>(() => {
    const stored = readStoredSettings();
    return { ...defaultSettings, ...stored };
  });
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const handleSave = () => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    setSavedMessage("Đã lưu cài đặt thành công.");
  };

  const handleReset = () => {
    localStorage.removeItem(SETTINGS_STORAGE_KEY);
    setSettings(defaultSettings);
    setSavedMessage("Đã khôi phục cài đặt mặc định.");
  };

  return (
    <Box sx={{ maxWidth: 860, mx: "auto", p: { xs: 1, sm: 2 } }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        Cài đặt
      </Typography>
      <Typography variant="body2" sx={{ color: "#aaaaaa", mb: 3 }}>
        Quản lý tùy chọn cá nhân cho tài khoản của bạn.
      </Typography>

      <Paper sx={{ bgcolor: "#181818", p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
        <Stack spacing={2.5}>
          {savedMessage && <Alert severity="success">{savedMessage}</Alert>}

          <TextField
            label="Tên hiển thị"
            value={settings.displayName}
            onChange={(event) => {
              setSavedMessage(null);
              setSettings((prev) => ({ ...prev, displayName: event.target.value }));
            }}
            fullWidth
          />

          <TextField
            select
            label="Ngôn ngữ"
            value={settings.language}
            onChange={(event) => {
              setSavedMessage(null);
              setSettings((prev) => ({
                ...prev,
                language: event.target.value as AppSettings["language"],
              }));
            }}
            fullWidth
          >
            <MenuItem value="vi">Tiếng Việt</MenuItem>
            <MenuItem value="en">English</MenuItem>
          </TextField>

          <FormControlLabel
            control={
              <Switch
                checked={settings.autoplay}
                onChange={(_, checked) => {
                  setSavedMessage(null);
                  setSettings((prev) => ({ ...prev, autoplay: checked }));
                }}
              />
            }
            label="Tự động phát video"
          />

          <FormControlLabel
            control={
              <Switch
                checked={settings.emailNotifications}
                onChange={(_, checked) => {
                  setSavedMessage(null);
                  setSettings((prev) => ({ ...prev, emailNotifications: checked }));
                }}
              />
            }
            label="Nhận thông báo qua email"
          />

          <Stack direction="row" spacing={1.5}>
            <Button variant="contained" sx={{ textTransform: "none" }} onClick={handleSave}>
              Lưu thay đổi
            </Button>
            <Button variant="outlined" sx={{ textTransform: "none" }} onClick={handleReset}>
              Khôi phục mặc định
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
