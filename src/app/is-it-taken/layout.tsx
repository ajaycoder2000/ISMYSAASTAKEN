import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Is It Taken? — Startup Name & Handle Availability Checker',
  description:
    'Check if your startup name is taken across .com, .io, .co, .app domains and X, GitHub, Instagram, and TikTok in one search.',
  alternates: {
    canonical: '/is-it-taken',
  },
  openGraph: {
    title: 'Is It Taken? — Startup Name & Handle Checker',
    description:
      'Check domain availability (.com/.io/.co/.app via official RDAP) and social handles (X, GitHub, Instagram, TikTok) in one click before launching.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Is It Taken? — Startup Name & Handle Availability Checker',
    description:
      'Official RDAP domain checks (.com/.io/.co/.app) + social handle availability for founders.',
  },
};

export default function IsItTakenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
