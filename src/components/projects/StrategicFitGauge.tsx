'use client';

import { useEffect, useRef, useState, useId } from 'react';
import { DollarSign, ShieldAlert, Clock, MapPin, Target } from 'lucide-react';

type StrategicFitGaugeProps = {
    fitScore: number | null;
    fitLabel: string | null;
    budgetAlignment: number | null;
    riskAlignment: number | null;
    horizonAlignment: number | null;
    locationAlignment: number | null;
    goalAlignment: number | null;
    advisoryConfidence?: number | null;
};

const RADIUS = 80;
const STROKE_WIDTH = 10;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SIZE = 180;
const CENTER = SIZE / 2;
const ANIMATION_DURATION = 1200;

function PillarBar({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value: number | null;
    icon: React.ElementType;
}) {
    if (value === null) return null;
    const color =
        value >= 80 ? 'bg-emerald-500' : value >= 60 ? 'bg-yellow-500' : 'bg-red-500';

    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <Icon size={11} className="text-slate-500" />
                    <span className="text-[10px] text-slate-400 tracking-wide uppercase">{label}</span>
                </div>
                <span className="text-[10px] font-bold text-slate-200 tabular-nums">{Math.round(value)}%</span>
            </div>
            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-1000 ${color}`}
                    style={{ width: `${value}%` }}
                />
            </div>
        </div>
    );
}

export default function StrategicFitGauge({
    fitScore,
    fitLabel,
    budgetAlignment,
    riskAlignment,
    horizonAlignment,
    locationAlignment,
    goalAlignment,
    advisoryConfidence,
}: StrategicFitGaugeProps) {
    const uniqueId = useId();
    const gradientId = `goldGradient-${uniqueId.replace(/:/g, '')}`;

    const [animatedScore, setAnimatedScore] = useState(0);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        if (fitScore === null) return;
        const start = performance.now();
        const to = fitScore;

        const step = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / ANIMATION_DURATION, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setAnimatedScore(Math.round(to * eased));
            if (progress < 1) {
                rafRef.current = requestAnimationFrame(step);
            }
        };

        rafRef.current = requestAnimationFrame(step);
        return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current); };
    }, [fitScore]);

    const offset = CIRCUMFERENCE - (animatedScore / 100) * CIRCUMFERENCE;

    const hasPillarData = budgetAlignment !== null || riskAlignment !== null;

    if (fitScore === null) {
        return (
            <div className="rounded-2xl border border-yellow-800/40 bg-slate-900/60 backdrop-blur-sm p-6 flex flex-col items-center gap-3 text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-yellow-600/70 font-medium">Fit Score</p>
                <p className="text-lg font-bold text-slate-100">Insufficient Data</p>
                <p className="text-xs text-slate-500 max-w-[220px] leading-relaxed">
                    Complete advisory profile to enable 5-pillar suitability analysis.
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 backdrop-blur-sm p-6 flex flex-col items-center gap-5">
            <p className="text-xs uppercase tracking-[0.2em] text-yellow-600/70 font-medium">
                Fit Score
            </p>

            {/* Circular Gauge */}
            <div className="relative" style={{ width: SIZE, height: SIZE }}>
                <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="rotate-[-90deg]">
                    <defs>
                        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#facc15" />
                            <stop offset="100%" stopColor="#fde68a" />
                        </linearGradient>
                    </defs>
                    <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" stroke="#1e293b" strokeWidth={STROKE_WIDTH} />
                    <circle
                        cx={CENTER} cy={CENTER} r={RADIUS} fill="none"
                        stroke={`url(#${gradientId})`} strokeWidth={STROKE_WIDTH}
                        strokeLinecap="round" strokeDasharray={CIRCUMFERENCE}
                        strokeDashoffset={offset}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                    <span className="text-3xl font-bold text-slate-100 tabular-nums leading-none">
                        {animatedScore}%
                    </span>
                    <span className="text-xs text-yellow-400 font-medium tracking-wide text-center px-2 leading-snug">
                        {fitLabel}
                    </span>
                </div>
            </div>

            {/* 5-Pillar Breakdown */}
            {hasPillarData && (
                <div className="w-full border-t border-slate-700/50 pt-4 flex flex-col gap-3">
                    <p className="text-[9px] uppercase tracking-widest text-slate-600 font-bold text-center">Advisory 5-Pillar Analysis</p>
                    <PillarBar label="Budget Compatibility" value={budgetAlignment} icon={DollarSign} />
                    <PillarBar label="Location Preference" value={locationAlignment} icon={MapPin} />
                    <PillarBar label="Goal Alignment" value={goalAlignment} icon={Target} />
                    <PillarBar label="Risk Tolerance" value={riskAlignment} icon={ShieldAlert} />
                    <PillarBar label="Holding Strategy" value={horizonAlignment} icon={Clock} />
                </div>
            )}

            {/* Advisory Confidence */}
            {advisoryConfidence !== null && advisoryConfidence !== undefined && (
                <div className="w-full border-t border-slate-700/50 pt-3">
                    <p className="text-xs text-slate-400 text-center tracking-wide">
                        Advisor Confidence:{' '}
                        <span className="text-slate-300 font-medium">{advisoryConfidence} / 100</span>
                    </p>
                </div>
            )}
        </div>
    );
}
