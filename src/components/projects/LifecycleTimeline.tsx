'use client';

import { Check, Circle, Clock } from 'lucide-react';

const STAGES = [
    { id: 'research', label: 'Investment Research', desc: 'Detailed asset analysis & strategic fit' },
    { id: 'site_visit', label: 'Site Inspection', desc: 'Direct on-site infrastructure verification' },
    { id: 'reservation', label: 'Reservation Secured', desc: 'Official project unit selection' },
    { id: 'deposit', label: 'Commitment Deposit', desc: 'Financial transaction initiated' },
    { id: 'contract', label: 'Legal Execution', desc: 'Contractual agreement finalized' },
    { id: 'payment', label: 'Final Settlement', desc: 'Full ownership transfer complete' },
    { id: 'portfolio', label: 'Asset Management', desc: 'Integration into property holdings' }
];

interface LifecycleTimelineProps {
    currentStage: string;
}

export default function LifecycleTimeline({ currentStage }: LifecycleTimelineProps) {
    const currentIndex = STAGES.findIndex(s => s.id === currentStage);

    return (
        <div className="py-8 px-4">
            <div className="relative flex items-center justify-between">
                {/* Connecting Line */}
                <div className="absolute left-0 right-0 top-6 h-[2px] bg-white/5 -z-10" />
                <div 
                    className="absolute left-0 top-6 h-[2px] bg-yellow-500 transition-all duration-1000 -z-10" 
                    style={{ width: `${(currentIndex / (STAGES.length - 1)) * 100}%` }}
                />

                {STAGES.map((stage, index) => {
                    const isCompleted = index < currentIndex;
                    const isCurrent = index === currentIndex;
                    const isFuture = index > currentIndex;

                    return (
                        <div key={stage.id} className="flex flex-col items-center gap-4 relative group">
                            {/* Connector Circle */}
                            <div 
                                className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 shadow-2xl ${
                                    isCompleted 
                                        ? 'bg-yellow-500 border-yellow-500 text-slate-950' 
                                        : isCurrent 
                                            ? 'bg-slate-900 border-yellow-500 text-yellow-500 scale-125 ring-8 ring-yellow-500/10' 
                                            : 'bg-slate-950 border-white/10 text-slate-700'
                                }`}
                            >
                                {isCompleted ? <Check size={20} /> : isCurrent ? <Clock size={20} className="animate-pulse" /> : <Circle size={12} />}
                            </div>

                            {/* Label */}
                            <div className="flex flex-col items-center text-center max-w-[100px] space-y-1">
                                <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${
                                    isCurrent ? 'text-yellow-500' : isFuture ? 'text-slate-700' : 'text-slate-400'
                                }`}>
                                    {stage.label}
                                </span>
                                {isCurrent && (
                                    <span className="text-[8px] text-slate-500 leading-tight uppercase font-medium">
                                        {stage.desc}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
