import { useTranslations } from 'next-intl';

export default function PortfolioPage() {
  const t = useTranslations('Dashboard');
  
  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6">
      <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-slate-100 italic uppercase">
        Property <span className="text-yellow-500">Holdings</span>
      </h1>
      <p className="text-slate-400 text-xs md:text-sm max-w-lg leading-relaxed uppercase tracking-widest font-bold opacity-70">
        Strategic overview of your acquired properties and advisory growth milestones.
      </p>
      <div className="glass p-8 md:p-12 rounded-[1.5rem] md:rounded-[2rem] border border-white/5 text-center">
        <p className="text-[10px] md:text-xs text-slate-500 font-black uppercase tracking-[0.2em] mb-4">
          No recorded client properties yet.
        </p>
        <p className="text-[10px] md:text-xs text-slate-400/60 uppercase tracking-widest max-w-xs mx-auto mb-8 font-medium">
          Properties will appear after acquisition tracking begins.
        </p>
        <div className="w-16 h-1 bg-yellow-500/20 rounded-full mx-auto"></div>
      </div>
    </div>
  );
}
