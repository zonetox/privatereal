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
