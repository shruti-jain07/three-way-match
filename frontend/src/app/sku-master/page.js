"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDeleteSkuMaster, useSkuMasters } from "@/hooks/useSkuMasters";

export default function SkuMasterPage() {
  const router = useRouter();
  const { data: skus, isLoading, isError, error } = useSkuMasters();
  const deleteMutation = useDeleteSkuMaster();

  const [deleteError, setDeleteError] = useState(null);

  const handleDelete = async (sku) => {
    if (
      !window.confirm(`Delete SKU Master "${sku.name}"? This cannot be undone.`)
    ) {
      return;
    }

    setDeleteError(null);

    try {
      await deleteMutation.mutateAsync(sku._id);
    } catch (err) {
      setDeleteError(err.message || "Failed to delete SKU Master");
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-8 py-10 ">
      <button onClick={() => router.back()} className="mb-5">
        ← Back
      </button>
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
          <h1 className="text-lg font-semibold text-black">SKU Master</h1>

          <p className="mt-1 text-sm text-black/50">
            Manage the catalogue used to resolve item codes across PO, GRN, and
            Invoice documents.
          </p>
        </div>

        <Link
          href="/sku-master/new"
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
          New SKU
        </Link>
      </div>

      {deleteError && (
        <div
          className="mt-4 rounded-md px-3 py-2 text-sm"
          style={{
            backgroundColor: "var(--color-status-mismatch-soft)",
            color: "var(--color-status-mismatch)",
          }}
        >
          {deleteError}
        </div>
      )}

      {/* SKU List */}
      <div className="mt-6 overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)]">
        {isLoading && (
          <p className="px-5 py-6 text-sm text-[var(--color-ink-muted)]">
            Loading SKU Masters...
          </p>
        )}

        {isError && (
          <p className="px-5 py-6 text-sm text-[var(--color-status-mismatch)]">
            {error?.message || "Could not load SKU Masters."}
          </p>
        )}

        {!isLoading && !isError && skus?.length === 0 && (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-[var(--color-ink)]">
              No SKU Masters yet
            </p>

            <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
              Add one so uploaded documents can resolve their item codes.
            </p>
          </div>
        )}

        {!isLoading && !isError && skus?.length > 0 && (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-xs uppercase tracking-wide text-[var(--color-ink-muted)]">
                <th className="px-5 py-3 font-medium">ERP Code</th>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">EAN</th>
                <th className="px-5 py-3 font-medium">UOM</th>
                <th className="px-5 py-3 text-right font-medium">
                  Agreed Rate
                </th>
                <th className="px-5 py-3 text-right font-medium">MRP</th>
                <th className="px-5 py-3 font-medium" />
              </tr>
            </thead>

            <tbody>
              {skus.map((sku) => (
                <tr
                  key={sku._id}
                  className="border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-page)]"
                >
                  <td className="px-5 py-3 font-mono text-[var(--color-ink)]">
                    {sku.skuErpCode}
                  </td>

                  <td className="px-5 py-3 text-[var(--color-ink)]">
                    {sku.name}
                  </td>

                  <td className="px-5 py-3 font-mono text-[var(--color-ink-muted)]">
                    {sku.eanCode || "-"}
                  </td>

                  <td className="px-5 py-3 text-[var(--color-ink-muted)]">
                    {sku.uom || "-"}
                  </td>

                  <td className="px-5 py-3 text-right font-mono text-[var(--color-ink)]">
                    {sku.agreedRate ?? "-"}
                  </td>

                  <td className="px-5 py-3 text-right font-mono text-[var(--color-ink)]">
                    {sku.mrp ?? "-"}
                  </td>

                  <td className="px-5 py-3 text-right whitespace-nowrap">
                    <Link
                      href={`/sku-master/${sku._id}`}
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
                      Edit
                    </Link>
                    <Link
                      href={`/sku-master/${sku._id}`}
                      className="
                        ml-2 inline-flex items-center
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
                    <button
                      type="button"
                      onClick={() => handleDelete(sku)}
                      className="
                        ml-2 inline-flex items-center
                        rounded-md border border-red-200
                        px-3 py-1.5
                        text-sm font-medium text-red-600
                        transition-all duration-200

                        hover:-translate-y-0.5
                        hover:bg-red-600
                        hover:text-white
                        hover:shadow-md

                        active:translate-y-0
                      "
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
