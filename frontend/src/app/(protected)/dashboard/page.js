"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDocuments } from "@/hooks/useDocuments";
import UploadModal from "@/components/upload/uploadModal";

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function HomePage() {
  const {
    data: purchaseOrders,
    isLoading,
    isError,
    error,
  } = useDocuments({ type: "po" });
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const router = useRouter();

  const handleUploaded = (poNumber) => {
    if (poNumber) {
      router.push(`/po/${encodeURIComponent(poNumber)}`);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-12 py-14 mt-10 bg-[#FAF9F6] rounded-xl">
      <div
        className="
    flex items-center justify-between
    rounded-xl border border-black/10
    bg-white px-6 py-5
    shadow-[0_8px_30px_rgba(0,0,0,0.06)]
  "
      >
        <div>
          <h1 className="text-lg font-semibold text-black">Purchase Orders</h1>

          <p className="mt-1 text-sm text-black/50">
            Review and reconcile your documents.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsUploadOpen(true)}
          className="
      rounded-lg border border-black
      bg-white px-4 py-2.5
      text-sm font-medium text-black
      transition-all duration-200

      hover:-translate-y-0.5
      hover:bg-black
      hover:text-white
      hover:shadow-lg

      active:translate-y-0
    "
        >
          Upload document
        </button>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)]">
        {isLoading && (
          <p className="px-5 py-6 text-sm text-[var(--color-ink-muted)]">
            Loading purchase orders...
          </p>
        )}

        {isError && (
          <p className="px-5 py-6 text-sm text-[var(--color-status-mismatch)]">
            {error?.message || "Could not load purchase orders."}
          </p>
        )}

        {!isLoading && !isError && purchaseOrders?.length === 0 && (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-[var(--color-ink)]">
              No purchase orders yet
            </p>
            <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
              Upload a PO to start reconciling it against GRNs and Invoices.
            </p>
          </div>
        )}

        {!isLoading && !isError && purchaseOrders?.length > 0 && (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-xs uppercase tracking-wide text-[var(--color-ink-muted)]">
                <th className="px-5 py-3 font-medium">PO Number</th>
                <th className="px-5 py-3 font-medium">Vendor</th>
                <th className="px-5 py-3 font-medium">PO Date</th>
                <th className="px-5 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {purchaseOrders.map((po) => (
                <tr
                  key={po._id}
                  className="border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-page)]"
                >
                  <td className="px-5 py-3 font-mono text-[var(--color-ink)]">
                    {po.poNumber}
                  </td>
                  <td className="px-5 py-3 text-[var(--color-ink)]">
                    {po.vendorName}
                  </td>
                  <td className="px-5 py-3 text-[var(--color-ink-muted)]">
                    {formatDate(po.poDate)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/po/${encodeURIComponent(po.poNumber)}`}
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
                      Review →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploaded={handleUploaded}
      />
    </div>
  );
}
