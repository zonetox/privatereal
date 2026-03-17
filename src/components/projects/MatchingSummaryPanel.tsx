'use client';

import React from 'react';
import { Target, MapPin, ShieldAlert, DollarSign, Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface MatchingSummaryPanelProps {
    bestFit: any; // ProjectWithFit
    totalProjects: number;
}

function AlignmentMetric({ label, value, icon: Icon }: { label: string, value: number | null, icon: any }) {
    if (value === null) return null;
    const color = value >= 80 ? 'text-emerald-400' : value >= 60 ? 'text-yellow-500' : 'text-rose-500';
    return (
        <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center text-slate-500">
                    <Icon size={14} />
                </div>
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">{label}</span>
            </div>
            <span className={`text-sm font-black italic ${color}`}>{Math.round(value)}%</span>
        </div>
    );
}

export default function MatchingSummaryPanel({ bestFit, totalProjects }: MatchingSummaryPanelProps) {
    const t = useTranslations('Workspace');
    const tb = useTranslations('AdvisoryBrief');

    if (!bestFit) return null;

    return (
        <div className="sticky top-24 space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
            {/* Summary Header */}
            <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-[0.4em] text-yellow-600 font-bold">Intelligence Feed</p>
                <h2 className="text-2xl font-black text-slate-100 tracking-tighter">
                   {t('matching_summary')}
                </h2>
            </div>

            {/* Stats Card */}
            <div className="bg-slate-950/40 border border-white/5 rounded-3xl p-8 space-y-6">
                <div>
                    <p className="text-[11px] font-black text-yellow-500 uppercase tracking-[0.2em] mb-4">Highest Match Strategy</p>
                    <div className="flex items-baseline gap-2">
                         <span className="text-5xl font-black text-slate-100 tracking-tighter">{bestFit.fit_score}%</span>
                         <span className="text-xs font-bold text-slate-500 uppercase tracking-widest italic">{totalProjects} Available Options</span>
                    </div>
                </div>

                <div className="space-y-1">
                    <AlignmentMetric label={tb('pillar_budget')} value={bestFit.budget_alignment} icon={DollarSign} />
                    <AlignmentMetric label={tb('pillar_location')} value={bestFit.location_alignment} icon={MapPin} />
                    <AlignmentMetric label={tb('pillar_goal')} value={bestFit.goal_alignment} icon={Target} />
                    <AlignmentMetric label={tb('pillar_risk')} value={bestFit.risk_alignment} icon={ShieldAlert} />
                    <AlignmentMetric label={tb('pillar_horizon')} value={bestFit.horizon_alignment} icon={Clock} />
                </div>

                <div className="pt-4 mt-2 border-t border-white/5">
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed uppercase tracking-widest">
                        Scoring based on PREIO Advisory Matrix V3.1. Analysis weights are prioritized by Budget and Location.
                    </p>
                </div>
            </div>

            {/* Trend Note */}
            <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500 mb-2">Market Sentiment</p>
                <p className="text-[11px] text-slate-400 font-medium italic">
                    Current opportunities align strongly with long-term capital preservation goals set in your profile.
                </p>
            </div>
        </div>
    );
}
