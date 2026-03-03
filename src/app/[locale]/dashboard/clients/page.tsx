import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default async function ClientsPage() {
  const t = useTranslations('Dashboard');
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{t('clients')}</h1>
      <p className="text-slate-400">Placeholder for clients. Business logic coming soon.</p>
    </div>
  );
}
