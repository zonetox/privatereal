import { createClient } from '@/lib/supabase/server';
import { redirect, Link } from '@/navigation';
import { logActivityAction } from '@/app/actions/activity-logger';
import { notFound } from 'next/navigation';
import { 
    MapPin, 
    Building2, 
    BarChart3, 
    TrendingUp, 
    Target, 
    Clock, 
    Coins, 
    Calendar, 
    CheckCircle2, 
    ShieldCheck, 
    AlertTriangle 
} from 'lucide-react';
import LocationPanel from "@/components/projects/LocationPanel";
import MarketPanel from "@/components/projects/MarketPanel";
import RiskPanel from "@/components/projects/RiskPanel";
import AdvisorPanel from "@/components/projects/AdvisorPanel";
import FitScorePanel from "@/components/projects/FitScorePanel";
import InfoCard from "@/components/projects/InfoCard";
import StrategicFitGauge from "@/components/projects/StrategicFitGauge";
import WorkspaceToggle from "@/components/projects/WorkspaceToggle";

interface ProjectDetailPageProps {
    params: {
        locale: string;
        id: string;
    };
}

// Utility to match GradeBadge styling from projects list
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
        <div className={`px-4 py-1 rounded-full border text-xl font-black ${styles}`}>
            {grade}
        </div>
    );
}

const PROPERTY_TYPE_LABELS: Record<string, string> = {
    apartment: 'Căn hộ Hạng sang',
    mid_apartment: 'Căn hộ Cao cấp',
    townhouse: 'Nhà phố',
    villa: 'Biệt thự',
    resort: 'BĐS Nghỉ dưỡng',
    land: 'Đất nền',
    mixed_use: 'Phức hợp',
};

