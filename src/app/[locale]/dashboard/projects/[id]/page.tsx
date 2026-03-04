import { createClient } from '@/lib/supabase/server';
import { redirect } from '@/navigation';
import { notFound } from 'next/navigation';
import {
    Building2,
    MapPin,
    User,
    ShieldCheck,
    TrendingUp,
    Clock,
    Layout,
    Calendar,
    Target,
    Coins,
    FileText,
    AlertTriangle,
    CheckCircle2,
    BarChart3,
    LucideIcon
} from 'lucide-react';
import StrategicFitGauge from '@/components/advisory/StrategicFitGauge';

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

function InfoCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string | number | null }) {
    return (
        <div className="glass p-4 rounded-xl border border-white/5 flex items-start gap-4">
            <div className="p-2.5 rounded-lg bg-white/5 text-slate-400">
                <Icon size={18} />
            </div>
            <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">{label}</p>
                <p className="text-sm font-semibold text-slate-200">{value ?? '—'}</p>
            </div>
        </div>
    );
}

function AdvisoryNote({ icon: Icon, title, content, colorClass }: { icon: LucideIcon; title: string, content: string | null; colorClass: string }) {
    if (!content) return null;
    return (
        <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-white/5 ${colorClass}`}>
                    <Icon size={20} />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-200">{title}</h3>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed italic">
                "{content}"
            </p>
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

    // 2. Fetch Project Data
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
            legal_notes,
            evaluation_notes,
            risk_notes,
            expected_growth_rate,
            holding_period_recommendation,
            status,
            visible_to_clients
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

    // 3. Fetch Fit Score (Client Only)
    let fitData = null;
    if (!isAdmin) {
        // Fetch client record to get the numeric UUID id
        const { data: clientRecord } = await supabase
            .from('clients')
            .select('id')
            .eq('user_id', user.id)
            .single();

        if (clientRecord) {
            const { data: rpcData } = await supabase.rpc('calculate_project_fit', {
                p_client_id: clientRecord.id,
                p_project_id: id
            });

            if (rpcData) {
                fitData = Array.isArray(rpcData) ? rpcData[0] : rpcData;
            }
        }
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
        <div className="max-w-6xl mx-auto space-y-10 py-6 animate-in fade-in duration-700">
            {/* SECTION 1 — Project Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-8 border-b border-white/5">
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-1 rounded bg-yellow-500/10 text-yellow-500 text-[10px] font-bold uppercase tracking-widest border border-yellow-500/20">
                            PREIO Intelligence Asset
                        </span>
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black tracking-tighter text-slate-100">
                            {project.name}
                        </h1>
                        <div className="flex flex-wrap items-center gap-4 text-slate-400">
                            <span className="flex items-center gap-1.5 text-sm">
                                <MapPin size={16} className="text-slate-500" />
                                {project.location}
                            </span>
                            <span className="flex items-center gap-1.5 text-sm">
                                <Building2 size={16} className="text-slate-500" />
                                {project.developer}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-right space-y-1">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">
                            Investment Grade
                        </p>
                        <GradeBadge grade={project.investment_grade} />
                    </div>
                    <div className="text-right space-y-1">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">
                            Confidence
                        </p>
                        <div className="flex items-center gap-2 justify-end">
                            <BarChart3 size={20} className="text-yellow-500/70" />
                            <span className="text-2xl font-black text-slate-200">
                                {project.analyst_confidence_level}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left Column: Advisory & Context */}
                <div className="lg:col-span-2 space-y-10">

                    {/* SECTION 3 — PREIO Advisory Notes */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <FileText size={18} className="text-yellow-500" />
                            <h2 className="text-lg font-bold tracking-tight text-slate-100">PREIO Advisory Analysis</h2>
                        </div>
                        <div className="grid grid-cols-1 gap-6">
                            <AdvisoryNote
                                icon={CheckCircle2}
                                title="Executive Evaluation"
                                content={project.evaluation_notes}
                                colorClass="text-emerald-500"
                            />
                            <AdvisoryNote
                                icon={ShieldCheck}
                                title="Legal Framework & Compliance"
                                content={project.legal_notes}
                                colorClass="text-sky-500"
                            />
                            <AdvisoryNote
                                icon={AlertTriangle}
                                title="Risk Assessment"
                                content={project.risk_notes}
                                colorClass="text-rose-500"
                            />
                        </div>
                    </div>

                    {/* SECTION 4 & 5 & 6 — Financial & Market Metrics */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <TrendingUp size={18} className="text-yellow-500" />
                            <h2 className="text-lg font-bold tracking-tight text-slate-100">Market & Asset Overview</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoCard icon={Layout} label="Property Type" value={project.property_type} />
                            <InfoCard icon={Target} label="Target Segment" value={project.target_segment} />
                            <InfoCard icon={Calendar} label="Launch Year" value={project.launch_year} />
                            <InfoCard icon={Coins} label="Price per m²" value={project.price_per_m2 ? formatter.format(Number(project.price_per_m2)) : null} />
                            <InfoCard icon={Clock} label="Recommended Horizon" value={project.holding_period_recommendation ? `${project.holding_period_recommendation} Years` : null} />
                            <InfoCard icon={BarChart3} label="Expected Growth (p.a.)" value={project.expected_growth_rate ? `${project.expected_growth_rate}%` : null} />
                        </div>
                    </div>
                </div>

                {/* Right Column: Strategic Fit (Fixed Position-like on desktop) */}
                <div className="space-y-8">
                    {/* SECTION 2 — Advisory Fit (Client Only) */}
                    {!isAdmin && (
                        <div className="sticky top-24">
                            <StrategicFitGauge
                                fitScore={fitData?.fit_score ?? null}
                                fitLabel={fitData?.fit_label ?? null}
                                riskAlignment={fitData?.risk_alignment ?? null}
                                returnAlignment={fitData?.return_alignment ?? null}
                                horizonAlignment={fitData?.horizon_alignment ?? null}
                                analystConfidence={project.analyst_confidence_level}
                            />
                        </div>
                    )}

                    {/* Admin View or Backup Info */}
                    {isAdmin && (
                        <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
                            <div className="flex items-center gap-2 text-yellow-500">
                                <ShieldCheck size={18} />
                                <p className="text-xs uppercase tracking-widest font-bold">Admin Internal View</p>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                You are viewing this page as an administrator. Strategic fit analysis is only active for clients to ensure personalized compatibility based on their risk profiles.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
