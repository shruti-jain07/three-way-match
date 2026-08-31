"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useDocuments } from "@/hooks/useDocuments";

export default function DocumentDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const type = searchParams.get("type");

  const { data: documents, isLoading, isError, error } =
    useDocuments(type ? { type } : {});

  const document = documents?.find(
    (item) => item._id === params.id
  );

  if (isLoading) {
    return (
      <p className="px-8 py-10 text-sm text-[var(--color-ink-muted)]">
        Loading document...
      </p>
    );
  }

  if (isError || !document) {
    return (
      <p className="px-8 py-10 text-sm text-[var(--color-status-mismatch)]">
        {error?.message || "Document not found."}
      </p>
    );
  }
const documentType = document.documentType;
  return (
  <div className="mx-auto max-w-6xl px-8 py-10">
    <h1 className="text-xl font-semibold text-black">
      Document Details
    </h1>

    <div className="mt-6 rounded-xl border border-black/10 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
      <div className="grid gap-6 sm:grid-cols-2">

        <div>
          <p className="text-xs font-medium uppercase text-black/40">
            Document Type
          </p>
          <p className="mt-1 text-sm font-medium text-black">
            {documentType.toUpperCase()}
          </p>
        </div>

        {document.poNumber && (
          <div>
            <p className="text-xs font-medium uppercase text-black/40">
              PO Number
            </p>
            <p className="mt-1 text-sm font-medium text-black">
              {document.poNumber}
            </p>
          </div>
        )}

        {document.grnNumber && (
          <div>
            <p className="text-xs font-medium uppercase text-black/40">
              GRN Number
            </p>
            <p className="mt-1 text-sm font-medium text-black">
              {document.grnNumber}
            </p>
          </div>
        )}

        {document.invoiceNumber && (
          <div>
            <p className="text-xs font-medium uppercase text-black/40">
              Invoice Number
            </p>
            <p className="mt-1 text-sm font-medium text-black">
              {document.invoiceNumber}
            </p>
          </div>
        )}

        <div>
          <p className="text-xs font-medium uppercase text-black/40">
            Vendor
          </p>
          <p className="mt-1 text-sm font-medium text-black">
            {document.vendorName ||document.rawParsed?.vendorName|| "-"}
          </p>
        </div>

      </div>
    </div>

    {document.items?.length > 0 && (
      <div className="mt-6 overflow-hidden rounded-xl border border-black/10 bg-white">
        <div className="border-b border-black/10 px-6 py-4">
          <h2 className="font-semibold text-black">
            Items
          </h2>
        </div>

        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-black/10 text-xs uppercase text-black/40">
              <th className="px-6 py-3">Item Code</th>
              <th className="px-6 py-3">Description</th>
              <th className="px-6 py-3 text-right">Quantity</th>
            </tr>
          </thead>

          <tbody>
            {document.items.map((item, index) => (
              <tr
                key={item._id || index}
                className="border-b border-black/5 last:border-0"
              >
                <td className="px-6 py-4 font-mono">
                  {item.itemCode || "-"}
                </td>

                <td className="px-6 py-4">
                  {item.description || item.name || "-"}
                </td>

                <td className="px-6 py-4 text-right">
                  {item.receivedQuantity ?? item.quantity??"-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);
}