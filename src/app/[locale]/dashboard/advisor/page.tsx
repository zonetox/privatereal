import { createClient } from '@/lib/supabase/server';
import { redirect } from '@/navigation';
import { getTranslations } from 'next-intl/server';
import { ShieldCheck, Users, Target, Activity } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdvisorDashboardPage({ params: { locale } }: { params: { locale: string } }) {
    const t = await getTranslations({ locale });
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect({ href: '/login', locale });
        return null;
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        redirect({ href: '/dashboard', locale });
        return null;
    }

    // 1. Fetch Clients
    const { data: clients } = await supabase
        .from('clients')
        .select('id, full_name, risk_score, risk_profile, profiles!clients_profile_id_fkey(email)');

    // 2. Fetch Advisor Notes (Action Items & Timeline)
    const { data: notes } = await supabase
        .from('advisor_client_notes')
        .select('*, clients(full_name)')
        .order('created_at', { ascending: false });

    const totalClients = clients?.length || 0;
    const avgRiskScore = totalClients > 0
        ? Math.round(clients!.reduce((acc, client) => acc + (client.risk_score || 0), 0) / totalClients)
        : 0;
    const actionItems = notes?.filter(note => note.action_items && note.action_items.length > 0) || [];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight gold-text-gradient mb-2">Advisor Command Center</h1>
                <p className="text-slate-400">Strategic property oversight and directives.</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-white/5 rounded-xl text-yellow-500 group-hover:scale-110 transition-transform">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400 font-medium">Total Clients</p>
                            <p className="text-2xl font-bold text-slate-100">{totalClients}</p>
                        </div>
                    </div>
                </div>

                <div className="glass p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-white/5 rounded-xl text-yellow-500 group-hover:scale-110 transition-transform">
                            <Target size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400 font-medium">Avg Portfolio Risk Score</p>
                            <p className="text-2xl font-bold text-slate-100">{avgRiskScore} / 100</p>
                        </div>
                    </div>
                </div>

                <div className="glass p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-white/5 rounded-xl text-yellow-500 group-hover:scale-110 transition-transform">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400 font-medium">Pending Action Items</p>
                            <p className="text-2xl font-bold text-slate-100">{actionItems.reduce((acc, curr) => acc + (curr.action_items?.length || 0), 0)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Pending Tasks */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                        <Activity size={20} className="text-yellow-500" />
                        Strategic Action Timeline
                    </h2>
                    
                    <div className="space-y-4">
                        {notes?.map((note) => (
                            <div key={note.id} className="glass p-5 rounded-xl border border-white/5 transition-all hover:bg-white/[0.03]">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="font-semibold text-slate-200">{note.clients?.full_name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded text-[10px] font-bold uppercase tracking-widest">
                                                {note.note_type}
                                            </span>
                                            <span className="text-xs text-slate-500">
                                                {new Date(note.created_at).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <p className="text-sm text-slate-400 leading-relaxed italic mb-4">
                                    &quot;{note.content}&quot;
                                </p>

                                {note.action_items && note.action_items.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Action Items:</p>
                                        <ul className="space-y-1">
                                            {note.action_items.map((item: string, idx: number) => (
                                                <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                                                    <span className="text-yellow-500 mt-1">•</span> {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}

                        {(!notes || notes.length === 0) && (
                            <div className="text-center py-12 glass rounded-xl border border-white/5">
                                <ShieldCheck size={48} className="mx-auto text-slate-600 mb-4" />
                                <h3 className="text-lg font-medium text-slate-300 mb-1">No Strategic Notes Yet</h3>
                                <p className="text-sm text-slate-500">Advisory notes logged on client profiles will appear here.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Clients Sidebar Grid */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-slate-100">Client Roster</h2>
                    <div className="space-y-3">
                        {clients?.map((client) => (
                            <a href={`/dashboard/clients/${client.id}/profile`} key={client.id} className="block glass p-4 rounded-xl border border-white/5 hover:border-yellow-500/30 transition-colors">
                                <div className="flex justify-between items-center mb-2">
                                    <p className="font-semibold text-slate-200">{client.full_name || 'Unnamed Client'}</p>
                                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                                        client.risk_profile === 'conservative' ? 'bg-green-500/10 text-green-500' :
                                        client.risk_profile === 'balanced' ? 'bg-blue-500/10 text-blue-500' :
                                        client.risk_profile === 'aggressive' ? 'bg-orange-500/10 text-orange-500' :
                                        'bg-slate-500/10 text-slate-500'
                                    }`}>
                                        {client.risk_profile?.toUpperCase() || 'UNRATED'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <span className="text-slate-500">Risk Score:</span>
                                    <span className="text-slate-200 font-medium">{client.risk_score || '0'}/100</span>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
