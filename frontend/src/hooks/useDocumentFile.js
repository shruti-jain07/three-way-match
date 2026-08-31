"use client";
 
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";
 
/**
 * GET /documents/:id/file requires a Bearer token, so we can't point an
 * <iframe>/<img> straight at the URL (the browser won't attach auth headers
 * to a plain src navigation). Instead: fetch the file as a blob through
 * apiClient (which does attach the header), then hand back an object URL
 * the <iframe>/<img> CAN use directly.
 */
export const useDocumentFile = (documentId, documentType) => {
  const [state, setState] = useState({ url: null, mimeType: null, isLoading: true, error: null });
 
  useEffect(() => {
    if (!documentId) {
      setState({ url: null, mimeType: null, isLoading: false, error: null });
      return;
    }
 
    let objectUrl = null;
    let isCancelled = false;
 
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
 
    const typeParam = documentType ? `?type=${documentType}` : "";
 
    apiClient
      .fetchFile(`/documents/${documentId}/file${typeParam}`)
      .then((blob) => {
        if (isCancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setState({ url: objectUrl, mimeType: blob.type, isLoading: false, error: null });
      })
      .catch((error) => {
        if (isCancelled) return;
        setState({ url: null, mimeType: null, isLoading: false, error });
      });
 
    return () => {
      isCancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [documentId, documentType]);
 
  return state;
};