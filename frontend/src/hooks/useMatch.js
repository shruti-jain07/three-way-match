"use client";
 
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { queryKeys } from "@/lib/queryKeys";
 
export const useMatch = (poNumber) => {
  return useQuery({
    queryKey: queryKeys.match.detail(poNumber),
    queryFn: () => apiClient.get(`/match/${encodeURIComponent(poNumber)}`),
    select: (response) => response.data,
    enabled: Boolean(poNumber),
  });
};
