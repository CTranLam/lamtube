import { useEffect, useMemo } from "react";
import { Box, Button, Skeleton } from "@mui/material";
import type { FilterButtonStyle } from "../../types/style";
import type { HomeCategoryId } from "../../types/category";
import { useHomeCategories } from "../../hooks/useHomeCategories";

type HomeFilterProps = {
  selectedCategoryId: HomeCategoryId;
  onCategoryChange: (id: HomeCategoryId) => void;
};

function getButtonStyle(selected: boolean): FilterButtonStyle {
  if (selected) {
    return {
      variant: "contained",
      borderColor: "transparent",
      backgroundColor: "#fff",
      textColor: "#000",
      hoverBackgroundColor: "#f1f1f1",
      hoverBorderColor: "transparent",
    };
  }

  return {
    variant: "outlined",
    borderColor: "rgba(255,255,255,0.2)",
    backgroundColor: "rgba(255,255,255,0.1)",
    textColor: "#fff",
    hoverBackgroundColor: "rgba(255,255,255,0.2)",
    hoverBorderColor: "rgba(255,255,255,0.3)",
  };
}

function FilterChip({
  selected,
  label,
  onClick,
}: {
  selected: boolean;
  label: string;
  onClick: () => void;
}) {
  const style = getButtonStyle(selected);

  return (
    <Button
      onClick={onClick}
      size="small"
      variant={style.variant}
      sx={{
        textTransform: "none",
        borderRadius: 999,
        px: 2,
        py: 0.5,
        fontSize: 13,
        borderColor: style.borderColor,
        bgcolor: style.backgroundColor,
        color: style.textColor,
        "&:hover": {
          bgcolor: style.hoverBackgroundColor,
          borderColor: style.hoverBorderColor,
        },
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </Button>
  );
}

export default function HomeFilter({
  selectedCategoryId,
  onCategoryChange,
}: HomeFilterProps) {
  const { data, isLoading, isError, refetch } = useHomeCategories({
    page: 0,
    size: 50,
  });
  const categories = useMemo(() => data?.items ?? [], [data]);
  const isCategoryListComplete =
    data != null && data.totalElements <= data.items.length;

  useEffect(() => {
    if (selectedCategoryId === "all" || !isCategoryListComplete) {
      return;
    }
    const exists = categories.some((item) => item.id === selectedCategoryId);
    if (!exists) {
      onCategoryChange("all");
    }
  }, [categories, isCategoryListComplete, onCategoryChange, selectedCategoryId]);

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1,
        mb: 2,
        overflowX: "auto",
        pb: 0.5,
        "&::-webkit-scrollbar": {
          height: 6,
        },
        "&::-webkit-scrollbar-thumb": {
          bgcolor: "rgba(255,255,255,0.2)",
          borderRadius: 999,
        },
      }}
    >
      <FilterChip
        selected={selectedCategoryId === "all"}
        label="Tất cả"
        onClick={() => onCategoryChange("all")}
      />

      {isLoading &&
        Array.from({ length: 5 }).map((_, index) => (
          <Skeleton
            key={index}
            variant="rounded"
            sx={{ width: 92, height: 30, borderRadius: 999 }}
          />
        ))}

      {isError && !isLoading && (
        <Button
          size="small"
          variant="outlined"
          onClick={() => {
            void refetch();
          }}
          sx={{ borderRadius: 999, textTransform: "none" }}
        >
          Thử lại
        </Button>
      )}

      {!isLoading &&
        !isError &&
        categories.map((category) => (
          <FilterChip
            key={category.id}
            selected={selectedCategoryId === category.id}
            label={category.name}
            onClick={() => onCategoryChange(category.id)}
          />
        ))}
    </Box>
  );
}
