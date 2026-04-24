import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  Box,
  Button,
  IconButton,
  Link as MuiLink,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../api/auth";

const PASSWORD_RESET_TOKEN_KEY = "password_reset_token";

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email")?.trim() ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [retypedPassword, setRetypedPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resetToken = sessionStorage.getItem(PASSWORD_RESET_TOKEN_KEY) ?? "";

  useEffect(() => {
    if (resetToken) {
      return;
    }
    navigate("/forgot-password");
  }, [navigate, resetToken]);

  const handlePasswordChange =
    (field: "newPassword" | "retypedPassword") =>
    (event: ChangeEvent<HTMLInputElement>) => {
      if (field === "newPassword") {
        setNewPassword(event.target.value);
        return;
      }
      setRetypedPassword(event.target.value);
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError("Mật khẩu mới cần ít nhất 8 ký tự");
      return;
    }

    if (newPassword !== retypedPassword) {
      setError("Mật khẩu nhập lại không khớp");
      return;
    }

    if (!resetToken) {
      setError("Phiên đổi mật khẩu đã hết hạn. Vui lòng xác thực OTP lại.");
      return;
    }

    try {
      setLoading(true);
      await resetPassword({
        resetToken,
        newPassword,
        retypedPassword,
      });
      sessionStorage.removeItem(PASSWORD_RESET_TOKEN_KEY);
      navigate("/login");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Không thể đổi mật khẩu";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#0f0f0f",
        color: "#fff",
        p: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          maxWidth: 400,
          p: 4,
          bgcolor: "#181818",
          borderRadius: 3,
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h5" component="h1">
            Đổi mật khẩu
          </Typography>
          <IconButton
            size="small"
            onClick={() => navigate("/login")}
            sx={{ color: "#aaa" }}
          >
            ✕
          </IconButton>
        </Box>

        <Typography variant="body2" sx={{ mb: 3, color: "#aaa" }}>
          Đặt mật khẩu mới cho tài khoản: <strong>{email || "(không xác định)"}</strong>
        </Typography>

        <Box
          component="form"
          noValidate
          autoComplete="off"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            label="Mật khẩu mới"
            type="password"
            variant="outlined"
            fullWidth
            size="small"
            required
            value={newPassword}
            onChange={handlePasswordChange("newPassword")}
            slotProps={{
              inputLabel: { sx: { color: "#aaa" } },
              input: { sx: { color: "#fff" } },
            }}
          />
          <TextField
            label="Nhập lại mật khẩu mới"
            type="password"
            variant="outlined"
            fullWidth
            size="small"
            required
            value={retypedPassword}
            onChange={handlePasswordChange("retypedPassword")}
            slotProps={{
              inputLabel: { sx: { color: "#aaa" } },
              input: { sx: { color: "#fff" } },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
            sx={{ mt: 1 }}
          >
            {loading ? "Đang cập nhật..." : "Xác nhận đổi mật khẩu"}
          </Button>

          {error && (
            <Typography
              variant="body2"
              sx={{ mt: 1, color: "#f87171", textAlign: "center" }}
            >
              {error}
            </Typography>
          )}
        </Box>

        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Typography variant="body2" sx={{ color: "#aaa" }}>
            Quay lại{" "}
            <MuiLink
              component={Link}
              to="/login"
              underline="hover"
              sx={{ color: "#3b82f6", fontWeight: 500, cursor: "pointer" }}
            >
              trang đăng nhập
            </MuiLink>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}

export default ResetPassword;
