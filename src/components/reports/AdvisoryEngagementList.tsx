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
                <div key={item.client_id} className="glass p-5 rounded-xl border border-white/5 flex items-center justify-between hover:bg-white/[0.03] transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                            <MessageSquare size={18} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-200">{item.client_name}</h3>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="flex items-center gap-1 text-[10px] text-slate-500 uppercase font-bold">
                                    <Calendar size={10} />
                                    Last Contact: {item.last_contact ? new Date(item.last_contact).toLocaleDateString() : 'N/A'}
                                </span>
                                <span className="flex items-center gap-1 text-[10px] text-yellow-500 uppercase font-bold">
                                    <TrendingUp size={10} />
                                    {item.note_count} Strategic Notes
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Actions</p>
                            <div className="flex items-center gap-1.5 text-slate-200">
                                <CheckSquare size={14} className={item.pending_actions > 0 ? 'text-yellow-500' : 'text-slate-500'} />
                                <span className="text-sm font-bold">{item.pending_actions} Pending</span>
                            </div>
                        </div>
                        <a 
                            href={`/dashboard/clients/${item.client_id}/profile`}
                            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold transition-all"
                        >
                            Open Profile
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
