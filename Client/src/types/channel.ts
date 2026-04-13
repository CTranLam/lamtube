import type { Video } from "./video";

export interface ChannelStats {
  totalViews: number;
  totalSubscribers: number;
  totalVideos: number;
  last30DaysViews: number;
}

export interface UserProfileDetail {
  email: string;
  profile: {
    fullName: string;
    bio: string;
    avatarUrl: string;
  };
}

export interface UserUpdateDTO {
  fullname?: string;
  bio?: string;
  avatarUrl?: string;
}

export type MyVideo = Video;
