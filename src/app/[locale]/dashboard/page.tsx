import { createClient } from '@/lib/supabase/server';
import { redirect, Link } from '@/navigation';
import { getTranslations } from 'next-intl/server';
import {
  Shield,
  Target,
  TrendingUp,
  Sparkles,
  Building2,
  UserCheck,
  ArrowUpRight,
  LucideIcon
} from 'lucide-react';


interface DashboardPageProps {
  params: { locale: string };
}

type MetricCardProps = {
  title: string;
  value: string | number | null;
  subtitle?: string;
  icon: LucideIcon;
};

function MetricCard({ title, value, subtitle, icon: Icon }: MetricCardProps) {
  return (
    <div className="relative group overflow-hidden rounded-2xl border border-slate-700/40 bg-slate-900/60 backdrop-blur-md p-5 md:p-6 transition-all duration-300 hover:border-slate-600/60 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-3 md:space-y-4 flex-1">
          <p className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">
            {title}
          </p>
          <div className="space-y-0.5 md:space-y-1">
            <h3 className="text-xl md:text-2xl font-black tracking-tight text-slate-100">
              {value ?? '—'}
            </h3>
            {subtitle && (
              <p className="text-[11px] md:text-xs text-slate-500 font-medium truncate">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="p-2.5 md:p-3 rounded-xl bg-slate-800/50 text-yellow-600/80 group-hover:text-yellow-500 transition-colors flex-shrink-0">
          <Icon size={18} className="md:w-5 md:h-5" />
        </div>
      </div>
      {/* Subtle decorative background gradient */}
      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-yellow-600/5 blur-[40px] rounded-full group-hover:bg-yellow-600/10 transition-all duration-500" />
    </div>
  );
}

const RISK_BADGE_STYLE: Record<string, string> = {
  conservative: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  balanced: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  aggressive: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
};

export const dynamic = 'force-dynamic';

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = await Promise.resolve(params);
  const t = await getTranslations({ locale });
  const supabase = createClient();

  // 1. Auth & Profile
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect({ href: '/login', locale });
    return null;
  }

  // 2. Fetch Client Data (Using cache optimization)
  const { getCachedClient } = require('@/lib/cache-utils');
  const client = await getCachedClient();

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
          <Shield size={32} className="text-slate-600" />
        </div>
        <h1 className="text-xl font-bold text-slate-200">{t('DashboardOverview.account_required_title')}</h1>
        <p className="text-slate-500 max-w-sm mb-4">{t('DashboardOverview.account_required_desc')}</p>
        <Link 
          href="/assessment" 
          className="px-8 py-3 rounded-xl bg-yellow-500 text-slate-950 text-xs font-black uppercase tracking-widest hover:bg-yellow-400 transition-all shadow-xl shadow-yellow-500/10"
        >
          {t('DashboardOverview.start_assessment_cta') || 'Start Onboarding Assessment'}
        </Link>
      </div>
    );
  }

  // 3. Completeness Calculation
  const requiredFields = [
    'budget_range',
    'monthly_cashflow',
    'purchase_goal',
    'risk_tolerance',
    'holding_period'
  ];
  const completedFields = requiredFields.filter(f => client[f] !== null).length;
  const completeness = Math.round((completedFields / requiredFields.length) * 100);

  // 4. Recommendations & Fit (Bulk Optimization v3.0)
  const { data: fitResults } = await supabase.rpc('calculate_all_project_fits', {
    p_client_id: client.id
  });

  const activeProjectsCount = fitResults?.length || 0;

  // Get highest fit score from bulk results
  let highestFit: number | null = null;
  if (fitResults && fitResults.length > 0) {
    const scores = (fitResults as any[])
      .map(r => r.fit_score || 0)
      .filter(s => s > 0);

    if (scores.length > 0) {
      highestFit = Math.max(...scores);
    }
  }

  // 5. Portfolio Summary
  const { data: properties } = await supabase
    .from('client_properties')
    .select('purchase_date')
    .eq('client_id', client.id)
    .order('purchase_date', { ascending: false });

  const totalProperties = properties?.length || 0;
  const latestPurchase = properties && properties.length > 0 ? properties[0].purchase_date : null;

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-yellow-600/70 font-medium">
            {t('DashboardOverview.header_badge')}
          </p>
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-slate-100 italic">
            {t('DashboardOverview.header_title').split(' ')[0]}{' '}
            <span className="bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
              {t('DashboardOverview.header_title').split(' ').slice(1).join(' ')}
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/recommendations"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-yellow-600/10 border border-yellow-600/20 text-yellow-500 text-xs font-bold uppercase tracking-widest hover:bg-yellow-600/20 transition-all"
          >
            {t('DashboardOverview.view_recommendations')}
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 1. Risk Profile */}
        <div className="relative group overflow-hidden rounded-2xl border border-slate-700/40 bg-slate-900/60 backdrop-blur-md p-5 md:p-6 transition-all duration-300 hover:border-slate-600/60">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-3 md:space-y-4 flex-1">
              <p className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">
                {t('DashboardOverview.risk_profile')}
              </p>
              <div className="space-y-1.5 md:space-y-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 md:px-3 md:py-1 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest border ${RISK_BADGE_STYLE[client.risk_tolerance || 'balanced']}`}>
                  {client.risk_tolerance || t('DashboardOverview.risk_analyzing')}
                </span>
                <p className="text-[11px] md:text-xs text-slate-500 font-medium">{t('DashboardOverview.risk_subtitle')}</p>
              </div>
            </div>
            <div className="p-2.5 md:p-3 rounded-xl bg-slate-800/50 text-yellow-600/80 group-hover:text-yellow-500 transition-colors flex-shrink-0">
              <Shield size={18} className="md:w-5 md:h-5" />
            </div>
          </div>
        </div>

        {/* 2. Completeness */}
        <MetricCard
          title={t('DashboardOverview.completeness_title')}
          value={`${completeness}%`}
          subtitle={completeness < 100 ? t('DashboardOverview.completeness_subtitle_low') : t('DashboardOverview.completeness_subtitle_high')}
          icon={UserCheck}
        />

        {/* 3. Active Recommendations */}
        <MetricCard
          title={t('DashboardOverview.active_recommendations_title')}
          value={activeProjectsCount}
          subtitle={t('DashboardOverview.active_recommendations_subtitle')}
          icon={Sparkles}
        />

        {/* 4. Top Match Fit */}
        <MetricCard
          title={t('DashboardOverview.highest_fit_title')}
          value={highestFit ? `${highestFit}%` : '—'}
          subtitle={highestFit ? t('DashboardOverview.highest_fit_subtitle_high') : t('DashboardOverview.highest_fit_subtitle_low')}
          icon={Target}
        />

        {/* 5. Total Properties */}
        <MetricCard
          title={t('DashboardOverview.total_properties_title')}
          value={totalProperties}
          subtitle={t('DashboardOverview.total_properties_subtitle')}
          icon={Building2}
        />

        {/* 6. Latest Acquisition */}
        <MetricCard
          title={t('DashboardOverview.latest_acquisition_title')}
          value={latestPurchase ? new Date(latestPurchase).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
          subtitle={t('DashboardOverview.latest_acquisition_subtitle')}
          icon={TrendingUp}
        />
      </div>

      {/* Quick Insights / CTA Section */}
      <div className="rounded-[1.5rem] md:rounded-[2rem] border border-yellow-800/20 bg-gradient-to-br from-yellow-700/5 to-transparent p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12">
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-100 uppercase tracking-widest">{t('DashboardOverview.advisory_precision_title')}</h2>
          <p className="text-xs md:text-sm text-slate-500 max-w-md leading-relaxed font-medium">
            {t('DashboardOverview.advisory_precision_desc')}
          </p>
        </div>
        <Link
          href="/dashboard/profile"
          className="w-full md:w-auto text-center px-6 md:px-10 py-3 md:py-4 rounded-xl bg-slate-100 text-slate-950 text-[11px] md:text-xs font-black uppercase tracking-[0.2em] hover:bg-white transition-all shadow-xl shadow-black/20"
        >
          {t('DashboardOverview.update_profile_cta')}
        </Link>
      </div>
    </div>
  );
}
