import { createClient } from '@/lib/supabase/server';
import { redirect } from '@/navigation';
import { notFound } from 'next/navigation';
import { 
    MapPin, 
    Building2, 
    BarChart3, 
    TrendingUp, 
    Target, 
    Clock, 
    Coins, 
    Layout, 
    Calendar, 
    FileText, 
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
            .select('id')
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
      const { logActivityAction } = require('@/app/actions/activity-logger');
      logActivityAction('project_view', id, `Viewing Project: ${project.name}`);
    }

    // Currency formatter
    const formatter = new Intl.NumberFormat(
        locale === 'vi' ? 'vi-VN' : 'en-US',
        {
            style: 'currency',
            currency: locale === 'vi' ? 'VND' : 'USD',
            maximumFractionDigits: 0
        }
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 md:space-y-16 px-4 md:px-6 py-6 md:py-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            
            {/* LAYER 1 — ADVISORY HEADER */}
            <div className="glass p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-yellow-500/[0.03] to-transparent pointer-events-none" />
                
                <div className="flex flex-col xl:flex-row justify-between gap-8 md:gap-12 relative z-10">
                    <div className="space-y-8 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] border border-yellow-500/20">
                                PREIO Advisory Dashboard
                            </span>
                            {/* Client: Add to Workspace directly from Detail page */}
                            {!isAdmin && clientId && project && (
                                <div className="scale-90 origin-left">
                                    <WorkspaceToggle
                                        projectId={id}
                                        clientId={clientId}
                                        initialState={isInWorkspace}
                                    />
                                </div>
                            )}
                        </div>
                        
                        <div className="space-y-3 md:space-y-4">
                            <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-100 leading-[1.1]">
                                {project.name ?? 'Dự án chưa đặt tên'}
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 md:gap-6 text-slate-400">
                                <span className="flex items-center gap-2 text-xs md:text-sm font-medium">
                                    <MapPin size={16} className="text-yellow-500/70" />
                                    {project.location}
                                </span>
                                <span className="flex items-center gap-2 text-xs md:text-sm font-medium">
                                    <Building2 size={16} className="text-yellow-500/70" />
                                    {project.developer}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 pt-6 border-t border-white/5">
                            <div>
                                <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Loại hình</p>
                                <p className="text-xs md:text-sm text-slate-200 font-bold">{project.property_type}</p>
                            </div>
                            <div>
                                <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Phân khúc</p>
                                <p className="text-xs md:text-sm text-slate-200 font-bold">{project.target_segment}</p>
                            </div>
                            <div className="col-span-2 md:col-span-1 border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                                <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Độ tự tin</p>
                                <div className="flex items-center gap-2">
                                    <BarChart3 size={14} className="text-yellow-500" />
                                    <p className="text-xs md:text-sm text-slate-200 font-bold">{project.analyst_confidence_level}%</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-row items-center gap-6 md:gap-10 border-t xl:border-t-0 border-white/5 pt-8 xl:pt-0">
                        <div className="text-center space-y-2 flex-shrink-0">
                            <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-slate-500 font-bold">Xếp hạng</p>
                            <GradeBadge grade={project.investment_grade} />
                        </div>
                        {fitData && project && (
                            <div className="w-40 h-40 md:w-52 md:h-52 flex-shrink-0">
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
                        )}
                    </div>
                </div>
            </div>

            {/* LAYER 2 — ADVISORY ANALYSIS GRID (2x2) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12">
                <div className="glass p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-white/5 bg-slate-900/40">
                    <LocationPanel location={project} />
                </div>
                <div className="glass p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-white/5 bg-slate-900/40">
                    <MarketPanel market={project} locale={locale} />
                </div>
                <div className="glass p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-white/5 bg-slate-900/40">
                    <RiskPanel risk={project} />
                </div>
                <div className="glass p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-white/5 bg-slate-900/40">
                    <AdvisorPanel notes={project} />
                </div>
            </div>

            {/* LAYER 3 — STRATEGIC OVERVIEW & FIT DETAIL */}
            <div className="pt-10 border-t border-white/5">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-10">
                        <div className="flex items-center gap-3">
                            <Layout size={20} className="text-yellow-500" />
                            <h2 className="text-xl font-bold tracking-tight text-slate-100 uppercase tracking-widest">Thông tin Tài sản & Kỳ vọng</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InfoCard icon={Calendar} label="Thời điểm Bàn giao" value={project.launch_year} />
                            <InfoCard icon={Coins} label="Đơn giá Niêm yết" value={project.price_per_m2 ? formatter.format(Number(project.price_per_m2)) : null} />
                            <InfoCard icon={Clock} label="Chu kỳ Đầu tư (Khuyến nghị)" value={project.holding_period_recommendation ? `${project.holding_period_recommendation} Năm` : null} />
                            <InfoCard icon={TrendingUp} label="Kỳ vọng Tăng trưởng" value={project.expected_growth_rate ? `${project.expected_growth_rate}% / năm` : null} />
                        </div>
                    </div>

                    <div className="space-y-8">
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
