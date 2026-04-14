import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import App from "./App.tsx";
import "./assets/index.css";
import { AuthProvider } from "./context/useAuth.tsx";

const queryClient = new QueryClient();

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#0f0f0f",
      paper: "#0f0f0f",
    },
    primary: {
      main: "#3b82f6",
    },
    secondary: {
      main: "#dc2626",
    },
    text: {
      primary: "#ffffff",
      secondary: "#aaaaaa",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#0f0f0f",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#0f0f0f",
        },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
