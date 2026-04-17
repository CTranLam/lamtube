import { useQuery } from "@tanstack/react-query";
import { getSubscribedChannels } from "../api/subscriptions";

export function useSubscribedChannels(enabled = true) {
  return useQuery({
    queryKey: ["subscriptions", "channels"],
    queryFn: getSubscribedChannels,
    enabled,
  });
}
