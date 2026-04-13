import { useState } from "react";
import type { FormEventHandler, ChangeEvent } from "react";
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
import { registerUser } from "../api/auth";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    retypedPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange =
    (field: "email" | "password" | "retypedPassword") =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    setError(null);

    if (form.password !== form.retypedPassword) {
      setError("Mật khẩu nhập lại không khớp");
      return;
    }

    try {
      setLoading(true);
      await registerUser(form);
      navigate("/login");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Đăng ký thất bại";
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
            Tạo tài khoản
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
            required
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
            required
            value={form.password}
            onChange={handleChange("password")}
            slotProps={{
              inputLabel: { sx: { color: "#aaa" } },
              input: { sx: { color: "#fff" } },
            }}
          />
          <TextField
            label="Nhập lại mật khẩu"
            type="password"
            variant="outlined"
            fullWidth
            size="small"
            required
            value={form.retypedPassword}
            onChange={handleChange("retypedPassword")}
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
            {loading ? "Đang đăng ký..." : "Đăng ký"}
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
            Đã có tài khoản?{" "}
            <MuiLink
              component={Link}
              to="/login"
              underline="hover"
              sx={{ color: "#3b82f6", fontWeight: 500, cursor: "pointer" }}
              onClick={() => navigate("/login")}
            >
              Đăng nhập
            </MuiLink>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}

export default Register;
