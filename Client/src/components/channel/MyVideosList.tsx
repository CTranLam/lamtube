import { Stack } from "@mui/material";
import type { MyVideo } from "../../types/channel";
import { MyVideoItem } from "./MyVideoItem";

interface MyVideosListProps {
  videos: MyVideo[];
  busyVideoIds: Set<number>;
  onEdit: (video: MyVideo) => void;
  onDelete: (video: MyVideo) => void;
}

export function MyVideosList({ videos, busyVideoIds, onEdit, onDelete }: MyVideosListProps) {
  return (
    <Stack spacing={1.5}>
      {videos.map((video) => (
        <MyVideoItem
          key={video.id}
          video={video}
          disabled={busyVideoIds.has(video.id)}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </Stack>
  );
}
