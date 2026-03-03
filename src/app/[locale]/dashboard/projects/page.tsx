import { createClient } from '@/lib/supabase/server';
import { useTranslations } from 'next-intl';
import { redirect } from '@/navigation';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage({ params }: { params: { locale: string } }) {
  const t = useTranslations('Dashboard');
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const { locale } = params;

  if (!user) {
    redirect({ href: '/login', locale });
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{t('projects')}</h1>
      <p className="text-slate-400">Placeholder for projects. Business logic coming soon.</p>
    </div>
  );
}
