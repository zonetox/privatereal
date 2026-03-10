import { createClient } from '@/lib/supabase/server';
import { redirect } from '@/navigation';
import {
    Building2,
    CreditCard,
    Hammer,
    Key,
    FileCheck,
    ChevronDown,
    CircleDot,
    LucideIcon
} from 'lucide-react';

interface MyPropertiesPageProps {
    params: { locale: string };
}

type Milestone = {
    id: string;
    milestone_type: 'payment_due' | 'construction_update' | 'handover' | 'document_submission';
    milestone_date: string;
    status: 'pending' | 'completed';
    notes: string | null;
};

type PropertyRow = {
    id: string;
    unit_code: string | null;
    purchase_date: string | null;
    contract_value: number | null;
    current_status: string | null;
    notes: string | null;
    projects: {
        name: string | null;
        location: string | null;
    } | null;
    property_milestones: Milestone[];
};

const STATUS_STYLES: Record<string, { badge: string; label: string }> = {
    reserved: {
        badge: 'bg-amber-950 text-amber-400 border border-amber-700/40',
        label: 'Reserved',
    },
    contract_signed: {
        badge: 'bg-sky-950 text-sky-400 border border-sky-700/40',
        label: 'Contract Signed',
    },
    paid: {
        badge: 'bg-emerald-950 text-emerald-400 border border-emerald-700/40',
        label: 'Paid',
    },
    transferred: {
        badge: 'bg-slate-700 text-slate-200 border border-slate-500/40',
        label: 'Transferred',
    },
};

const MILESTONE_ICONS: Record<string, LucideIcon> = {
    payment_due: CreditCard,
    construction_update: Hammer,
    handover: Key,
    document_submission: FileCheck,
};

const MILESTONE_LABELS: Record<string, string> = {
    payment_due: 'Payment Due',
    construction_update: 'Construction Update',
    handover: 'Handover',
    document_submission: 'Document Submission',
};

