import { createClient } from '@/lib/supabase/server';
import { redirect, Link } from '@/navigation';
import StrategicFitGauge from '@/components/advisory/StrategicFitGauge';

interface RecommendationsPageProps {
    params: { locale: string };
}

type Project = {
    id: string;
    name: string;
    location: string;
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

const GRADE_STYLES: Record<string, string> = {
    A: 'bg-emerald-950 text-emerald-400 border border-emerald-700/40',
    B: 'bg-sky-950 text-sky-400 border border-sky-700/40',
    C: 'bg-amber-950 text-amber-400 border border-amber-700/40',
    D: 'bg-red-950 text-red-400 border border-red-700/40',
};

function GradeBadge({ grade }: { grade: string | null }) {
    if (!grade) return null;
    const style = GRADE_STYLES[grade] ?? 'bg-slate-800 text-slate-400 border border-slate-700';
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold tracking-wider ${style}`}>
            Grade {grade}
        </span>
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

    // 3. Fetch active visible projects
    const { data: projects } = await supabase
        .from('projects')
        .select('id, name, location, investment_grade, analyst_confidence_level')
        .eq('status', 'active')
        .eq('visible_to_clients', true)
        .returns<Project[]>();

    const activeProjects = projects ?? [];

    // 4. For each project, call calculate_project_fit RPC
    const projectsWithFit: ProjectWithFit[] = await Promise.all(
        activeProjects.map(async (project) => {
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

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-yellow-600/70 font-medium">
                    Advisory Engine
                </p>
                <h1 className="text-4xl font-black tracking-tighter text-slate-100">
                    Project{' '}
                    <span className="bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
                        Recommendations
                    </span>
                </h1>
                <p className="text-slate-400 max-w-2xl text-sm leading-relaxed">
                    Projects curated in alignment with your strategic profile.
                </p>
            </div>

            {/* Empty State */}
            {sorted.length === 0 && (
                <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center rounded-2xl border border-slate-800 bg-slate-900/40 p-12">
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
                        <span className="text-2xl">📋</span>
                    </div>
                    <p className="text-slate-300 font-semibold">No active projects available</p>
                    <p className="text-slate-500 text-sm max-w-xs">
                        No active projects available for advisory review. Check back soon.
                    </p>
                </div>
            )}

            {/* Project Grid */}
            {sorted.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {sorted.map((project) => (
                        <div
                            key={project.id}
                            className="group rounded-2xl border border-slate-700/50 bg-slate-900/60 backdrop-blur-sm p-6 flex flex-col gap-5 transition-all duration-300 hover:-translate-y-1 hover:border-yellow-700/30 hover:shadow-[0_8px_32px_rgba(250,204,21,0.06)]"
                        >
                            {/* Card Header */}
                            <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1 min-w-0">
                                    <h2 className="text-base font-bold text-slate-100 truncate leading-snug">
                                        {project.name}
                                    </h2>
                                    <p className="text-xs text-slate-500 truncate">{project.location}</p>
                                </div>
                                <GradeBadge grade={project.investment_grade} />
                            </div>

                            {/* Gauge */}
                            <div className="flex justify-center">
                                <StrategicFitGauge
                                    fitScore={project.fit_score}
                                    fitLabel={project.fit_label}
                                    riskAlignment={project.risk_alignment}
                                    returnAlignment={project.return_alignment}
                                    horizonAlignment={project.horizon_alignment}
                                    analystConfidence={project.analyst_confidence_level}
                                />
                            </div>

                            {/* View Details Button */}
                            <Link
                                href={`/dashboard/projects/${project.id}`}
                                className="w-full text-center text-xs font-semibold tracking-wider uppercase py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:border-yellow-700/50 hover:text-yellow-400 transition-all duration-200"
                            >
                                View Details
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
