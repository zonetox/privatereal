import { useTranslations } from 'next-intl';

export default function ClientsPage() {
  const t = useTranslations('Dashboard');
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{t('clients')}</h1>
      <p className="text-slate-400">Placeholder for clients. Business logic coming soon.</p>
    </div>
  );
}
