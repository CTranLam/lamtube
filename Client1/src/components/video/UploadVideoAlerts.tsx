import { Alert, Stack } from "@mui/material";

interface UploadVideoAlertsProps {
  error: string | null;
  success: string | null;
}

export function UploadVideoAlerts({ error, success }: UploadVideoAlertsProps) {
  if (!error && !success) return null;

  return (
    <Stack spacing={1.5}>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
    </Stack>
  );
}
