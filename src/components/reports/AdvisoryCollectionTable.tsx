'use client';

import { Building2, User } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface AdvisoryCollectionData {
    client_id: string;
    client_name: string;
    risk_profile: string;
    total_property_investment: number;
    asset_count: number;
    avg_expected_roi: number;
    portfolio_lifecycle_status: string;
    // New enriched fields
    capital_range?: string;
    workspace_project_count?: number;
    active_directives_count?: number;
}

export default function AdvisoryCollectionTable({ data }: { data: AdvisoryCollectionData[] }) {
    const t = useTranslations('ReportsOverview');
    const tf = useTranslations('LeadForm'); // For capital range mapping
    
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-white/5 text-slate-500 text-[9px] md:text-xs uppercase tracking-widest font-bold">
                        <th className="px-3 md:px-4 py-3 md:py-4">{t('client')}</th>
                        <th className="px-3 md:px-4 py-3 md:py-4">{t('col_capital_range')}</th>
                        <th className="px-3 md:px-4 py-3 md:py-4">{t('managed_budget')}</th>
                        <th className="px-3 md:px-4 py-3 md:py-4">{t('col_selected_projects')}</th>
                        <th className="px-3 md:px-4 py-3 md:py-4">{t('col_active_directives')}</th>
                        <th className="px-3 md:px-4 py-3 md:py-4">{t('advisory_progress')}</th>
                    </tr>
                </thead>
                <tbody className="text-[11px] md:text-sm">
                    {data.map((item) => (
                        <tr key={item.client_id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                            <td className="px-3 md:px-4 py-3 md:py-4">
                                <div className="flex items-center gap-2 md:gap-3">
                                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 flex-shrink-0">
                                        <User size={12} className="md:w-3.5 md:h-3.5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-slate-200 truncate">{item.client_name}</p>
                                        <p className="text-[9px] md:text-[10px] text-slate-500 uppercase truncate">{item.risk_profile}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-3 md:px-4 py-3 md:py-4 whitespace-nowrap">
                                <span className="px-2 py-0.5 bg-slate-800 text-slate-300 border border-slate-700 rounded text-[10px] font-bold">
                                    {item.capital_range ? tf(item.capital_range) : "—"}
                                </span>
                            </td>
                            <td className="px-3 md:px-4 py-3 md:py-4 font-medium text-slate-300 whitespace-nowrap text-emerald-500">
                                {item.total_property_investment ? formatCurrency(item.total_property_investment) : "—"}
                            </td>
                            <td className="px-3 md:px-4 py-3 md:py-4 text-center">
                                <span className="text-slate-200 font-bold">{item.workspace_project_count ?? 0}</span>
                            </td>
                            <td className="px-3 md:px-4 py-3 md:py-4 text-center">
                                <span className={item.active_directives_count ? "text-yellow-500 font-black" : "text-slate-500"}>
                                    {item.active_directives_count ?? 0}
                                </span>
                            </td>
                            <td className="px-3 md:px-4 py-3 md:py-4">
                                <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-tighter whitespace-nowrap">
                                    {item.portfolio_lifecycle_status || 'Assessment'}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
