'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Settings2, Filter, ChevronDown } from 'lucide-react';

export default function OpportunityBoardFilters() {
    const t = useTranslations('Workspace');

    return (
        <div className="flex flex-wrap items-center gap-4 py-6 border-y border-white/5">
            <div className="flex items-center gap-2 px-5 py-2.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
                <Filter size={14} className="text-yellow-500" />
                <span className="text-[11px] font-black uppercase text-yellow-500 tracking-wider">
                    {t('filter_fit_score', { score: 70 })}
                </span>
            </div>

            <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-900/40 border border-white/5 rounded-full hover:border-white/10 transition-colors cursor-pointer group">
                <span className="text-[11px] font-black uppercase text-slate-400 group-hover:text-slate-200 tracking-wider">Location</span>
                <ChevronDown size={14} className="text-slate-600" />
            </div>

            <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-900/40 border border-white/5 rounded-full hover:border-white/10 transition-colors cursor-pointer group">
                <span className="text-[11px] font-black uppercase text-slate-400 group-hover:text-slate-200 tracking-wider">Property Type</span>
                <ChevronDown size={14} className="text-slate-600" />
            </div>

            <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-900/40 border border-white/5 rounded-full hover:border-white/10 transition-colors cursor-pointer group">
                <span className="text-[11px] font-black uppercase text-slate-400 group-hover:text-slate-200 tracking-wider">Budget Range</span>
                <ChevronDown size={14} className="text-slate-600" />
            </div>

            <div className="ml-auto flex items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">
                <Settings2 size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Advanced Audit</span>
            </div>
        </div>
    );
}
