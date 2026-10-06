import { Metadata } from 'next';
import WaitlistClientView from '@/components/waitlist/WaitlistClientView';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Join the Pre-Launch Waitlist — Founding Member Access | ismysaastaken?',
  description:
    'Join the ismysaastaken? launch waitlist. Check if your SaaS idea is taken, find competitors, and lock in Founding Member perks and bonus scans.',
  alternates: {
    canonical: '/waitlist',
  },
  openGraph: {
    title: 'Join the Pre-Launch Waitlist — ismysaastaken?',
    description:
      'Check if your SaaS idea is taken, uncover competitor intelligence, and lock in Founding Member perks before public launch.',
    url: `${SITE_URL}/waitlist`,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Join the Pre-Launch Waitlist — ismysaastaken?',
    description:
      'Check if your SaaS idea is taken, uncover competitor intelligence, and lock in Founding Member perks before public launch.',
  },
};

export default function WaitlistPage() {
  return (
    <main className="min-h-[85vh] flex flex-col justify-center items-center relative overflow-hidden py-8">
      {/* Subtle ambient background glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full blur-[120px] pointer-events-none opacity-20 bg-[var(--accent-amber)]"
        aria-hidden="true"
      />
      <WaitlistClientView />
    </main>
  );
}
