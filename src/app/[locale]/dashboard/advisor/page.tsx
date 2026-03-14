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

    // 3. Calculate Stats
    const totalClients = clients?.length || 0;
    const avgRiskScore = totalClients > 0
        ? Math.round(clients!.reduce((acc, client) => acc + (client.risk_score || 0), 0) / totalClients)
        : 0;
    const actionItems = notes?.filter(note => note.action_items && note.action_items.length > 0) || [];

    // 4. Fetch Projects Count for Intelligence Block
    const { count: projectCount } = await supabase.from('projects').select('*', { count: 'exact', head: true });

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter gold-text-gradient italic uppercase">Advisor Command Center</h1>
                    <p className="text-slate-400 font-medium tracking-wide mt-1">Strategic oversight and institutional directives.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="px-4 py-2 bg-slate-900/80 border border-slate-800 rounded-xl">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">System Status</p>
                        <div className="flex items-center gap-2 mt-0.5">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                            <span className="text-xs font-bold text-slate-200">ACTIVE ADVISORY</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Core Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricBlock 
                    title="Total Clients" 
                    value={totalClients} 
                    icon={Users} 
                    subtitle="Acquired HNW Profiles"
                />
                <MetricBlock 
                    title="Potential Lead Score" 
                    value={`${avgRiskScore}/100`} 
                    icon={Target} 
                    subtitle="Avg Strategic Rating"
                />
                <MetricBlock 
                    title="Project Intelligence" 
                    value={projectCount || 0} 
                    icon={ShieldCheck} 
                    subtitle="Audited Assets"
                />
                <MetricBlock 
                    title="Advisor Tasks" 
                    value={actionItems.reduce((acc, curr) => acc + (curr.action_items?.length || 0), 0)} 
                    icon={Activity} 
                    subtitle="Pending Directives"
                    highlight
                />
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 xl:gold-border-l xl:pl-8 lg:grid-cols-3 gap-10">
                {/* Strategic Action Timeline */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-slate-100 uppercase tracking-widest flex items-center gap-3">
                            <Activity size={20} className="text-yellow-500" />
                            Strategic Directives
                        </h2>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                        {notes?.map((note) => (
                            <div key={note.id} className="glass p-6 rounded-2xl border border-white/5 transition-all hover:border-yellow-500/20 group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                                            <ShieldCheck size={18} className="text-yellow-500" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-100">{note.clients?.full_name}</p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                                {new Date(note.created_at).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', { day: 'numeric', month: 'short' })}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="px-2 py-1 bg-yellow-500/5 text-yellow-500 border border-yellow-500/10 rounded text-[9px] font-black uppercase tracking-widest">
                                        {note.note_type}
                                    </span>
                                </div>
                                
                                <p className="text-sm text-slate-400 leading-relaxed mb-4 pl-1 border-l-2 border-yellow-500/20 italic">
                                    {note.content}
                                </p>

                                {note.action_items && note.action_items.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                                        {note.action_items.map((item: string, idx: number) => (
                                            <div key={idx} className="flex items-start gap-3 text-xs text-slate-300">
                                                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1 flex-shrink-0" />
                                                <span>{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        {(!notes || notes.length === 0) && (
                            <div className="text-center py-20 glass rounded-2xl border border-white/5 border-dashed">
                                <ShieldCheck size={48} className="mx-auto text-slate-700 mb-4 opacity-30" />
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">No Directives Logged</h3>
                            </div>
                        )}
                    </div>
                </div>

                {/* Client Roster Sidebar */}
                <div className="space-y-6">
                    <h2 className="text-xl font-black text-slate-100 uppercase tracking-widest">Client Roster</h2>
                    <div className="space-y-4">
                        {clients?.map((client) => (
                            <a href={`/dashboard/clients/${client.id}/profile`} key={client.id} className="block glass p-5 rounded-2xl border border-white/5 hover:border-yellow-500/40 transition-all group">
                                <div className="flex justify-between items-center mb-3">
                                    <p className="font-bold text-slate-100 group-hover:text-yellow-500 transition-colors uppercase tracking-tight">{client.full_name || 'Unnamed Client'}</p>
                                    <div className="w-2 h-2 rounded-full bg-yellow-500 mt-0.5" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                                        <span className="text-slate-500">Tier Profile</span>
                                        <span className={
                                            client.risk_profile === 'conservative' ? 'text-emerald-500' :
                                            client.risk_profile === 'balanced' ? 'text-sky-500' :
                                            client.risk_profile === 'aggressive' ? 'text-rose-500' :
                                            'text-slate-500'
                                        }>
                                            {client.risk_profile || 'UNRATED'}
                                        </span>
                                    </div>
                                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-yellow-500/50" 
                                            style={{ width: `${client.risk_score || 0}%` }}
                                        />
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricBlock({ title, value, icon: Icon, subtitle, highlight = false }: any) {
    return (
        <div className={`glass p-6 rounded-2xl border transition-all duration-500 group relative overflow-hidden ${highlight ? 'border-yellow-500/30' : 'border-white/5'}`}>
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-slate-800/80 rounded-xl text-yellow-500 group-hover:scale-110 transition-transform shadow-lg">
                        <Icon size={20} />
                    </div>
                    {highlight && <div className="px-2 py-0.5 bg-yellow-500 text-slate-950 text-[8px] font-black rounded uppercase tracking-tighter">Priority</div>}
                </div>
                <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">{title}</p>
                    <p className="text-3xl font-black text-slate-100 tracking-tighter italic">{value}</p>
                    <p className="text-[10px] text-slate-600 font-medium mt-1 uppercase tracking-tight">{subtitle}</p>
                </div>
            </div>
            {/* Background pattern */}
            <div className="absolute right-0 bottom-0 opacity-5 group-hover:opacity-10 transition-opacity">
                <Icon size={120} className="translate-x-12 translate-y-12" />
            </div>
        </div>
    );
}
