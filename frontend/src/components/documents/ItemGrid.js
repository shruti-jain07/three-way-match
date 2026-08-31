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
 
const COLUMNS = [
  "SKU Name",
  "SKU ID",
  "Mapped SKU Name",
  "ERP Code",
  "EAN",
  "HSN",
  "UOM",
  "PO Qty",
  "GRN Qty",
  "Invoice Qty",
  "Unit Price",
  "Unit MRP",
  "Gross Amount",
];
 
export default function ItemGrid({ matchedItems }) {
  if (!matchedItems || matchedItems.length === 0) {
    return <p className="px-5 py-6 text-sm text-[var(--color-ink-muted)]">No items to display.</p>;
  }
 
  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)]">
      <table className="w-full min-w-[1100px] text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)] text-xs uppercase tracking-wide text-[var(--color-ink-muted)]">
            {COLUMNS.map((column) => (
              <th key={column} className="whitespace-nowrap px-4 py-3 font-medium">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matchedItems.map((item) => {
            const isUnmapped = item.reasons.includes("unmapped_master_sku");
            const hasPriceMismatch = item.reasons.includes("price_mismatch");
            const hasMrpMismatch = item.reasons.includes("mrp_mismatch");
 
            const unitPrice = item.invoice.unitRates?.[0] ?? item.skuMaster?.agreedRate ?? null;
            const unitMrp = item.skuMaster?.mrp ?? item.grn.mrps?.[0] ?? item.invoice.mrps?.[0] ?? null;
            const grossQuantity = item.invoice.quantity ?? item.grn.quantity ?? item.po.quantity ?? 0;
            const grossAmount = unitPrice !== null ? grossQuantity * unitPrice : null;
 
            return (
              <tr key={item.matchKey} className="border-b border-[var(--color-border)] last:border-b-0">
                <td className="px-4 py-3 text-[var(--color-ink)]">{item.description || "-"}</td>
                <td className="px-4 py-3 font-mono text-[var(--color-ink)]">{item.itemCode || "-"}</td>
                <td className="px-4 py-3">
                  {isUnmapped ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-status-partial-soft)] px-2 py-0.5 text-xs font-medium text-[var(--color-status-partial)]">
                      Unmapped
                    </span>
                  ) : (
                    <span className="text-[var(--color-ink)]">{item.skuMaster?.name || "-"}</span>
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-[var(--color-ink-muted)]">
                  {item.skuMaster?.skuErpCode || "-"}
                </td>
                <td className="px-4 py-3 font-mono text-[var(--color-ink-muted)]">
                  {item.skuMaster?.eanCode || "-"}
                </td>
                <td className="px-4 py-3 font-mono text-[var(--color-ink-muted)]">
                  {item.skuMaster?.hsnCode || "-"}
                </td>
                <td className="px-4 py-3 text-[var(--color-ink-muted)]">{item.skuMaster?.uom || "-"}</td>
                <td className="px-4 py-3 text-right font-mono text-[var(--color-ink)]">
                  {formatNumber(item.po.quantity)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-[var(--color-ink)]">
                  {formatNumber(item.grn.quantity)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-[var(--color-ink)]">
                  {formatNumber(item.invoice.quantity)}
                </td>
                <td
                  className="px-4 py-3 text-right font-mono"
                  style={
                    hasPriceMismatch
                      ? { backgroundColor: "var(--color-status-mismatch-soft)", color: "var(--color-status-mismatch)" }
                      : { color: "var(--color-ink)" }
                  }
                >
                  {formatCurrency(unitPrice)}
                </td>
                <td
                  className="px-4 py-3 text-right font-mono"
                  style={
                    hasMrpMismatch
                      ? { backgroundColor: "var(--color-status-mismatch-soft)", color: "var(--color-status-mismatch)" }
                      : { color: "var(--color-ink)" }
                  }
                >
                  {formatCurrency(unitMrp)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-[var(--color-ink)]">
                  {formatCurrency(grossAmount)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}