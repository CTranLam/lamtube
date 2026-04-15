import { useCallback, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import Navbar from "../components/common/Navbar";
import Sidebar from "../components/common/Sidebar";

export default function MainLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleMenuClick = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  const initialSearchValue = useMemo(() => {
    if (location.pathname !== "/") return "";
    return new URLSearchParams(location.search).get("title") ?? "";
  }, [location.pathname, location.search]);

  const handleSearchSubmit = useCallback(
    (query: string) => {
      const trimmed = query.trim();
      const nextParams =
        location.pathname === "/"
          ? new URLSearchParams(location.search)
          : new URLSearchParams();

      if (trimmed) {
        nextParams.set("title", trimmed);
      } else {
        nextParams.delete("title");
      }

      navigate({
        pathname: "/",
        search: nextParams.toString() ? `?${nextParams.toString()}` : "",
      });
    },
    [location.pathname, location.search, navigate],
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#0f0f0f",
      }}
    >
      <Navbar
        onMenuClick={handleMenuClick}
        onSearchSubmit={handleSearchSubmit}
        initialSearchValue={initialSearchValue}
      />
      <Box sx={{ display: "flex", flex: 1, pt: "64px" }}>
        <Sidebar open onClose={() => {}} collapsed={sidebarCollapsed} />
        <Box
          component="main"
          sx={{
            flex: 1,
            backgroundColor: "#0f0f0f",
            p: { xs: 1, sm: 2 },
            overflowX: "hidden",
            mt: { xs: 0, md: 0 },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
