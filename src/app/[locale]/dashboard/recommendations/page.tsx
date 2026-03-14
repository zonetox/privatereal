import { createClient } from '@/lib/supabase/server';
import { redirect, Link } from '@/navigation';
import StrategicFitGauge from '@/components/projects/StrategicFitGauge';
import WorkspaceToggle from '@/components/projects/WorkspaceToggle';
import CompareToggle from '@/components/projects/CompareToggle';
import {
    Building2,
    MapPin,
    TrendingUp,
    Clock,
    Target,
    Coins,
    Calendar,
    BarChart3,
    ArrowUpRight,
    ShieldCheck
} from 'lucide-react';

interface RecommendationsPageProps {
    params: { locale: string };
}

type OpportunityCard = {
    key_strengths: string[] | null;
    risk_indicators: string[] | null;
    thesis_summary: string | null;
};

type Project = {
    id: string;
    name: string;
    location: string;
    developer: string | null;
    property_type: string | null;
    target_segment: string | null;
    price_per_m2: number | null;
    launch_year: number | null;
    expected_growth_rate: number | null;
    holding_period_recommendation: number | null;
    investment_grade: string | null;
    analyst_confidence_level: number | null;
    liquidity_score: number | null;
    growth_score: number | null;
    infrastructure_score: number | null;
    avg_rental_yield: number | null;
    evaluation_notes: string | null;
    min_unit_price: number | null;
    opportunity_cards?: OpportunityCard[];
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

type ProjectWithFit = Project & FitResult & { isSelected: boolean };

const GRADE_CONFIG: Record<string, string> = {
    A: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5',
    B: 'text-sky-400 border-sky-500/30 bg-sky-500/5',
    C: 'text-amber-400 border-amber-500/30 bg-amber-500/5',
    D: 'text-rose-400 border-rose-500/30 bg-rose-500/5',
};

function GradeBadge({ grade }: { grade: string | null }) {
    if (!grade) return null;
    const styles = GRADE_CONFIG[grade] || 'text-slate-400 border-slate-700 bg-slate-800';
    return (
        <div className={`px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${styles}`}>
            Grade {grade}
        </div>
    );
}

function MetricItem({ icon: Icon, label, value, colorClass = "text-slate-400" }: { icon: any, label: string, value: string | number | null, colorClass?: string }) {
    return (
        <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-slate-500">
                <Icon size={12} />
                <span className="text-[9px] uppercase tracking-wider font-bold">{label}</span>
            </div>
            <span className={`text-[11px] font-bold ${colorClass}`}>{value ?? '—'}</span>
        </div>
    );
}

export default async function RecommendationsPage({ params }: RecommendationsPageProps) {
    const { locale } = await Promise.resolve(params);
    const supabase = createClient();

    // 1. Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect({ href: '/login', locale });
        return null;
    }

    // 2. Get client id using cached utility (Performance optimization)
    const { getCachedClient } = require('@/lib/cache-utils');
    const clientRecord = await getCachedClient();
    const clientId = clientRecord?.id ?? null;

    // 3. Fetch active visible projects & Fit results in parallel (Bulk optimization)
    // We use RPC for bulk fit calculation to avoid N+1 queries.
    const [projectsResponse, fitResponse, selectionsResponse] = await Promise.all([
        supabase
            .from('projects')
            .select('*')
            .eq('status', 'active')
            .eq('visible_to_clients', true),
        clientId ? supabase.rpc('calculate_all_project_fits', { p_client_id: clientId }) : Promise.resolve({ data: [] }),
        clientId ? supabase.from('client_workspace_selections').select('project_id').eq('client_id', clientId) : Promise.resolve({ data: [] })
    ]);

    const activeProjects = projectsResponse.data ?? [];
    const fitDataMap = new Map((fitResponse.data as any[] || []).map(f => [f.project_id, f]));
    const selectedIds = new Set((selectionsResponse.data as any[] || []).map(s => s.project_id));

    // 4. Merge results efficiently
    const projectsWithFit: ProjectWithFit[] = activeProjects.map(project => {
        const fitData = fitDataMap.get(project.id);
        return {
            ...project,
            fit_score: fitData?.fit_score ?? null,
            fit_label: fitData?.fit_label ?? 'Insufficient Data',
            budget_alignment: fitData?.budget_alignment ?? null,
            risk_alignment: fitData?.risk_alignment ?? null,
            horizon_alignment: fitData?.horizon_alignment ?? null,
            location_alignment: fitData?.location_alignment ?? null,
            goal_alignment: fitData?.goal_alignment ?? null,
            isSelected: selectedIds.has(project.id)
        };
    });

    const sorted = projectsWithFit.sort((a, b) => (b.fit_score || 0) - (a.fit_score || 0));

    const formatter = new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', { style: 'currency', currency: locale === 'vi' ? 'VND' : 'USD', maximumFractionDigits: 0 });

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
                <div className="space-y-2">
                    <p className="text-[9px] md:text-xs uppercase tracking-[0.3em] text-yellow-600/80 font-bold">Advisory Board</p>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-100 italic">Real Estate <span className="bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-500 bg-clip-text text-transparent">Opportunities</span></h1>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {sorted.map((project) => (
                    <div key={project.id} className="relative">
                        <Link href={`/dashboard/projects/${project.id}`} className="group relative flex flex-col glass rounded-[1.5rem] md:rounded-[2.5rem] border border-white/5 bg-slate-900/40 transition-all duration-500 hover:-translate-y-2 hover:border-yellow-500/20 hover:shadow-[0_20px_60px_-15px_rgba(234,179,8,0.1)] overflow-hidden">
                            <div className="p-5 md:p-8 pb-4 space-y-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-500 text-[8px] font-black uppercase tracking-widest border border-yellow-500/20">Advisory Project</span>
                                        </div>
                                        <h2 className="text-xl md:text-2xl font-black text-slate-100 truncate tracking-tight">{project.name}</h2>
                                        <div className="flex items-center gap-1.5 text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                            {project.developer && <span className="text-amber-500/90 truncate max-w-[100px] md:max-w-none">{project.developer} <span className="text-slate-600 px-1">•</span></span>}
                                            <MapPin size={12} className="text-yellow-500/50 flex-shrink-0" /> <span className="truncate">{project.location}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="pt-2">
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">Giá từ</p>
                                    <p className="text-lg md:text-xl font-bold text-emerald-400">{project.min_unit_price ? formatter.format(project.min_unit_price) : 'Liên hệ'}</p>
                                </div>
                            </div>

                            <div className="px-4 md:px-5 py-3 border-y border-white/5 bg-white/[0.02] transform scale-95 md:scale-100 origin-center">
                                <StrategicFitGauge 
                                    fitScore={project.fit_score} 
                                    fitLabel={project.fit_label}
                                    budgetAlignment={project.budget_alignment ?? null}
                                    riskAlignment={project.risk_alignment}
                                    horizonAlignment={project.horizon_alignment}
                                    locationAlignment={project.location_alignment ?? null}
                                    goalAlignment={project.goal_alignment ?? null}
                                    advisoryConfidence={project.analyst_confidence_level}
                                />
                            </div>

                            {/* Intelligence Curation Section */}
                            {project.opportunity_cards && project.opportunity_cards[0] && (
                                <div className="p-8 pt-6 pb-2 space-y-4">
                                    {project.opportunity_cards[0].key_strengths && project.opportunity_cards[0].key_strengths.length > 0 && (
                                        <div className="space-y-2">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Key Strengths</span>
                                            <ul className="space-y-1">
                                                {project.opportunity_cards[0].key_strengths.slice(0, 2).map((str, idx) => (
                                                    <li key={idx} className="flex items-start gap-2 text-[11px] text-slate-300 font-medium">
                                                        <span className="text-emerald-500 mt-0.5">•</span> {str}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {project.opportunity_cards[0].risk_indicators && project.opportunity_cards[0].risk_indicators.length > 0 && (
                                        <div className="space-y-2">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-amber-500">Risk Indicators</span>
                                            <ul className="space-y-1">
                                                {project.opportunity_cards[0].risk_indicators.slice(0, 2).map((risk, idx) => (
                                                    <li key={idx} className="flex items-start gap-2 text-[11px] text-slate-400 font-medium italic">
                                                        <span className="text-amber-500 mt-0.5">•</span> {risk}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className={`p-8 ${project.opportunity_cards && project.opportunity_cards[0] ? 'pt-4' : 'pt-6'} space-y-6`}>
                                <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                                    <div className="space-y-3">
                                        <MetricItem icon={Calendar} label="Launch" value={project.launch_year} />
                                        <MetricItem icon={Coins} label="Price/m²" value={project.price_per_m2 ? formatter.format(project.price_per_m2) : '—'} />
                                    </div>
                                    <div className="space-y-3 pl-4 border-l border-white/5">
                                        <MetricItem icon={TrendingUp} label="Exp. Growth" value={project.expected_growth_rate ? `${project.expected_growth_rate}%` : '—'} colorClass="text-emerald-400" />
                                        <MetricItem icon={ShieldCheck} label="Confidence" value={project.analyst_confidence_level ? `${project.analyst_confidence_level}%` : '—'} />
                                    </div>
                                </div>
                            </div>

                            <div className={`px-5 md:p-8 ${project.opportunity_cards && project.opportunity_cards[0] ? 'pt-4' : 'pt-6'} space-y-6`}>
                                <div className="grid grid-cols-2 gap-x-4 md:gap-x-8 gap-y-3">
                                    <div className="space-y-2.5 md:space-y-3">
                                        <MetricItem icon={Calendar} label="Launch" value={project.launch_year} />
                                        <MetricItem icon={Coins} label="Price/m²" value={project.price_per_m2 ? formatter.format(project.price_per_m2) : '—'} />
                                    </div>
                                    <div className="space-y-2.5 md:space-y-3 pl-3 md:pl-4 border-l border-white/5">
                                        <MetricItem icon={TrendingUp} label="Exp. Growth" value={project.expected_growth_rate ? `${project.expected_growth_rate}%` : '—'} colorClass="text-emerald-400" />
                                        <MetricItem icon={ShieldCheck} label="Confidence" value={project.analyst_confidence_level ? `${project.analyst_confidence_level}%` : '—'} />
                                    </div>
                                </div>
                            </div>
                        </Link>
                        
                        <div className="absolute bottom-5 md:bottom-6 right-16 md:right-20 z-20">
                            {clientId && <WorkspaceToggle projectId={project.id} clientId={clientId} initialState={project.isSelected} />}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
