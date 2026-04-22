import { Alert, Snackbar } from "@mui/material";
import type { MyVideosSnackbarState } from "../../types/types";

interface MyVideosSnackbarProps {
  state: MyVideosSnackbarState;
  onClose: () => void;
}

export function MyVideosSnackbar({ state, onClose }: MyVideosSnackbarProps) {
  return (
    <Snackbar
      open={state.open}
      autoHideDuration={3500}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    >
      <Alert onClose={onClose} severity={state.severity} variant="filled" sx={{ width: "100%" }}>
        {state.message}
      </Alert>
    </Snackbar>
  );
}
