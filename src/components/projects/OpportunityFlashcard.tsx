import React from 'react';
import { Link } from '@/navigation';
import StrategicFitGauge from '@/components/projects/StrategicFitGauge';
import WorkspaceToggle from '@/components/projects/WorkspaceToggle';
import CompareToggle from '@/components/projects/CompareToggle';
import { MapPin, TrendingUp, Calendar, Coins, ArrowUpRight, ShieldCheck } from 'lucide-react';

interface OpportunityFlashcardProps {
    project: any; // Type ProjectWithFit
    clientId: string | null;
    locale: string;
}

function MetricItem({ icon: Icon, label, value, colorClass = "text-slate-400" }: { icon: any, label: string, value: string | number | null, colorClass?: string }) {
    return (
        <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-slate-500">
                <Icon size={12} />
                <span className="text-[9px] uppercase tracking-wider font-bold">{label}</span>
            </div>
            <span className={`text-[11px] font-bold ${colorClass}`}>{value ?? '—'}</span>
        </div>
    );
}

export default function OpportunityFlashcard({ project, clientId, locale }: OpportunityFlashcardProps) {
    const formatter = new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', { style: 'currency', currency: locale === 'vi' ? 'VND' : 'USD', maximumFractionDigits: 0 });

    return (
        <div className="relative">
            <Link href={`/dashboard/projects/${project.id}`} className="group relative flex flex-col glass rounded-[2.5rem] border border-white/5 bg-slate-900/40 transition-all duration-500 hover:-translate-y-2 hover:border-yellow-500/20 hover:shadow-[0_20px_60px_-15px_rgba(234,179,8,0.1)] overflow-hidden">
                <div className="p-8 pb-4 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-500 text-[8px] font-black uppercase tracking-widest border border-yellow-500/20">Advisory Project</span>
                            </div>
                            <h2 className="text-2xl font-black text-slate-100 truncate tracking-tight">{project.name}</h2>
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                {project.developer && <span className="text-amber-500/90">{project.developer} <span className="text-slate-600 px-1">•</span></span>}
                                <MapPin size={12} className="text-yellow-500/50" /> {project.location}
                            </div>
                        </div>
                    </div>
                    
                    <div className="pt-4 border-t border-white/5 mt-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">Giá từ</p>
                        <p className="text-xl font-bold text-emerald-400">{project.min_unit_price ? formatter.format(project.min_unit_price) : 'Liên hệ'}</p>
                    </div>
                </div>

                <div className="px-4 py-3 border-y border-white/5 bg-white/[0.02]">
                    <StrategicFitGauge 
                        fitScore={project.fit_score} 
                        fitLabel={project.fit_label}
                        budgetAlignment={project.budget_alignment ?? null}
                        riskAlignment={project.risk_alignment}
                        horizonAlignment={project.horizon_alignment}
                        locationAlignment={project.location_alignment ?? null}
                        goalAlignment={project.goal_alignment ?? null}
                        advisoryConfidence={project.analyst_confidence_level}
                    />
                </div>

                {/* Intelligence Curation Section */}
                {project.opportunity_cards && project.opportunity_cards[0] && project.opportunity_cards[0].key_strengths && project.opportunity_cards[0].key_strengths.length > 0 ? (
                    <div className="p-8 pt-6 pb-2 space-y-4">
                        <div className="space-y-2">
                            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Ưu điểm nổi bật</span>
                            <p className="text-sm text-slate-300 font-medium italic line-clamp-2">
                                "{project.opportunity_cards[0].key_strengths[0]}"
                            </p>
                        </div>
                    </div>
                ) : project.evaluation_notes ? (
                    <div className="p-8 pt-6 pb-2 space-y-4">
                        <div className="space-y-2">
                            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Ưu điểm nổi bật</span>
                            <p className="text-sm text-slate-300 font-medium italic line-clamp-2">
                                "{project.evaluation_notes.split(/(?<=[.!?])\s/)[0]}"
                            </p>
                        </div>
                    </div>
                ) : null}

                <div className={`p-8 ${project.opportunity_cards && project.opportunity_cards[0] ? 'pt-4' : 'pt-6'} space-y-6`}>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                        <div className="space-y-3">
                            <MetricItem icon={Calendar} label="Launch" value={project.launch_year} />
                            <MetricItem icon={Coins} label="Price/m²" value={project.price_per_m2 ? formatter.format(project.price_per_m2) : '—'} />
                        </div>
                        <div className="space-y-3 pl-4 border-l border-white/5">
                            <MetricItem icon={TrendingUp} label="Exp. Growth" value={project.expected_growth_rate ? `${project.expected_growth_rate}%` : '—'} colorClass="text-emerald-400" />
                            <MetricItem icon={ShieldCheck} label="Confidence" value={project.analyst_confidence_level ? `${project.analyst_confidence_level}%` : '—'} />
                        </div>
                    </div>
                </div>

                <div className="p-8 pt-0 flex items-center justify-between gap-4">
                    <div className="pt-2 flex items-center justify-between group/action flex-1">
                        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-black group-hover/action:text-yellow-500 transition-colors">Examine Advisory</span>
                        <ArrowUpRight size={16} />
                    </div>
                    <div className="pt-2">
                        <CompareToggle project={{ id: project.id, name: project.name }} />
                    </div>
                </div>
            </Link>
            
            <div className="absolute bottom-6 right-20 z-20">
                {clientId && <WorkspaceToggle projectId={project.id} clientId={clientId} initialState={project.isSelected} />}
            </div>
        </div>
    );
}
