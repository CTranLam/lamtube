import { useQuery } from "@tanstack/react-query";
import { getChannelStats } from "../api/channel";
import type { ChannelStats } from "../types/channel";

export function useChannelStats() {
  return useQuery<ChannelStats>({
    queryKey: ["channel", "stats"],
    queryFn: getChannelStats,
  });
}
