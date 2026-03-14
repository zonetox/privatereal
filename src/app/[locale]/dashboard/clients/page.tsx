import { createClient } from '@/lib/supabase/server';
import { redirect, Link } from '@/navigation';
import { Users, Phone, Mail, ShieldCheck, Briefcase, ChevronRight, AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic';

const RISK_BADGE: Record<string, string> = {
    conservative: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    balanced:     'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    aggressive:   'bg-rose-500/10 text-rose-400 border border-rose-500/20',
};

export default async function ClientsPage({ params }: { params: { locale: string } }) {
    const { locale } = await Promise.resolve(params);
    const supabase = createClient();

    // 1. Auth & Admin guard
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect({ href: '/login', locale });
    if (!user) return null;

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') redirect({ href: '/dashboard', locale });

    // 2. Fetch clients with workspace project count
    const { data: clients, error } = await supabase
        .from('clients')
        .select(`
            id,
            full_name,
            email,
            phone,
            risk_profile,
            created_at,
            profiles(email),
            client_workspace_selections(count)
        `)
        .order('created_at', { ascending: false });

    if (error) console.error('Failed to fetch clients:', error);
    const allClients = clients ?? [];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
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
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm overflow-hidden">
                {allClients.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-600">
                            <Users size={22} />
                        </div>
                        <p className="text-slate-400 font-semibold">Chưa có khách hàng</p>
                        <p className="text-slate-600 text-sm">Chuyển đổi Lead sang Client để bắt đầu quản lý.</p>
                    </div>
                ) : (
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-slate-800">
                                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Khách hàng</th>
                                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Liên hệ</th>
                                <th className="px-5 py-3 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Khẩu vị Rủi ro</th>
                                <th className="px-5 py-3 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Dự án Workspace</th>
                                <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Thao tác</th>
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
                                    <tr key={client.id} className="group hover:bg-slate-800/30 transition-all duration-150">
                                        {/* Name */}
                                        <td className="px-5 py-4">
                                            <p className="text-sm font-semibold text-slate-100 group-hover:text-yellow-400 transition-colors">
                                                {client.full_name ?? '—'}
                                            </p>
                                            <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-widest">
                                                Ngày tạo: {new Date(client.created_at).toLocaleDateString('vi-VN')}
                                            </p>
                                        </td>

                                        {/* Contact */}
                                        <td className="px-5 py-4">
                                            <div className="space-y-0.5">
                                                <p className="flex items-center gap-1.5 text-xs text-slate-400">
                                                    <Mail size={11} className="text-slate-600" />
                                                    {displayEmail}
                                                </p>
                                                {client.phone && (
                                                    <p className="flex items-center gap-1.5 text-xs text-slate-400">
                                                        <Phone size={11} className="text-slate-600" />
                                                        {client.phone}
                                                    </p>
                                                )}
                                            </div>
                                        </td>

                                        {/* Risk Profile */}
                                        <td className="px-5 py-4 text-center">
                                            {client.risk_profile ? (
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${riskClass}`}>
                                                    <ShieldCheck size={10} className="mr-1" />
                                                    {client.risk_profile}
                                                </span>
                                            ) : (
                                                <span className="text-slate-600 flex items-center justify-center gap-1 text-xs">
                                                    <AlertTriangle size={10} />
                                                    Chưa có
                                                </span>
                                            )}
                                        </td>

                                        {/* Workspace Projects */}
                                        <td className="px-5 py-4 text-center">
                                            <div className="inline-flex items-center gap-1.5">
                                                <Briefcase size={12} className="text-yellow-600/60" />
                                                <span className="text-sm font-bold text-slate-300">{wsCount}</span>
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-5 py-4 text-right">
                                            <Link
                                                href={`/dashboard/clients/${client.id}/profile`}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white transition-all duration-200"
                                            >
                                                Hồ sơ
                                                <ChevronRight size={10} />
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
