import { useState } from "react";
import type { SyntheticEvent, ChangeEvent } from "react";
import type { UserInfo } from "../types/auth";
import {
  Box,
  Button,
  IconButton,
  Link as MuiLink,
  TextField,
  Typography,
  Paper,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api/auth";
import { useAuth } from "../hooks/useAuth";

function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange =
    (field: "email" | "password") => (event: ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      setLoading(true);
      const response = await loginUser(form);

      const userInfo: UserInfo = {
        id: response.data.id,
        email: response.data.email,
        role: response.data.role,
      };
      if (response.data?.token && userInfo) {
        signIn({ token: response.data.token, userInfo });
      }
      if (response.data.role === "ROLE_ADMIN") {
        navigate("/admin");
        return;
      }
      navigate("/");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Đăng nhập thất bại";
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
            Đăng nhập
          </Typography>
          <IconButton
            size="small"
            onClick={() => navigate("/")}
            sx={{ color: "#aaa" }}
          >
            ✕
          </IconButton>
        </Box>
        <Typography variant="body2" sx={{ mb: 3 }}></Typography>
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
            value={form.email}
            onChange={handleChange("email")}
            slotProps={{
              inputLabel: { sx: { color: "#aaa" } },
              input: { sx: { color: "#fff" } },
            }}
          />
          <TextField
            label="Mật khẩu"
            type="password"
            variant="outlined"
            fullWidth
            size="small"
            value={form.password}
            onChange={handleChange("password")}
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
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
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

        <Box
          sx={{
            mt: 2,
            display: "flex",
            flexDirection: "column",
            gap: 1,
            alignItems: "center",
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: "#3b82f6", textAlign: "center", width: "100%" }}
          >
            <MuiLink
              component={Link}
              to="/forgot-password"
              underline="hover"
              sx={{ color: "#3b82f6", cursor: "pointer" }}
            >
              Quên mật khẩu?
            </MuiLink>
          </Typography>

          <Typography
            variant="body2"
            sx={{ color: "#aaa", textAlign: "center", width: "100%" }}
          >
            Chưa có tài khoản?{" "}
            <MuiLink
              component={Link}
              to="/register"
              underline="hover"
              sx={{ color: "#3b82f6", fontWeight: 500, cursor: "pointer" }}
            >
              Đăng ký ngay
            </MuiLink>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}

export default Login;
