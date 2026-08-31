'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Telemetry application error:', error);
  }, [error]);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 sm:px-6 py-16">
      <div className="max-w-md w-full bg-[hsl(220,15%,10%)] border border-[hsl(0,72%,55%,0.3)] rounded-2xl p-6 sm:p-8 text-center relative overflow-hidden shadow-2xl">
        {/* Amber alert icon */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[hsl(0,72%,50%,0.12)] border border-[hsl(0,72%,50%,0.3)] mb-4">
          <span className="w-2 h-2 rounded-full bg-[hsl(0,72%,55%)] animate-ping" />
          <span className="text-[10px] font-bold font-[family-name:var(--font-mono)] uppercase tracking-wider text-[hsl(0,72%,65%)]">
            SYSTEM ANOMALY DETECTED
          </span>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,95%)] mb-2">
          Telemetry Engine Interrupted
        </h1>

        <p className="text-xs sm:text-sm text-[hsl(40,8%,55%)] font-[family-name:var(--font-inter)] leading-relaxed mb-4">
          An unexpected error occurred while rendering this interface. Our telemetry has logged the incident.
        </p>

        {error.digest && (
          <div className="mb-6 p-2.5 bg-[hsl(220,12%,8%)] border border-[hsl(220,10%,18%)] rounded-lg text-left">
            <span className="text-[10px] font-mono text-[hsl(40,8%,40%)] block uppercase">Digest Signature</span>
            <code className="text-[11px] font-mono text-[hsl(42,95%,55%)] break-all">{error.digest}</code>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-5 py-2.5 bg-[hsl(42,95%,55%)] hover:bg-[hsl(42,95%,50%)] text-[hsl(220,15%,8%)] text-xs font-bold font-[family-name:var(--font-space-grotesk)] rounded-xl transition-all shadow-sm cursor-pointer"
          >
            ↻ Re-initialize Engine
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto px-4 py-2.5 bg-[hsl(220,12%,14%)] hover:bg-[hsl(220,12%,20%)] border border-[hsl(220,10%,24%)] text-[hsl(40,20%,85%)] text-xs font-medium font-[family-name:var(--font-mono)] rounded-xl transition-all"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
