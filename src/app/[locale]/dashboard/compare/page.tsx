import { createClient } from '@/lib/supabase/server';
import { redirect, Link } from '@/navigation';
import {
    ArrowLeft,
    ShieldCheck,
    TrendingUp,
    Coins,
    Clock,
    Target,
    Activity,
    Scale
} from 'lucide-react';
import StrategicFitGauge from '@/components/projects/StrategicFitGauge';

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
    avg_rental_yield: number | null;
    expected_growth_rate: number | null;
    holding_period_recommendation: number | null;
    risk_score: number | null;
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
    const { locale } = await Promise.resolve(params);
    const { ids: idsParam } = await Promise.resolve(searchParams);
    const supabase = createClient();

    const ids = idsParam ? idsParam.split(',') : [];

    // 1. Auth & Client ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect({ href: '/login', locale });

    const { data: clientRecord } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user?.id)
        .single();
    
    const clientId = clientRecord?.id;

    // 2. Fetch Projects
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

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <Link 
                        href="/dashboard/workspace"
                        className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-yellow-500 hover:bg-yellow-500/10 transition-all"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-[0.3em] text-yellow-600/80 font-black">Institutional Analysis</p>
                        <h1 className="text-4xl font-black tracking-tighter text-slate-100 italic">Project <span className="text-yellow-500">Comparison</span></h1>
                    </div>
                </div>
            </div>

            {projects.length === 0 ? (
                <div className="p-20 flex flex-col items-center justify-center rounded-[3rem] border border-dashed border-white/10 bg-slate-900/20 gap-4">
                    <Scale size={48} className="text-slate-700" />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">No Projects Selected for Analysis</p>
                </div>
            ) : (
                <div className="overflow-x-auto pb-10 custom-scrollbar">
                    <table className="w-full border-separate border-spacing-x-4">
                        <thead>
                            <tr>
                                <th className="sticky left-0 bg-slate-950/80 backdrop-blur-md z-30 min-w-[200px] text-left p-6 align-bottom border-b border-white/5">
                                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-600">Metric Alignment</span>
                                </th>
                                {projects.map(p => (
                                    <th key={p.id} className="min-w-[320px] p-6 text-left border-b border-white/5">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-500 text-[8px] font-black uppercase tracking-widest">Selected Asset</span>
                                                <div className={`px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-widest ${
                                                    p.investment_grade === 'A' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5' : 'text-sky-400 border-sky-500/30'
                                                }`}>
                                                    Grade {p.investment_grade}
                                                </div>
                                            </div>
                                            <h3 className="text-2xl font-black text-slate-100 truncate">{p.name}</h3>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider italic">{p.location}</p>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {/* Strategic Fit Section */}
                            <tr>
                                <td className="sticky left-0 bg-slate-950/80 backdrop-blur-md z-20 py-8 px-6 font-black text-[11px] uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                    <Activity size={14} className="text-yellow-600" /> Strategic Fit
                                </td>
                                {projects.map(p => (
                                    <td key={p.id} className="py-8 px-6 bg-white/[0.01]">
                                        <StrategicFitGauge 
                                            fitScore={p.fit_score} 
                                            fitLabel={p.fit_label}
                                            budgetAlignment={p.budget_alignment}
                                            riskAlignment={p.risk_alignment}
                                            horizonAlignment={p.horizon_alignment}
                                            locationAlignment={p.location_alignment}
                                            goalAlignment={p.goal_alignment}
                                        />
                                    </td>
                                ))}
                            </tr>

                            {/* Market Dynamics */}
                            <ComparisonRow 
                                label="Market Snapshot" 
                                icon={Target} 
                                projects={projects}
                                render={p => (
                                    <div className="space-y-4">
                                        <MetricValue label="Price / m²" value={p.price_per_m2 ? formatter.format(p.price_per_m2) : '—'} />
                                        <MetricValue label="Rental Yield" value={p.avg_rental_yield ? `${p.avg_rental_yield}%` : '—'} />
                                    </div>
                                )}
                            />

                            {/* Growth & Risk */}
                            <ComparisonRow 
                                label="Financial Outlook" 
                                icon={TrendingUp} 
                                projects={projects}
                                render={p => (
                                    <div className="space-y-4">
                                        <MetricValue label="Annual Growth" value={p.expected_growth_rate ? `${p.expected_growth_rate}%` : '—'} color="text-emerald-400" />
                                        <MetricValue label="Rec. Horizon" value={p.holding_period_recommendation ? `${p.holding_period_recommendation} Years` : '—'} />
                                    </div>
                                )}
                            />

                            <ComparisonRow 
                                label="Risk Governance" 
                                icon={ShieldCheck} 
                                projects={projects}
                                render={p => (
                                    <div className="space-y-4">
                                        <MetricValue label="Risk Score" value={p.risk_score ? `${p.risk_score} / 100` : '—'} />
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

function ComparisonRow({ label, icon: Icon, projects, render }: { label: string, icon: any, projects: any[], render: (p: any) => React.ReactNode }) {
    return (
        <tr className="group hover:bg-white/[0.02] transition-all">
            <td className="sticky left-0 bg-slate-950/80 backdrop-blur-md z-20 py-10 px-6 align-top">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-slate-500">
                        <Icon size={14} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-slate-300 transition-colors">{label}</span>
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
