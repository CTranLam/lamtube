export interface Video {
  id: string;
  title: string;
  channelName: string;
  views: string;
  publishedAt: string;
  duration: string;
  thumbnailUrl: string;
  description: string;
  embedUrl: string;
}

export interface UploadVideoCategory {
  id: number;
  name: string;
}

export interface UploadVideoPayload {
  title: string;
  description: string;
  categoryId?: number;
  status: "public" | "private";
  videoFile: File;
  thumbnailFile?: File | null;
}

export interface UploadVideoResponse {
  id: number;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  status: "public" | "private";
  categoryId?: number | null;
}

export interface UploadVideoFormState {
  title: string;
  description: string;
  categoryId: string;
  status: "public" | "private";
}

export interface VideoDetail {
  id: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  status: string;
  viewCount: number;
  categoryName: string | null;
  categoryId: number | null;
  uploaderName?: string;
  uploaderAvatarUrl?: string;
  subscriberCount?: number;
  likeCount?: number;
  dislikeCount?: number;
  commentCount?: number;
}

export interface HomeVideoListResult {
  items: Video[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