function StatusBadge({ status }: { status: string | null }) {
    if (!status) return null;
    const config = STATUS_STYLES[status] ?? {
        badge: 'bg-slate-800 text-slate-400 border border-slate-700',
        label: status,
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold tracking-wide ${config.badge}`}>
            {config.label}
        </span>
    );
}

function formatCurrency(value: number | null, locale: string): string {
    if (value === null) return '—';
    const isVi = locale === 'vi';
    return new Intl.NumberFormat(isVi ? 'vi-VN' : 'en-US', {
        style: 'currency',
        currency: isVi ? 'VND' : 'USD',
        maximumFractionDigits: 0,
    }).format(value);
}

function formatDate(dateStr: string | null): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

export const dynamic = 'force-dynamic';

export default async function MyPropertiesPage({ params }: MyPropertiesPageProps) {
    const supabase = createClient();

    // 1. Auth check
    const { data: { user } } = await supabase.auth.getUser();
    const { locale } = params;

    if (!user) redirect({ href: '/login', locale });
    if (!user) return null;

    // 2. Get client_id
    const { data: clientRecord } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user.id)
        .single();

    const clientId = clientRecord?.id ?? null;

    // 3. Fetch properties with project details and milestones
    const properties: PropertyRow[] = [];

    if (clientId) {
        const { data } = await supabase
            .from('client_properties')
            .select(`
                id,
                unit_code,
                purchase_date,
                contract_value,
                current_status,
                notes,
                projects (
                    name,
                    location
                ),
                property_milestones (
                    id,
                    milestone_type,
                    milestone_date,
                    status,
                    notes
                )
            `)
            .eq('client_id', clientId)
            .order('purchase_date', { ascending: false })
            .returns<PropertyRow[]>();

        if (data) {
            // Sort milestones within each property by date
            data.forEach(prop => {
                prop.property_milestones.sort((a, b) =>
                    new Date(a.milestone_date).getTime() - new Date(b.milestone_date).getTime()
                );
            });
            properties.push(...data);
        }
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-yellow-600/70 font-medium">
                    Holdings
                </p>
                <h1 className="text-4xl font-black tracking-tighter text-slate-100">
                    My{' '}
                    <span className="bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
                        Properties
                    </span>
                </h1>
                <p className="text-slate-400 text-sm">
                    Properties acquired through PREIO advisory.
                </p>
            </div>

            {/* Empty State */}
            {properties.length === 0 && (
                <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center rounded-2xl border border-slate-800 bg-slate-900/40 p-12">
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
                        <Building2 size={22} className="text-slate-500" />
                    </div>
                    <p className="text-slate-300 font-semibold">No recorded acquisitions yet.</p>
                    <p className="text-slate-500 text-sm max-w-xs">
                        Your confirmed properties will appear here once recorded by your advisor.
                    </p>
                </div>
            )}

            {/* Properties List */}
            {properties.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
                    {properties.map((prop) => (
                        <div
                            key={prop.id}
                            className="rounded-2xl border border-slate-700/40 bg-slate-900/60 backdrop-blur-sm p-6 flex flex-col gap-5 transition-all duration-300 hover:border-slate-600/60 hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)]"
                        >
                            {/* Project Info */}
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 space-y-0.5">
                                    <h2 className="text-base font-bold text-slate-100 truncate leading-snug">
                                        {prop.projects?.name ?? '—'}
                                    </h2>
                                    <p className="text-xs text-slate-500 truncate">
                                        {prop.projects?.location ?? '—'}
                                    </p>
                                </div>
                                <StatusBadge status={prop.current_status} />
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-3 pt-1">
                                <div className="space-y-0.5">
                                    <p className="text-[10px] uppercase tracking-widest text-slate-600 font-medium">Unit</p>
                                    <p className="text-sm text-slate-200 font-semibold">{prop.unit_code ?? '—'}</p>
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[10px] uppercase tracking-widest text-slate-600 font-medium">Purchase Date</p>
                                    <p className="text-sm text-slate-200 font-semibold">{formatDate(prop.purchase_date)}</p>
                                </div>
                                <div className="col-span-2 space-y-0.5">
                                    <p className="text-[10px] uppercase tracking-widest text-slate-600 font-medium">Contract Value</p>
                                    <p className="text-sm text-slate-200 font-semibold">{formatCurrency(prop.contract_value, locale)}</p>
                                </div>
                            </div>

                            {/* Timeline / Milestones */}
                            {prop.property_milestones.length > 0 && (
                                <details className="group border-t border-slate-800/60 pt-4">
                                    <summary className="flex items-center justify-between cursor-pointer list-none">
                                        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold group-open:text-yellow-600/70 transition-colors">
                                            Property Timeline
                                        </p>
                                        <ChevronDown size={14} className="text-slate-600 transition-transform group-open:rotate-180" />
                                    </summary>
                                    <div className="mt-4 space-y-4 pl-1">
                                        {prop.property_milestones.map((ms, idx) => {
                                            const Icon = MILESTONE_ICONS[ms.milestone_type] || CircleDot;
                                            const isCompleted = ms.status === 'completed';
                                            return (
                                                <div key={ms.id} className="relative flex gap-4">
                                                    {/* Connection Line */}
                                                    {idx < prop.property_milestones.length - 1 && (
                                                        <div className="absolute left-[11px] top-6 bottom-[-20px] w-px bg-slate-800" />
                                                    )}

                                                    <div className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center border transition-colors ${isCompleted
                                                        ? 'bg-yellow-600/10 border-yellow-700/30 text-yellow-500/80'
                                                        : 'bg-slate-800/50 border-slate-700 text-slate-500'
                                                        }`}>
                                                        <Icon size={12} />
                                                    </div>

                                                    <div className="flex-1 space-y-1">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <p className={`text-xs font-bold leading-none ${isCompleted ? 'text-slate-200' : 'text-slate-400'}`}>
                                                                {MILESTONE_LABELS[ms.milestone_type]}
                                                            </p>
                                                            <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${isCompleted ? 'bg-emerald-500/10 text-emerald-500/80' : 'bg-slate-800 text-slate-500'
                                                                }`}>
                                                                {ms.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-[10px] text-slate-500 font-medium">{formatDate(ms.milestone_date)}</p>
                                                        {ms.notes && <p className="text-[11px] text-slate-600 leading-relaxed italic">{ms.notes}</p>}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </details>
                            )}

                            {/* Notes */}
                            {prop.notes && (
                                <div className="border-t border-slate-800/60 pt-4">
                                    {prop.notes.length <= 120 ? (
                                        <p className="text-xs text-slate-500 leading-relaxed font-medium">{prop.notes}</p>
                                    ) : (
                                        <details className="group">
                                            <summary className="text-xs text-slate-500 leading-relaxed font-medium line-clamp-2 cursor-pointer list-none">
                                                <span className="group-open:hidden">
                                                    {prop.notes.slice(0, 120)}…{' '}
                                                    <span className="text-yellow-600/70 hover:text-yellow-500 transition-colors">View full note →</span>
                                                </span>
                                            </summary>
                                            <p className="text-xs text-slate-500 leading-relaxed mt-1 font-medium">{prop.notes}</p>
                                        </details>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
