import { Metadata } from 'next';
import RoastView from '@/components/roast/RoastView';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Idea Roast Mode 🔥 — Brutally Honest SaaS Validation | IsMySaaSTaken',
  description:
    'Get a blunt, witty comedy-roast critique of your SaaS concept and its market reality. Roasts the positioning, competition, and saturation — never the founder.',
  alternates: {
    canonical: '/roast',
  },
  openGraph: {
    title: 'Idea Roast Mode 🔥 — Is My SaaS Taken?',
    description:
      'Unfiltered, comedy-roast feedback on SaaS ideas grounded in real competitor intelligence.',
    url: `${SITE_URL}/roast`,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Idea Roast Mode 🔥 — Is My SaaS Taken?',
    description:
      'Unfiltered, comedy-roast feedback on SaaS ideas grounded in real competitor intelligence.',
  },
};

export default function RoastPage() {
  return <RoastView />;
}
