import { Button, Stack, TextField, Typography } from "@mui/material";

type WatchCommentFormProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  error: string | null;
};

export default function WatchCommentForm({
  value,
  onChange,
  onSubmit,
  isSubmitting,
  error,
}: WatchCommentFormProps) {
  const trimmed = value.trim();

  return (
    <Stack spacing={1.25} sx={{ mb: 2 }}>
      <TextField
        fullWidth
        multiline
        minRows={3}
        placeholder="Viết bình luận của bạn..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? (
        <Typography variant="caption" sx={{ color: "#ef4444" }}>
          {error}
        </Typography>
      ) : null}
      <Stack direction="row" justifyContent="flex-end">
        <Button
          variant="contained"
          sx={{ textTransform: "none" }}
          onClick={onSubmit}
          disabled={isSubmitting || !trimmed}
        >
          {isSubmitting ? "Đang gửi..." : "Gửi bình luận"}
        </Button>
      </Stack>
    </Stack>
  );
}
