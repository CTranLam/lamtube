export interface WatchHistoryVideo {
  videoId: number;
  title: string;
  thumbnailUrl: string;
  uploaderName: string;
  viewCount: number;
  watchedAt: string;
}

export interface WatchHistoryGroup {
  date: string;
  label: string;
  items: WatchHistoryVideo[];
}
