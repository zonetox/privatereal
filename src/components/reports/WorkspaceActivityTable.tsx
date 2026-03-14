'use client';

import { Briefcase, User, MapPin, Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface WorkspaceActivityRow {
    client_id: string;
    client_name: string;
    risk_profile: string | null;
    project_id: string;
    project_name: string | null;
    project_location: string | null;
    investment_grade: string | null;
    added_to_workspace_at: string;
    lifecycle_stage: string;
}

const STAGE_BADGE: Record<string, string> = {
    considering:   'bg-slate-700 text-slate-400 border border-slate-600',
    research:      'bg-blue-900/50 text-blue-400 border border-blue-700/40',
    due_diligence: 'bg-amber-900/50 text-amber-400 border border-amber-700/40',
    committed:     'bg-emerald-900/50 text-emerald-400 border border-emerald-700/40',
    completed:     'bg-purple-900/50 text-purple-400 border border-purple-700/40',
};

const GRADE_COLOR: Record<string, string> = {
    A: 'text-emerald-400',
    B: 'text-sky-400',
    C: 'text-amber-400',
    D: 'text-rose-400',
};

export default function WorkspaceActivityTable({ data }: { data: WorkspaceActivityRow[] }) {
    const t = useTranslations('ReportsOverview');

    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center rounded-2xl border border-slate-800 bg-slate-900/60">
                <Briefcase size={24} className="text-slate-600" />
                <p className="text-slate-500 text-sm font-semibold">{t('empty_activity')}</p>
                <p className="text-slate-600 text-xs">{t('empty_activity_desc')}</p>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm overflow-hidden">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="border-b border-slate-800">
                        <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{t('client')}</th>
                        <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{t('projects_under_consideration')}</th>
                        <th className="px-5 py-3 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{t('grade')}</th>
                        <th className="px-5 py-3 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{t('status')}</th>
                        <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{t('date_added')}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                    {data.map((row, idx) => {
                        const stageBadge = STAGE_BADGE[row.lifecycle_stage] ?? STAGE_BADGE.considering;
                        const gradeColor = GRADE_COLOR[row.investment_grade ?? ''] ?? 'text-slate-500';
                        return (
                            <tr key={`${row.client_id}-${row.project_id}-${idx}`} className="hover:bg-slate-800/30 transition-all duration-150">
                                {/* Client */}
                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                                            <User size={10} className="text-slate-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-200">{row.client_name}</p>
                                            {row.risk_profile && (
                                                <p className="text-[10px] text-slate-500 capitalize">{row.risk_profile}</p>
                                            )}
                                        </div>
                                    </div>
                                </td>

                                {/* Project */}
                                <td className="px-5 py-4">
                                    <p className="text-sm font-semibold text-slate-200">
                                        {row.project_name ?? '—'}
                                    </p>
                                    {row.project_location && (
                                        <p className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                                            <MapPin size={9} />
                                            {row.project_location}
                                        </p>
                                    )}
                                </td>

                                {/* Grade */}
                                <td className="px-5 py-4 text-center">
                                    <span className={`text-lg font-black ${gradeColor}`}>
                                        {row.investment_grade ?? '—'}
                                    </span>
                                </td>

                                {/* Stage */}
                                <td className="px-5 py-4 text-center">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${stageBadge}`}>
                                        {row.lifecycle_stage.replace(/_/g, ' ')}
                                    </span>
                                </td>

                                {/* Date */}
                                <td className="px-5 py-4 text-right">
                                    <div className="flex items-center justify-end gap-1 text-xs text-slate-500">
                                        <Clock size={11} />
                                        {new Date(row.added_to_workspace_at).toLocaleDateString('vi-VN')}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
