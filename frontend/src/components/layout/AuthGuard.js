"use client";
 
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../providers/AuthProvider";
 
export default function AuthGuard({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
 
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-page)]">
        <p className="text-sm text-[var(--color-ink-muted)]">Loading...</p>
      </div>
    );
  }
 
  return children;
}