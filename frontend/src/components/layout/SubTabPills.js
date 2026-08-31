"use client";
 
export default function SubTabPills({ items, activeId, onChange, labelPrefix }) {
  if (!items || items.length === 0) {
    return null;
  }
 
  return (
    <div className="flex flex-wrap gap-2 border-b border-[var(--color-border)] bg-[var(--color-page)] px-6 py-3">
      {items.map((item) => {
        const isActive = item._id === activeId;
 
        return (
          <button
            key={item._id}
            type="button"
            onClick={() => onChange(item._id)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              isActive
                ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                : "border-[var(--color-border-strong)] bg-[var(--color-panel)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
            }`}
          >
            {labelPrefix}: {item.number}
            {item.isDuplicate && (
              <span className={`ml-1.5 ${isActive ? "text-white/80" : "text-[var(--color-status-mismatch)]"}`}>
                (Duplicate)
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}