export type PlaylistPickerItem = {
  id: number;
  name: string;
  isPrivate: boolean;
  containsVideo: boolean;
};

export type CreatePlaylistPayload = {
  name: string;
  isPrivate: boolean;
};

export type WatchLaterVideo = {
  id: number;
  title: string;
  thumbnailUrl: string;
  uploaderName: string;
  viewCount: number;
};

export type PlaylistListItem = {
  id: number;
  name: string;
  isPrivate: boolean;
  videoCount: number;
};

export type PlaylistVideoItem = {
  id: number;
  title: string;
  thumbnailUrl: string;
  uploaderName: string;
  viewCount: number;
};

export type PlaylistUpdatePayload = {
  name?: string;
  isPrivate?: boolean;
};
