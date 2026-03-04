import { createClient } from '@/lib/supabase/server';
import { redirect, Link } from '@/navigation';
import StrategicFitGauge from '@/components/advisory/StrategicFitGauge';
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
};

type FitResult = {
    fit_score: number | null;
    fit_label: string | null;
    risk_alignment: number | null;
    return_alignment: number | null;
    horizon_alignment: number | null;
};

type ProjectWithFit = Project & FitResult;

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

    // 2. Get client id from profiles
    const { data: clientRecord } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user.id)
        .single();

    const clientId = clientRecord?.id ?? null;

    // 3. Fetch active visible projects (Extended fields)
    const { data: projects } = await supabase
        .from('projects')
        .select(`
            id, 
            name, 
            location, 
            developer, 
            property_type, 
            target_segment, 
            price_per_m2, 
            launch_year, 
            expected_growth_rate, 
            holding_period_recommendation, 
            investment_grade, 
            analyst_confidence_level
        `)
        .eq('status', 'active')
        .eq('visible_to_clients', true)
        .returns<Project[]>();

    const activeProjects = projects ?? [];

    // 4. For each project, call calculate_project_fit RPC
    const projectsWithFit: ProjectWithFit[] = await Promise.all(
        activeProjects.map(async (project: Project) => {
            if (!clientId) {
                return {
                    ...project,
                    fit_score: null,
                    fit_label: 'Insufficient Data',
                    risk_alignment: null,
                    return_alignment: null,
                    horizon_alignment: null,
                };
            }

            const { data: fitData } = await supabase
                .rpc('calculate_project_fit', {
                    p_client_id: clientId,
                    p_project_id: project.id,
                })
                .maybeSingle<FitResult>();

            return {
                ...project,
                fit_score: fitData?.fit_score ?? null,
                fit_label: fitData?.fit_label ?? 'Insufficient Data',
                risk_alignment: fitData?.risk_alignment ?? null,
                return_alignment: fitData?.return_alignment ?? null,
                horizon_alignment: fitData?.horizon_alignment ?? null,
            };
        })
    );

    // 5. Sort by fit_score DESC (nulls last)
    const sorted = projectsWithFit.sort((a, b) => {
        if (a.fit_score === null && b.fit_score === null) return 0;
        if (a.fit_score === null) return 1;
        if (b.fit_score === null) return -1;
        return b.fit_score - a.fit_score;
    });

    // 6. Currency Formatter
    const formatter = new Intl.NumberFormat(
        locale === 'vi' ? 'vi-VN' : 'en-US',
        {
            style: 'currency',
            currency: locale === 'vi' ? 'VND' : 'USD',
            maximumFractionDigits: 0
        }
    );

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.3em] text-yellow-600/80 font-bold">
                        Intelligence Board
                    </p>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-100 italic">
                        Real Estate{' '}
                        <span className="bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-500 bg-clip-text text-transparent">
                            Opportunities
                        </span>
                    </h1>
                    <p className="text-slate-500 max-w-2xl text-sm leading-relaxed font-medium">
                        Exclusive assets filtered by the PREIO Advisory Engine to match your strategic profile.
                    </p>
                </div>
            </div>

            {/* Empty State */}
            {sorted.length === 0 && (
                <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center rounded-3xl border border-white/5 bg-slate-900/40 p-12 glass">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-slate-500">
                        <BarChart3 size={32} />
                    </div>
                    <p className="text-slate-300 font-bold tracking-tight">No Active Opportunities</p>
                    <p className="text-slate-500 text-xs max-w-[240px] leading-relaxed uppercase tracking-widest font-medium">
                        The Advisory Engine has not identified any assets matching the publication criteria at this time.
                    </p>
                </div>
            )}

            {/* Opportunity Board Grid */}
            {sorted.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {sorted.map((project) => (
                        <Link
                            key={project.id}
                            href={`/dashboard/projects/${project.id}`}
                            className="group relative flex flex-col glass rounded-[2.5rem] border border-white/5 bg-slate-900/40 transition-all duration-500 hover:-translate-y-2 hover:border-yellow-500/20 hover:shadow-[0_20px_60px_-15px_rgba(234,179,8,0.1)] overflow-hidden"
                        >
                            {/* Card Header (Identity) */}
                            <div className="p-8 pb-4 space-y-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-1.5 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-500 text-[8px] font-black uppercase tracking-widest border border-yellow-500/20">
                                                Asset #{project.id.slice(0, 4)}
                                            </span>
                                            {project.property_type && (
                                                <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">
                                                    • {project.property_type}
                                                </span>
                                            )}
                                        </div>
                                        <h2 className="text-xl font-black text-slate-100 truncate tracking-tight leading-tight group-hover:text-yellow-400 transition-colors">
                                            {project.name}
                                        </h2>
                                        <div className="flex items-center gap-3 text-slate-500">
                                            <div className="flex items-center gap-1 text-[11px] font-medium">
                                                <MapPin size={12} className="text-slate-600" />
                                                {project.location}
                                            </div>
                                            <div className="flex items-center gap-1 text-[11px] font-medium">
                                                <Building2 size={12} className="text-slate-600" />
                                                {project.developer ?? 'Institutional'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <GradeBadge grade={project.investment_grade} />
                                    </div>
                                </div>
                            </div>

                            {/* Compatibility Area (Gauge) */}
                            <div className="px-4 py-2 border-y border-white/5 bg-white/[0.02]">
                                <StrategicFitGauge
                                    fitScore={project.fit_score}
                                    fitLabel={project.fit_label}
                                    riskAlignment={project.risk_alignment}
                                    returnAlignment={project.return_alignment}
                                    horizonAlignment={project.horizon_alignment}
                                    analystConfidence={project.analyst_confidence_level}
                                />
                            </div>

                            {/* Detailed Indicators (Market & Advisory) */}
                            <div className="p-8 pt-6 space-y-6">
                                <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                                    {/* Market Snapshot */}
                                    <div className="space-y-3">
                                        <p className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-black mb-1">Market Snapshot</p>
                                        <MetricItem icon={Calendar} label="Launch" value={project.launch_year} />
                                        <MetricItem icon={Target} label="Segment" value={project.target_segment} />
                                        <MetricItem icon={Coins} label="Price/m²" value={project.price_per_m2 ? formatter.format(project.price_per_m2) : '—'} />
                                    </div>
                                    {/* Advisory Indicators */}
                                    <div className="space-y-3 pl-4 border-l border-white/5">
                                        <p className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-black mb-1">Advisory Intel</p>
                                        <MetricItem icon={TrendingUp} label="Exp. Growth" value={project.expected_growth_rate ? `${project.expected_growth_rate}%` : '—'} colorClass="text-emerald-400" />
                                        <MetricItem icon={Clock} label="Horizon" value={project.holding_period_recommendation ? `${project.holding_period_recommendation}Y` : '—'} />
                                        <MetricItem icon={ShieldCheck} label="Confidence" value={project.analyst_confidence_level ? `${project.analyst_confidence_level}%` : '—'} />
                                    </div>
                                </div>

                                {/* Footer Action */}
                                <div className="pt-2 flex items-center justify-between group/action">
                                    <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold group-hover/action:text-yellow-500 transition-colors">
                                        Examine Asset Intelligence
                                    </span>
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover/action:bg-yellow-500 group-hover/action:text-slate-950 transition-all duration-300">
                                        <ArrowUpRight size={16} />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
