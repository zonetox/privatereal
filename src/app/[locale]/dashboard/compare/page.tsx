import { createClient } from '@/lib/supabase/server';
import { redirect, Link } from '@/navigation';
import {
    ArrowLeft,
    ShieldCheck,
    Coins,
    Target,
    Activity,
    Scale,
    Building2
} from 'lucide-react';
import StrategicFitGauge from '@/components/projects/StrategicFitGauge';
import { getTranslations } from 'next-intl/server';

interface ComparePageProps {
    searchParams: { ids?: string };
    params: { locale: string };
}

type Project = {
    id: string;
    name: string;
    location: string;
    developer: string | null;
    investment_grade: string | null;
    price_per_m2: number | null;
    min_unit_price: number | null;
    avg_rental_yield: number | null;
    expected_growth_rate: number | null;
    holding_period_recommendation: number | null;
    risk_score: number | null;
    location_score: number | null;
    liquidity_score: number | null;
    growth_score: number | null;
    legal_score: number | null;
};

type FitResult = {
    fit_score: number | null;
    fit_label: string | null;
    budget_alignment: number | null;
    risk_alignment: number | null;
    horizon_alignment: number | null;
    location_alignment: number | null;
    goal_alignment: number | null;
};

type ProjectComparisonData = Project & FitResult;

