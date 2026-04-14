import { Box, Button } from "@mui/material";
import { VIDEO_FILTERS } from "../../constants/video.constant";
import type { FilterButtonStyle } from "../../types/style";

type HomeFilterProps = {
  selectedFilterId: string;
  onFilterChange: (id: string) => void;
};

export default function HomeFilter({
  selectedFilterId,
  onFilterChange,
}: HomeFilterProps) {
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
      {VIDEO_FILTERS.map((filter) => {
        const selected = filter.id === selectedFilterId;
        const defaultStyle: FilterButtonStyle = {
          variant: "outlined",
          borderColor: "rgba(255,255,255,0.2)",
          backgroundColor: "rgba(255,255,255,0.1)",
          textColor: "#fff",
          hoverBackgroundColor: "rgba(255,255,255,0.2)",
          hoverBorderColor: "rgba(255,255,255,0.3)",
        };

        const selectedStyle: FilterButtonStyle = {
          variant: "contained",
          borderColor: "transparent",
          backgroundColor: "#fff",
          textColor: "#000",
          hoverBackgroundColor: "#f1f1f1",
          hoverBorderColor: "transparent",
        };

        let style: FilterButtonStyle = defaultStyle;
        if (selected) {
          style = selectedStyle;
        }
        return (
          <Button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
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
            {filter.label}
          </Button>
        );
      })}
    </Box>
  );
}
