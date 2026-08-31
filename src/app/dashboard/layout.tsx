import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Founder Dashboard — Is My SaaS Taken?',
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
