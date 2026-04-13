import type { ElementType } from "react";
import {
  Home as HomeIcon,
  Subscriptions as SubscriptionsIcon,
  History as HistoryIcon,
  VideoLibrary as VideoLibraryIcon,
  PlaylistPlay as PlaylistIcon,
  WatchLater as WatchLaterIcon,
  ThumbUpAlt as ThumbUpAltIcon,
  CloudDownload as DownloadIcon,
  MusicNote as MusicIcon,
  SportsEsports as GamingIcon,
  Article as NewsIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  Feedback as FeedbackIcon,
} from "@mui/icons-material";

export type SidebarNavItem = {
  id: string;
  label: string;
  icon: ElementType;
  path: string;
};

export const MAIN_NAV: SidebarNavItem[] = [
  { id: "home", label: "Trang chủ", icon: HomeIcon, path: "/" },
  {
    id: "subscriptions",
    label: "Kênh đăng ký",
    icon: SubscriptionsIcon,
    path: "/subscriptions",
  },
];

export const YOU_NAV: SidebarNavItem[] = [
  { id: "history", label: "Video đã xem", icon: HistoryIcon, path: "/history" },
  {
    id: "playlists",
    label: "Danh sách phát",
    icon: PlaylistIcon,
    path: "/playlists",
  },
  {
    id: "your-videos",
    label: "Video của bạn",
    icon: VideoLibraryIcon,
    path: "/your-videos",
  },
  {
    id: "watch-later",
    label: "Xem sau",
    icon: WatchLaterIcon,
    path: "/watch-later",
  },
  {
    id: "liked",
    label: "Video đã thích",
    icon: ThumbUpAltIcon,
    path: "/liked",
  },
  {
    id: "downloads",
    label: "Nội dung tải xuống",
    icon: DownloadIcon,
    path: "/downloads",
  },
];

export const EXPLORE_NAV: SidebarNavItem[] = [
  { id: "music", label: "Âm nhạc", icon: MusicIcon, path: "/music" },
  { id: "gaming", label: "Trò chơi", icon: GamingIcon, path: "/gaming" },
  { id: "news", label: "Tin tức", icon: NewsIcon, path: "/news" },
];

export const SETTINGS_NAV: SidebarNavItem[] = [
  { id: "settings", label: "Cài đặt", icon: SettingsIcon, path: "/settings" },
  { id: "help", label: "Trợ giúp", icon: HelpIcon, path: "/help" },
  {
    id: "feedback",
    label: "Gửi phản hồi",
    icon: FeedbackIcon,
    path: "/feedback",
  },
];
