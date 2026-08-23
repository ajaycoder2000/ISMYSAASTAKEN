'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ScanHistory from '@/components/ScanHistory';
import UsageBar from '@/components/UsageBar';
import ScanningIndicator from '@/components/ScanningIndicator';

interface UserData {
  id: string;
  email: string;
  plan: string;
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
      fetch('/api/auth/session').then(r => r.json()),
      fetch('/api/scans').then(r => r.json()).catch(() => ({ scans: [] })),
    ]).then(([sessionData, scansData]) => {
      if (!sessionData.user) {
        router.push('/login');
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

  const FREE_MONTHLY_CAP = 3;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] px-4 sm:px-6 py-10 sm:py-16">
      <div className="w-full max-w-2xl mx-auto">
        {/* Upgrade toast */}
        {showUpgradeToast && (
          <div className="mb-6 p-4 bg-[hsl(145,60%,45%,0.08)] border border-[hsl(145,60%,45%,0.2)] rounded-lg animate-fade-in">
            <p className="text-sm text-[hsl(145,60%,55%)] font-[family-name:var(--font-inter)] font-medium">
              🎉 Welcome to Pro! You now have unlimited scans.
            </p>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,92%)]">
            Dashboard
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-sm text-[hsl(40,8%,55%)] font-[family-name:var(--font-inter)]">
              {user.email}
            </span>
            <span className={`text-xs font-[family-name:var(--font-mono)] uppercase tracking-widest px-2 py-0.5 rounded ${
              user.plan === 'pro'
                ? 'text-[hsl(42,95%,55%)] bg-[hsl(42,95%,55%,0.1)]'
                : 'text-[hsl(40,8%,45%)] bg-[hsl(220,10%,18%)]'
            }`}>
              {user.plan}
            </span>
          </div>
        </div>

        {/* Usage */}
        <div className="mb-8">
          <UsageBar
            used={user.scansUsedThisMonth}
            limit={user.plan === 'pro' ? null : FREE_MONTHLY_CAP}
            resetDate={user.scansResetDate}
          />
        </div>

        {/* Upgrade CTA for free users */}
        {user.plan === 'free' && (
          <div className="mb-8 bg-[hsl(220,12%,12%)] border border-[hsl(220,10%,18%)] rounded-lg p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm text-[hsl(40,20%,92%)] font-[family-name:var(--font-inter)] font-medium">
                  Want unlimited scans and saved history?
                </p>
                <p className="text-xs text-[hsl(40,8%,45%)] font-[family-name:var(--font-inter)] mt-1">
                  Pro is $12/mo. Every scan costs us real money, so this keeps the lights on.
                </p>
              </div>
              <Link
                href="/pricing"
                className="flex-shrink-0 px-5 py-2 bg-[hsl(42,95%,55%)] hover:bg-[hsl(42,95%,50%)] text-[hsl(220,15%,8%)] font-bold text-sm rounded-lg transition-all duration-200 font-[family-name:var(--font-space-grotesk)] text-center"
              >
                Upgrade →
              </Link>
            </div>
          </div>
        )}

        {/* Scan history */}
        <div>
          <h2 className="text-xs font-[family-name:var(--font-mono)] uppercase tracking-[0.2em] text-[hsl(40,8%,55%)] mb-4">
            Your Scans
          </h2>
          <ScanHistory scans={scans} />
        </div>

        {/* Quick scan CTA */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-sm text-[hsl(42,95%,55%)] hover:text-[hsl(42,95%,65%)] transition-colors font-[family-name:var(--font-space-grotesk)] font-medium"
          >
            ← Run a new scan
          </Link>
        </div>
      </div>
    </div>
  );
}
