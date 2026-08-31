"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../providers/AuthProvider";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      await login();
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Could not sign in. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 py-10">
      <section className="grid w-full max-w-4xl overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_16px_45px_rgba(0,0,0,0.08)] md:grid-cols-2">
        
        {/* Left side */}
        <div className="flex min-h-[430px] flex-col justify-between bg-black p-10 text-white">
          <div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/20">
              <span className="text-sm">↗</span>
            </div>

            <div className="mt-14">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/45">
                Procurement Workspace
              </p>

              <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
                Welcome to the
                <br />
                Three-Way Match
                <br />
                Engine.
              </h1>

              <p className="mt-5 max-w-xs text-sm leading-6 text-white/55">
                Review purchase orders, invoices, and GRNs in one
                reconciliation workspace.
              </p>
            </div>
          </div>

          <div className="text-xs tracking-wide text-white/35">
            PO · INVOICE · GRN
          </div>
        </div>

        {/* Right side */}
        <div className="flex min-h-[430px] items-center bg-white p-10">
          <div className="w-full">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-black/40">
              Workspace Access
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-black">
              Sign in
            </h2>

            <p className="mt-3 max-w-sm text-sm leading-6 text-black/50">
              Continue to access documents, matching results, and reconciliation
              details.
            </p>

            <div className="my-8 h-px w-full bg-black/10" />

            <button
              type="button"
              onClick={handleLogin}
              disabled={isSubmitting}
              className="
                flex w-full items-center justify-between
                rounded-lg border border-black
                bg-white px-5 py-3.5
                text-sm font-medium text-black
                transition-all duration-200

                hover:-translate-y-0.5
                hover:bg-black
                hover:text-white
                hover:shadow-lg

                active:translate-y-0

                disabled:cursor-not-allowed
                disabled:opacity-50
                disabled:hover:translate-y-0
              "
            >
              <span>
                {isSubmitting ? "Signing in..." : "Sign in to workspace"}
              </span>

              <span className="text-base">→</span>
            </button>

            {error && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <p className="mt-6 text-xs text-black/35">
              Three-Way Match Engine
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}