import { createClient } from '@/lib/supabase/server';
import { redirect, Link } from '@/navigation';
import { 
    CheckCircle2,
    MapPin,
    ArrowLeft
} from 'lucide-react';

interface BriefPageProps {
    params: { locale: string, id: string };
}

type FitResult = {
    fit_score: number | null;
    fit_label: string | null;
    budget_alignment: number | null;
    risk_alignment: number | null;
    horizon_alignment: number | null;
    location_alignment: number | null;
    goal_alignment: number | null;
};

export default async function ClientAdvisoryBrief({ params }: BriefPageProps) {
    const { locale, id: projectId } = await Promise.resolve(params);
    const supabase = createClient();

    // 1. Auth & Client
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect({ href: '/login', locale });

    const { data: clientRecord } = await supabase
        .from('clients')
        .select(`
            *,
            profiles(full_name)
        `)
        .eq('user_id', user?.id)
        .single();
    
    if (!clientRecord) redirect({ href: '/dashboard', locale });
    const clientId = clientRecord.id;

    // 2. Data Aggregation
    const { data: project } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

    if (!project) redirect({ href: '/dashboard/workspace', locale });

    const { data: fitData } = await supabase
        .rpc('calculate_project_fit', {
            p_client_id: clientId,
            p_project_id: projectId,
        })
        .maybeSingle<FitResult>();

    const formatter = new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
        style: 'currency',
        currency: locale === 'vi' ? 'VND' : 'USD',
        maximumFractionDigits: 0
    });

    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-20 animate-in fade-in duration-1000">
            {/* Action Bar (Hidden on print) */}
            <div className="flex items-center justify-between print:hidden">
                <Link 
                    href="/dashboard/workspace"
                    className="flex items-center gap-2 text-slate-500 hover:text-yellow-500 transition-colors text-xs font-black uppercase tracking-widest"
                >
                    <ArrowLeft size={16} />
                    Return to Workspace
                </Link>
                <button 
                    className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-[10px] font-black uppercase tracking-widest hover:bg-yellow-500 hover:text-slate-950 transition-all"
                >
                    Ready for Advisory
                </button>
            </div>

            {/* CONSULTING MEMO CONTENT */}
            <div className="bg-white text-slate-950 p-12 md:p-20 shadow-2xl space-y-16 min-h-[1100px] border-t-[12px] border-slate-900">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-8 border-b-2 border-slate-100 pb-12">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Strictly Confidential</p>
                            <h1 className="text-4xl font-black tracking-tighter uppercase italic">Advisory <span className="text-yellow-600">Brief</span></h1>
                        </div>
                        <div className="flex items-center gap-6 pt-4">
                            <div>
                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Client</p>
                                <p className="text-sm font-black">{clientRecord.profiles?.full_name || 'Valued Client'}</p>
                            </div>
                            <div className="w-px h-8 bg-slate-200" />
                            <div>
                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Date</p>
                                <p className="text-sm font-black uppercase">{new Date().toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Ref: PREIO-MEMO-{project.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                </div>

                {/* 1. Project Summary */}
                <section className="space-y-8">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-px bg-slate-900" />
                        <h2 className="text-xs font-black uppercase tracking-[0.3em]">01. Project Summary</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-6">
                            <div className="space-y-1">
                                <h3 className="text-3xl font-black tracking-tight text-slate-900">{project.name}</h3>
                                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                    <MapPin size={14} className="text-yellow-600" />
                                    {project.location}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                                <MemoMetric label="Developer" value={project.developer || 'N/A'} />
                                <MemoMetric label="Investment Grade" value={`Grade ${project.investment_grade || 'B'}`} />
                                <MemoMetric label="Target Segment" value={project.target_segment || 'Residential'} />
                                <MemoMetric label="Price Point" value={project.min_unit_price ? formatter.format(project.min_unit_price) : 'Contact Advisor'} />
                            </div>
                        </div>
                        <div className="bg-slate-50 p-6 border border-slate-100 italic text-slate-600 text-sm leading-relaxed">
                            &ldquo;{project.evaluation_notes || 'No analyst notes available for this project. Please contact your dedicated advisor for a deeper qualitative review.'}&rdquo;
                        </div>
                    </div>
                </section>

                {/* 2. Strategic Fit */}
                <section className="space-y-8">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-px bg-slate-900" />
                        <h2 className="text-xs font-black uppercase tracking-[0.3em]">02. Strategic Fit Analysis</h2>
                    </div>
                    <div className="p-8 border-2 border-slate-900">
                        <div className="flex flex-col md:flex-row items-center gap-12">
                            <div className="w-full md:w-1/3 text-center space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fit Coefficient</p>
                                <div className="text-6xl font-black italic text-slate-900">{fitData?.fit_score}%</div>
                                <div className="px-3 py-1 bg-yellow-600 text-white text-[9px] font-black uppercase tracking-widest inline-block">
                                    {fitData?.fit_label}
                                </div>
                            </div>
                            <div className="w-full md:w-2/3 grid grid-cols-1 gap-4">
                                <AlignmentBar label="Budget Alignment" value={fitData?.budget_alignment ?? 0} />
                                <AlignmentBar label="Risk Alignment" value={fitData?.risk_alignment ?? 0} />
                                <AlignmentBar label="Holding Horizon" value={fitData?.horizon_alignment ?? 0} />
                                <AlignmentBar label="Location Pref" value={fitData?.location_alignment ?? 0} />
                                <AlignmentBar label="Investment Goal" value={fitData?.goal_alignment ?? 0} />
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. Key Advantages */}
                <section className="space-y-8">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-px bg-slate-900" />
                        <h2 className="text-xs font-black uppercase tracking-[0.3em]">03. Strategic Advantages</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(project.key_advantages || ['Infrastructure Development', 'Market Gapping', 'Legal Security']).map((adv: string, idx: number) => (
                            <div key={idx} className="flex gap-3 p-4 border border-slate-100">
                                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                                <span className="text-[11px] font-black uppercase tracking-wider text-slate-800 leading-tight">{adv}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 4. Market & Risk context */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                    <section className="space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-px bg-slate-900" />
                            <h2 className="text-xs font-black uppercase tracking-[0.3em]">04. Market Context</h2>
                        </div>
                        <div className="space-y-4">
                            <MetricRow label="Liquidity Score" value={project.liquidity_score} />
                            <MetricRow label="Capital Growth Est." value={`${project.growth_score}%`} />
                            <MetricRow label="Net Rental Yield" value={`${project.avg_rental_yield}%`} />
                        </div>
                    </section>
                    <section className="space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-px bg-slate-900" />
                            <h2 className="text-xs font-black uppercase tracking-[0.3em]">05. Risk Review</h2>
                        </div>
                        <div className="space-y-4">
                            <MetricRow label="Legal Status Code" value={project.legal_score} suffix="/ 100" />
                            <MetricRow label="Risk Rating" value={project.risk_score} suffix="/ 100" />
                            <MetricRow label="Downside Exposure" value={`${project.downside_risk_percent}%`} color="text-rose-600" />
                        </div>
                    </section>
                </div>

                {/* 6. Advisor Conclusion */}
                <section className="space-y-8 pt-12 border-t border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-px bg-slate-900" />
                        <h2 className="text-xs font-black uppercase tracking-[0.3em]">06. Analyst Conclusion</h2>
                    </div>
                    <div className="bg-slate-950 text-white p-10 space-y-6">
                        <p className="text-xl font-bold tracking-tight italic">
                            Based on the current institutional matching algorithm, this asset represents a <span className="text-yellow-500 font-black uppercase">{fitData?.fit_label}</span> alignment with your investment profile.
                        </p>
                        <ul className="space-y-3">
                            <li className="flex gap-3 text-sm text-slate-400">
                                <span className="text-yellow-500 font-black">●</span>
                                The project&apos;s risk rating of {project.risk_score}/100 falls within your defined risk ceiling.
                            </li>
                            <li className="flex gap-3 text-sm text-slate-400">
                                <span className="text-yellow-500 font-black">●</span>
                                Strategic location alignment of {fitData?.location_alignment}% ensures long-term portfolio synergy.
                            </li>
                        </ul>
                    </div>
                </section>

                {/* Footer Branding */}
                <div className="pt-20 flex justify-between items-end opacity-20 filter grayscale">
                    <div className="space-y-1">
                        <p className="text-2xl font-black italic tracking-tighter">PREIO</p>
                        <p className="text-[8px] font-black uppercase tracking-widest">Decision Intelligence Office</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black italic">Generated by PREIO Advisory Engine v3.0</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MemoMetric({ label, value }: { label: string, value: string }) {
    return (
        <div className="space-y-1">
            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">{label}</p>
            <p className="text-xs font-black text-slate-900">{value}</p>
        </div>
    );
}

function AlignmentBar({ label, value }: { label: string, value: number | null }) {
    return (
        <div className="flex items-center gap-4">
            <span className="w-32 text-[9px] font-black uppercase tracking-wider text-slate-500">{label}</span>
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-slate-900 transition-all duration-1000" 
                    style={{ width: `${value || 0}%` }}
                />
            </div>
            <span className="w-8 text-[10px] font-black text-slate-900 text-right">{value || 0}%</span>
        </div>
    );
}

function MetricRow({ label, value, suffix = '', color = 'text-slate-900' }: { label: string, value: string | number | null, suffix?: string, color?: string }) {
    return (
        <div className="flex items-center justify-between border-b border-slate-50 pb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
            <span className={`text-sm font-black ${color}`}>{value ?? '—'} {suffix}</span>
        </div>
    );
}
