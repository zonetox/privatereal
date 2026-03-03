'use client';

import { useEffect, useRef, useState, useId } from 'react';

type StrategicFitGaugeProps = {
    fitScore: number | null;
    fitLabel: string | null;
    riskAlignment: number | null;
    returnAlignment: number | null;
    horizonAlignment: number | null;
    analystConfidence?: number | null;
};

const RADIUS = 80;
const STROKE_WIDTH = 10;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SIZE = 180;
const CENTER = SIZE / 2;
const ANIMATION_DURATION = 1200; // ms

function AlignmentRow({ label, value }: { label: string; value: number | null }) {
    if (value === null) return null;
    return (
        <div className="flex items-center justify-between py-1">
            <span className="text-xs text-slate-400 tracking-wide">{label}</span>
            <span className="text-xs font-semibold text-slate-200">{value}%</span>
        </div>
    );
}

export default function StrategicFitGauge({
    fitScore,
    fitLabel,
    riskAlignment,
    returnAlignment,
    horizonAlignment,
    analystConfidence,
}: StrategicFitGaugeProps) {
    // Unique ID for SVG gradient to prevent collision across multiple instances
    const uniqueId = useId();
    const gradientId = `goldGradient-${uniqueId.replace(/:/g, '')}`;

    // Animated score counter (requestAnimationFrame-based)
    const [animatedScore, setAnimatedScore] = useState(0);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        if (fitScore === null) return;

        const start = performance.now();
        const from = 0;
        const to = fitScore;

        const step = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / ANIMATION_DURATION, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setAnimatedScore(Math.round(from + (to - from) * eased));

            if (progress < 1) {
                rafRef.current = requestAnimationFrame(step);
            }
        };

        rafRef.current = requestAnimationFrame(step);

        return () => {
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        };
    }, [fitScore]);

    const offset = CIRCUMFERENCE - (animatedScore / 100) * CIRCUMFERENCE;

    const hasAlignmentData =
        riskAlignment !== null || returnAlignment !== null || horizonAlignment !== null;

    // Null state — insufficient data
    if (fitScore === null) {
        return (
            <div className="rounded-2xl border border-yellow-800/40 bg-slate-900/60 backdrop-blur-sm p-6 flex flex-col items-center gap-3 text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-yellow-600/70 font-medium">
                    Strategic Compatibility
                </p>
                <p className="text-lg font-bold text-slate-100">Insufficient Data</p>
                <p className="text-xs text-slate-500 max-w-[220px] leading-relaxed">
                    Complete advisory profile to enable compatibility analysis.
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 backdrop-blur-sm p-6 flex flex-col items-center gap-5">
            {/* Section Label */}
            <p className="text-xs uppercase tracking-[0.2em] text-yellow-600/70 font-medium">
                Strategic Compatibility
            </p>

            {/* Circular Gauge */}
            <div className="relative" style={{ width: SIZE, height: SIZE }}>
                <svg
                    width={SIZE}
                    height={SIZE}
                    viewBox={`0 0 ${SIZE} ${SIZE}`}
                    className="rotate-[-90deg]"
                >
                    <defs>
                        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#facc15" />
                            <stop offset="100%" stopColor="#fde68a" />
                        </linearGradient>
                    </defs>

                    {/* Track */}
                    <circle
                        cx={CENTER}
                        cy={CENTER}
                        r={RADIUS}
                        fill="none"
                        stroke="#1e293b"
                        strokeWidth={STROKE_WIDTH}
                    />

                    {/* Progress */}
                    <circle
                        cx={CENTER}
                        cy={CENTER}
                        r={RADIUS}
                        fill="none"
                        stroke={`url(#${gradientId})`}
                        strokeWidth={STROKE_WIDTH}
                        strokeLinecap="round"
                        strokeDasharray={CIRCUMFERENCE}
                        strokeDashoffset={offset}
                    />
                </svg>

                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                    <span className="text-3xl font-bold text-slate-100 tabular-nums leading-none">
                        {animatedScore}%
                    </span>
                    <span className="text-xs text-yellow-400 font-medium tracking-wide text-center px-2 leading-snug">
                        {fitLabel}
                    </span>
                </div>
            </div>

            {/* Alignment Breakdown — only render when at least one value exists */}
            {hasAlignmentData && (
                <div className="w-full border-t border-slate-700/50 pt-4 flex flex-col gap-0.5">
                    <AlignmentRow label="Risk Alignment" value={riskAlignment} />
                    <AlignmentRow label="Return Alignment" value={returnAlignment} />
                    <AlignmentRow label="Horizon Alignment" value={horizonAlignment} />
                </div>
            )}

            {/* Analyst Confidence */}
            {analystConfidence !== null && analystConfidence !== undefined && (
                <div className="w-full border-t border-slate-700/50 pt-3">
                    <p className="text-xs text-slate-400 text-center tracking-wide">
                        Analyst Confidence:{' '}
                        <span className="text-slate-300 font-medium">{analystConfidence} / 100</span>
                    </p>
                </div>
            )}
        </div>
    );
}
