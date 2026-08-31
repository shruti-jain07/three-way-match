"use client";
 
import { useState } from "react";
import { useUploadDocument } from "@/hooks/useUploadDocument";
 
const DOCUMENT_TYPES = [
  { value: "po", label: "Purchase Order" },
  { value: "grn", label: "GRN" },
  { value: "invoice", label: "Invoice" },
];
 
const ACCEPTED_EXTENSIONS = ".pdf,.jpg,.jpeg,.png,.webp";
 
export default function UploadModal({ isOpen, onClose, onUploaded }) {
  const [documentType, setDocumentType] = useState("po");
  const [file, setFile] = useState(null);
  const [validationError, setValidationError] = useState(null);
 
  const uploadMutation = useUploadDocument();
 
  if (!isOpen) return null;
 
  const resetAndClose = () => {
    setFile(null);
    setDocumentType("po");
    setValidationError(null);
    uploadMutation.reset();
    onClose();
  };
 
  const handleSubmit = async (event) => {
    event.preventDefault();
    setValidationError(null);
 
    if (!file) {
      setValidationError("Choose a file to upload.");
      return;
    }
 
    try {
      const response = await uploadMutation.mutateAsync({ file, documentType });
      const poNumber = response?.data?.document?.poNumber;
      onUploaded?.(poNumber);
      resetAndClose();
    } catch (error) {
      
    }
  };
 
  const errorMessage = validationError || uploadMutation.error?.message;
  const isSubmitting = uploadMutation.isPending;
 
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] shadow-xl">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
          <h2 className="text-sm font-semibold text-[var(--color-ink)]">Upload document</h2>
          <button
            type="button"
            onClick={resetAndClose}
            disabled={isSubmitting}
            className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] disabled:opacity-50"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
 
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-5 py-5">
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-[var(--color-ink-muted)]">
              Document type
            </label>
            <select
              value={documentType}
              onChange={(event) => setDocumentType(event.target.value)}
              disabled={isSubmitting}
              className="mt-1.5 w-full rounded-md border border-[var(--color-border-strong)] bg-white px-3 py-2 text-sm text-[var(--color-ink)] focus:border-[var(--color-primary)] focus:outline-none"
            >
              {DOCUMENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
 
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-[var(--color-ink-muted)]">
              File
            </label>
            <input
              type="file"
              accept={ACCEPTED_EXTENSIONS}
              onChange={(event) => setFile(event.target.files?.[0] || null)}
              disabled={isSubmitting}
              className="mt-1.5 w-full rounded-md border border-dashed border-[var(--color-border-strong)] bg-white px-3 py-2 text-sm text-[var(--color-ink-muted)] file:mr-3 file:rounded file:border-0 file:bg-[var(--color-primary-soft)] file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-[var(--color-primary)]"
            />
            <p className="mt-1 text-xs text-[var(--color-ink-muted)]">PDF, JPEG, PNG, or WEBP - up to 10MB.</p>
          </div>
 
          {errorMessage && (
            <div
              className="rounded-md px-3 py-2 text-sm"
              style={{ backgroundColor: "var(--color-status-mismatch-soft)", color: "var(--color-status-mismatch)" }}
              role="alert"
            >
              {errorMessage}
            </div>
          )}
 
          {isSubmitting && (
            <p className="text-sm text-[var(--color-ink-muted)]">Uploading and parsing document...</p>
          )}
 
          <div className="mt-1 flex justify-end gap-2">
            <button
              type="button"
              onClick={resetAndClose}
              disabled={isSubmitting}
              className="rounded-md border border-[var(--color-border-strong)] px-4 py-2 text-sm font-medium text-[var(--color-ink)] hover:bg-[var(--color-page)] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
            >
              {isSubmitting ? "Uploading..." : "Upload"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}