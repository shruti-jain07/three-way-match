"use client";
 
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { invalidatePoNumberQueries } from "@/lib/queryKeys";
 
export const useUploadDocument = () => {
  const queryClient = useQueryClient();
 
  return useMutation({
    mutationFn: ({ file, documentType }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", documentType);
 
      return apiClient.post("/documents/upload", formData);
    },
 
    onSuccess: (response) => {
      const poNumber = response?.data?.document?.poNumber;
 
      if (poNumber) {
        invalidatePoNumberQueries(queryClient, poNumber);
      } else {
        queryClient.invalidateQueries({ queryKey: ["documents"] });
      }
    },
  });
};