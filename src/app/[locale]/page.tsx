import { useTranslations } from 'next-intl';
import Link from 'next/link';
import {
  UserPlus,
  Fingerprint,
  Building2,
  Compass,
  Shield,
  ChevronRight,
  ShieldCheck,
  History,
  Activity
} from 'lucide-react';

export default function Home({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations('HomePage');

  const engines = [
    { id: 1, icon: UserPlus },
    { id: 2, icon: Fingerprint },
    { id: 3, icon: Building2 },
    { id: 4, icon: Compass },
    { id: 5, icon: Shield },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* 1. Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 text-center overflow-hidden border-b border-slate-900">
        {/* Abstract background elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-yellow-600/5 blur-[120px] rounded-full -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-slate-900/50 blur-[100px] rounded-full" />

        <div className="z-10 max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/50 border border-slate-800 text-yellow-600/80 text-[10px] uppercase tracking-[0.3em] font-bold">
            <ShieldCheck size={12} />
            Institutional Strategic Advisory
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] text-white">
            {t('hero.title')}
          </h1>

          <p className="max-w-xl mx-auto text-lg md:text-xl text-slate-400 font-medium leading-relaxed">
            {t('hero.subtitle')}
          </p>

          <div className="pt-8">
            <Link
              href={`/${locale}/consultation`}
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-slate-100 text-slate-950 text-sm font-black uppercase tracking-widest hover:bg-white transition-all shadow-2xl shadow-yellow-600/10"
            >
              {t('hero.cta')}
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. 5 Core Engines */}
      <section className="py-32 px-6 max-w-7xl mx-auto w-full">
        <div className="space-y-16">
          <div className="space-y-4 text-center">
            <h2 className="text-[10px] uppercase tracking-[0.4em] text-yellow-600/70 font-bold">
              Infrastructure
            </h2>
            <h3 className="text-4xl font-black tracking-tighter">
              {t('engines.title')}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {engines.map((engine) => {
              const Icon = engine.icon;
              return (
                <div key={engine.id} className="group p-8 rounded-2xl border border-slate-900 bg-slate-950 hover:bg-slate-900/50 hover:border-slate-800 transition-all duration-500">
                  <div className="mb-8 w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-yellow-600/70 group-hover:text-yellow-500 transition-colors">
                    <Icon size={24} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-100 mb-2 leading-snug">
                    {t(`engines.engine${engine.id}.title`)}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    {t(`engines.engine${engine.id}.desc`)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Methodology & 4. Authority */}
      <section className="py-32 px-6 bg-slate-900/20 border-y border-slate-900/50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24">
          {/* Methodology */}
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-yellow-600/10 flex items-center justify-center text-yellow-600/80">
                <Activity size={20} />
              </div>
              <h3 className="text-2xl font-black tracking-tight">{t('methodology.title')}</h3>
            </div>
            <p className="text-slate-400 text-lg leading-relaxed font-medium italic border-l-2 border-yellow-600/30 pl-8 capitalize">
              {t('methodology.text')}
            </p>
          </div>

          {/* Authority */}
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                <History size={20} />
              </div>
              <h3 className="text-2xl font-black tracking-tight">{t('authority.title')}</h3>
            </div>
            <p className="text-slate-500 text-lg leading-relaxed font-medium pr-8">
              {t('authority.text')}
            </p>
          </div>
        </div>
      </section>

      {/* 5. CTA Footer */}
      <section className="py-40 px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-12">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight">
            Elevate your portfolio to <span className="text-white italic underline underline-offset-8 decoration-yellow-600/40">institutional grade</span>.
          </h2>
          <Link
            href={`/${locale}/consultation`}
            className="inline-block px-12 py-5 rounded-full border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white text-xs font-black uppercase tracking-[0.3em] transition-all"
          >
            Request Private Briefing
          </Link>
          <div className="pt-24 space-y-8 opacity-40">
            <div className="flex justify-center gap-4">
              {[
                { code: 'vi', label: 'Tiếng Việt' },
                { code: 'en', label: 'English' },
                { code: 'zh', label: '中文' }
              ].map((lang) => (
                <Link
                  key={lang.code}
                  href={`/${lang.code}`}
                  className={`text-[10px] uppercase tracking-widest font-bold transition-colors ${locale === lang.code ? 'text-yellow-600' : 'text-slate-500 hover:text-slate-300'
                    }`}
                >
                  {lang.label}
                </Link>
              ))}
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-medium">
              {t('footer.copyright')}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
