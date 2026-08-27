'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AccountSettings, { UserSettings } from '@/components/AccountSettings';
import ScanningIndicator from '@/components/ScanningIndicator';

export default function SettingsPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((data) => {
        if (!data.user) {
          router.push('/sign-in');
          return;
        }
        setUserData({
          email: data.user.email,
          plan: data.user.plan || 'free',
          scansUsedThisMonth: data.user.scansUsedThisMonth || 0,
          scansLimit: data.user.plan === 'pro' ? 9999 : 3,
          joinedDate: 'Aug 2026',
          notifications: {
            weeklyDigest: true,
            competitorAlerts: true,
            productUpdates: false,
            scanReceipts: true,
          },
        });
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center">
        <ScanningIndicator size="lg" className="mb-3" />
        <p className="text-xs font-[family-name:var(--font-mono)] text-[hsl(40,8%,50%)]">Loading account settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] px-4 py-8">
      <AccountSettings user={userData || undefined} />
    </div>
  );
}
