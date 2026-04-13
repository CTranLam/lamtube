import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Stack,
  Typography,
  CircularProgress,
  Avatar,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import { useUserDetails } from "../../hooks/useUserDetails";

type Props = {
  open: boolean;
  onClose: () => void;
  userId: number | null;
};

export default function UserDetailsModal({ open, onClose, userId }: Props) {
  const { data, isLoading, error } = useUserDetails(userId);
  const user = data?.data ?? null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        Thông tin người dùng
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {isLoading ? (
          <Stack sx={{ py: 2 }} alignItems="center">
            <CircularProgress size={24} />
          </Stack>
        ) : error ? (
          <Typography variant="body2" sx={{ color: "error.main" }}>
            {error instanceof Error ? error.message : String(error)}
          </Typography>
        ) : !user ? (
          <Typography variant="body2">Không có dữ liệu.</Typography>
        ) : (
          <Stack spacing={1} sx={{ mt: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar
                src={user.avatarUrl ?? undefined}
                alt={user.fullname ?? user.email}
                sx={{ width: 64, height: 64 }}
              >
                {!user.avatarUrl && <PersonIcon />}
              </Avatar>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>
                  {user.fullname ?? user.email}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
            </Box>

            <Typography variant="body2">
              <strong>ID:</strong> {user.id}
            </Typography>
            <Typography variant="body2">
              <strong>Giới thiệu:</strong> {user.bio}
            </Typography>
            <Typography variant="body2">
              <strong>Vai trò:</strong> {user.role}
            </Typography>
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
}
