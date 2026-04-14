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

export interface MyVideo {
  id: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  status: "public" | "private";
  viewCount: number;
  categoryName: string | null;
  categoryId: number | null;
}
