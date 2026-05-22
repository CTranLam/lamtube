import { Box, IconButton, Tooltip } from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import { Link } from "react-router-dom";

export type NavbarLogoProps = {
  onMenuClick?: () => void;
};

export function NavbarLogo({ onMenuClick }: NavbarLogoProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        minWidth: { xs: "auto", sm: 180 },
      }}
    >
      <Tooltip title="Menu">
        <IconButton
          onClick={onMenuClick}
          sx={{
            color: "#fff",
            width: 40,
            height: 40,
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            },
          }}
        >
          <MenuIcon />
        </IconButton>
      </Tooltip>

      <Link
        to="/"
        style={{
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Box
          sx={{
            width: 34,
            height: 24,
            backgroundColor: "#ff0000",
            borderRadius: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            fontWeight: 700,
            color: "#fff",
            transition: "background-color 0.2s",
            "&:hover": {
              backgroundColor: "#e50000",
            },
          }}
        >
          ▶
        </Box>
        <Box
          sx={{
            fontSize: 18,
            fontWeight: 700,
            color: "#fff",
            letterSpacing: -0.5,
            display: { xs: "none", sm: "block" },
          }}
        >
          LamTube
        </Box>
      </Link>
    </Box>
  );
}
