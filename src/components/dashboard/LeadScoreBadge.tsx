'use client';

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface LeadScoreBadgeProps {
    score: number | null | undefined;
}

export default function LeadScoreBadge({ score }: LeadScoreBadgeProps) {
    const safeScore = score ?? 0;
    
    let colorClass = "bg-rose-500/10 text-rose-500 border-rose-500/20";
    if (safeScore >= 70) {
        colorClass = "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    } else if (safeScore >= 40) {
        colorClass = "bg-amber-500/10 text-amber-500 border-amber-500/20";
    }

    return (
        <div className={cn(
            "inline-flex items-center justify-center w-10 h-10 rounded-full border transition-all duration-300 font-black",
            colorClass
        )}>
            <span className="text-sm">{safeScore}</span>
        </div>
    );
}
