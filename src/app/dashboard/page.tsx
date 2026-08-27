'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ScanHistory from '@/components/ScanHistory';
import ScanningIndicator from '@/components/ScanningIndicator';
import ScanDiff from '@/components/ScanDiff';
import TelemetryGauge from '@/components/TelemetryGauge';

interface UserData {
  id: string;
  email: string;
  plan: 'free' | 'pro' | 'sprint';
  scansUsedThisMonth: number;
  scansRemaining: number;
  scansResetDate: string;
}

interface ScanEntry {
  _id: string;
  ideaText: string;
  saturationScore: 'low' | 'medium' | 'high';
  shareSlug: string;
  competitorCount: number;
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [scans, setScans] = useState<ScanEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpgradeToast, setShowUpgradeToast] = useState(false);

  useEffect(() => {
    // Check for upgrade success
    const params = new URLSearchParams(window.location.search);
    if (params.get('upgraded') === 'true') {
      setShowUpgradeToast(true);
      setTimeout(() => setShowUpgradeToast(false), 5000);
      // Clean URL
      window.history.replaceState({}, '', '/dashboard');
    }

    // Fetch session and scan history
    Promise.all([
      fetch('/api/auth/session').then((r) => r.json()),
      fetch('/api/scans').then((r) => r.json()).catch(() => ({ scans: [] })),
    ]).then(([sessionData, scansData]) => {
      if (!sessionData.user) {
        router.push('/sign-in');
        return;
      }
      setUser(sessionData.user);
      setScans(scansData.scans || []);
      setLoading(false);
    });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center">
        <ScanningIndicator size="lg" className="mb-3" />
        <p className="text-xs font-[family-name:var(--font-mono)] text-[hsl(40,8%,50%)]">Loading dashboard telemetry...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] px-4 sm:px-6 py-10 sm:py-16">
      <div className="w-full max-w-2xl mx-auto space-y-8">
        {/* Upgrade toast */}
        {showUpgradeToast && (
          <div className="p-4 bg-[hsl(145,60%,45%,0.08)] border border-[hsl(145,60%,45%,0.2)] rounded-xl animate-fade-in">
            <p className="text-sm text-[hsl(145,60%,55%)] font-[family-name:var(--font-inter)] font-medium">
              🎉 Welcome to Pro! You now have unlimited scans.
            </p>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,94%)]">
              Founder Dashboard
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-sm text-[hsl(40,8%,55%)] font-[family-name:var(--font-inter)]">
                {user.email}
              </span>
              <span className={`text-xs font-[family-name:var(--font-mono)] uppercase tracking-widest px-2.5 py-0.5 rounded-full font-bold ${
                user.plan === 'pro'
                  ? 'text-[hsl(42,95%,55%)] bg-[hsl(42,95%,55%,0.15)] border border-[hsl(42,95%,55%,0.3)]'
                  : 'text-[hsl(40,8%,55%)] bg-[hsl(220,10%,18%)] border border-[hsl(220,10%,24%)]'
              }`}>
                {user.plan}
              </span>
            </div>
          </div>

          <Link
            href="/settings"
            className="self-start sm:self-auto px-4 py-2 bg-[hsl(220,12%,14%)] hover:bg-[hsl(220,12%,18%)] border border-[hsl(220,10%,22%)] text-[hsl(40,20%,88%)] hover:text-[hsl(42,95%,55%)] text-xs font-[family-name:var(--font-mono)] font-bold rounded-xl transition-all flex items-center gap-1.5"
          >
            ⚙️ Account Settings
          </Link>
        </div>

        {/* High-Tech Telemetry Usage Battery Gauge */}
        <TelemetryGauge
          plan={user.plan === 'pro' ? 'pro' : 'free'}
          scansUsed={user.scansUsedThisMonth}
          scansLimit={3}
          onUpgrade={() => router.push('/pricing')}
          onBilling={() => router.push('/pricing')}
        />

        {/* Market Shift Tracker (Scan Diff) */}
        <div>
          <h2 className="text-xs font-[family-name:var(--font-mono)] uppercase tracking-[0.2em] text-[hsl(40,8%,55%)] mb-3">
            Market Shift Radar
          </h2>
          <ScanDiff
            ideaText={scans[0]?.ideaText || "AI that turns meeting notes into Linear tickets"}
            comparedTo="vs. scan from 14 days ago"
          />
        </div>

        {/* Scan history */}
        <div>
          <h2 className="text-xs font-[family-name:var(--font-mono)] uppercase tracking-[0.2em] text-[hsl(40,8%,55%)] mb-4">
            Your Scans
          </h2>
          <ScanHistory scans={scans} />
        </div>

        {/* Quick scan CTA */}
        <div className="pt-4 text-center">
          <Link
            href="/"
            className="text-xs sm:text-sm text-[hsl(42,95%,55%)] hover:text-[hsl(42,95%,65%)] transition-colors font-[family-name:var(--font-space-grotesk)] font-bold"
          >
            ← Run a new live scan
          </Link>
        </div>
      </div>
    </div>
  );
}
