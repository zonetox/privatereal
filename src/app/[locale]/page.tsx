import { useTranslations } from 'next-intl';
import Link from 'next/link';
import {
  ShieldCheck,
  Gavel,
  Briefcase,
  FileCheck,
  ChevronRight,
  Activity,
  History,
  Lock,
  Scale,
  TrendingUp,
  Shield
} from 'lucide-react';

export default function Home({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations('HomePage');

  const steps = [
    { id: 1, icon: Scale },
    { id: 2, icon: ShieldCheck },
    { id: 3, icon: Briefcase },
    { id: 4, icon: FileCheck },
  ];

  const engines = [
    { id: 1, icon: Activity },
    { id: 2, icon: Lock },
    { id: 3, icon: TrendingUp },
    { id: 4, icon: Shield },
    { id: 5, icon: History },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-yellow-600/30">
      {/* 1. Hero Section */}
      <section className="relative min-h-[100vh] flex flex-col items-center justify-center px-6 text-center overflow-hidden border-b border-slate-900/50">
        {/* Executive Blur Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[700px] bg-yellow-600/5 blur-[140px] rounded-full -translate-y-1/2 opacity-60" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-slate-900/40 blur-[120px] rounded-full opacity-40" />

        <div className="z-10 max-w-5xl space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-yellow-600/90 text-[10px] uppercase tracking-[0.4em] font-black">
            <Lock size={11} className="mb-0.5" />
            Institutional Private Advisory
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] text-white">
            {t('hero.title')}
          </h1>

          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 font-medium leading-relaxed tracking-tight">
            {t('hero.subtitle')}
          </p>

          <div className="pt-10 flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              href={`/${locale}/assessment`}
              className="group relative inline-flex items-center gap-3 px-10 py-5 rounded-xl bg-white text-slate-950 text-xs font-black uppercase tracking-[0.2em] hover:bg-slate-100 transition-all shadow-2xl shadow-yellow-600/10 overflow-hidden"
            >
              <span className="relative z-10 font-black">{t('hero.cta')}</span>
              <ChevronRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href={`/${locale}/login`}
              className="px-10 py-5 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-300 text-xs font-black uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white transition-all"
            >
              {t('hero.client_login')}
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Access Model Section */}
      <section className="py-32 px-6 border-b border-slate-900/50">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="space-y-4 text-center">
            <h2 className="text-[10px] uppercase tracking-[0.4em] text-yellow-600/70 font-bold">
              Protocol
            </h2>
            <h3 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
              {t('access.title')}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-900/40 border border-slate-900/80 rounded-3xl overflow-hidden backdrop-blur-sm">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="relative group bg-slate-950 p-10 space-y-6 hover:bg-slate-900/30 transition-all duration-500">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-slate-900/80 border border-slate-800/50 flex items-center justify-center text-yellow-600/80 group-hover:text-yellow-500 transition-colors">
                      <Icon size={24} />
                    </div>
                    <span className="text-3xl font-black text-slate-900">0{step.id}</span>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-lg font-bold text-slate-100 tracking-tight">
                      {t(`access.step${step.id}.title`)}
                    </h4>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">
                      {t(`access.step${step.id}.desc`)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Core Infrastructure Section */}
      <section className="py-32 px-6 max-w-7xl mx-auto w-full">
        <div className="space-y-20">
          <div className="space-y-4 text-center">
            <h2 className="text-[10px] uppercase tracking-[0.4em] text-yellow-600/70 font-bold">
              Infrastructure
            </h2>
            <h3 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
              {t('engines.title')}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {engines.map((engine) => {
              const Icon = engine.icon;
              return (
                <div key={engine.id} className="group p-10 rounded-3xl border border-slate-900 bg-slate-950/50 hover:bg-slate-900/30 hover:border-slate-800 transition-all duration-500 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-600/5 blur-[50px] -translate-y-1/2 translate-x-1/2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                  <div className="mb-10 w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:text-yellow-600/80 transition-all duration-500">
                    <Icon size={22} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-100 mb-3 leading-tight tracking-tight">
                    {t(`engines.engine${engine.id}.title`)}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    {t(`engines.engine${engine.id}.desc`)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Methodology & Authority Section */}
      <section className="py-32 px-6 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30,41,59,0.2)_0%,transparent_100%)]" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-32 relative z-10">
          {/* Methodology */}
          <div className="space-y-10">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-yellow-600/80 shadow-inner">
                <Activity size={22} strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-black tracking-tight text-white uppercase italic">{t('methodology.title')}</h3>
            </div>
            <p className="text-slate-400 text-xl leading-relaxed font-black border-l-2 border-yellow-700/60 pl-10">
              {t('methodology.text')}
            </p>
          </div>

          {/* Authority */}
          <div className="space-y-10">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                <Shield size={22} />
              </div>
              <h3 className="text-2xl font-black tracking-tight text-white uppercase">{t('authority.title')}</h3>
            </div>
            <p className="text-slate-500 text-lg leading-relaxed font-medium pr-10">
              {t('authority.text')}
            </p>
          </div>
        </div>
      </section>

      {/* 5. Footer & CTA Section */}
      <section className="py-48 px-6 text-center border-t border-slate-900/50">
        <div className="max-w-5xl mx-auto space-y-20">
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight text-white">
            Private Institutional <span className="bg-clip-text text-transparent bg-gradient-to-br from-yellow-500 to-yellow-800 italic pr-2">Security</span> &
            Strategic <span className="bg-clip-text text-transparent bg-gradient-to-br from-slate-200 to-slate-500 italic pr-2">Legacy</span>.
          </h2>

          <div className="flex flex-col items-center gap-24">
            <Link
              href={`/${locale}/assessment`}
              className="inline-block px-14 py-6 rounded-full border border-slate-800 hover:border-yellow-700/50 text-slate-400 hover:text-white text-[10px] font-black uppercase tracking-[0.5em] transition-all bg-slate-900/20"
            >
              Request Private Briefing
            </Link>

            <div className="space-y-10 opacity-30 group hover:opacity-100 transition-opacity duration-700">
              <div className="flex justify-center gap-8">
                {[
                  { code: 'vi', label: 'Tiếng Việt' },
                  { code: 'en', label: 'English' },
                  { code: 'zh', label: '中文' }
                ].map((lang) => (
                  <Link
                    key={lang.code}
                    href="/"
                    locale={lang.code as 'en' | 'vi' | 'zh'}
                    className={`text-[9px] uppercase tracking-widest font-black transition-colors ${locale === lang.code ? 'text-yellow-600' : 'text-slate-500 hover:text-slate-300'
                      }`}
                  >
                    {lang.label}
                  </Link>
                ))}
              </div>
              <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-slate-600">
                {t('footer.copyright')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
