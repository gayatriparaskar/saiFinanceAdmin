import { useQuery } from "@tanstack/react-query";
import axios from "../../axios";

export const useUser = () => {
  const token = localStorage.getItem('token');

  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      if (!token) {
        throw new Error('No authentication token found');
      }
      const { data } = await axios.get("users/profile");
      return data?.result;
    },
    enabled: !!token, // Only run query if token exists
    retry: (failureCount, error) => {
      // Don't retry on auth errors (401, 403)
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        // Clear invalid token and redirect to login
        localStorage.removeItem('token');
        window.location.href = '/login';
        return false;
      }
      return failureCount < 2; // Retry up to 2 times for other errors
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });
};
