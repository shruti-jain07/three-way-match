const STATUS_CONFIG = {
  matched: { label: "Matched", color: "var(--color-status-matched)", soft: "var(--color-status-matched-soft)" },
  partially_matched: {
    label: "Partially Matched",
    color: "var(--color-status-partial)",
    soft: "var(--color-status-partial-soft)",
  },
  mismatch: { label: "Mismatch", color: "var(--color-status-mismatch)", soft: "var(--color-status-mismatch-soft)" },
  insufficient_documents: {
    label: "Insufficient Documents",
    color: "var(--color-status-insufficient)",
    soft: "var(--color-status-insufficient-soft)",
  },
};
 
export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.insufficient_documents;
 
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ color: config.color, backgroundColor: config.soft }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: config.color }} aria-hidden="true" />
      {config.label}
    </span>
  );
}