const TARGET_SEGMENT_LABELS: Record<string, string> = {
    mass: 'Đại chúng',
    mid: 'Trung cấp',
    high_end: 'Cao cấp',
    luxury: 'Hạng sang (Ultra-Luxury)',
};

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
    const { locale, id } = params;
    const supabase = createClient();

    // 1. Auth & Role Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect({ href: '/login', locale });
        return null;
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    const isAdmin = profile?.role === 'admin';

    // 2. Fetch Project Data directly from projects table (Primary Source of Truth)
    const { data: project, error: projectError } = await supabase
        .from('projects')
        .select(`
            id,
            name,
            location,
            developer,
            price_per_m2,
            property_type,
            launch_year,
            target_segment,
            final_score,
            investment_grade,
            analyst_confidence_level,
            status,
            visible_to_clients,
            
            location_score,
            infrastructure_score,
            liquidity_score,
            growth_score,
            legal_score,
            risk_score,
            downside_risk_percent,
            
            evaluation_notes,
            legal_notes,
            risk_notes,
            buyer_suitability,
            not_suitable_for,
            key_advantages,
            key_concerns,
            market_trend_notes,
            
            avg_rental_yield,
            expected_growth_rate,
            holding_period_recommendation,
            construction_status,
            distance_to_cbd,
            rental_demand,
            supply_level,
            regional_avg_price,
            amenities,
            
            opportunity_cards(*)
        `)
        .eq('id', id)
        .single();

    if (projectError || !project) {
        return notFound();
    }
    
    // Security check: Client can only see active + visible projects
    if (!isAdmin) {
        if (project.status !== 'active' || !project.visible_to_clients) {
            return notFound();
        }
    }

    // 3. Fetch Client Record, Fit Score, and Workspace State (Client Only)
    let fitData = null;
    let clientId: string | null = null;
    let isInWorkspace = false;
    if (!isAdmin) {
        const { data: clientRecord } = await supabase
            .from('clients')
            .select('id, budget_range, preferred_locations, primary_goal, holding_period')
            .eq('user_id', user.id)
            .single();

        if (clientRecord) {
            clientId = clientRecord.id;

            const [rpcResult, wsResult] = await Promise.all([
                supabase.rpc('calculate_project_fit', {
                    p_client_id: clientRecord.id,
                    p_project_id: id
                }),
                supabase
                    .from('client_workspace_selections')
                    .select('id')
                    .eq('client_id', clientRecord.id)
                    .eq('project_id', id)
                    .maybeSingle()
            ]);

            if (rpcResult.data) {
                fitData = Array.isArray(rpcResult.data) ? rpcResult.data[0] : rpcResult.data;
            }
            isInWorkspace = !!wsResult.data;
        }
    }

    // Log project view activity (Client Only)
    if (!isAdmin) {
      logActivityAction('project_view', id, `Viewing Project: ${project.name}`);
    }

    // ==========================================
    // CLIENT ADVISORY UI
    // ==========================================
    if (!isAdmin) {
        return (
            <div className="max-w-5xl mx-auto space-y-12 md:space-y-16 px-4 md:px-8 py-8 md:py-16 animate-in fade-in duration-1000">
                
                {/* 1. HERO SECTION */}
                <div className="relative rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-slate-900 border border-slate-800 p-8 md:p-12">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-yellow-900/10 to-transparent pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8 md:items-end">
                        <div className="space-y-6 flex-1">
                            {fitData && fitData.fit_score >= 70 && (
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-widest shadow-xl">
                                    <CheckCircle2 size={16} />
                                    {t('ProjectDetailClient.suitable_badge')}
                                </div>
                            )}
                            
                            <div className="space-y-2">
                                <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-100 uppercase leading-[1.1]">
                                    {project.name}
                                </h1>
                                <p className="text-sm md:text-base text-slate-400 font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Building2 size={16} /> {project.developer}
                                    <span className="text-slate-700 font-normal">|</span>
                                    <MapPin size={16} /> {project.location}
                                </p>
                            </div>

                            <div className="pt-4 border-t border-slate-800/60 inline-block">
                                <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-slate-500 font-bold mb-1">
                                    Giá niêm yết từ
                                </p>
                                <p className="text-2xl md:text-4xl font-black text-yellow-500 uppercase tracking-tighter">
                                    {project.price_per_m2 ? formatter.format(Number(project.price_per_m2)) : t('AdvisoryBrief.not_available')}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
                            <Link 
                                href={`/dashboard/clients/${clientId}/profile`} 
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-yellow-500 text-slate-950 text-xs font-black uppercase tracking-widest hover:bg-yellow-400 transition-all shadow-xl shadow-yellow-500/10"
                            >
                                <Calendar size={16} />
                                {t('ProjectDetailClient.cta_book_visit')}
                            </Link>
                            {clientId && (
                                <WorkspaceToggle
                                    projectId={id}
                                    clientId={clientId}
                                    initialState={isInWorkspace}
                                    label={t('ProjectDetailClient.cta_save_project')}
                                    className="w-full justify-center px-8 py-4 bg-slate-800/50 hover:bg-slate-800"
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. WHY THIS PROJECT FITS YOU */}
                {fitData && clientRecord && (
                    <div className="bg-gradient-to-br from-yellow-950/20 to-slate-900/40 p-8 md:p-12 rounded-[2rem] border border-yellow-900/30">
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <h2 className="text-[11px] md:text-xs font-black uppercase tracking-[0.3em] text-yellow-600">
                                    {t('ProjectDetailClient.section_why_title')}
                                </h2>
                                <p className="text-slate-300 font-medium">
                                    {t('ProjectDetailClient.why_desc_intro')}
                                </p>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className={`mt-1 rounded-full p-1 ${fitData.budget_alignment >= 70 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                                        <CheckCircle2 size={16} />
                                    </div>
                                    <div>
                                        <p className="text-slate-200 font-medium">
                                            {t('ProjectDetailClient.why_budget_match', { 
                                                clientBudget: clientRecord.budget_range ? t(`AdvisoryProfile.budget_${clientRecord.budget_range}`) : 'Chưa cập nhật', 
                                                projectPrice: project.price_per_m2 ? formatter.format(Number(project.price_per_m2)) : t('AdvisoryBrief.not_available')
                                            })}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className={`mt-1 rounded-full p-1 ${fitData.location_alignment >= 70 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                                        <CheckCircle2 size={16} />
                                    </div>
                                    <div>
                                        <p className="text-slate-200 font-medium">
                                            {t('ProjectDetailClient.why_location_match', { 
                                                clientLocation: clientRecord.preferred_locations && clientRecord.preferred_locations.length > 0 ? clientRecord.preferred_locations.join(', ') : 'Chưa cập nhật'
                                            })}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className={`mt-1 rounded-full p-1 ${fitData.goal_alignment >= 70 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                                        <CheckCircle2 size={16} />
                                    </div>
                                    <div>
                                        <p className="text-slate-200 font-medium">
                                            {t('ProjectDetailClient.why_goal_match', { 
                                                clientGoal: clientRecord.primary_goal ? t(`AdvisoryProfile.goal_${clientRecord.primary_goal}`) : 'Chưa cập nhật'
                                            })}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className={`mt-1 rounded-full p-1 ${fitData.horizon_alignment >= 70 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                                        <CheckCircle2 size={16} />
                                    </div>
                                    <div>
                                        <p className="text-slate-200 font-medium">
                                            {t('ProjectDetailClient.why_horizon_match', { 
                                                clientHorizon: clientRecord.holding_period ? t(`AdvisoryProfile.period_${clientRecord.holding_period}`) : 'Chưa cập nhật'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                    {/* 3. PROJECT OVERVIEW */}
                    <div className="bg-slate-900/50 p-8 rounded-[2rem] border border-slate-800/60 space-y-6">
                        <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">
                            {t('ProjectDetailClient.section_overview_title')}
                        </h2>
                        <div className="space-y-5">
                            <div className="flex justify-between items-center border-b border-slate-800/50 pb-4">
                                <span className="text-slate-400 text-sm">{t('ProjectDetailClient.overview_type')}</span>
                                <span className="text-slate-200 font-bold">{PROPERTY_TYPE_LABELS[project.property_type as keyof typeof PROPERTY_TYPE_LABELS] || project.property_type}</span>
                            </div>
                            {project.amenities && (
                                <div className="flex justify-between items-center border-b border-slate-800/50 pb-4">
                                    <span className="text-slate-400 text-sm">{t('ProjectDetailClient.overview_scale')}</span>
                                    <span className="text-slate-200 font-bold text-right max-w-[60%] line-clamp-1">{project.amenities[0] || '—'}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center border-b border-slate-800/50 pb-4">
                                <span className="text-slate-400 text-sm">{t('ProjectDetailClient.overview_status')}</span>
                                <span className="text-slate-200 font-bold">{project.construction_status || 'Kế hoạch'}</span>
                            </div>
                            <div className="flex justify-between items-center pb-2">
                                <span className="text-slate-400 text-sm">{t('ProjectDetailClient.overview_handover')}</span>
                                <span className="text-slate-200 font-bold">{project.launch_year || '—'}</span>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-slate-800/50">
                            <p className="text-sm font-medium text-slate-300 italic flex items-start gap-2">
                                <span className="text-yellow-600 font-serif text-xl leading-none">&quot;</span>
                                {project.buyer_suitability || t('ProjectDetailClient.overview_desc')}
                            </p>
                        </div>
                    </div>

                    {/* 4. LOCATION & CONNECTIVITY */}
                    <div className="bg-slate-900/50 p-8 rounded-[2rem] border border-slate-800/60 space-y-6">
                        <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">
                            {t('ProjectDetailClient.section_location_title')}
                        </h2>
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                                    <MapPin size={18} />
                                </div>
                                <p className="text-slate-200 font-medium">
                                    {t('ProjectDetailClient.location_distance', { distance: project.distance_to_cbd || '--' })}
                                </p>
                            </div>
                            {project.market_trend_notes && (
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                                        <TrendingUp size={18} />
                                    </div>
                                    <p className="text-slate-300 text-sm leading-relaxed mt-1">
                                        {project.market_trend_notes}
                                    </p>
                                </div>
                            )}
                            <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                                <p className="text-indigo-300 text-sm font-medium">
                                    {t('ProjectDetailClient.location_insight')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                    {/* 5. VALUE POTENTIAL */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="h-px flex-1 bg-gradient-to-l from-white/10 to-transparent"></div>
                            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">
                                {t('ProjectDetailClient.section_value_title')}
                            </h2>
                            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800/60 pb-8 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full group-hover:bg-emerald-500/10 transition-colors" />
                                <h3 className="text-sm font-black text-slate-200 mb-2 relative z-10">{t('ProjectDetailClient.value_growth_title')}</h3>
                                <p className="text-slate-400 text-sm relative z-10">{t('ProjectDetailClient.value_growth_desc', { rate: project.expected_growth_rate || '--' })}</p>
                                <div className="absolute bottom-4 right-6 font-black text-4xl text-slate-800/50 z-0">{project.expected_growth_rate}%</div>
                            </div>
                            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800/60 pb-8 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full group-hover:bg-blue-500/10 transition-colors" />
                                <h3 className="text-sm font-black text-slate-200 mb-2 relative z-10">{t('ProjectDetailClient.value_rental_title')}</h3>
                                <p className="text-slate-400 text-sm relative z-10">{t('ProjectDetailClient.value_rental_desc', { rate: project.avg_rental_yield || '--' })}</p>
                                <div className="absolute bottom-4 right-6 font-black text-4xl text-slate-800/50 z-0">{project.avg_rental_yield}%</div>
                            </div>
                            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800/60 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full group-hover:bg-amber-500/10 transition-colors" />
                                <h3 className="text-sm font-black text-slate-200 mb-2 relative z-10">{t('ProjectDetailClient.value_liquidity_title')}</h3>
                                <p className="text-slate-400 text-sm relative z-10">{t('ProjectDetailClient.value_liquidity_desc')}</p>
                            </div>
                        </div>
                    </div>

                    {/* 6. RISK SECTION */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="h-px flex-1 bg-gradient-to-l from-white/10 to-transparent"></div>
                            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">
                                {t('ProjectDetailClient.section_risk_title')}
                            </h2>
                            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
                        </div>

                        <div className="bg-rose-950/10 p-8 rounded-[2rem] border border-rose-900/20 h-[calc(100%-2.5rem)]">
                            <div className="space-y-6">
                                {/* Generic Disclaimers & Project specific concerns */}
                                <div className="flex gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                                    <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                                    <p className="text-slate-300 text-sm">{t('ProjectDetailClient.risk_construction')}</p>
                                </div>
                                <div className="flex gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                                    <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                                    <p className="text-slate-300 text-sm">{t('ProjectDetailClient.risk_legal')}</p>
                                </div>
                                {project.key_concerns && project.key_concerns.map((concern: string, idx: number) => (
                                    <div key={idx} className="flex gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800 border-l-rose-500/50 shadow-[inset_2px_0_0_0_rgba(244,63,94,0.5)]">
                                        <AlertTriangle size={18} className="text-rose-400 shrink-0 mt-0.5" />
                                        <p className="text-slate-200 text-sm">{concern}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 7. EXPERT OPINION */}
                <div className="bg-slate-100 text-slate-950 p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-slate-200 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                    <div className="relative z-10 space-y-6 max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-200 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-2">
                            <ShieldCheck size={14} />
                            {t('ProjectDetailClient.section_expert_title')}
                        </div>
                        <p className="text-lg md:text-2xl font-medium leading-relaxed font-serif italic text-slate-800">
                            &quot;{project.evaluation_notes || t('ProjectDetailClient.expert_summary')}&quot;
                        </p>
                        <div className="pt-6 border-t border-slate-300 flex items-center justify-between">
                            <div>
                                <p className="font-black text-sm uppercase tracking-widest text-slate-900">PREIO Advisory Board</p>
                                <p className="text-xs font-medium text-slate-500 mt-0.5">Hội đồng Cố vấn Cấp cao</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 8. CTA SECTION (Sticky-like feel at block level) */}
                <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link 
                        href={`/dashboard/clients/${clientId}/profile`} 
                        className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-10 py-5 rounded-2xl bg-yellow-500 text-slate-950 text-sm font-black uppercase tracking-widest hover:bg-yellow-400 transition-all shadow-[0_0_40px_-10px_rgba(234,179,8,0.5)]"
                    >
                        <Calendar size={18} />
                        {t('ProjectDetailClient.cta_book_visit')}
                    </Link>
                    <Link 
                        href="/contact" 
                        className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-10 py-5 rounded-2xl bg-slate-800 text-slate-100 border border-slate-700 text-sm font-black uppercase tracking-widest hover:bg-slate-700 transition-all hover:border-slate-500"
                    >
                        <BarChart3 size={18} />
                        {t('ProjectDetailClient.cta_contact_advisor')}
                    </Link>
                </div>
                
            </div>
        );
    }

    // ==========================================
    // ADMIN ANALYTICAL UI (LEGACY/INTERNAL)
    // ==========================================

    return (
        <div className="max-w-7xl mx-auto space-y-12 md:space-y-20 px-4 md:px-8 py-8 md:py-16 animate-in fade-in duration-1000">
            
            {/* TẦNG 1 — PROJECT HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-8 md:items-center">
                <div className="space-y-5">
                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-slate-100 uppercase leading-[1]">
                            {project.name}
                        </h1>
                        <p className="text-xs md:text-lg text-slate-500 font-bold uppercase tracking-[0.4em]">
                            {project.developer} <span className="text-slate-700 mx-2">•</span> {project.location}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                        <span className="px-4 py-1.5 rounded-full bg-slate-950 border border-white/5 text-slate-400 text-[10px] font-black uppercase tracking-widest shadow-xl">
                            {PROPERTY_TYPE_LABELS[project.property_type as keyof typeof PROPERTY_TYPE_LABELS] || project.property_type}
                        </span>
                        <span className="px-4 py-1.5 rounded-full bg-slate-950 border border-white/5 text-slate-500 text-[10px] font-black uppercase tracking-widest shadow-xl">
                            {TARGET_SEGMENT_LABELS[project.target_segment as keyof typeof TARGET_SEGMENT_LABELS] || project.target_segment}
                        </span>
                        {!isAdmin && clientId && (
                            <WorkspaceToggle
                                projectId={id}
                                clientId={clientId}
                                initialState={isInWorkspace}
                            />
                        )}
                    </div>
                </div>

                {fitData && (
                    <div className="flex items-center gap-6 bg-slate-950/40 p-6 rounded-[2rem] border border-white/5">
                        <div className="text-right hidden md:block">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Strategic Fit</p>
                            <p className="text-2xl font-black text-yellow-500 uppercase tracking-tighter">{fitData.fit_label}</p>
                        </div>
                        <div className="w-28 h-28 md:w-32 md:h-32">
                            <StrategicFitGauge 
                                fitScore={fitData.fit_score}
                                fitLabel={fitData.fit_label}
                                budgetAlignment={fitData.budget_alignment}
                                locationAlignment={fitData.location_alignment}
                                goalAlignment={fitData.goal_alignment}
                                riskAlignment={fitData.risk_alignment}
                                horizonAlignment={fitData.horizon_alignment}
                                advisoryConfidence={project.analyst_confidence_level}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* TẦNG 2 — ADVISORY ANALYSIS (Grid 2x2) */}
            <div className="space-y-8">
                <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-white/5"></div>
                    <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-600">Phân tích Thẩm định Dự án</h2>
                    <div className="h-px flex-1 bg-white/5"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    <div className="bg-slate-950/20 p-8 rounded-[2rem] border border-white/5 hover:border-white/10 transition-colors">
                        <LocationPanel location={project} />
                    </div>
                    <div className="bg-slate-950/20 p-8 rounded-[2rem] border border-white/5 hover:border-white/10 transition-colors">
                        <MarketPanel market={project} locale={locale} />
                    </div>
                    <div className="bg-slate-950/20 p-8 rounded-[2rem] border border-white/5 hover:border-white/10 transition-colors">
                        <RiskPanel risk={project} />
                    </div>
                    <div className="bg-slate-950/20 p-8 rounded-[2rem] border border-white/5 hover:border-white/10 transition-colors">
                        <AdvisorPanel notes={project} />
                    </div>
                </div>
            </div>

            {/* TẦNG 3 — CLIENT FIT (Strategic Breakdown) */}
            <div className="space-y-10 pt-10 border-t border-white/5">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    <div className="lg:col-span-2 space-y-12">
                        <div className="space-y-6">
                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">Thông Số Giao dịch & Kỳ vọng</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <InfoCard icon={Calendar} label="Thời gian Bàn giao" value={project.launch_year} />
                                <InfoCard icon={Coins} label="Đơn giá Niêm yết" value={project.price_per_m2 ? formatter.format(Number(project.price_per_m2)) : null} />
                                <InfoCard icon={Clock} label="Chu kỳ Đầu tư Khuyến khuyến" value={project.holding_period_recommendation ? `${project.holding_period_recommendation} Năm` : null} />
                                <InfoCard icon={TrendingUp} label="Kỳ vọng Tăng trưởng" value={project.expected_growth_rate ? `${project.expected_growth_rate}% / năm` : null} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-yellow-500/5 p-8 rounded-[2.5rem] border border-yellow-500/10 self-start">
                        <FitScorePanel 
                            score={fitData} 
                            advisoryConfidence={project.analyst_confidence_level} 
                            isAdmin={isAdmin} 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
