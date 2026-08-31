"use client";
 
import { useState } from "react";
import { useDocumentFile } from "@/hooks/useDocumentFile";
 
const ZOOM_STEP = 10;
const ZOOM_MIN = 50;
const ZOOM_MAX = 200;
 
export default function FilePreview({ documentId, documentType }) {
  const { url, mimeType, isLoading, error } = useDocumentFile(documentId, documentType);
  const [zoom, setZoom] = useState(100);
 
  const zoomOut = () => setZoom((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP));
  const zoomIn = () => setZoom((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP));
 
  return (
    <div className="flex h-full flex-col rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)]">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-2.5">
        <p className="text-sm font-medium text-[var(--color-ink)]">Original Document</p>
 
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={zoomOut}
            disabled={zoom <= ZOOM_MIN || !url}
            className="flex h-7 w-7 items-center justify-center rounded text-[var(--color-ink-muted)] hover:bg-[var(--color-page)] disabled:opacity-40"
            aria-label="Zoom out"
          >
            &minus;
          </button>
          <span className="w-10 text-center font-mono text-xs text-[var(--color-ink-muted)]">{zoom}%</span>
          <button
            type="button"
            onClick={zoomIn}
            disabled={zoom >= ZOOM_MAX || !url}
            className="flex h-7 w-7 items-center justify-center rounded text-[var(--color-ink-muted)] hover:bg-[var(--color-page)] disabled:opacity-40"
            aria-label="Zoom in"
          >
            +
          </button>
        </div>
      </div>
 
      <div className="flex flex-1 items-center justify-center overflow-auto bg-[var(--color-page)] p-4">
        {isLoading && <p className="text-sm text-[var(--color-ink-muted)]">Loading preview...</p>}
 
        {!isLoading && (error || !url) && (
          <div className="text-center">
            <p className="text-sm font-medium text-[var(--color-ink)]">Preview not available</p>
            <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
              The original file couldn&apos;t be loaded for this document.
            </p>
          </div>
        )}
 
        {!isLoading && url && mimeType === "application/pdf" && (
          <iframe
            src={url}
            title="Document preview"
            className="h-full w-full origin-top-left border-0"
            style={{ width: `${zoom}%`, height: `${zoom}%` }}
          />
        )}
 
        {!isLoading && url && mimeType?.startsWith("image/") && (
          <img
            src={url}
            alt="Document preview"
            className="max-w-none"
            style={{ width: `${zoom}%` }}
          />
        )}
      </div>
    </div>
  );
}