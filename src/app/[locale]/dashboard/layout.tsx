import { createClient } from '@/lib/supabase/server';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { redirect } from '@/navigation';
import ComparisonManager from '@/components/projects/ComparisonManager';

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
  let { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  // HEAL: If profile doesn't exist yet (DB trigger delay), create one immediately
  if (!profile) {
    const { data: newProfile, error: upsertError } = await supabase
        .from('profiles')
        .upsert({ 
            id: user.id, 
            email: user.email, 
            role: 'client' 
        })
        .select('role')
        .single();
    
    if (!upsertError) {
        profile = newProfile;
    }
  }

  // Final check: if still no profile (serious error), only THEN redirect
  if (!profile) {
    redirect({ href: '/login', locale });
    return null;
  }

  const userData = {
    id: user.id,
    email: user.email,
    role: profile.role as 'admin' | 'client'
  };

  // Log session access (counts as active metric)
  if (userData.role === 'client') {
    // We import it here or use a side effect component, but since it's a server component layout,
    // we can just call it (it's safe as it's a server action called from server)
    const { logActivityAction } = require('@/app/actions/activity-logger');
    logActivityAction('login', undefined, 'Accessing Dashboard');
  }

  return (
    <DashboardLayout user={userData}>
      {children}
      <ComparisonManager />
    </DashboardLayout>
  );
}
