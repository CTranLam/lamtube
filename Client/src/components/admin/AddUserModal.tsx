import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Stack,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { ApiResponse } from "../../types/auth";
import { useAdminRoles } from "../../hooks/useAdminRoles";
import { useCreateUser } from "../../hooks/useCreateUser";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: (user: ApiResponse<unknown>) => void;
};

export default function AddUserModal({ open, onClose, onCreated }: Props) {
  const [email, setEmail] = useState("");
  const [fullname, setFullname] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  const { roles, isLoading: rolesLoading, error: rolesError } = useAdminRoles();
  const {
    createUser,
    isLoading: creating,
    error: createError,
    setError: setCreateError,
  } = useCreateUser();

  const reset = () => {
    setEmail("");
    setFullname("");
    setPassword("");
    setRole(roles[0] ?? "");
    setCreateError(null);
  };

  useEffect(() => {
    if (!role && roles.length > 0) {
      // Defer to avoid React warning about synchronous setState in effect
      const id = window.setTimeout(() => {
        setRole((current) => (current || roles[0] ? roles[0] : current));
      }, 0);
      return () => window.clearTimeout(id);
    }
  }, [roles, role]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleCreate = async () => {
    try {
      await createUser({ email, fullname, password, role });
      onCreated?.({} as ApiResponse<unknown>);
      reset();
      onClose();
    } catch (e) {
      // error state is already handled in the hook; ensure React catches
      if (e instanceof Error) {
        setCreateError(e.message);
      } else {
        setCreateError("Lỗi tạo người dùng");
      }
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        Thêm người dùng
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {(() => {
            const message =
              rolesError instanceof Error
                ? rolesError.message
                : (createError ?? null);
            return message ? (
              <Typography variant="body2" color="error">
                {message}
              </Typography>
            ) : null;
          })()}

          <TextField
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
          />
          <TextField
            label="Tên đầy đủ"
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            fullWidth
          />
          <TextField
            label="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            fullWidth
          />
          <TextField
            select
            label="Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            fullWidth
            disabled={rolesLoading || roles.length === 0}
          >
            {roles.map((r) => (
              <MenuItem key={r} value={r}>
                {r}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={creating}>
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={handleCreate}
          disabled={creating || !email || !fullname || !password || !role}
        >
          {creating ? "Đang tạo..." : "Tạo"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
