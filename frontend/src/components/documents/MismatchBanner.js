import { reasonLabel, isHardReason } from "@/lib/reasonLabels";
 
export default function MismatchBanner({ reasons }) {
  if (!reasons || reasons.length === 0) {
    return null;
  }
 
  const hasHardReason = reasons.some(isHardReason);
  const color = hasHardReason ? "var(--color-status-mismatch)" : "var(--color-status-partial)";
  const soft = hasHardReason ? "var(--color-status-mismatch-soft)" : "var(--color-status-partial-soft)";
 
  return (
    <div
      className="mb-4 flex items-start gap-2 rounded-md px-4 py-3 text-sm"
      style={{ backgroundColor: soft, color }}
      role="alert"
    >
      <svg viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-4 w-4 flex-shrink-0">
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l6.28 11.164c.75 1.334-.213 2.987-1.744 2.987H3.72c-1.53 0-2.493-1.653-1.743-2.987L8.257 3.1zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 8a1 1 0 100-2 1 1 0 000 2z"
          clipRule="evenodd"
        />
      </svg>
      <p className="font-medium">{reasons.map(reasonLabel).join(" · ")}</p>
    </div>
  );
}