import type {
  UploadVideoCategory,
  UploadVideoPayload,
  UploadVideoResponse,
  Video,
} from "../types/video";
import type { ApiResponse } from "../types/auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Mock data
const MOCK_VIDEOS: Video[] = [
  {
    id: "1",
    title: "Playlist Jazzhop thư giãn khi làm việc",
    channelName: "Chill Studio",
    views: "543 N lượt xem",
    publishedAt: "3 ngày trước",
    duration: "2:05:12",
    thumbnailUrl:
      "https://khoanhdep.com/wp-content/uploads/2025/10/meme-chill-guy-10.jpg",
    description: "Nhạc jazzhop nhẹ nhàng giúp bạn tập trung làm việc, học tập.",
    embedUrl: "https://www.youtube.com/embed/VvRkYSTS9TA",
  },
  {
    id: "2",
    title: "Vlog du lịch Thụy Sĩ trên nhà di động",
    channelName: "Khoai Lang Thang",
    views: "1,2 Tr lượt xem",
    publishedAt: "1 tuần trước",
    duration: "17:48",
    thumbnailUrl:
      "https://khoanhdep.com/wp-content/uploads/2025/10/meme-chill-guy.jpg",
    description:
      "Hành trình khám phá Thụy Sĩ với phong cảnh hùng vĩ và ẩm thực đặc sắc.",
    embedUrl: "https://www.youtube.com/embed/VvRkYSTS9TA",
  },
  {
    id: "3",
    title: "TOP 30 ca khúc nhạc trẻ chill cực hay",
    channelName: "Chút Gió - MUSIC",
    views: "839 N lượt xem",
    publishedAt: "2 tuần trước",
    duration: "1:59:39",
    thumbnailUrl:
      "https://khoanhdep.com/wp-content/uploads/2025/10/meme-chill-guy-24.jpg",
    description: "Tuyển tập nhạc trẻ chill giúp bạn thư giãn sau giờ làm việc.",
    embedUrl: "https://www.youtube.com/embed/VvRkYSTS9TA",
  },
  {
    id: "4",
    title: "Highlights bóng đá vòng loại World Cup",
    channelName: "TV360 Bóng Đá",
    views: "40 N lượt xem",
    publishedAt: "12 giờ trước",
    duration: "9:32",
    thumbnailUrl:
      "https://khoanhdep.com/wp-content/uploads/2025/10/meme-chill-guy-17.jpg",
    description: "Tổng hợp những pha bóng hay nhất trận đấu vừa qua.",
    embedUrl: "https://www.youtube.com/embed/VvRkYSTS9TA",
  },
];

export async function getTrendingVideos(categoryId?: number): Promise<Video[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (categoryId != null) {
    return MOCK_VIDEOS;
  }

  return MOCK_VIDEOS;
}

export async function getVideoById(
  id: string | undefined,
): Promise<Video | undefined> {
  if (!id) return undefined;

  await new Promise((resolve) => setTimeout(resolve, 300));
  return MOCK_VIDEOS.find((video) => video.id === id);
}

export async function getUploadCategories(): Promise<UploadVideoCategory[]> {
  const response = await fetch(`${API_BASE_URL}/categories`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const body = (await response.json()) as ApiResponse<UploadVideoCategory[]>;

  if (!response.ok) {
    throw new Error(body.message || "Không thể tải danh mục");
  }

  return body.data ?? [];
}

export async function createVideo(
  payload: UploadVideoPayload,
): Promise<ApiResponse<UploadVideoResponse>> {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("description", payload.description);
  formData.append("status", payload.status);
  formData.append("video", payload.videoFile);
  if (payload.categoryId != null) {
    formData.append("categoryId", String(payload.categoryId));
  }
  if (payload.thumbnailFile) {
    formData.append("thumbnail", payload.thumbnailFile);
  }

  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_BASE_URL}/user/upload/video`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });

  if (!response.ok) {
    let message = "Không thể đăng video";

    try {
      const body = (await response.json()) as { message?: string };
      message = body.message || message;
    } catch {
      if (response.status === 404) {
        message = "Backend upload video chưa được triển khai.";
      }
    }

    throw new Error(message);
  }

  return (await response.json()) as ApiResponse<UploadVideoResponse>;
}
