import { createClient } from '@/lib/supabase/server';
import { redirect, Link } from '@/navigation';
import { Users, Phone, Mail, ShieldCheck, Briefcase, ChevronRight, AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic';

const RISK_BADGE: Record<string, string> = {
    conservative: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    balanced:     'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    aggressive:   'bg-rose-500/10 text-rose-400 border border-rose-500/20',
};

export default async function ClientsPage({ 
    params,
    searchParams 
}: { 
    params: { locale: string },
    searchParams: { q?: string }
}) {
    const { locale } = await Promise.resolve(params);
    const { q } = await Promise.resolve(searchParams);
    const supabase = createClient();

    // 1. Auth & Admin guard
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect({ href: '/login', locale });

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') redirect({ href: '/dashboard', locale });

    // 2. Fetch clients with workspace project count and last activity
    let query = supabase
        .from('clients')
        .select(`
            id,
            full_name,
            email,
            phone,
            risk_profile,
            created_at,
            profiles(email),
            client_workspace_selections(count),
            activities(created_at)
        `);

    if (q) {
        query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%`);
    }

    const { data: clients, error } = await query.order('created_at', { ascending: false });

    if (error) console.error('Failed to fetch clients:', error);
    
    // Sort activities for each client to get "last activity"
    const allClients = (clients ?? []).map(client => {
        const activities = (client.activities as any[]) || [];
        const lastActivity = activities.length > 0 
            ? new Date(Math.max(...activities.map(a => new Date(a.created_at).getTime())))
            : null;
            
        return {
            ...client,
            last_activity: lastActivity
        };
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-yellow-600/70 font-medium">
                        Admin Control
                    </p>
                    <h1 className="text-3xl font-black tracking-tighter text-slate-100">
                        Quản lý{' '}
                        <span className="bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
                            Khách hàng
                        </span>
                    </h1>
                    <p className="text-sm text-slate-500">
                        {allClients.length} khách hàng trong hệ thống
                    </p>
                </div>

                {/* Search Bar */}
                <form action="" className="relative w-full md:w-80 group">
                    <Users size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-yellow-500 transition-colors" />
                    <input 
                        name="q"
                        defaultValue={q}
                        placeholder="Tìm kiếm tên hoặc email..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-xs text-slate-200 focus:outline-none focus:border-yellow-600/50 transition-all font-medium placeholder:text-slate-600"
                    />
                </form>
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm overflow-hidden overflow-x-auto shadow-2xl shadow-black/40">
                {allClients.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-600">
                            <Users size={22} />
                        </div>
                        <p className="text-slate-400 font-semibold">
                            {q ? `Không tìm thấy kết quả cho "${q}"` : 'Chưa có khách hàng'}
                        </p>
                        <p className="text-slate-600 text-sm">Chuyển đổi Lead sang Client để bắt đầu quản lý.</p>
                    </div>
                ) : (
                    <table className="w-full border-collapse min-w-[900px]">
                        <thead>
                            <tr className="border-b border-slate-800 bg-slate-800/20">
                                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Thông tin Khách hàng</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Liên hệ</th>
                                <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Rủi ro</th>
                                <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Workspace</th>
                                <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Hoạt động cuối</th>
                                <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                            {allClients.map((client) => {
                                const displayEmail = client.email || (client.profiles as { email?: string } | null)?.email || '—';
                                const riskClass   = RISK_BADGE[client.risk_profile ?? ''] ?? 'bg-slate-800 text-slate-400 border border-slate-700';
                                const wsCount     = Array.isArray(client.client_workspace_selections)
                                    ? (client.client_workspace_selections[0] as { count: number } | undefined)?.count ?? 0
                                    : 0;

                                return (
                                    <tr key={client.id} className="group hover:bg-slate-800/40 transition-all duration-150">
                                        {/* Name */}
                                        <td className="px-6 py-5">
                                            <p className="text-sm font-bold text-slate-100 group-hover:text-yellow-400 transition-colors">
                                                {client.full_name ?? '—'}
                                            </p>
                                            <p className="text-[9px] text-slate-600 mt-1 uppercase tracking-widest font-black">
                                                ID: {client.id.split('-')[0]} • {new Date(client.created_at).toLocaleDateString('vi-VN')}
                                            </p>
                                        </td>

                                        {/* Contact */}
                                        <td className="px-6 py-5">
                                            <div className="space-y-1">
                                                <p className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                                                    <Mail size={12} className="text-slate-600" />
                                                    {displayEmail}
                                                </p>
                                                {client.phone && (
                                                    <p className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                                                        <Phone size={12} className="text-slate-600" />
                                                        {client.phone}
                                                    </p>
                                                )}
                                            </div>
                                        </td>

                                        {/* Risk Profile */}
                                        <td className="px-6 py-5 text-center">
                                            {client.risk_profile ? (
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] ${riskClass}`}>
                                                    <ShieldCheck size={11} className="mr-1.5" />
                                                    {client.risk_profile}
                                                </span>
                                            ) : (
                                                <span className="text-slate-700 flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase">
                                                    <AlertTriangle size={11} />
                                                    N/A
                                                </span>
                                            )}
                                        </td>

                                        {/* Workspace Projects */}
                                        <td className="px-6 py-5 text-center">
                                            <div className="inline-flex flex-col items-center">
                                                <div className="flex items-center gap-2 text-slate-100 font-black">
                                                    <Briefcase size={12} className="text-yellow-600/60" />
                                                    <span className="text-base">{wsCount}</span>
                                                </div>
                                                <p className="text-[8px] text-slate-600 uppercase tracking-tighter font-bold">Dự án chọn</p>
                                            </div>
                                        </td>

                                        {/* Last Activity */}
                                        <td className="px-6 py-5 text-center">
                                            <p className="text-xs text-slate-300 font-bold">
                                                {client.last_activity ? client.last_activity.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'}
                                            </p>
                                            {client.last_activity && (
                                                <p className="text-[9px] text-slate-500 font-medium">
                                                    {client.last_activity.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-5 text-right">
                                            <Link
                                                href={`/dashboard/clients/${client.id}/profile`}
                                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] bg-slate-800 text-slate-300 border border-slate-700 hover:bg-yellow-600 hover:text-slate-950 hover:border-yellow-600 hover:scale-105 transition-all duration-300 shadow-lg shadow-black/20"
                                            >
                                                Hồ sơ
                                                <ChevronRight size={12} />
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
