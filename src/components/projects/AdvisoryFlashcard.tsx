'use client';

import React from 'react';
import { Link } from '@/navigation';
import StrategicFitGauge from '@/components/projects/StrategicFitGauge';
import WorkspaceToggle from '@/components/projects/WorkspaceToggle';
import CompareToggle from '@/components/projects/CompareToggle';
import { MapPin, ArrowUpRight, TrendingUp, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface AdvisoryFlashcardProps {
    project: any; 
    clientId: string | null;
    locale: string;
}

export default function AdvisoryFlashcard({ project, clientId, locale }: AdvisoryFlashcardProps) {
    const t = useTranslations('Workspace');
    const tb = useTranslations('AdvisoryBrief');
    
    const formatter = new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', { 
        style: 'currency', 
        currency: locale === 'vi' ? 'VND' : 'USD', 
        maximumFractionDigits: 0 
    });

    const keyAdvantage = project.opportunity_cards?.[0]?.key_strengths?.[0] || 
                         project.evaluation_notes?.split(/[.!?]/)[0] || 
                         "High strategic alignment with client profile";

    return (
        <div className="group relative flex flex-col bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-[2rem] overflow-hidden transition-all duration-500 hover:border-yellow-500/30 hover:shadow-[0_20px_60px_-15px_rgba(234,179,8,0.1)]">
            {/* Header Section */}
            <div className="p-8 pb-6">
                <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-[9px] font-black uppercase tracking-widest text-yellow-500">
                        Investment Memo
                    </span>
                    <div className="flex gap-2">
                        <CompareToggle project={{ id: project.id, name: project.name }} />
                        {clientId && (
                            <div className="scale-75 origin-top-right">
                                <WorkspaceToggle 
                                    projectId={project.id} 
                                    clientId={clientId} 
                                    initialState={project.isSelected} 
                                />
                            </div>
                        )}
                    </div>
                </div>

                <h3 className="text-2xl font-black text-slate-100 tracking-tight group-hover:text-yellow-500 transition-colors mb-2">
                    {project.name}
                </h3>
                
                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    <span className="text-slate-300">{project.developer}</span>
                    <span className="text-slate-700">|</span>
                    <div className="flex items-center gap-1">
                        <MapPin size={12} className="text-yellow-500/50" />
                        <span>{project.location}</span>
                    </div>
                </div>
            </div>

            {/* Financial Summary */}
            <div className="px-8 pb-6 border-b border-white/5">
                <div className="flex items-end justify-between">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Listing Price</p>
                        <p className="text-xl font-black text-emerald-400">
                            {project.min_unit_price ? formatter.format(project.min_unit_price) : 'Contact Advisor'}
                        </p>
                    </div>
                    {project.expected_growth_rate && (
                        <div className="text-right">
                            <div className="flex items-center gap-1 text-emerald-500 justify-end">
                                <TrendingUp size={14} />
                                <span className="text-sm font-black">{project.expected_growth_rate}%</span>
                            </div>
                            <p className="text-[9px] font-bold text-slate-600 uppercase">Growth Exp.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Advisory Explanation Layer */}
            <div className="px-8 py-6 bg-yellow-500/[0.03] border-y border-white/5 space-y-4">
                <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-yellow-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-100">{t('why_it_fits')}</span>
                </div>
                <div className="space-y-3">
                    <div className="flex items-start gap-3">
                        <div className="w-1 h-1 rounded-full bg-yellow-500/50 mt-1.5 flex-shrink-0" />
                        <p className="text-[11px] text-slate-300 font-medium italic">
                            {project.budget_alignment >= 90 ? "Phù hợp hoàn hảo với hạn mức ngân sách của bạn." : "Cấu trúc tài chính tối ưu cho kế hoạch đầu tư."}
                        </p>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-1 h-1 rounded-full bg-yellow-500/50 mt-1.5 flex-shrink-0" />
                        <p className="text-[11px] text-slate-300 font-medium italic">
                            {project.location_alignment >= 80 ? `Nằm trong khu vực trọng điểm (${project.location}) bạn quan tâm.` : "Vị trí chiến lược có tính cộng hưởng cao."}
                        </p>
                    </div>
                    {project.growth_score >= 70 && (
                        <div className="flex items-start gap-3">
                            <div className="w-1 h-1 rounded-full bg-yellow-500/50 mt-1.5 flex-shrink-0" />
                            <p className="text-[11px] text-slate-300 font-medium italic">
                                Có dư địa tăng trưởng và thặng dư vốn tốt trong dài hạn.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Strategic Fit Badge - Replacing Raw Gauge prominent display */}
            <div className="px-8 py-4 flex items-center justify-between bg-slate-950/20">
                <div className="space-y-0.5">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Đánh giá độ tương hợp</p>
                    <p className="text-sm font-black text-emerald-400 uppercase italic tracking-tight">
                        {tb(`fit_${project.fit_label?.toLowerCase().replace(' ', '_')}`)}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-xl font-black text-slate-100 italic">{project.fit_score}%</p>
                </div>
            </div>

            {/* Hidden Strategic Fit Gauge (Available in Analysis View) */}
            {/* Kept minimal for background logic or small visual if needed, but the primary is now text-based labels */}

            {/* Footer Action */}
            <Link 
                href={`/dashboard/projects/${project.id}`}
                className="mt-auto flex items-center justify-between px-8 py-6 border-t border-white/5 bg-slate-950/20 group/btn transition-colors hover:bg-yellow-500/10"
            >
                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 group-hover/btn:text-yellow-500 transition-colors">
                    {t('view_analysis')}
                </span>
                <ArrowUpRight size={18} className="text-slate-600 group-hover/btn:text-yellow-500 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-all" />
            </Link>
        </div>
    );
}
