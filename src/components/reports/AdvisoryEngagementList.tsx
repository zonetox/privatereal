'use client';

import { MessageSquare, Calendar, CheckSquare, TrendingUp } from 'lucide-react';

interface EngagementData {
    client_id: string;
    client_name: string;
    note_count: number;
    last_contact: string;
    pending_actions: number;
}

export default function AdvisoryEngagementList({ data }: { data: EngagementData[] }) {
    return (
        <div className="space-y-4">
            {data.map((item) => (
                <div key={item.client_id} className="glass p-5 rounded-xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-white/[0.03] transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 flex-shrink-0">
                            <MessageSquare size={18} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-200">{item.client_name}</h3>
                            <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-3 mt-1">
                                <span className="flex items-center gap-1 text-[9px] md:text-[10px] text-slate-500 uppercase font-black">
                                    <Calendar size={10} />
                                    {item.last_contact ? new Date(item.last_contact).toLocaleDateString() : 'N/A'}
                                </span>
                                <span className="flex items-center gap-1 text-[9px] md:text-[10px] text-yellow-500/80 uppercase font-black whitespace-nowrap">
                                    <TrendingUp size={10} />
                                    {item.note_count} Notes
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-0 border-white/5 pt-4 sm:pt-0">
                        <div className="text-left sm:text-right">
                            <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Actions</p>
                            <div className="flex items-center gap-1.5 text-slate-200">
                                <CheckSquare size={14} className={item.pending_actions > 0 ? 'text-yellow-500' : 'text-slate-500'} />
                                <span className="text-[11px] md:text-sm font-bold truncate max-w-[80px] xs:max-w-none">{item.pending_actions} Pending</span>
                            </div>
                        </div>
                        <a 
                            href={`/dashboard/clients/${item.client_id}/profile`}
                            className="px-4 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 text-yellow-500 rounded-lg text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap"
                        >
                            Profile
                        </a>
                    </div>
                </div>
            ))}

            {data.length === 0 && (
                <div className="text-center py-12 glass rounded-xl border border-white/5">
                    <MessageSquare size={48} className="mx-auto text-slate-600 mb-4" />
                    <p className="text-slate-400">No engagement data found.</p>
                </div>
            )}
        </div>
    );
}
