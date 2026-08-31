"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../providers/AuthProvider";

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M3 13.5h7.5V21H3v-7.5zm10.5-10.5H21v7.5h-7.5V3zM13.5 13.5H21V21h-7.5v-7.5zM3 3h7.5v7.5H3V3z"
      />
    ),
  },
  {
    href: "/documents",
    label: "Documents",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M6 4.5h8.25L19.5 9.75V19.5a1.5 1.5 0 01-1.5 1.5H6a1.5 1.5 0 01-1.5-1.5V6A1.5 1.5 0 016 4.5z"
      />
    ),
  },
  {
    href: "/sku-master",
    label: "SKU Master",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M4 7.5l8-4 8 4-8 4-8-4zm0 0v9l8 4m0-13v13m8-13v9l-8 4"
      />
    ),
  },
];

const IconRailButton = ({ href, label, icon, isActive }) => (
  <Link
    href={href}
    title={label}
    className={`flex h-11 w-11 items-center justify-center rounded-md transition-colors ${
      isActive
        ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
        : "text-[var(--color-ink-muted)] hover:bg-[var(--color-page)] hover:text-[var(--color-ink)]"
    }`}
  >
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className="h-5 w-5"
    >
      {icon}
    </svg>
    <span className="sr-only">{label}</span>
  </Link>
);

export default function AppShell({ children }) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-[var(--color-page)]">
      <aside className="flex w-16 flex-shrink-0 flex-col items-center border-r border-[var(--color-border)] bg-[var(--color-panel)] py-4">
        <div
          className="mb-6 h-8 w-8 rounded bg-[var(--color-primary)]"
          aria-hidden="true"
        />

        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <IconRailButton
              key={item.href}
              {...item}
              isActive={
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href)
              }
            />
          ))}
        </nav>

        <div className="mt-auto">
          <button
            type="button"
            onClick={logout}
            title="Sign out"
            className="flex h-11 w-11 items-center justify-center rounded-md text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-page)] hover:text-[var(--color-status-mismatch)]"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M18 12H8.25m9.75 0l-3-3m3 3l-3 3"
              />
            </svg>
            <span className="sr-only">Sign out</span>
          </button>
        </div>
        
      </aside>

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
