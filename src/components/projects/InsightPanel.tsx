import React from 'react';
import { Target, TrendingUp, MapPin, Coins, Clock, ShieldCheck } from 'lucide-react';

interface InsightPanelProps {
    topMatch: any; // Using any for now, should map to FitResult
}

export default function InsightPanel({ topMatch }: InsightPanelProps) {
    if (!topMatch) return null;

    return (
        <div className="w-full xl:w-80 flex-shrink-0 space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 delay-150">
            <div className="glass rounded-[2rem] border border-white/5 bg-slate-900/60 p-6 space-y-6 sticky top-24">
                <div className="space-y-1">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-200">Matching Summary</h3>
                    <p className="text-[11px] font-medium text-slate-500">Based on Top Recommended Project</p>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-400">
                            <Coins size={14} className="text-emerald-500/70" />
                            <span className="text-xs font-medium">Budget Match</span>
                        </div>
                        <span className="text-sm font-bold text-emerald-400">{topMatch.budget_alignment ?? '—'}</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-400">
                            <MapPin size={14} className="text-sky-500/70" />
                            <span className="text-xs font-medium">Location Match</span>
                        </div>
                        <span className="text-sm font-bold text-sky-400">{topMatch.location_alignment ?? '—'}</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-400">
                            <Target size={14} className="text-indigo-500/70" />
                            <span className="text-xs font-medium">Goal Alignment</span>
                        </div>
                        <span className="text-sm font-bold text-indigo-400">{topMatch.goal_alignment ?? '—'}</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-400">
                            <ShieldCheck size={14} className="text-amber-500/70" />
                            <span className="text-xs font-medium">Risk Tolerance</span>
                        </div>
                        <span className="text-sm font-bold text-amber-400">{topMatch.risk_alignment ?? '—'}</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-400">
                            <Clock size={14} className="text-purple-500/70" />
                            <span className="text-xs font-medium">Holding Strategy</span>
                        </div>
                        <span className="text-sm font-bold text-purple-400">{topMatch.horizon_alignment ?? '—'}</span>
                    </div>
                </div>

                <div className="pt-6 border-t border-white/5">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-500/10 to-amber-500/5 border border-yellow-500/20">
                        <p className="text-[10px] uppercase tracking-widest font-black text-amber-500 mb-2">AI Advisor Insight</p>
                        <p className="text-xs text-slate-300 leading-relaxed font-medium">
                            Profile analysis indicates a strong inclination towards <span className="text-white">Capital Appreciation</span> in emerging districts. The recommended portfolio reflects your {topMatch.risk_alignment > 70 ? 'balanced to aggressive' : 'conservative'} risk appetite.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
