import { useState } from "react";
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
import { Link, useNavigate } from "react-router-dom";
import { requestPasswordResetOtp } from "../api/auth";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Vui lòng nhập email");
      return;
    }

    try {
      setLoading(true);
      await requestPasswordResetOtp({ email: email.trim() });
      navigate(`/forgot-password/verify-otp?email=${encodeURIComponent(email.trim())}`);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Không thể gửi mã OTP";
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
            Quên mật khẩu
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
          Nhập email đã đăng ký để nhận mã OTP xác thực.
        </Typography>

        <Box
          component="form"
          noValidate
          autoComplete="off"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            label="Email"
            type="email"
            variant="outlined"
            fullWidth
            size="small"
            required
            value={email}
            onChange={handleEmailChange}
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
            {loading ? "Đang gửi mã..." : "Gửi mã OTP"}
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
            Đã nhớ mật khẩu?{" "}
            <MuiLink
              component={Link}
              to="/login"
              underline="hover"
              sx={{ color: "#3b82f6", fontWeight: 500, cursor: "pointer" }}
            >
              Quay lại đăng nhập
            </MuiLink>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}

export default ForgotPassword;
