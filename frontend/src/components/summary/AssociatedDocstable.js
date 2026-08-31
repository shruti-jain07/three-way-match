import StatusBadge from "@/components/ui/statusBadge";
 
const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};
 
const formatNumber = (value) => {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat("en-IN").format(value);
};
 
const formatCurrency = (value) => {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(
    value
  );
};
 
export default function AssociatedDocsTable({ documents }) {
  if (!documents || documents.length === 0) {
    return (
      <p className="px-5 py-6 text-sm text-[var(--color-ink-muted)]">No linked GRNs or Invoices yet.</p>
    );
  }
 
  return (
    <div className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)]">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)] text-xs uppercase tracking-wide text-[var(--color-ink-muted)]">
            <th className="px-5 py-3 font-medium">Type</th>
            <th className="px-5 py-3 font-medium">Document No.</th>
            <th className="px-5 py-3 font-medium">Date</th>
            <th className="px-5 py-3 text-right font-medium">Quantity</th>
            <th className="px-5 py-3 text-right font-medium">Amount</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((row, index) => {
            const isCurrentStatus = row.type === "Current Status";
 
            if (isCurrentStatus) {
              return (
                <tr key="current-status" className="bg-[var(--color-page)] font-medium">
                  <td className="px-5 py-3 text-[var(--color-ink)]" colSpan={2}>
                    Current Status
                  </td>
                  <td className="px-5 py-3 text-[var(--color-ink-muted)]">
                    <StatusBadge status={row.matchStatus} />
                  </td>
                  <td className="px-5 py-3 text-right font-mono text-[var(--color-ink)]">
                    Received {formatNumber(row.cumulativeReceivedQuantity)} / Invoiced{" "}
                    {formatNumber(row.cumulativeInvoicedQuantity)}
                  </td>
                  <td className="px-5 py-3 text-right font-mono text-[var(--color-ink)]">
                    Pending {formatNumber(row.pendingDeliveryQuantity)}
                  </td>
                </tr>
              );
            }
 
            return (
              <tr
                key={`${row.type}-${row.documentNumber}-${index}`}
                className="border-b border-[var(--color-border)] last:border-b-0"
              >
                <td className="px-5 py-3 text-[var(--color-ink)]">{row.type}</td>
                <td className="px-5 py-3 font-mono text-[var(--color-ink)]">
                  {row.documentNumber}
                  {row.isDuplicate && (
                    <span className="ml-2 rounded-full bg-[var(--color-status-mismatch-soft)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-status-mismatch)]">
                      Duplicate
                    </span>
                  )}
                </td>
                <td className="px-5 py-3 text-[var(--color-ink-muted)]">{formatDate(row.date)}</td>
                <td className="px-5 py-3 text-right font-mono text-[var(--color-ink)]">
                  {formatNumber(row.quantity)}
                </td>
                <td className="px-5 py-3 text-right font-mono text-[var(--color-ink)]">
                  {formatCurrency(row.amount)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}