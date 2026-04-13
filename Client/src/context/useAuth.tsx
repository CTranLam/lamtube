import { useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { UserInfo } from "../types/auth";
import { AuthContext } from "./AuthContext";

function getInitialUser(): UserInfo | null {
  try {
    const stored = localStorage.getItem("user_info");
    if (!stored) return null;
    return JSON.parse(stored) as UserInfo;
  } catch {
    return null;
  }
}

function getInitialAuthState() {
  const token = localStorage.getItem("access_token");
  const user = getInitialUser();
  const isAuthenticated = Boolean(token && user);
  return { token, user, isAuthenticated };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const initial = getInitialAuthState();
  const [user, setUser] = useState<UserInfo | null>(initial.user);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    initial.isAuthenticated,
  );

  const signIn = ({
    token,
    userInfo,
  }: {
    token: string;
    userInfo: UserInfo;
  }) => {
    queryClient.removeQueries({ queryKey: ["myProfile"] });
    localStorage.setItem("access_token", token);
    localStorage.setItem("user_info", JSON.stringify(userInfo));
    setUser(userInfo);
    setIsAuthenticated(true);
  };

  const signOut = () => {
    queryClient.removeQueries({ queryKey: ["myProfile"] });
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_info");
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = { isAuthenticated, user, signIn, signOut };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
