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
                            {/* 1. Core Metadata Row Group */}
                            <tr className="bg-white/[0.02]">
                                <td className="sticky left-0 bg-slate-950/95 backdrop-blur-md z-20 py-4 px-6 border-b border-white/5">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t('overview')}</span>
                                </td>
                                {projects.map(p => (
                                    <td key={p.id} className="p-0 border-b border-white/5 bg-transparent" />
                                ))}
                            </tr>
                            
                            <MetricRow label={t('developer')} projects={projects} value={p => p.developer || '—'} />
                            <MetricRow label={t('location')} projects={projects} value={p => p.location} />
                            <MetricRow 
                                label={t('price_from')} 
                                projects={projects} 
                                value={p => p.min_unit_price ? formatter.format(p.min_unit_price) : commonT('contact')}
                                color="text-emerald-400"
                            />

                            {/* 2. Fit & Scores Group */}
                            <tr className="bg-white/[0.02]">
                                <td className="sticky left-0 bg-slate-950/95 backdrop-blur-md z-20 py-4 px-6 border-b border-white/5">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-600">{t('strategic_fit')}</span>
                                </td>
                                {projects.map(p => (
                                    <td key={p.id} className="p-0 border-b border-white/5 bg-transparent" />
                                ))}
                            </tr>

                            <MetricRow 
                                label={t('metric_alignment')} 
                                projects={projects} 
                                render={p => (
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-[10px] font-black ${
                                            (p.fit_score || 0) > 75 ? 'border-emerald-500 text-emerald-500 bg-emerald-500/10' : 
                                            (p.fit_score || 0) > 50 ? 'border-yellow-500 text-yellow-500 bg-yellow-500/10' : 'border-slate-700 text-slate-500 bg-slate-900'
                                        }`}>
                                            {p.fit_score}%
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">{p.fit_label}</span>
                                    </div>
                                )} 
                            />

                            <MetricRow 
                                label={t('location_score')} 
                                projects={projects} 
                                render={p => <ScoreBar value={p.location_score} />} 
                            />
                            <MetricRow 
                                label={t('liquidity_score')} 
                                projects={projects} 
                                render={p => <ScoreBar value={p.liquidity_score} />} 
                            />
                            <MetricRow 
                                label={t('growth_score')} 
                                projects={projects} 
                                render={p => <ScoreBar value={p.growth_score} color="emerald" />} 
                            />
                            <MetricRow 
                                label={t('legal_score')} 
                                projects={projects} 
                                render={p => <ScoreBar value={p.legal_score} color="sky" />} 
                            />
                            <MetricRow 
                                label={t('risk_score')} 
                                projects={projects} 
                                render={p => <ScoreBar value={p.risk_score} color="rose" inverse />} 
                            />
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

function MetricRow({ label, projects, value, render, color = "text-slate-100" }: { 
    label: string, 
    projects: ProjectComparisonData[], 
    value?: (p: ProjectComparisonData) => string | number,
    render?: (p: ProjectComparisonData) => React.ReactNode,
    color?: string
}) {
    return (
        <tr className="group hover:bg-white/[0.01] transition-all">
            <td className="sticky left-0 bg-slate-950/95 backdrop-blur-md z-20 py-4 px-6 align-top">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 group-hover:text-slate-400 transition-colors">{label}</span>
            </td>
            {projects.map(p => (
                <td key={p.id} className="py-4 px-6 border-l border-white/5">
                    {render ? render(p) : (
                        <span className={`text-xs font-black italic ${color}`}>{value ? value(p) : '—'}</span>
                    )}
                </td>
            ))}
        </tr>
    );
}

function ScoreBar({ value, color = "yellow", inverse = false }: { value: number | null, color?: string, inverse?: boolean }) {
    if (value === null) return <span className="text-slate-700 text-[10px] font-bold">N/A</span>;
    
    const colors: Record<string, string> = {
        yellow: 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.3)]',
        emerald: 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]',
        sky: 'bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.3)]',
        rose: 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
    };

    // For risk, higher is worse (unless we consider risk score as safety)
    // PREIO Risk Score standard: higher is MORE risk. 
    const displayColor = inverse 
        ? (value > 70 ? colors.rose : value > 40 ? colors.yellow : colors.emerald)
        : (value > 70 ? colors.emerald : value > 40 ? colors.yellow : colors.rose);

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
                <span className="text-[11px] font-black italic text-slate-300">{value}</span>
                <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden max-w-[80px]">
                    <div 
                        className={`h-full transition-all duration-1000 ${displayColor}`}
                        style={{ width: `${value}%` }}
                    />
                </div>
            </div>
        </div>
    );
}

