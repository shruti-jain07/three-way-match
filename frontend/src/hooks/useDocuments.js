"use client";
 
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../lib/apiClient";
import { queryKeys } from "../lib/queryKeys";
 

export const useDocuments = (filters = {}) => {
  const { type, poNumber } = filters;
 
  const searchParams = new URLSearchParams();
  if (type) searchParams.set("type", type);
  if (poNumber) searchParams.set("poNumber", poNumber);
 
  const queryString = searchParams.toString();
 
  return useQuery({
    queryKey: queryKeys.documents.list(filters),
    queryFn: () => apiClient.get(`/documents${queryString ? `?${queryString}` : ""}`),
    select: (response) => response.data,
  });
};
export const useDocument = (id, type) => {
  const searchParams = new URLSearchParams();

  if (type) {
    searchParams.set("type", type);
  }

  const queryString = searchParams.toString();

  return useQuery({
    queryKey: queryKeys.documents.detail(id),
    queryFn: () =>
      apiClient.get(
        `/documents/${id}${queryString ? `?${queryString}` : ""}`
      ),
    select: (response) => response.data,
    enabled: Boolean(id),
  });
};