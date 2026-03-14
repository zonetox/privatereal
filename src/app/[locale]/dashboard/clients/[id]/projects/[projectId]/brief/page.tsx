import { createClient } from '@/lib/supabase/server';
import { redirect, Link } from '@/navigation';
import { notFound } from 'next/navigation';
import {
    CheckCircle2,
    MapPin,
    ArrowLeft,
    Eye
} from 'lucide-react';
import { getTranslations } from 'next-intl/server';

interface AdminBriefPageProps {
    params: { locale: string; clientId: string; projectId: string };
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

export const dynamic = 'force-dynamic';

export default async function AdminBriefPreviewPage({ params }: AdminBriefPageProps) {
    const t = await getTranslations('AdvisoryBrief');
    const { locale, clientId, projectId } = await Promise.resolve(params);
    const supabase = createClient();

    // 1. Auth — Admin only
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect({ href: '/login', locale });

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user!.id).single();
    if (profile?.role !== 'admin') redirect({ href: '/dashboard', locale });

    // 2. Fetch client record
    const { data: clientRecord, error: clientError } = await supabase
        .from('clients')
        .select('*, profiles(full_name, email)')
        .eq('id', clientId)
        .single();

    if (clientError || !clientRecord) notFound();

    // 3. Fetch project
    const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

    if (projectError || !project) notFound();

    // 4. Compute fit score from admin's perspective (SECURITY DEFINER allows this)
    const { data: fitDataRaw } = await supabase
        .rpc('calculate_project_fit', {
            p_client_id: clientId,
            p_project_id: projectId,
        })
        .maybeSingle<FitResult>();

    const fitData = fitDataRaw ?? null;

