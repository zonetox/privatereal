import { useTranslations } from 'next-intl';

export default function PortfolioPage() {
  const t = useTranslations('Dashboard');
  
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-black tracking-tighter text-slate-100 italic uppercase">
        Property <span className="text-yellow-500 text-slate-100">Holdings</span>
      </h1>
      <p className="text-slate-400 text-sm max-w-lg leading-relaxed uppercase tracking-widest font-bold opacity-70">
        Strategic overview of your acquired properties and advisory growth milestones.
      </p>
      <div className="glass p-12 rounded-[2rem] border border-white/5 text-center">
        <p className="text-slate-500 text-xs font-black uppercase tracking-[0.2em] mb-4">Detailed Analytics Coming Soon</p>
        <div className="w-16 h-1 w-full bg-yellow-500/20 rounded-full mx-auto"></div>
      </div>
    </div>
  );
}
