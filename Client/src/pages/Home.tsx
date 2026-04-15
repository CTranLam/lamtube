import { useCallback } from "react";
import { Box } from "@mui/material";
import { useSearchParams } from "react-router-dom";
import HomeFilter from "../components/home/HomeFilter";
import HomeVideo from "../components/home/HomeVideo";
import type { HomeCategoryId } from "../types/category";

function parseCategoryFromQuery(value: string | null): HomeCategoryId {
  if (!value) return "all";
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return "all";
  }
  return parsed;
}

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategoryId = parseCategoryFromQuery(
    searchParams.get("category"),
  );
  const searchTitle = searchParams.get("title")?.trim() ?? "";

  const handleCategoryChange = useCallback(
    (id: HomeCategoryId) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (id === "all") {
          next.delete("category");
        } else {
          next.set("category", String(id));
        }
        return next;
      });
    },
    [setSearchParams],
  );

  return (
    <Box sx={{ px: 2, pt: 1, pb: 2 }}>
      <HomeFilter
        selectedCategoryId={selectedCategoryId}
        onCategoryChange={handleCategoryChange}
      />
      <HomeVideo
        selectedCategoryId={selectedCategoryId}
        searchTitle={searchTitle}
      />
    </Box>
  );
}