export default async function ProjectComparison({ searchParams, params }: ComparePageProps) {
    const t = await getTranslations('Comparison');
    const commonT = await getTranslations('Common');
    const { locale } = await Promise.resolve(params);
    const { ids: idsParam } = await Promise.resolve(searchParams);
    const supabase = createClient();

    // 4. Enforce Project Limit (Server-side)
    const rawIds = idsParam ? idsParam.split(',') : [];
    const ids = rawIds.slice(0, 3);

    // 1. Auth & Client ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect({ href: '/login', locale });
        return null;
    }

    const { data: clientRecord } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user.id)
        .single();
    
    const clientId = clientRecord?.id;

    // 2. Fetch Projects (Including missing score fields)
    const { data: rawProjects } = await supabase
        .from('projects')
        .select('*')
        .in('id', ids);

    // 3. Enrich with Fit
    const projects: ProjectComparisonData[] = await Promise.all(
        (rawProjects || []).map(async (p) => {
            const { data: fitData } = await supabase
                .rpc('calculate_project_fit', {
                    p_client_id: clientId,
                    p_project_id: p.id,
                })
                .maybeSingle<FitResult>();

            return {
                ...p,
                fit_score: fitData?.fit_score ?? null,
                fit_label: fitData?.fit_label ?? '—',
                budget_alignment: fitData?.budget_alignment ?? null,
                risk_alignment: fitData?.risk_alignment ?? null,
                horizon_alignment: fitData?.horizon_alignment ?? null,
                location_alignment: fitData?.location_alignment ?? null,
                goal_alignment: fitData?.goal_alignment ?? null,
            };
        })
    );

    const formatter = new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
        style: 'currency',
        currency: locale === 'vi' ? 'VND' : 'USD',
        maximumFractionDigits: 0
    });

    // Log comparison activity (Client Only)
    if (clientId && projects.length > 0) {
        const { logActivityAction } = require('@/app/actions/activity-logger');
        logActivityAction('compare_projects', undefined, `Comparing ${projects.length} projects`, { project_ids: ids });
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
                <div className="flex items-center gap-4 md:gap-6">
                    <Link 
                        href="/dashboard/workspace"
                        className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-yellow-500 hover:bg-yellow-500/10 transition-all flex-shrink-0"
                    >
                        <ArrowLeft size={18} className="md:w-5 md:h-5" />
                    </Link>
                    <div className="space-y-1">
                        <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-yellow-600/80">{t('sub_header')}</p>
                        <h1 className="text-2xl md:text-4xl font-black tracking-tighter text-slate-100 italic leading-tight">{t('title')} <span className="text-yellow-500">{t('subtitle')}</span></h1>
                    </div>
                </div>
            </div>

            {projects.length === 0 ? (
                <div className="p-20 flex flex-col items-center justify-center rounded-[3rem] border border-dashed border-white/10 bg-slate-900/20 gap-4">
                    <Scale size={48} className="text-slate-700" />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">{t('no_projects')}</p>
                </div>
            ) : (
                <div className="overflow-x-auto pb-10 custom-scrollbar">
                    <table className="w-full border-separate border-spacing-x-4">
                        <thead>
                            <tr>
                                <th className="sticky left-0 bg-slate-950/95 backdrop-blur-md z-30 min-w-[120px] md:min-w-[200px] text-left p-4 md:p-6 align-bottom border-b border-white/5">
                                    <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.25em] text-slate-600">{t('metric_alignment')}</span>
                                </th>
                                {projects.map(p => (
                                    <th key={p.id} className="min-w-[240px] md:min-w-[320px] p-4 md:p-6 text-left border-b border-white/5">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-500 text-[7px] md:text-[8px] font-black uppercase tracking-widest">{t('selected_asset')}</span>
                                                {p.investment_grade && (
                                                    <div className={`px-2 py-0.5 rounded-full border text-[7px] md:text-[8px] font-black uppercase tracking-widest ${
                                                        p.investment_grade === 'A' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5' : 'text-sky-400 border-sky-500/30'
                                                    }`}>
                                                        {t('grade')} {p.investment_grade}
                                                    </div>
                                                )}
                                            </div>
                                            <h3 className="text-lg md:text-2xl font-black text-slate-100 truncate tracking-tight">{p.name}</h3>
                                            <div className="flex flex-col gap-1">
                                                {p.developer && <p className="text-[10px] md:text-[11px] text-amber-500 font-black uppercase tracking-widest">{p.developer}</p>}
                                                <p className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-wider italic">{p.location}</p>
                                            </div>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {/* Project Overview Group */}
                            <ComparisonRow 
                                label={t('overview')} 
                                icon={Building2} 
                                projects={projects}
                                render={p => (
                                    <div className="space-y-4">
                                        <MetricValue label={t('price_from')} value={p.min_unit_price ? formatter.format(p.min_unit_price) : commonT('contact')} color="text-emerald-400" />
                                        <MetricValue label={t('developer')} value={p.developer || '—'} />
                                        <MetricValue label={t('location')} value={p.location} />
                                    </div>
                                )}
                            />

                            {/* Strategic Fit Group */}
                            <tr>
                                <td className="sticky left-0 bg-slate-950/95 backdrop-blur-md z-20 py-6 md:py-8 px-4 md:px-6 font-black text-[8px] md:text-[11px] uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                    <Activity size={10} className="md:w-3.5 md:h-3.5 text-yellow-600" /> {t('strategic_fit')}
                                </td>
                                {projects.map(p => (
                                    <td key={p.id} className="py-6 md:py-8 px-4 md:px-6 bg-white/[0.01]">
                                        <div className="scale-90 md:scale-100 origin-center">
                                            <StrategicFitGauge 
                                                fitScore={p.fit_score} 
                                                fitLabel={p.fit_label}
                                                budgetAlignment={p.budget_alignment}
                                                riskAlignment={p.risk_alignment}
                                                horizonAlignment={p.horizon_alignment}
                                                locationAlignment={p.location_alignment}
                                                goalAlignment={p.goal_alignment}
                                            />
                                        </div>
                                    </td>
                                ))}
                            </tr>

                            {/* Expert Analysis Group */}
                            <ComparisonRow 
                                label={t('expert_analysis')} 
                                icon={Target} 
                                projects={projects}
                                render={p => (
                                    <div className="space-y-4">
                                        <MetricValue label={t('location_score')} value={p.location_score ? `${p.location_score} / 100` : '—'} />
                                        <MetricValue label={t('liquidity_score')} value={p.liquidity_score ? `${p.liquidity_score} / 100` : '—'} />
                                        <MetricValue label={t('growth_score')} value={p.growth_score ? `${p.growth_score} / 100` : '—'} />
                                        <MetricValue label={t('legal_score')} value={p.legal_score ? `${p.legal_score} / 100` : '—'} />
                                    </div>
                                )}
                            />

                            {/* Market Dynamics Group */}
                            <ComparisonRow 
                                label={t('market_context')} 
                                icon={Coins} 
                                projects={projects}
                                render={p => (
                                    <div className="space-y-4">
                                        <MetricValue label={t('price_per_m2')} value={p.price_per_m2 ? formatter.format(p.price_per_m2) : '—'} />
                                        <MetricValue label={t('yield')} value={p.avg_rental_yield ? `${p.avg_rental_yield}%` : '—'} />
                                        <MetricValue label={t('expected_growth')} value={p.expected_growth_rate ? `${p.expected_growth_rate}%` : '—'} color="text-emerald-400" />
                                    </div>
                                )}
                            />

                            {/* Risk Review Group */}
                            <ComparisonRow 
                                label={t('risk_review')} 
                                icon={ShieldCheck} 
                                projects={projects}
                                render={p => (
                                    <div className="space-y-4">
                                        <MetricValue label={t('risk_score')} value={p.risk_score ? `${p.risk_score} / 100` : '—'} />
                                        <div className="pt-2">
                                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full transition-all duration-1000 ${
                                                        (p.risk_score || 0) < 30 ? 'bg-emerald-500' : (p.risk_score || 0) < 60 ? 'bg-yellow-500' : 'bg-rose-500'
                                                    }`}
                                                    style={{ width: `${p.risk_score}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            />
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

function ComparisonRow({ label, icon: Icon, projects, render }: { 
    label: string, 
    icon: React.ElementType, 
    projects: ProjectComparisonData[], 
    render: (p: ProjectComparisonData) => React.ReactNode 
}) {
    return (
        <tr className="group hover:bg-white/[0.02] transition-all">
            <td className="sticky left-0 bg-slate-950/90 backdrop-blur-md z-20 py-8 md:py-10 px-4 md:px-6 align-top">
                <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 flex-shrink-0">
                        <Icon size={12} className="md:w-3.5 md:h-3.5" />
                    </div>
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-slate-300 transition-colors">{label}</span>
                </div>
            </td>
            {projects.map(p => (
                <td key={p.id} className="py-10 px-6 border-l border-white/5">
                    {render(p)}
                </td>
            ))}
        </tr>
    );
}

function MetricValue({ label, value, color = "text-slate-300" }: { label: string, value: string | number, color?: string }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600">{label}</span>
            <span className={`text-xs font-black italic ${color}`}>{value}</span>
        </div>
    );
}

