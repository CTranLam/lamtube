import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  Box,
  Button,
  IconButton,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { requestPasswordResetOtp, verifyPasswordResetOtp } from "../api/auth";

const PASSWORD_RESET_TOKEN_KEY = "password_reset_token";

function VerifyResetOtp() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email")?.trim() ?? "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleOtpChange = (event: ChangeEvent<HTMLInputElement>) => {
    setOtp(event.target.value);
  };

  const handleVerifyOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!email) {
      setError("Thiếu email xác thực. Vui lòng nhập lại email.");
      return;
    }

    if (!otp.trim()) {
      setError("Vui lòng nhập mã OTP");
      return;
    }

    try {
      setLoading(true);
      const response = await verifyPasswordResetOtp({ email, otp: otp.trim() });
      const resetToken = response.data.resetToken;
      sessionStorage.setItem(PASSWORD_RESET_TOKEN_KEY, resetToken);
      navigate(`/forgot-password/reset?email=${encodeURIComponent(email)}`);
    } catch (e) {
      const nextError = e instanceof Error ? e.message : "Mã OTP không hợp lệ";
      setError(nextError);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError(null);
    setMessage(null);

    if (!email) {
      setError("Thiếu email xác thực. Vui lòng quay lại bước nhập email.");
      return;
    }

    try {
      setResendLoading(true);
      await requestPasswordResetOtp({ email });
      setMessage("Đã gửi lại mã OTP. Vui lòng kiểm tra email.");
    } catch (e) {
      const nextError = e instanceof Error ? e.message : "Không thể gửi lại mã OTP";
      setError(nextError);
    } finally {
      setResendLoading(false);
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
            Xác thực OTP
          </Typography>
          <IconButton
            size="small"
            onClick={() => navigate("/forgot-password")}
            sx={{ color: "#aaa" }}
          >
            ✕
          </IconButton>
        </Box>

        <Typography variant="body2" sx={{ mb: 3, color: "#aaa" }}>
          Mã OTP đã được gửi tới: <strong>{email || "(chưa có email)"}</strong>
        </Typography>

        <Box
          component="form"
          noValidate
          autoComplete="off"
          onSubmit={handleVerifyOtp}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            label="Mã OTP"
            type="text"
            variant="outlined"
            fullWidth
            size="small"
            required
            value={otp}
            onChange={handleOtpChange}
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
            {loading ? "Đang xác thực..." : "Xác thực OTP"}
          </Button>

          <Button
            type="button"
            variant="text"
            color="primary"
            fullWidth
            disabled={resendLoading}
            onClick={handleResendOtp}
          >
            {resendLoading ? "Đang gửi lại..." : "Gửi lại mã OTP"}
          </Button>

          {message && (
            <Typography
              variant="body2"
              sx={{ mt: 1, color: "#60a5fa", textAlign: "center" }}
            >
              {message}
            </Typography>
          )}

          {error && (
            <Typography
              variant="body2"
              sx={{ mt: 1, color: "#f87171", textAlign: "center" }}
            >
              {error}
            </Typography>
          )}
        </Box>
      </Paper>
    </Box>
  );
}

export default VerifyResetOtp;
