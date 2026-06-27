import { AuthProvider } from '@/context/AuthContext';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { requireAdmin } from '@/lib/auth';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <AdminSidebar username={admin.username} />
        <div className="ml-64 p-8">
          {children}
        </div>
      </div>
    </AuthProvider>
  );
}
