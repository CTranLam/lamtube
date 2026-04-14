import { useQuery } from "@tanstack/react-query";
import { getMyVideos } from "../api/channel";
import type { MyVideo } from "../types/channel";

export function useMyVideos() {
  return useQuery<MyVideo[]>({
    queryKey: ["channel", "myVideos"],
    queryFn: getMyVideos,
  });
}
