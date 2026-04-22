export interface EditFormState {
  title: string;
  description: string;
  categoryId: string;
  status: "public" | "private";
}

export interface MyVideosSnackbarState {
  open: boolean;
  severity: "success" | "error";
  message: string;
}
