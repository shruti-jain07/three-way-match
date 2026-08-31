"use client";
 
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useMatch } from "@/hooks/useMatch";
import { useSummary } from "@/hooks/useSummary";
import TopTabs from "@/components/layout/TopTabs";
import SubTabPills from "@/components/layout/SubTabPills";
import StatusBadge from "@/components/ui/statusBadge";
import StatCards from "@/components/summary/StatCards";
import AssociatedDocsTable from "@/components/summary/AssociatedDocstable";
import DocumentDetailPanel from "@/components/documents/DocumentDetailPanel";

import { useRouter } from "next/navigation";
export default function PoWorkspacePage() {
  const router = useRouter();
  const params = useParams();
  const poNumber = decodeURIComponent(params.poNumber);
 
  const [activeTab, setActiveTab] = useState("po");
  const [activeGrnId, setActiveGrnId] = useState(null);
  const [activeInvoiceId, setActiveInvoiceId] = useState(null);
 
  const matchQuery = useMatch(poNumber);
  const summaryQuery = useSummary(poNumber);
 
  const match = matchQuery.data;
 
  const grnPills = useMemo(
    () => (match?.grns || []).map((grn) => ({ _id: grn._id, number: grn.grnNumber, isDuplicate: grn.isDuplicate })),
    [match]
  );
 
  const invoicePills = useMemo(
    () =>
      (match?.invoices || []).map((invoice) => ({
        _id: invoice._id,
        number: invoice.invoiceNumber,
        isDuplicate: invoice.isDuplicate,
      })),
    [match]
  );
 
  const counts = {
    po: match?.primaryPo ? 1 : 0,
    fulfillment: invoicePills.length,
    delivery: grnPills.length,
  };
 
  const activeGrn = useMemo(() => {
    const id = activeGrnId || grnPills[0]?._id;
    return (match?.grns || []).find((grn) => grn._id === id) || null;
  }, [match, activeGrnId, grnPills]);
 
  const activeInvoice = useMemo(() => {
    const id = activeInvoiceId || invoicePills[0]?._id;
    return (match?.invoices || []).find((invoice) => invoice._id === id) || null;
  }, [match, activeInvoiceId, invoicePills]);
 
 
  const poReasons = useMemo(() => {
    if (!match?.primaryPo) return [];
    return (match.reasons || []).includes("duplicate_po") ? ["duplicate_po"] : [];
  }, [match]);
 
  const invoiceReasons = useMemo(() => {
    if (!activeInvoice || !match?.primaryPo) return [];
 
    const reasons = [];
    if (activeInvoice.isDuplicate) reasons.push("duplicate_document");
 
    if (
      activeInvoice.invoiceDate &&
      new Date(activeInvoice.invoiceDate).getTime() > new Date(match.primaryPo.poDate).getTime()
    ) {
      reasons.push("invoice_date_after_po_date");
    }
 
    return reasons;
  }, [activeInvoice, match]);
 
  const grnReasons = useMemo(() => {
    if (!activeGrn) return [];
    return activeGrn.isDuplicate ? ["duplicate_document"] : [];
  }, [activeGrn]);
 
  if (matchQuery.isLoading) {
    return <p className="px-8 py-10 text-sm text-[var(--color-ink-muted)]">Loading match result...</p>;
  }
 
  if (matchQuery.isError) {
    return (
      <p className="px-8 py-10 text-sm text-[var(--color-status-mismatch)]">
        {matchQuery.error?.message || "Could not load this purchase order."}
      </p>
    );
  }
 
  return (
    
    <div className="flex min-h-screen flex-col bg-white">
      <button 
      onClick={() => router.back()}
      className="absolute right-15 top-0 ">
  ← Back
</button>
      <div className="flex items-center justify-between px-6 pt-6">
        <div>
          <h1 className="font-mono text-lg font-semibold text-[var(--color-ink)]">{poNumber}</h1>
          <p className="mt-0.5 text-sm text-[var(--color-ink-muted)]">{match?.primaryPo?.vendorName}</p>
        </div>
        <StatusBadge status={match?.status} />
      </div>
 
      <div className="mt-4">
        <TopTabs activeTab={activeTab} onChange={setActiveTab} counts={counts} />
      </div>
 
      {activeTab === "delivery" && (
        <SubTabPills
          items={grnPills}
          activeId={activeGrnId || grnPills[0]?._id}
          onChange={setActiveGrnId}
          labelPrefix="GRN"
        />
      )}
 
      {activeTab === "fulfillment" && (
        <SubTabPills
          items={invoicePills}
          activeId={activeInvoiceId || invoicePills[0]?._id}
          onChange={setActiveInvoiceId}
          labelPrefix="Invoice"
        />
      )}
 
      <div className="flex-1 px-6 py-6">
        {activeTab === "po" && (
          <DocumentDetailPanel
            documentType="po"
            document={match?.primaryPo}
            matchedItems={match?.matchedItems}
            reasons={poReasons}
          />
        )}
 
        {activeTab === "fulfillment" && (
          <DocumentDetailPanel
            documentType="invoice"
            document={activeInvoice}
            matchedItems={match?.matchedItems}
            reasons={invoiceReasons}
          />
        )}
 
        {activeTab === "delivery" && (
          <DocumentDetailPanel
            documentType="grn"
            document={activeGrn}
            matchedItems={match?.matchedItems}
            reasons={grnReasons}
          />
        )}
 
        {activeTab === "summary" && (
          <div className="flex flex-col gap-6">
            {summaryQuery.isLoading && (
              <p className="text-sm text-[var(--color-ink-muted)]">Loading summary...</p>
            )}
 
            {summaryQuery.isError && (
              <p className="text-sm text-[var(--color-status-mismatch)]">
                {summaryQuery.error?.message || "Could not load the summary."}
              </p>
            )}
 
            {summaryQuery.data && (
              <>
                <StatCards
                  poAmount={summaryQuery.data.poAmount}
                  totalInvoiced={summaryQuery.data.totalInvoiced}
                  totalReceived={summaryQuery.data.totalReceived}
                />
                <AssociatedDocsTable documents={summaryQuery.data.documents} />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}