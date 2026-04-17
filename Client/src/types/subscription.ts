import type { Video } from "./video";

export interface SubscribedChannelSummary {
  channelId: number;
  channelName: string;
  channelHandle: string;
  avatarUrl: string;
  description: string;
  subscriberCount: number;
  isSubscribed: boolean;
}

export interface SubscribedVideosPage {
  items: Video[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
