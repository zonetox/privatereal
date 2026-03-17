import { createClient } from '@/lib/supabase/server';
import { redirect, Link } from '@/navigation';
import StrategicFitGauge from '@/components/projects/StrategicFitGauge';
import CompareToggle from '@/components/projects/CompareToggle';
import LifecycleTimeline from '@/components/projects/LifecycleTimeline';
import LifecycleStageUpdate from '@/components/projects/LifecycleStageUpdate';
import { MapPin, Check, ArrowUpRight, MessageSquare, CheckSquare, FileText, Briefcase } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import DecisionNoteEditor from '@/components/projects/DecisionNoteEditor';

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

    const { data: selections } = await supabase.from('client_workspace_selections').select('*, project:projects(*)').eq('client_id', clientId);
    const projectsData = selections || [];

    const projects: (ProjectSummary & { personal_notes: string | null })[] = await Promise.all(
        projectsData.map(async (selection: any) => {
            const project = selection.project;
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
                lifecycle: lifecycle || null,
                personal_notes: selection.notes
            };
        })
    );

    const { data: ownedProperties } = await supabase.from('client_properties').select('*, project:projects(name)').eq('client_id', clientId);

    const formatter = new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
        style: 'currency',
        currency: locale === 'vi' ? 'VND' : 'USD',
        maximumFractionDigits: 0
    });

    const ownedPropertiesData = ownedProperties || [];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* 1. HEADER & GLOBAL ACTIONS */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
                <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-[0.4em] text-yellow-600/80 font-black">{t('header_badge')}</p>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-100 italic">
                        {t('header_title')} <span className="text-yellow-500">{t('header_title_highlight')}</span>
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    {projects.length >= 2 && (
                        <Link 
                            href={`/dashboard/compare?ids=${projects.map(p => p.id).join(',')}`}
                            className="px-6 py-4 rounded-2xl bg-yellow-500 text-slate-950 text-[10px] font-black uppercase tracking-widest hover:bg-yellow-400 transition-all shadow-xl shadow-yellow-500/20"
                        >
                            {t('compare_selected')} ({projects.length})
                        </Link>
                    )}
                    <Link href="/dashboard/recommendations" className="px-6 py-4 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 hover:bg-white/10 transition-all">
                        {t('explore_more')}
                    </Link>
                </div>
            </div>

            {projects.length === 0 && (
                <div className="flex flex-col items-center justify-center min-h-[50vh] gap-8 text-center rounded-[3rem] border border-white/5 bg-slate-900/40 p-12 glass">
                    <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center text-slate-600 border border-white/5">
                        <Briefcase size={40} />
                    </div>
                    <div className="space-y-3">
                        <p className="text-slate-200 text-2xl font-black italic tracking-tight">{t('empty_title')}</p>
                        <p className="text-slate-500 text-xs max-w-[350px] leading-relaxed uppercase tracking-widest font-bold">{t('empty_desc')}</p>
                    </div>
                    <Link href="/dashboard/recommendations" className="px-10 py-5 rounded-3xl bg-yellow-500 text-slate-950 text-xs font-black uppercase tracking-widest shadow-2xl shadow-yellow-500/20 hover:scale-105 active:scale-95 transition-all">
                        {t('explore_opportunities')}
                    </Link>
                </div>
            )}

            {/* 2. DECISION GRID (MAIN COCKPIT) */}
            <div className="grid grid-cols-1 gap-16">
                {projects.map((item) => (
                    <div key={item.id} className="relative group flex flex-col glass rounded-[3.5rem] border border-white/10 bg-slate-900/40 p-1 transition-all hover:border-yellow-500/20 overflow-hidden">
                        
                        {/* Area 4: Lifecycle Tracking (Banner Style) */}
                        <div className="px-8 py-6 border-b border-white/5 bg-white/[0.02]">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{t('lifecycle_tracking')}</span>
                                    {item.lifecycle && (
                                        <div className="px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[9px] font-black uppercase tracking-widest animate-in fade-in zoom-in duration-500">
                                            {item.lifecycle.stage.replace(/_/g, ' ')}
                                        </div>
                                    )}
                                </div>
                                {item.lifecycle && (
                                    <LifecycleStageUpdate 
                                        lifecycleId={item.lifecycle.id} 
                                        currentStage={item.lifecycle.stage} 
                                        isAdmin={isAdmin} 
                                    />
                                )}
                            </div>
                            <LifecycleTimeline currentStage={item.lifecycle?.stage || 'exploring'} />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                            {/* Area 1: Saved Project Summary */}
                            <div className="lg:col-span-4 p-8 border-r border-white/5 flex flex-col justify-between space-y-8">
                                <div className="space-y-6">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <h2 className="text-2xl md:text-3xl font-black text-slate-100 italic tracking-tighter">{item.name}</h2>
                                            <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                                                <MapPin size={12} className="text-yellow-600" /> {item.location}
                                            </div>
                                        </div>
                                        <GradeBadge grade={item.investment_grade} />
                                    </div>
                                    <div className="scale-100 origin-left">
                                        <StrategicFitGauge fitScore={item.fit_score} fitLabel={item.fit_label} budgetAlignment={item.budget_alignment} riskAlignment={item.risk_alignment} horizonAlignment={item.horizon_alignment} locationAlignment={item.location_alignment} goalAlignment={item.goal_alignment} />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <Link 
                                            href={`/dashboard/workspace/${item.id}/brief`}
                                            className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-yellow-500 text-slate-950 hover:bg-yellow-400 transition-all shadow-xl shadow-yellow-500/10"
                                        >
                                            <FileText size={16} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">{t('generate_brief')}</span>
                                        </Link>
                                        <CompareToggle project={{ id: item.id, name: item.name }} />
                                    </div>
                                    <Link href={`/dashboard/projects/${item.id}`} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-yellow-500/[0.05] hover:border-yellow-500/20 transition-all group/link">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover/link:text-yellow-500 transition-colors">{t('view_analysis')}</span>
                                        <ArrowUpRight size={16} className="text-slate-600 group-hover/link:text-yellow-600" />
                                    </Link>
                                </div>
                            </div>
                            
                            {/* Area 3: Decision Notes & Area 2: Comparison Items (Checklist) */}
                            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-0 bg-black/20">
                                {/* Decision Notes (Client & Advisor) */}
                                <div className="p-8 border-r border-white/5 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <MessageSquare size={16} className="text-yellow-500" />
                                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-200">{t('decision_notes')}</h3>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Advisory Section */}
                                        <div className="space-y-4">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{t('advisor_insights')}</span>
                                            <div className="space-y-3 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                                                {item.advisor_notes.length === 0 ? (
                                                    <div className="p-4 rounded-xl border border-dashed border-white/10 text-center">
                                                        <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">{t('awaiting_feedback')}</p>
                                                    </div>
                                                ) : (
                                                    item.advisor_notes.map(note => (
                                                        <div key={note.id} className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                                            <p className="text-[11px] text-slate-300 leading-relaxed italic">“{note.content}”</p>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>

                                        {/* Client Personal Notes */}
                                        <DecisionNoteEditor 
                                            clientId={clientId}
                                            projectId={item.id}
                                            initialNotes={item.personal_notes}
                                        />
                                    </div>
                                </div>

                                {/* Comparison & Checklist */}
                                <div className="p-8 space-y-6">
                                    <div className="flex items-center gap-3">
                                        <CheckSquare size={16} className="text-emerald-500" />
                                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-200">{t('decision_items')}</h3>
                                    </div>
                                    <div className="space-y-3">
                                        {item.checklist.length === 0 ? (
                                            ['Pháp lý (Audit)', 'Tài chính (Cashflow)', 'Hiện trạng (Site Visit)', 'Thủ tục (SPA)'].map((label, i) => (
                                                <div key={i} className="flex items-center gap-3 p-4 rounded-2xl border border-white/5 bg-white/[0.02] opacity-30">
                                                    <div className="w-5 h-5 rounded border border-white/10" />
                                                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
                                                </div>
                                            ))
                                        ) : (
                                            item.checklist.map(task => (
                                                <div key={task.id} className={`flex items-center gap-3 p-4 rounded-2xl border ${task.is_completed ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/[0.02] border-white/5'}`}>
                                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${task.is_completed ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'border-white/20'}`}>
                                                        {task.is_completed && <Check size={12} className="text-slate-950" />}
                                                    </div>
                                                    <span className="text-[11px] font-black uppercase tracking-wider">{task.task_name}</span>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Action items for this specific cockpit entry */}
                                    <div className="pt-6 border-t border-white/5">
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 mb-4">Các bước tiếp theo</p>
                                        <button className="w-full p-4 rounded-xl border border-dashed border-white/10 hover:border-white/20 transition-all text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-300">
                                            + Thêm hạng mục quyết định
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* 3. MY PORTFOLIO ASSETS (FROM client_properties) */}
            {ownedPropertiesData.length > 0 && (
                <div className="pt-10 space-y-8">
                    <div className="flex items-center gap-4 px-1">
                        <Briefcase className="text-emerald-500" />
                        <h2 className="text-2xl md:text-3xl font-black text-slate-100 italic tracking-tight">{t('my_portfolio_assets')}</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {ownedPropertiesData.map((prop: any) => (
                            <div key={prop.id} className="glass rounded-[2rem] border border-white/10 bg-slate-900/40 p-8 space-y-6">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-xl font-black text-slate-100 italic tracking-tight">{prop.project?.name || 'Unknown Project'}</h3>
                                    <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-black uppercase tracking-widest">
                                        {prop.current_status?.replace(/_/g, ' ') || 'Unknown'}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-y-4">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">{t('unit_code')}</p>
                                        <p className="text-xs font-bold text-slate-300">{prop.unit_code || '—'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">{t('purchase_date')}</p>
                                        <p className="text-xs font-bold text-slate-300">{prop.purchase_date || '—'}</p>
                                    </div>
                                    <div className="col-span-2 space-y-1">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">{t('contract_value')}</p>
                                        <p className="text-lg font-black text-emerald-400">{prop.contract_value ? formatter.format(prop.contract_value) : '—'}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
