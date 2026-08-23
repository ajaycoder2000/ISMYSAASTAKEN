'use client';
import { useState, useEffect } from 'react';

export default function LivePulse() {
  const [stats, setStats] = useState<{ scans24h: number; scansTotal: number } | null>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  if (!stats || stats.scansTotal === 0) return null;

  return (
    <div className="flex items-center gap-2 text-xs font-[family-name:var(--font-mono)] text-[hsl(40,8%,45%)]">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[hsl(145,60%,45%)] opacity-50" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[hsl(145,60%,45%)]" />
      </span>
      {stats.scans24h > 0
        ? `${stats.scans24h} ideas scanned in the last 24h`
        : `${stats.scansTotal.toLocaleString()} ideas scanned`
      }
    </div>
  );
}
