import React from 'react';
import { ChevronDown, Filter } from 'lucide-react';

export default function AdvisoryFilterBar() {
    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl glass border border-white/5 bg-slate-900/60 mb-6">
            <div className="flex items-center gap-2 text-slate-400">
                <Filter size={16} className="text-yellow-500/70" />
                <span className="text-xs font-bold uppercase tracking-widest">Advisory Filters</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
                {/* Fit Score Filter */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                    <span className="text-xs font-medium text-slate-300">Fit Score &gt; 70</span>
                    <ChevronDown size={14} className="text-slate-500 group-hover:text-slate-300" />
                </div>
                
                {/* Location Filter */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                    <span className="text-xs font-medium text-slate-300">Location</span>
                    <ChevronDown size={14} className="text-slate-500 group-hover:text-slate-300" />
                </div>

                {/* Property Type Filter */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                    <span className="text-xs font-medium text-slate-300">Property Type</span>
                    <ChevronDown size={14} className="text-slate-500 group-hover:text-slate-300" />
                </div>

                {/* Budget Range Filter */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                    <span className="text-xs font-medium text-slate-300">Budget Range</span>
                    <ChevronDown size={14} className="text-slate-500 group-hover:text-slate-300" />
                </div>
            </div>
        </div>
    );
}
