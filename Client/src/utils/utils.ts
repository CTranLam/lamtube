import type { MyVideo } from "../types/channel";
import type { EditFormState } from "../types/types";

export function toStatusLabel(status: "public" | "private") {
  return status === "public" ? "Công khai" : "Riêng tư";
}

export function toInitialForm(video: MyVideo): EditFormState {
  return {
    title: video.title,
    description: video.description || "",
    categoryId: video.categoryId != null ? String(video.categoryId) : "",
    status: video.status,
  };
}
