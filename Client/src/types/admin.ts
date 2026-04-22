export interface NavItemProps {
  item: {
    path: string;
    label: string;
    icon?: React.ReactNode;
  };
}

export interface AdminVideoSummary {
  id: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  status: string;
  viewCount: number;
  categoryName: string | null;
  categoryId: number | null;
  uploaderName: string;
  createdAt?: string | null;
}
