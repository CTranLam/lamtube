import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";

interface UploadVideoActionsCardProps {
  submitting: boolean;
  onGoToChannel: () => void;
}

export function UploadVideoActionsCard({
  submitting,
  onGoToChannel,
}: UploadVideoActionsCardProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 3,
        bgcolor: "rgba(249,115,22,0.06)",
        borderColor: "rgba(249,115,22,0.24)",
      }}
    >
      <Stack spacing={1}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CloudUploadRoundedIcon sx={{ color: "#f97316" }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Hành động
          </Typography>
        </Box>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{ pt: 1 }}
        >
          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              px: 3,
              bgcolor: "#f97316",
              "&:hover": { bgcolor: "#ea580c" },
            }}
          >
            {submitting ? (
              <>
                <CircularProgress size={18} sx={{ color: "#fff", mr: 1 }} />
                Đang đăng video...
              </>
            ) : (
              "Đăng video"
            )}
          </Button>
          <Button
            type="button"
            variant="text"
            onClick={onGoToChannel}
            sx={{ textTransform: "none", color: "#d4d4d8" }}
          >
            Về kênh của tôi
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
