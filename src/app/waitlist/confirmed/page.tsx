import { Suspense } from 'react';
import { Metadata } from 'next';
import WaitlistConfirmedView from '@/components/waitlist/WaitlistConfirmedView';

export const metadata: Metadata = {
  title: 'Waitlist Confirmed — Founding Member Perks | ismysaastaken?',
  description: 'Your spot on the ismysaastaken? launch waitlist is confirmed. Share your invite link to unlock bonus scans and early access.',
  robots: {
    index: false, // Prevent search engines from indexing the confirmed redirect page
    follow: false,
  },
};

export default function WaitlistConfirmedPage() {
  return (
    <main className="min-h-[85vh] flex flex-col justify-center items-center relative overflow-hidden py-8">
      {/* Subtle ambient background glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full blur-[120px] pointer-events-none opacity-20 bg-emerald-500"
        aria-hidden="true"
      />
      <Suspense
        fallback={
          <div className="py-20 text-center font-[family-name:var(--font-mono)] text-sm text-[var(--text-dim)]">
            Loading confirmation details...
          </div>
        }
      >
        <WaitlistConfirmedView />
      </Suspense>
    </main>
  );
}
