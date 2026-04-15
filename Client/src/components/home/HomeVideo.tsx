import { Box, Button } from "@mui/material";
import { useVideos } from "../../hooks/useVideos";
import type { HomeCategoryId } from "../../types/category";
import { VideoGrid } from "../video/VideoGrid";
import HomeVideoItem from "./HomeVideoItem.tsx";

type HomeVideoProps = {
  selectedCategoryId: HomeCategoryId;
  searchTitle?: string;
};

export default function HomeVideo({
  selectedCategoryId,
  searchTitle,
}: HomeVideoProps) {
  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useVideos({
    categoryId: selectedCategoryId === "all" ? undefined : selectedCategoryId,
    title: searchTitle,
  });

  const videos = data?.pages.flatMap((page) => page.items) ?? [];

  if (isError) {
    return (
      <Box sx={{ p: 2 }}>
        Không thể tải danh sách video. Vui lòng thử lại sau.
      </Box>
    );
  }

  if (isLoading || !data) {
    return (
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(4, 1fr)",
          },
          gap: 2,
        }}
      >
        {Array.from({ length: 8 }).map((_, index) => (
          <HomeVideoItem key={index} />
        ))}
      </Box>
    );
  }

  if (videos.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        {searchTitle
          ? `Không tìm thấy video nào với từ khóa "${searchTitle}".`
          : "Chưa có video phù hợp với bộ lọc hiện tại."}
      </Box>
    );
  }

  return (
    <Box>
      <VideoGrid videos={videos} />

      {hasNextPage && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Button
            variant="outlined"
            onClick={() => {
              void fetchNextPage();
            }}
            disabled={isFetchingNextPage}
            sx={{ textTransform: "none" }}
          >
            {isFetchingNextPage ? "Đang tải..." : "Tải thêm"}
          </Button>
        </Box>
      )}
    </Box>
  );
}
