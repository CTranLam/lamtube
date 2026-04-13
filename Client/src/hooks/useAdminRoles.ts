import { useQuery } from "@tanstack/react-query";
import { getRoles } from "../api/admin";

export const useAdminRoles = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["adminRoles"],
    queryFn: getRoles,
    retry: false,
  });

  return {
    roles: (data?.data as string[]) ?? [],
    isLoading,
    error: error ?? null,
    refresh: refetch,
  };
};
