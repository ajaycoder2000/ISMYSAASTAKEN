import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Account Settings — Is My SaaS Taken?',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
