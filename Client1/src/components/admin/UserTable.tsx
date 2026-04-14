import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Stack,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import type { UserSummary } from "../../types/auth";

interface UserTableProps {
  users: UserSummary[];
  onView?: (user: UserSummary) => void;
  onEdit?: (user: UserSummary) => void;
  onDelete?: (user: UserSummary) => void;
}

export function UserTable({ users, onView, onEdit, onDelete }: UserTableProps) {
  return (
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: 2,
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "common.white",
        color: "#000",
      }}
    >
      <Table
        size="small"
        sx={{
          "& td, & th": { color: "#000" },
          bgcolor: "common.white",
        }}
      >
        <TableHead>
          <TableRow sx={{ bgcolor: "common.white" }}>
            <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Vai trò</TableCell>
            <TableCell align="right" sx={{ fontWeight: 600, pr: 3 }}>
              Thao tác
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow
              key={user.userId}
              hover
              sx={{
                bgcolor: "common.white",
                "&:hover": { bgcolor: "grey.50" },
                "&:last-child td, &:last-child th": { border: 0 },
              }}
            >
              <TableCell sx={{ py: 1.5 }}>{user.userId}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {user.role}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <IconButton
                    size="small"
                    onClick={() => onView?.(user)}
                    color="info"
                  >
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => onEdit?.(user)}
                    color="primary"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => onDelete?.(user)}
                    color="error"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
