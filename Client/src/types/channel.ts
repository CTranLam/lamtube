export interface ChannelStats {
  totalViews?: number;
  totalSubscribers?: number;
  totalVideos?: number;
  totalLikes?: number;
  totalDislikes?: number;
  last30DaysViews?: number;
  monthlyViews?: number;
  monthlyLikes?: number;
  monthlyDislikes?: number;
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

export interface MyVideoUpdatePayload {
  title: string;
  description: string;
  categoryId: number | null;
  status: "public" | "private";
}
