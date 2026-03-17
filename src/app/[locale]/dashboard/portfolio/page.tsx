import { useTranslations } from 'next-intl';

export default function PortfolioPage() {
  const t = useTranslations('Dashboard');
  
  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6">
      <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-slate-100 italic uppercase">
        {t('advisoryCollection')}
      </h1>
      <div className="glass p-8 md:p-12 rounded-[1.5rem] md:rounded-[2rem] border border-white/5 text-center">
        <p className="text-[10px] md:text-xs text-slate-500 font-black uppercase tracking-[0.2em] mb-4">
          {t('my_portfolio_assets')}
        </p>
      </div>
    </div>
  );
}