    const formatter = new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
        style: 'currency',
        currency: locale === 'vi' ? 'VND' : 'USD',
        maximumFractionDigits: 0
    });

    const clientName = (clientRecord.profiles as { full_name?: string; email?: string } | null)?.full_name
        || clientRecord.full_name
        || 'Khách hàng';

    const keyAdvantagesArray = ((): string[] => {
        const raw = project.key_advantages;
        if (!raw) return [];
        if (Array.isArray(raw)) return raw;
        return (raw as string).split(/[\n,]/).map((s: string) => s.trim()).filter(Boolean);
    })();

    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-20 animate-in fade-in duration-1000">
            {/* Admin Preview Banner */}
            <div className="flex items-center justify-between">
                <Link
                    href={`/dashboard/clients/${clientId}/profile`}
                    className="flex items-center gap-2 text-slate-500 hover:text-yellow-500 transition-colors text-xs font-black uppercase tracking-widest"
                >
                    <ArrowLeft size={16} />
                    Quay lại Hồ sơ
                </Link>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[10px] font-black uppercase tracking-widest">
                    <Eye size={12} />
                    Admin Preview — Góc nhìn Khách hàng
                </div>
            </div>

            {/* CONSULTING MEMO CONTENT */}
            <div className="bg-white text-slate-950 p-12 md:p-20 shadow-2xl space-y-16 min-h-[1100px] border-t-[12px] border-slate-900">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-8 border-b-2 border-slate-100 pb-12">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">{t('strictly_confidential')}</p>
                            <h1 className="text-4xl font-black tracking-tighter uppercase italic">
                                {t('title_main')} <span className="text-yellow-600">{t('title_sub')}</span>
                            </h1>
                        </div>
                        <div className="flex items-center gap-6 pt-4">
                            <div>
                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">{t('client')}</p>
                                <p className="text-sm font-black">{clientName}</p>
                            </div>
                            <div className="w-px h-8 bg-slate-200" />
                            <div>
                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">{t('date')}</p>
                                <p className="text-sm font-black">{new Date().toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US')}</p>
                            </div>
                        </div>
                    </div>
                    <div className="text-right space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">PREIO</p>
                        <p className="text-2xl font-black tracking-tighter">Advisory Office</p>
                        <p className="text-xs text-slate-400">Private Real Estate Intelligence</p>
                    </div>
                </div>

                {/* Section 1 — Project Overview */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-px bg-slate-900" />
                        <h2 className="text-xs font-black uppercase tracking-[0.3em]">{t('overview_title')}</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="space-y-1">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{t('investment_grade')}</p>
                            <p className="text-2xl font-black">{project.investment_grade ?? '—'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{t('target_segment')}</p>
                            <p className="text-sm font-bold">{project.target_segment ?? '—'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{t('price_point')}</p>
                            <p className="text-sm font-bold">
                                {project.min_unit_price ? formatter.format(Number(project.min_unit_price)) : '—'}
                            </p>
                        </div>
                        <div className="space-y-1 flex items-start gap-1">
                            <MapPin size={12} className="text-slate-400 mt-0.5 shrink-0" />
                            <p className="text-sm font-bold">{project.location ?? '—'}</p>
                        </div>
                    </div>
                </section>

                {/* Section 2 — Strategic Fit */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-px bg-slate-900" />
                        <h2 className="text-xs font-black uppercase tracking-[0.3em]">{t('strategic_fit_title')}</h2>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="w-full md:w-1/3 text-center space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('fit_coefficient')}</p>
                            <div className="text-6xl font-black italic text-slate-900">{fitData?.fit_score ?? 0}%</div>
                            <div className="px-3 py-1 bg-yellow-600 text-white text-[9px] font-black uppercase tracking-widest inline-block">
                                {fitData?.fit_label ?? '—'}
                            </div>
                        </div>
                        <div className="flex-1 grid grid-cols-1 gap-3 w-full">
                            {[
                                { label: 'Budget', value: fitData?.budget_alignment },
                                { label: 'Location', value: fitData?.location_alignment },
                                { label: 'Goal', value: fitData?.goal_alignment },
                                { label: 'Risk', value: fitData?.risk_alignment },
                                { label: 'Horizon', value: fitData?.horizon_alignment },
                            ].map(({ label, value }) => (
                                <div key={label} className="flex items-center gap-3">
                                    <span className="text-[9px] font-black uppercase w-14 text-slate-500">{label}</span>
                                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-slate-900 rounded-full transition-all duration-700"
                                            style={{ width: `${value ?? 0}%` }}
                                        />
                                    </div>
                                    <span className="text-[9px] font-black w-8 text-right text-slate-600">{value ?? 0}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Section 3 — Key Advantages */}
                {keyAdvantagesArray.length > 0 && (
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-px bg-slate-900" />
                            <h2 className="text-xs font-black uppercase tracking-[0.3em]">{t('strategic_advantages_title')}</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {keyAdvantagesArray.map((adv: string, idx: number) => (
                                <div key={idx} className="flex gap-3 p-4 border border-slate-100">
                                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-800 leading-tight">{adv}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Section 4 — Market Context */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-px bg-slate-900" />
                        <h2 className="text-xs font-black uppercase tracking-[0.3em]">{t('market_context_title')}</h2>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">
                        {project.market_trend_notes || t('not_available')}
                    </p>
                </section>

                {/* Section 5 — Risk Review */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-px bg-slate-900" />
                        <h2 className="text-xs font-black uppercase tracking-[0.3em]">{t('risk_review_title')}</h2>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">
                        {project.risk_notes || t('not_available')}
                    </p>
                </section>

                {/* Section 6 — Advisor Conclusion */}
                <section className="bg-slate-950 text-white p-10 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-px bg-white/20" />
                        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white/70">{t('analyst_conclusion_title')}</h2>
                    </div>
                    <p className="text-xl font-bold tracking-tight italic">
                        {t('conclusion_intro', { label: fitData?.fit_label ?? '—' })}
                    </p>
                    <ul className="space-y-3">
                        <li className="flex gap-3 text-sm text-slate-400">
                            <span className="text-yellow-500 font-black">●</span>
                            {t('risk_conclusion', { score: project.risk_score ?? 0 })}
                        </li>
                        <li className="flex gap-3 text-sm text-slate-400">
                            <span className="text-yellow-500 font-black">●</span>
                            {t('location_conclusion', { score: fitData?.location_alignment ?? 0 })}
                        </li>
                    </ul>
                    <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.3em] pt-4 border-t border-white/10">
                        {t('generated_by')} — Admin Preview Mode
                    </p>
                </section>
            </div>
        </div>
    );
}
