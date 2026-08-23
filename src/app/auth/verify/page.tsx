'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ScanningIndicator from '@/components/ScanningIndicator';

export default function VerifyPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
      setStatus('error');
      return;
    }

    fetch(`/api/auth/verify?token=${token}`, { redirect: 'follow' })
      .then((res) => {
        if (res.redirected) {
          window.location.href = res.url;
        } else if (res.ok) {
          setStatus('success');
          setTimeout(() => router.push('/'), 1000);
        } else {
          setStatus('error');
        }
      })
      .catch(() => setStatus('error'));
  }, [router]);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-sm">
        {status === 'loading' && (
          <div className="animate-fade-in flex flex-col items-center">
            <ScanningIndicator size="lg" className="mb-4" />
            <p className="text-sm text-[hsl(40,8%,65%)] font-[family-name:var(--font-inter)]">
              Verifying your login token...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="animate-fade-in">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[hsl(145,60%,45%,0.12)] flex items-center justify-center">
              <svg className="w-6 h-6 text-[hsl(145,60%,45%)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-[hsl(40,20%,92%)] font-[family-name:var(--font-inter)]">
              You&apos;re in. Redirecting...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="animate-fade-in">
            <h1 className="text-xl font-bold font-[family-name:var(--font-space-grotesk)] text-[hsl(40,20%,92%)] mb-2">
              Link expired or invalid
            </h1>
            <p className="text-sm text-[hsl(40,8%,55%)] font-[family-name:var(--font-inter)] mb-6">
              Magic links only last 15 minutes. Request a new one.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[hsl(42,95%,55%)] hover:bg-[hsl(42,95%,50%)] text-[hsl(220,15%,8%)] font-bold text-sm rounded-lg transition-all duration-200 font-[family-name:var(--font-space-grotesk)]"
            >
              Request new link →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
