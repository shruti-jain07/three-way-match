"use client";
 
const TABS = [
  { key: "po", label: "Purchase Order" },
  { key: "fulfillment", label: "Fulfillment" },
  { key: "delivery", label: "Delivery" },
  { key: "summary", label: "Summary" },
];
 
const CountBadge = ({ count }) => (
  <span className="ml-1.5 rounded-full bg-black/[0.06] px-1.5 py-0.5 text-[11px] font-medium leading-none">
    {count}
  </span>
);
 

export default function TopTabs({ activeTab, onChange, counts }) {
  return (
    <div className="flex gap-1 border-b border-[var(--color-border)] px-6">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        const count = counts?.[tab.key];
 
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`flex items-center border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
              isActive
                ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                : "border-transparent text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
            }`}
          >
            {tab.label}
            {typeof count === "number" && <CountBadge count={count} />}
          </button>
        );
      })}
    </div>
  );
}