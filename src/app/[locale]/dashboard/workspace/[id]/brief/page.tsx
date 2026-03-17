import { createClient } from '@/lib/supabase/server';
import { redirect } from '@/navigation';
import { getTranslations } from 'next-intl/server';
import { ArrowLeft, Printer, ShieldAlert, TrendingUp, Target, Landmark, Coins, FileText, CheckCircle2 } from 'lucide-react';
import { Link } from '@/navigation';
import StrategicFitGauge from '@/components/projects/StrategicFitGauge';

interface BriefPageProps {
    params: { 
        id: string; 
        locale: string;
    };
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

export default async function ProjectBriefPage({ params }: BriefPageProps) {
    const { id, locale } = await Promise.resolve(params);
    const t = await getTranslations('AdvisoryBrief');
    const wsT = await getTranslations('Workspace');
    const supabase = createClient();

    // 1. Auth & Client Identification
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect({ href: '/login', locale });

    const { data: clientRecord } = await supabase.from('clients').select('*').eq('user_id', user.id).single();
    if (!clientRecord) return null;
    const clientId = clientRecord.id;

    // 2. Data Aggregation
    const [projectRes, fitRes, notesRes] = await Promise.all([
        supabase.from('projects').select('*').eq('id', id).single(),
        supabase.rpc('calculate_project_fit', { p_client_id: clientId, p_project_id: id }).single(),
        supabase.from('advisor_notes').select('*').eq('client_id', clientId).eq('project_id', id).order('created_at', { ascending: false })
    ]);

    const project = projectRes.data;
    const fit = fitRes.data as FitResult | null;
    const notes = notesRes.data || [];

    if (!project) return <div>Project not found</div>;

    const formatter = new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
        style: 'currency',
        currency: locale === 'vi' ? 'VND' : 'USD',
        maximumFractionDigits: 0
    });

    return (
        <div className="max-w-5xl mx-auto space-y-12 pb-24 animate-in fade-in duration-1000">
            {/* NAVIGATION & ACTIONS */}
            <div className="flex items-center justify-between px-4 md:px-0 print:hidden">
                <Link 
                    href="/dashboard/workspace"
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors group"
                >
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10">
                        <ArrowLeft size={16} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">{t('return_workspace')}</span>
                </Link>
                <div className="flex gap-4">
                    <button 
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-yellow-500/10 hover:border-yellow-500/20 hover:text-yellow-500 transition-all font-black uppercase tracking-widest text-[10px]"
                    >
                        <Printer size={16} />
                        In Báo cáo (PDF)
                    </button>
                </div>
            </div>

            {/* MEMO HEADER */}
            <header className="px-8 py-16 bg-slate-900/40 border border-white/10 rounded-[3rem] glass relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8">
                    <div className="px-4 py-2 border border-rose-500/30 bg-rose-500/5 rounded-lg">
                        <p className="text-[9px] font-black text-rose-500 uppercase tracking-[0.3em]">{t('strictly_confidential')}</p>
                    </div>
                </div>
                
                <div className="space-y-6">
                    <div className="space-y-2">
                        <p className="text-[11px] font-black uppercase tracking-[0.5em] text-yellow-600/80">{t('ready_advisory')}</p>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-100 italic">
                            {t('title_main')} <span className="text-yellow-500">{t('title_sub')}</span>
                        </h1>
                    </div>
                    
                    <div className="flex flex-wrap gap-x-12 gap-y-6 pt-8 border-t border-white/5">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('client')}</p>
                            <p className="text-lg font-black text-slate-200 italic">{clientRecord.full_name || (user?.email ?? 'Client')}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('date')}</p>
                            <p className="text-lg font-black text-slate-200 italic">{new Date().toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US')}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mã định danh</p>
                            <p className="text-lg font-black text-slate-200 italic">PR-{project.id.slice(0, 8).toUpperCase()}</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* 6 SEGMENTS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                
                {/* 01. PROJECT OVERVIEW */}
                <section className="space-y-8 p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                            <FileText size={20} />
                        </div>
                        <h2 className="text-xl font-black text-slate-100 uppercase tracking-tighter italic">{t('overview_title')}</h2>
                    </div>
                    
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Dự án</p>
                                <p className="text-sm font-bold text-slate-200">{project.name}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">{t('developer')}</p>
                                <p className="text-sm font-bold text-slate-200">{project.developer || '—'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">{t('location')}</p>
                                <p className="text-sm font-bold text-slate-200 italic">{project.location}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">{t('investment_grade')}</p>
                                <p className="text-sm font-black text-yellow-500">GRADE {project.investment_grade || '—'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">{t('target_segment')}</p>
                                <p className="text-sm font-bold text-slate-200 uppercase">{project.target_segment || '—'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">{t('price_point')}</p>
                                <p className="text-sm font-extrabold text-emerald-400">{project.min_unit_price ? formatter.format(project.min_unit_price) : '—'}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 02. STRATEGIC FIT */}
                <section className="space-y-8 p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500">
                            <Target size={20} />
                        </div>
                        <h2 className="text-xl font-black text-slate-100 uppercase tracking-tighter italic">{t('strategic_fit_title')}</h2>
                    </div>
                    
                    <div className="flex flex-col items-center gap-6">
                        <div className="scale-110">
                            <StrategicFitGauge 
                                fitScore={fit?.fit_score ?? null}
                                fitLabel={fit?.fit_label ?? null}
                                budgetAlignment={fit?.budget_alignment ?? null}
                                riskAlignment={fit?.risk_alignment ?? null}
                                horizonAlignment={fit?.horizon_alignment ?? null}
                                locationAlignment={fit?.location_alignment ?? null}
                                goalAlignment={fit?.goal_alignment ?? null}
                            />
                        </div>
                    </div>
                </section>

                {/* 03. STRATEGIC ADVANTAGES */}
                <section className="space-y-8 p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                            <CheckCircle2 size={20} />
                        </div>
                        <h2 className="text-xl font-black text-slate-100 uppercase tracking-tighter italic">{t('strategic_advantages_title')}</h2>
                    </div>
                    
                    <div className="space-y-4">
                        {(project.key_advantages || []).length > 0 ? (
                            <div className="grid grid-cols-1 gap-3">
                                {project.key_advantages.map((adv: string, idx: number) => (
                                    <div key={idx} className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                                        <p className="text-xs font-bold text-slate-300 uppercase tracking-wide">{adv}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-500 italic uppercase tracking-widest">{t('not_available')}</p>
                        )}
                    </div>
                </section>

                {/* 04. MARKET CONTEXT */}
                <section className="space-y-8 p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
                            <TrendingUp size={20} />
                        </div>
                        <h2 className="text-xl font-black text-slate-100 uppercase tracking-tighter italic">{t('market_context_title')}</h2>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                        <MarketIndicator label="Thanh khoản" value={project.liquidity_score} />
                        <MarketIndicator label="Tiềm năng tăng giá" value={project.growth_score} color="emerald" />
                        <div className="col-span-2 p-6 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{t('yield')}</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black text-emerald-400 italic">{project.avg_rental_yield || '0'}%</span>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">mục tiêu hàng năm</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 05. RISK REVIEW */}
                <section className="space-y-8 p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
                            <ShieldAlert size={20} />
                        </div>
                        <h2 className="text-xl font-black text-slate-100 uppercase tracking-tighter italic">{t('risk_review_title')}</h2>
                    </div>
                    
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{t('risk_score')}</p>
                                <span className="text-2xl font-black text-slate-200 italic">{project.risk_score || 0}/100</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full transition-all duration-1000 ${
                                        (project.risk_score || 0) < 30 ? 'bg-emerald-500' : (project.risk_score || 0) < 60 ? 'bg-yellow-500' : 'bg-rose-500'
                                    }`}
                                    style={{ width: `${project.risk_score}%` }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Pháp lý</p>
                                <p className="text-sm font-black text-emerald-400">{project.legal_score || 0}% Safe</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Rủi ro giảm giá</p>
                                <p className="text-sm font-black text-rose-400">-{project.downside_risk_percent || 0}% Est.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 06. ADVISOR CONCLUSION */}
                <section className="space-y-8 p-10 rounded-[2.5rem] bg-slate-900/60 border border-yellow-500/20 md:col-span-2">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500 text-lg">
                            🏛️
                        </div>
                        <h2 className="text-xl font-black text-slate-100 uppercase tracking-tighter italic">{t('analyst_conclusion_title')}</h2>
                    </div>
                    
                    <div className="space-y-6">
                        <p className="text-lg font-black text-slate-200 leading-relaxed italic">
                            “{t('conclusion_intro', { label: fit?.fit_label || 'phù hợp' })}”
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-white/5">
                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Nhận định Chuyên gia</p>
                                <div className="space-y-3">
                                    {notes.length > 0 ? (
                                        notes.map((note: any) => (
                                            <div key={note.id} className="p-5 rounded-2xl bg-white/5 border border-white/5 relative">
                                                <p className="text-sm text-slate-300 leading-relaxed">{note.content}</p>
                                                <div className="absolute top-2 right-4 text-[8px] font-bold text-slate-600 uppercase">
                                                    {new Date(note.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 rounded-2xl border border-dashed border-white/10 text-center">
                                            <p className="text-xs text-slate-600 font-bold uppercase tracking-widest">{t('not_available')}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="space-y-6 pt-10">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                        <span className="text-slate-500">Hệ số Tin cậy</span>
                                        <span className="text-yellow-600">{project.analyst_confidence_level || 85}%</span>
                                    </div>
                                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-yellow-500/50 w-[85%]" />
                                    </div>
                                </div>
                                <div className="p-6 rounded-2xl bg-yellow-500/10 border border-yellow-500/20">
                                    <p className="text-[10px] text-yellow-600 font-black uppercase tracking-widest leading-relaxed">
                                        Khuyến nghị này dựa trên dữ liệu thị trường và thuật toán PREIO Matching v3.1. Phù hợp cho lộ trình nắm giữ {project.holding_period_recommendation || 5} năm.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <footer className="pt-20 text-center space-y-2 pb-10 border-t border-white/5 border-dashed">
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.5em]">{t('generated_by')}</p>
                <div className="flex items-center justify-center gap-8 pt-4">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">PREIO EXECUTIVE BRIEF</p>
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/30" />
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">PRIVATE & CONFIDENTIAL</p>
                </div>
            </footer>
        </div>
    );
}

function MarketIndicator({ label, value, color = "yellow" }: { label: string, value: number | null, color?: string }) {
    const barColor = color === 'emerald' ? 'bg-emerald-500' : 'bg-yellow-500';
    return (
        <div className="space-y-3 p-6 rounded-2xl bg-white/5 border border-white/5">
            <div className="flex justify-between items-center">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">{label}</p>
                <span className="text-[11px] font-black text-slate-300">{value || 0}%</span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full ${barColor}`} style={{ width: `${value || 0}%` }} />
            </div>
        </div>
    );
}
