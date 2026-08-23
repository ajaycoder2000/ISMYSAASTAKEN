import { redirect } from 'next/navigation';
import { getAdminUser } from '@/lib/auth';
import AdminNav from '@/components/admin/AdminNav';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Strict server-side verification: redirect silently to home if not admin
  const admin = await getAdminUser();
  if (!admin) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-[hsl(220,15%,6%)] text-[hsl(40,20%,92%)] flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <AdminNav adminEmail={admin.email} />

      {/* Main Admin Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl">
        {children}
      </main>
    </div>
  );
}
