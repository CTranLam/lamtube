import { useState, useCallback } from "react";
import { Box } from "@mui/material";
import HomeFilter from "../components/home/HomeFilter";
import HomeVideo from "../components/home/HomeVideo";

export default function Home() {
  const [selectedFilterId, setSelectedFilterId] = useState<string>("all");
  const handleFilterChange = useCallback((id: string) => {
    setSelectedFilterId(id);
  }, []);

  return (
    <Box sx={{ px: 2, pt: 1, pb: 2 }}>
      <HomeFilter
        selectedFilterId={selectedFilterId}
        onFilterChange={handleFilterChange}
      />
      <HomeVideo />
    </Box>
  );
}
