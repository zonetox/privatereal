import { createClient } from '@/lib/supabase/server';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { redirect } from '@/navigation';

export const dynamic = 'force-dynamic';

export default async function DashboardLayoutWrapper({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect({ href: '/login', locale });
    return null;
  }

  // Fetch role from profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || (profile.role !== 'admin' && profile.role !== 'client')) {
    redirect({ href: '/login', locale });
    return null;
  }

  const userData = {
    id: user.id,
    email: user.email,
    role: profile.role as 'admin' | 'client'
  };

  return (
    <DashboardLayout user={userData}>
      {children}
    </DashboardLayout>
  );
}
