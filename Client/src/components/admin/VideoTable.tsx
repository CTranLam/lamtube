import {
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import PublicIcon from "@mui/icons-material/Public";
import LockIcon from "@mui/icons-material/Lock";
import type { AdminVideoSummary } from "../../types/admin";

interface VideoTableProps {
  videos: AdminVideoSummary[];
  busyVideoIds: Set<number>;
  onView: (video: AdminVideoSummary) => void;
  onToggleStatus: (video: AdminVideoSummary) => void;
  onDelete: (video: AdminVideoSummary) => void;
}

function statusLabel(status: string) {
  return status === "public" ? "Công khai" : "Riêng tư";
}

export function VideoTable({ videos, busyVideoIds, onView, onToggleStatus, onDelete }: VideoTableProps) {
  return (
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: 2,
        boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
        overflow: "hidden",
        border: "1px solid",
        borderColor: "rgba(255,255,255,0.12)",
        bgcolor: "#181818",
        color: "#f4f4f5",
      }}
    >
      <Table
        size="small"
        sx={{
          "& td, & th": { color: "#f4f4f5", borderColor: "rgba(255,255,255,0.08)" },
          bgcolor: "#181818",
        }}
      >
        <TableHead>
          <TableRow sx={{ bgcolor: "rgba(255,255,255,0.02)" }}>
            <TableCell sx={{ fontWeight: 600 }}>Video</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Uploader</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Danh mục</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Lượt xem</TableCell>
            <TableCell align="right" sx={{ fontWeight: 600, pr: 3 }}>
              Thao tác
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {videos.map((video) => {
            const busy = busyVideoIds.has(video.id);
            return (
              <TableRow
                key={video.id}
                hover
                sx={{
                  bgcolor: "#181818",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.03)" },
                  "&:last-child td, &:last-child th": { border: 0 },
                }}
              >
                <TableCell sx={{ py: 1.5 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 280 }}>
                    <Paper
                      component="img"
                      src={video.thumbnailUrl}
                      alt={video.title}
                      elevation={0}
                      sx={{
                        width: 96,
                        height: 54,
                        objectFit: "cover",
                        borderRadius: 1,
                        bgcolor: "grey.200",
                      }}
                    />
                    <Stack sx={{ minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap title={video.title}>
                        {video.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        ID: {video.id}
                      </Typography>
                    </Stack>
                  </Stack>
                </TableCell>

                <TableCell>
                  <Typography variant="body2" noWrap sx={{ maxWidth: 160 }}>
                    {video.uploaderName || "-"}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography variant="body2">{video.categoryName || "Chưa có"}</Typography>
                </TableCell>

                <TableCell>
                  <Chip
                    size="small"
                    label={statusLabel(video.status)}
                    color={video.status === "public" ? "success" : "default"}
                  />
                </TableCell>

                <TableCell>
                  <Typography variant="body2">{new Intl.NumberFormat("vi-VN").format(video.viewCount)}</Typography>
                </TableCell>

                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Tooltip title="Xem chi tiết">
                      <span>
                        <IconButton size="small" onClick={() => onView(video)} color="info" disabled={busy}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip
                      title={video.status === "public" ? "Chuyển sang riêng tư" : "Chuyển sang công khai"}
                    >
                      <span>
                        <IconButton
                          size="small"
                          onClick={() => onToggleStatus(video)}
                          color="primary"
                          disabled={busy}
                        >
                          {video.status === "public" ? (
                            <LockIcon fontSize="small" />
                          ) : (
                            <PublicIcon fontSize="small" />
                          )}
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Xóa video">
                      <span>
                        <IconButton
                          size="small"
                          onClick={() => onDelete(video)}
                          color="error"
                          disabled={busy}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
