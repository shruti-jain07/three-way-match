"use client";
 
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { queryKeys } from "@/lib/queryKeys";
 
export const useSkuMasters = () => {
  return useQuery({
    queryKey: queryKeys.skuMasters.all,
    queryFn: () => apiClient.get("/masters/sku"),
    select: (response) => response.data,
  });
};
 
export const useSkuMaster = (id) => {
  return useQuery({
    queryKey: queryKeys.skuMasters.detail(id),
    queryFn: () => apiClient.get(`/masters/sku/${id}`),
    select: (response) => response.data,
    enabled: Boolean(id),
  });
};
 
export const useCreateSkuMaster = () => {
  const queryClient = useQueryClient();
 
  return useMutation({
    mutationFn: (data) => apiClient.post("/masters/sku", data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.skuMasters.all }),
  });
};
 
export const useUpdateSkuMaster = () => {
  const queryClient = useQueryClient();
 
  return useMutation({
    mutationFn: ({ id, data }) => apiClient.patch(`/masters/sku/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.skuMasters.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.skuMasters.detail(variables.id) });
    },
  });
};
 
export const useDeleteSkuMaster = () => {
  const queryClient = useQueryClient();
 
  return useMutation({
    mutationFn: (id) => apiClient.delete(`/masters/sku/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.skuMasters.all }),
  });
};