"use client";
 
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { queryKeys } from "@/lib/queryKeys";
 
export const useSummary = (poNumber) => {
  return useQuery({
    queryKey: queryKeys.summary.detail(poNumber),
    queryFn: () => apiClient.get(`/summary/${encodeURIComponent(poNumber)}`),
    select: (response) => response.data,
    enabled: Boolean(poNumber),
  });
};

 

