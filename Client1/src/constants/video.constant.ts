export interface YouTubeThumbnail {
  url: string;
}
export interface YouTubeThumbnails {
  high: YouTubeThumbnail;
}

export interface YouTubeSnippet {
  title: string;
  channelTitle: string;
  publishedAt: string;
  description: string;
  thumbnails: YouTubeThumbnails;
}

export interface YouTubeStatistics {
  viewCount: string;
}

export interface YouTubeContentDetails {
  duration: string;
}

export interface YouTubeVideoItem {
  id: string;
  snippet: YouTubeSnippet;
  statistics: YouTubeStatistics;
  contentDetails: YouTubeContentDetails;
}

export interface YouTubeVideosResponse {
  items: YouTubeVideoItem[];
}

export interface VideoFilter {
  id: string;
  label: string;
  videoCategoryId?: string;
}

export const VIDEO_FILTERS: VideoFilter[] = [
  { id: "all", label: "Tất cả" },
  { id: "music", label: "Âm nhạc", videoCategoryId: "10" },
  { id: "gaming", label: "Trò chơi", videoCategoryId: "20" },
  { id: "news", label: "Tin tức", videoCategoryId: "25" },
  { id: "education", label: "Học tập", videoCategoryId: "27" },
  { id: "travel", label: "Du lịch", videoCategoryId: "19" },
];
