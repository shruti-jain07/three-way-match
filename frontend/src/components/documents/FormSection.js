const ACCENT_COLORS = {
  default: "var(--color-primary)",
  success: "var(--color-status-matched)",
  warning: "var(--color-status-partial)",
  danger: "var(--color-status-mismatch)",
};
 
export function Field({ label, value, mono = false }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-ink-muted)]">{label}</p>
      <p className={`mt-0.5 text-sm text-[var(--color-ink)] ${mono ? "font-mono" : ""}`}>
        {value === null || value === undefined || value === "" ? "-" : value}
      </p>
    </div>
  );
}
 
export default function FormSection({ title, accent = "default", children }) {
  return (
    <div className="flex overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)]">
      <div className="w-1 flex-shrink-0" style={{ backgroundColor: ACCENT_COLORS[accent] }} aria-hidden="true" />
      <div className="flex-1 p-5">
        {title && <h2 className="mb-4 text-sm font-semibold text-[var(--color-ink)]">{title}</h2>}
        <div className="grid grid-cols-2 gap-x-4 gap-y-4">{children}</div>
      </div>
    </div>
  );
}