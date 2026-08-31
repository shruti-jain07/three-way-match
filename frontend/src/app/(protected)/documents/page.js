"use client";

import { useState } from "react";
import Link from "next/link";
import { useDocuments } from "@/hooks/useDocuments";

const TABS = [
{ id: "", label: "All Documents" },
{ id: "po", label: "Purchase Orders" },
{ id: "grn", label: "GRNs" },
{ id: "invoice", label: "Invoices" },
];

const formatDate = (value) => {
if (!value) return "-";

return new Date(value).toLocaleDateString("en-IN", {
day: "2-digit",
month: "short",
year: "numeric",
});
};

const getDocumentNumber = (document, type) => {
if (type === "po") return document.poNumber || "-";
if (type === "grn") return document.grnNumber || "-";
if (type === "invoice") return document.invoiceNumber || "-";

return "-";
};

const getDocumentLabel = (type) => {
if (type === "po") return "PO";
if (type === "grn") return "GRN";
if (type === "invoice") return "Invoice";

return "-";
};

export default function DocumentsPage() {
const [activeType, setActiveType] = useState("");

const {
data: documents,
isLoading,
isError,
error,
} = useDocuments(
activeType ? { type: activeType } : {}
);
console.log("Active Type:", activeType);
console.log("Documents:", documents);
return ( <div className="mx-auto max-w-6xl px-8 py-10">


  {/* Header */}
  <div
    className="
      flex items-center justify-between
      rounded-xl border border-black/10
      bg-white px-6 py-5
      shadow-[0_8px_30px_rgba(0,0,0,0.06)]
    "
  >
    <div>
      <h1 className="text-lg font-semibold text-black">
        Documents
      </h1>

      <p className="mt-1 text-sm text-black/50">
        View and manage uploaded purchase orders, GRNs, and invoices.
      </p>
    </div>

  
  </div>

  {/* Tabs */}
  <div className="mt-6 flex flex-wrap gap-2">
    {TABS.map((tab) => {
      const isActive = activeType === tab.id;

      return (
        <button
          key={tab.id}
          type="button"
          onClick={() => setActiveType(tab.id)}
          className={`
            rounded-lg border px-4 py-2
            text-sm font-medium
            transition-all duration-200
            ${
              isActive
                ? "border-black bg-black text-white"
                : "border-black/10 bg-white text-black/60 hover:border-black hover:text-black"
            }
          `}
        >
          {tab.label}
        </button>
      );
    })}
  </div>

  {/* Documents Table */}
  <div className="mt-6 overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)]">

    {isLoading && (
      <p className="px-5 py-6 text-sm text-[var(--color-ink-muted)]">
        Loading documents...
      </p>
    )}

    {isError && (
      <p className="px-5 py-6 text-sm text-[var(--color-status-mismatch)]">
        {error?.message || "Could not load documents."}
      </p>
    )}

    {!isLoading && !isError && documents?.length === 0 && (
      <div className="px-5 py-10 text-center">
        <p className="text-sm text-[var(--color-ink)]">
          No documents found
        </p>

        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          Upload a document to start managing your purchase orders, GRNs,
          and invoices.
        </p>
      </div>
    )}

    {!isLoading && !isError && documents?.length > 0 && (
      <table className="w-full text-left text-sm">

        <thead>
          <tr className="border-b border-[var(--color-border)] text-xs uppercase tracking-wide text-[var(--color-ink-muted)]">

            <th className="px-5 py-3 font-medium">
              Document Number
            </th>

            <th className="px-5 py-3 font-medium">
              Type
            </th>

            <th className="px-5 py-3 font-medium">
              PO Number
            </th>

            <th className="px-5 py-3 font-medium">
              Vendor
            </th>

            <th className="px-5 py-3 font-medium">
              Date
            </th>

            <th className="px-5 py-3" />

          </tr>
        </thead>

        <tbody>
          {documents.map((document) => {
            const documentType =
              document.documentType || activeType;
console.log(documents);
            return (
              <tr
                key={document._id}
                className="
                  border-b border-[var(--color-border)]
                  last:border-b-0
                  hover:bg-[var(--color-page)]
                "
              >

                <td className="px-5 py-3 font-mono text-[var(--color-ink)]">
                  {getDocumentNumber(
                    document,
                    documentType
                  )}
                </td>

                <td className="px-5 py-3">
                  <span className="rounded-full bg-black/5 px-2.5 py-1 text-xs font-medium text-black/60">
                    {getDocumentLabel(documentType)}
                  </span>
                </td>

                <td className="px-5 py-3 text-[var(--color-ink-muted)]">
                  {document.poNumber || "-"}
                </td>

                <td className="px-5 py-3 text-[var(--color-ink)]">
                  {document.vendorName || "-"}
                </td>

                <td className="px-5 py-3 text-[var(--color-ink-muted)]">
                  {formatDate(
                    document.poDate ||
                    document.grnDate ||
                    document.invoiceDate
                  )}
                </td>

                <td className="px-5 py-3 text-right">
                  <Link
                    href={`/documents/${document._id}?type=${documentType}`}
                    className="
                      inline-flex items-center
                      rounded-md border border-black/15
                      bg-white px-3 py-1.5
                      text-sm font-medium text-black
                      transition-all duration-200

                      hover:-translate-y-0.5
                      hover:border-black
                      hover:bg-black
                      hover:text-white
                      hover:shadow-md

                      active:translate-y-0
                    "
                  >
                    View
                  </Link>
                </td>

              </tr>
            );
          })}
        </tbody>

      </table>
    )}
  </div>
</div>


);
}
