import { useCallback, useState } from "react";
import { AppBar, Toolbar } from "@mui/material";
import { NavbarLogo } from "./NavbarLogo";
import { NavbarSearch } from "./NavbarSearch";
import { NavbarActions } from "./NavbarActions";

type NavbarProps = {
  onMenuClick?: () => void;
  onSearchSubmit?: (query: string) => void;
};

export default function Navbar({ onMenuClick, onSearchSubmit }: NavbarProps) {
  const [searchValue, setSearchValue] = useState("");

  const handleSearchSubmit = useCallback(() => {
    const trimmed = searchValue.trim();
    if (!trimmed) return;
    if (onSearchSubmit) {
      onSearchSubmit(trimmed);
    } else {
      console.log("Searching for:", trimmed);
    }
  }, [onSearchSubmit, searchValue]);

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: "#0f0f0f",
        backgroundImage: "none",
        boxShadow: "0 1px 0 rgb(255, 255, 255, 0.1)",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar
        sx={{
          gap: 2,
          px: { xs: 1, sm: 2 },
          minHeight: 56,
        }}
      >
        {/* Left: menu + logo */}
        <NavbarLogo onMenuClick={onMenuClick} />

        {/* Center: rounded search bar */}
        <NavbarSearch
          value={searchValue}
          onChange={setSearchValue}
          onSubmit={handleSearchSubmit}
        />

        {/* Right: action buttons + profile menu */}
        <NavbarActions />
      </Toolbar>
    </AppBar>
  );
}
