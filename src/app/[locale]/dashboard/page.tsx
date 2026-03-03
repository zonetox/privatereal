import { createClient } from '@/lib/supabase/server';
import { redirect, Link } from '@/navigation';
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
    <div className="relative group overflow-hidden rounded-2xl border border-slate-700/40 bg-slate-900/60 backdrop-blur-md p-6 transition-all duration-300 hover:border-slate-600/60 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      <div className="flex items-start justify-between">
        <div className="space-y-4 flex-1">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">
            {title}
          </p>
          <div className="space-y-1">
            <h3 className="text-2xl font-black tracking-tight text-slate-100">
              {value ?? '—'}
            </h3>
            {subtitle && (
              <p className="text-xs text-slate-500 font-medium truncate">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-slate-800/50 text-yellow-600/80 group-hover:text-yellow-500 transition-colors">
          <Icon size={20} />
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
  const supabase = createClient();

  // 1. Auth & Profile
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect({ href: '/login', locale });
  if (!user) return null;

  // 2. Fetch Client Data
  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!client) {
    // Redirection for users who are not clients (admins don't have client records usually)
    // But for this snapshot, we'll gracefully handle it.
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
          <Shield size={32} className="text-slate-600" />
        </div>
        <h1 className="text-xl font-bold text-slate-200">Advisory Account Required</h1>
        <p className="text-slate-500 max-w-sm">Please consult with an advisor to enable your strategic dashboard.</p>
      </div>
    );
  }

  // 3. Completeness Calculation
  const requiredFields = [
    'investment_capital',
    'monthly_cashflow',
    'primary_occupation',
    'primary_objective',
    'risk_score',
    'time_horizon'
  ];
  const completedFields = requiredFields.filter(f => client[f] !== null).length;
  const completeness = Math.round((completedFields / requiredFields.length) * 100);

  // 4. Recommendations & Fit
  const { data: projects } = await supabase
    .from('projects')
    .select('id')
    .eq('status', 'active')
    .eq('visible_to_clients', true);

  const activeProjectsCount = projects?.length || 0;

  // Get highest fit score
  let highestFit: number | null = null;
  if (projects && projects.length > 0) {
    const fitResults = await Promise.all(
      projects.map(p => supabase.rpc('calculate_project_fit', {
        p_client_id: client.id,
        p_project_id: p.id
      }))
    );
    const scores = fitResults
      .map(r => r.data?.fit_score || 0)
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
          <p className="text-xs uppercase tracking-[0.2em] text-yellow-600/70 font-medium">
            Executive Overview
          </p>
          <h1 className="text-4xl font-black tracking-tighter text-slate-100">
            Strategic{' '}
            <span className="bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
              Snapshot
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/recommendations"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-yellow-600/10 border border-yellow-600/20 text-yellow-500 text-xs font-bold uppercase tracking-widest hover:bg-yellow-600/20 transition-all"
          >
            View Recommendations
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 1. Risk Profile */}
        <div className="relative group overflow-hidden rounded-2xl border border-slate-700/40 bg-slate-900/60 backdrop-blur-md p-6 transition-all duration-300 hover:border-slate-600/60">
          <div className="flex items-start justify-between">
            <div className="space-y-4 flex-1">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">
                Risk Profile
              </p>
              <div className="space-y-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${RISK_BADGE_STYLE[client.risk_profile || 'balanced']}`}>
                  {client.risk_profile || 'Analyzing'}
                </span>
                <p className="text-xs text-slate-500 font-medium">Based on advisory assessment</p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/50 text-yellow-600/80 group-hover:text-yellow-500 transition-colors">
              <Shield size={20} />
            </div>
          </div>
        </div>

        {/* 2. Completeness */}
        <MetricCard
          title="Profile Completeness"
          value={`${completeness}%`}
          subtitle={completeness < 100 ? "Update profile for better matches" : "Full precision advisory active"}
          icon={UserCheck}
        />

        {/* 3. Active Recommendations */}
        <MetricCard
          title="Active Recommendations"
          value={activeProjectsCount}
          subtitle="Institutional projects available"
          icon={Sparkles}
        />

        {/* 4. Top Match Fit */}
        <MetricCard
          title="Highest Fit Score"
          value={highestFit ? `${highestFit}%` : '—'}
          subtitle={highestFit ? "Maximum alignment achieved" : "Analyzing availability"}
          icon={Target}
        />

        {/* 5. Total Properties */}
        <MetricCard
          title="Total Assets"
          value={totalProperties}
          subtitle="Acquired through PREIO"
          icon={Building2}
        />

        {/* 6. Latest Acquisition */}
        <MetricCard
          title="Latest Acquisition"
          value={latestPurchase ? new Date(latestPurchase).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
          subtitle="Portfolio expansion history"
          icon={TrendingUp}
        />
      </div>

      {/* Quick Insights / CTA Section */}
      <div className="rounded-3xl border border-yellow-800/20 bg-gradient-to-br from-yellow-700/5 to-transparent p-8 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-2 text-center md:text-left">
          <h2 className="text-xl font-bold text-slate-200">Advisory Precision</h2>
          <p className="text-sm text-slate-500 max-w-md">
            Your investment metrics are computed by the Advisory Engine in real-time. Ensure your strategic profile is up to date for maximum precision in recommendations.
          </p>
        </div>
        <Link
          href="/dashboard/settings"
          className="px-8 py-3 rounded-xl bg-slate-100 text-slate-950 text-xs font-bold uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-black/20"
        >
          Update Profile
        </Link>
      </div>
    </div>
  );
}
