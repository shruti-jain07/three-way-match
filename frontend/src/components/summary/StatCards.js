const formatCurrency = (value) => {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
};
 
const StatCard = ({ label, value }) => (
  <div className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
    <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-ink-muted)]">{label}</p>
    <p className="mt-2 font-mono text-2xl font-semibold text-[var(--color-ink)]">{formatCurrency(value)}</p>
  </div>
);
 
export default function StatCards({ poAmount, totalInvoiced, totalReceived }) {
  return (
    <div className="flex gap-4">
      <StatCard label="PO Amount" value={poAmount} />
      <StatCard label="Total Invoiced" value={totalInvoiced} />
      <StatCard label="Total Received" value={totalReceived} />
    </div>
  );
}