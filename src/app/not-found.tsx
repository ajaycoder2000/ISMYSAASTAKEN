import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 sm:px-6 py-16">
      <div className="max-w-md w-full bg-[hsl(220,15%,10%)] border border-[hsl(220,10%,20%)] rounded-2xl p-6 sm:p-8 text-center relative overflow-hidden shadow-2xl">
        {/* Glow accent */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[hsl(42,95%,55%,0.08)] rounded-full blur-2xl pointer-events-none" />

        {/* Radar beacon badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[hsl(0,72%,50%,0.12)] border border-[hsl(0,72%,50%,0.3)] mb-5">
          <span className="w-2 h-2 rounded-full bg-[hsl(0,72%,55%)] animate-ping" />
          <span className="text-[10px] font-bold font-[family-name:var(--font-mono)] uppercase tracking-wider text-[hsl(0,72%,65%)]">
            RADAR TARGET UNREACHABLE
          </span>
        </div>

        {/* Main code */}
        <div className="font-[family-name:var(--font-mono)] text-5xl sm:text-6xl font-extrabold text-[hsl(40,20%,95%)] tracking-tight mb-2">
          404
        </div>
        <h1 className="text-sm sm:text-base font-bold font-[family-name:var(--font-mono)] uppercase tracking-widest text-[hsl(42,95%,55%)] mb-3">
          Sector Coordinates Not Found
        </h1>

        <p className="text-xs sm:text-sm text-[hsl(40,8%,55%)] font-[family-name:var(--font-inter)] leading-relaxed mb-6">
          No market validation report or telemetry exists at this address. The page may have been moved, deleted, or entered with an invalid permalink slug.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 bg-[hsl(42,95%,55%)] hover:bg-[hsl(42,95%,50%)] text-[hsl(220,15%,8%)] text-xs font-bold font-[family-name:var(--font-space-grotesk)] rounded-xl transition-all shadow-sm"
          >
            ← Return to Scanner
          </Link>
          <Link
            href="/#recent-scans"
            className="w-full sm:w-auto px-4 py-2.5 bg-[hsl(220,12%,14%)] hover:bg-[hsl(220,12%,20%)] border border-[hsl(220,10%,24%)] text-[hsl(40,20%,85%)] text-xs font-medium font-[family-name:var(--font-mono)] rounded-xl transition-all"
          >
            Browse Live Scans
          </Link>
        </div>
      </div>
    </div>
  );
}
