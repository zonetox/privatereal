import { createClient } from '@/lib/supabase/server';
import { redirect, Link } from '@/navigation';
import StrategicFitGauge from '@/components/projects/StrategicFitGauge';
import CompareToggle from '@/components/projects/CompareToggle';
import LifecycleTimeline from '@/components/projects/LifecycleTimeline';
import LifecycleStageUpdate from '@/components/projects/LifecycleStageUpdate';
import { MapPin, Check, ArrowUpRight, MessageSquare, CheckSquare, FileText, Briefcase } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

interface WorkspacePageProps {
    params: { locale: string };
}

type Project = {
    id: string;
    name: string;
    location: string;
    developer: string | null;
    investment_grade: string | null;
    price_per_m2: number | null;
    launch_year: number | null;
    target_segment: string | null;
    expected_growth_rate: number | null;
    holding_period_recommendation: number | null;
    analyst_confidence_level: number | null;
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

type AdvisorNote = {
    id: string;
    content: string;
    created_at: string;
};

type ChecklistItem = {
    id: string;
    task_name: string;
    is_completed: boolean;
};

type ProjectSummary = Project & FitResult & {
    advisor_notes: AdvisorNote[];
    checklist: ChecklistItem[];
    lifecycle?: {
        id: string;
        stage: string;
    } | null;
};

const GRADE_CONFIG: Record<string, string> = {
    A: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5',
    B: 'text-sky-400 border-sky-500/30 bg-sky-500/5',
    C: 'text-amber-400 border-amber-500/30 bg-amber-500/5',
    D: 'text-rose-400 border-rose-500/30 bg-rose-500/5',
};

function GradeBadge({ grade }: { grade: string | null }) {
    if (!grade) return null;
    const styles = GRADE_CONFIG[grade] || 'text-slate-400 border-slate-700 bg-slate-800';
    return <div className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${styles}`}>G {grade}</div>;
}

export default async function DecisionWorkspace({ params }: WorkspacePageProps) {
    const t = await getTranslations('Workspace');
    const { locale } = await Promise.resolve(params);
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect({ href: '/login', locale });
        return null;
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (!profile) return null;
    const isAdmin = profile.role === 'admin';

    const { data: clientRecord } = await supabase.from('clients').select('id').eq('user_id', user.id).single();
    if (!clientRecord) return null;
    const clientId = clientRecord.id;

    const { data: selections } = await supabase.from('client_workspace_selections').select('project:projects(*)').eq('client_id', clientId);
    const rawProjects = (selections?.map(s => s.project) || []) as unknown as Project[];

    const projects: ProjectSummary[] = await Promise.all(
        rawProjects.map(async (project) => {
            const { data: fitData } = await supabase.rpc('calculate_project_fit', { p_client_id: clientId, p_project_id: project.id }).maybeSingle<FitResult>();
            const { data: notes } = await supabase.from('advisor_notes').select('*').eq('client_id', clientId).eq('project_id', project.id).order('created_at', { ascending: false });
            const { data: checklist } = await supabase.from('decision_checklists').select('*').eq('client_id', clientId).eq('project_id', project.id);
            const { data: lifecycle } = await supabase.from('client_project_lifecycle').select('id, stage').eq('client_id', clientId).eq('project_id', project.id).maybeSingle();

            return {
                ...project,
                fit_score: fitData?.fit_score ?? null,
                fit_label: fitData?.fit_label ?? '—',
                budget_alignment: fitData?.budget_alignment ?? null,
                risk_alignment: fitData?.risk_alignment ?? null,
                horizon_alignment: fitData?.horizon_alignment ?? null,
                location_alignment: fitData?.location_alignment ?? null,
                goal_alignment: fitData?.goal_alignment ?? null,
                advisor_notes: notes || [],
                checklist: checklist || [],
                lifecycle: lifecycle || null
            };
        })
    );

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.3em] text-yellow-600/80 font-bold">Decision Center</p>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-100 italic">Decision <span className="text-yellow-500">Workspace</span></h1>
                </div>
                <Link href="/dashboard/recommendations" className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 hover:bg-yellow-500 hover:text-slate-950 transition-all font-bold">Explore More Projects</Link>
            </div>

            {projects.length === 0 && (
                <div className="flex flex-col items-center justify-center min-h-[40vh] md:min-h-[50vh] gap-4 md:gap-6 text-center rounded-[2rem] md:rounded-[3rem] border border-white/5 bg-slate-900/40 p-6 md:p-12 glass">
                    <div className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-white/5 flex items-center justify-center text-slate-600 border border-white/5"><Briefcase size={28} className="md:w-9 md:h-9" /></div>
                    <div className="space-y-2">
                        <p className="text-slate-300 text-lg md:text-xl font-black italic tracking-tight">{t('empty_title')}</p>
                        <p className="text-slate-500 text-[10px] md:text-xs max-w-[250px] md:max-w-[300px] leading-relaxed uppercase tracking-widest font-medium">{t('empty_desc')}</p>
                    </div>
                    <Link href="/dashboard/recommendations" className="mt-2 md:mt-4 px-6 md:px-8 py-3 md:py-4 rounded-2xl md:rounded-3xl bg-yellow-500 text-slate-950 text-[10px] md:text-xs font-black uppercase tracking-widest shadow-2xl shadow-yellow-500/20 hover:scale-105 active:scale-95 transition-all">{t('explore_opportunities')}</Link>
                </div>
            )}

            <div className="grid grid-cols-1 gap-12">
                {projects.map((item) => (
                    <div key={item.id} className="group relative glass rounded-[3rem] border border-white/5 bg-slate-900/20 overflow-hidden">
                        
                        {/* Lifecycle Banner */}
                        <div className="px-5 md:px-8 pt-6 md:pt-8 pb-2 md:pb-4 border-b border-white/5 bg-white/[0.01]">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 md:mb-2">
                                <div className="flex items-center gap-3 md:gap-4">
                                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">{t('advisory_journey')}</span>
                                    {item.lifecycle && (
                                        <div className="px-2.5 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[8px] md:text-[9px] font-black uppercase tracking-widest">
                                            {item.lifecycle.stage.replace(/_/g, ' ')}
                                        </div>
                                    )}
                                </div>
                                {item.lifecycle && (
                                    <div className="self-end md:self-auto">
                                        <LifecycleStageUpdate 
                                            lifecycleId={item.lifecycle.id} 
                                            currentStage={item.lifecycle.stage} 
                                            isAdmin={isAdmin} 
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="scale-95 md:scale-100 origin-left">
                                <LifecycleTimeline currentStage={item.lifecycle?.stage || 'research'} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                            <div className="lg:col-span-4 p-5 md:p-8 border-r border-white/5 space-y-6 md:space-y-8">
                                <div className="space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <h2 className="text-xl md:text-2xl font-black text-slate-100 italic tracking-tight">{item.name}</h2>
                                            <div className="flex items-center gap-1.5 text-slate-500 text-[9px] md:text-[10px] font-bold uppercase tracking-wider"><MapPin size={10} className="text-yellow-600 flex-shrink-0" />{item.location}</div>
                                        </div>
                                        <GradeBadge grade={item.investment_grade} />
                                    </div>
                                </div>
                                <div className="scale-95 md:scale-100 origin-left">
                                    <StrategicFitGauge fitScore={item.fit_score} fitLabel={item.fit_label} budgetAlignment={item.budget_alignment} riskAlignment={item.risk_alignment} horizonAlignment={item.horizon_alignment} locationAlignment={item.location_alignment} goalAlignment={item.goal_alignment} />
                                </div>
                                <div className="pt-2 md:pt-4 flex flex-col gap-2.5 md:gap-3">
                                    <Link 
                                        href={`/dashboard/workspace/${item.id}/brief`}
                                        className="flex items-center justify-center gap-2 w-full p-3.5 md:p-4 rounded-xl md:rounded-2xl bg-yellow-500 text-slate-950 hover:bg-yellow-400 transition-all shadow-xl shadow-yellow-500/10"
                                    >
                                        <FileText size={14} className="md:w-4 md:h-4" />
                                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">{t('generate_brief')}</span>
                                    </Link>
                                    <CompareToggle project={{ id: item.id, name: item.name }} />
                                    <Link href={`/dashboard/projects/${item.id}`} className="flex items-center justify-between p-3.5 md:p-4 rounded-xl md:rounded-2xl bg-white/5 border border-white/5 hover:bg-yellow-500/[0.03] hover:border-yellow-500/20 transition-all group/link">
                                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover/link:text-yellow-500 transition-colors">{t('property_advisory_detail')}</span>
                                        <ArrowUpRight size={14} className="md:w-4 md:h-4 text-slate-600 group-hover/link:text-yellow-600" />
                                    </Link>
                                </div>
                            </div>
                            
                            <div className="lg:col-span-8 p-5 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 bg-black/10">
                                <div className="space-y-5 md:space-y-6">
                                    <div className="flex items-center gap-2"><MessageSquare size={14} className="md:w-4 md:h-4 text-yellow-500" /><h3 className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-slate-200">{t('advisor_insights')}</h3></div>
                                    <div className="space-y-3 md:space-y-4 max-h-[240px] md:max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                        {item.advisor_notes.length === 0 ? (
                                            <div className="p-5 md:p-6 rounded-xl md:rounded-2xl border border-dashed border-white/10 text-center"><p className="text-[9px] md:text-[10px] text-slate-600 font-bold uppercase tracking-widest">{t('awaiting_feedback')}</p></div>
                                        ) : (
                                            item.advisor_notes.map(note => (
                                                <div key={note.id} className="p-4 md:p-5 rounded-xl md:rounded-2xl bg-white/5 border border-white/5"><p className="text-[11px] md:text-xs text-slate-300 leading-relaxed italic">&ldquo;{note.content}&rdquo;</p></div>
                                            ))
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-5 md:space-y-6">
                                    <div className="flex items-center gap-2"><CheckSquare size={14} className="md:w-4 md:h-4 text-emerald-500" /><h3 className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-slate-200">{t('decision_items')}</h3></div>
                                    <div className="space-y-2.5 md:space-y-3">
                                        {item.checklist.length === 0 ? (
                                            ['Legal Audit', 'Financial Verification', 'Site Inspection'].map((t, i) => (
                                                <div key={i} className="flex items-center gap-2 md:gap-3 p-2.5 md:p-3 rounded-lg md:rounded-xl border border-white/5 bg-white/[0.02] opacity-30">
                                                    <div className="w-4 h-4 md:w-5 md:h-5 rounded border border-white/10" />
                                                    <span className="text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t}</span>
                                                </div>
                                            ))
                                        ) : (
                                            item.checklist.map(task => (
                                                <div key={task.id} className={`flex items-center gap-2 md:gap-3 p-2.5 md:p-3 rounded-lg md:rounded-xl border ${task.is_completed ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' : 'bg-white/[0.02] border-white/5'}`}>
                                                    <div className={`w-4 h-4 md:w-5 md:h-5 rounded border flex items-center justify-center ${task.is_completed ? 'bg-emerald-500 border-emerald-500' : 'border-white/20'}`}>{task.is_completed && <Check size={10} className="md:w-3 md:h-3 text-slate-950" />}</div>
                                                    <span className="text-[10px] md:text-[11px] font-black uppercase tracking-wider">{task.task_name}</span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
