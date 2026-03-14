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
}

export default function AdvisoryCollectionTable({ data }: { data: AdvisoryCollectionData[] }) {
    const t = useTranslations('ReportsOverview');
    
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
                    <tr className="border-b border-white/5 text-slate-500 text-xs uppercase tracking-widest font-bold">
                        <th className="px-4 py-4">{t('client')}</th>
                        <th className="px-4 py-4">{t('managed_budget')}</th>
                        <th className="px-4 py-4">{t('property_count')}</th>
                        <th className="px-4 py-4">{t('avg_rental_return')}</th>
                        <th className="px-4 py-4">{t('advisory_progress')}</th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {data.map((item) => (
                        <tr key={item.client_id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                            <td className="px-4 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                                        <User size={14} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-200">{item.client_name}</p>
                                        <p className="text-[10px] text-slate-500 uppercase">{item.risk_profile}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-4 py-4 font-medium text-slate-300">
                                {formatCurrency(item.total_property_investment)}
                            </td>
                            <td className="px-4 py-4">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Building2 size={14} className="text-slate-500" />
                                    {item.asset_count}
                                </div>
                            </td>
                            <td className="px-4 py-4">
                                <span className="text-emerald-500 font-bold">
                                    {item.avg_expected_roi?.toFixed(1)}%
                                </span>
                            </td>
                            <td className="px-4 py-4">
                                <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
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
