import { createClient } from '@/lib/supabase/server';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { redirect } from 'next/navigation';

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
    redirect(`/${locale}/login`);
  }

  // Fetch role from profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || (profile.role !== 'admin' && profile.role !== 'client')) {
    redirect(`/${locale}/login`);
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
