'use client';

import { MapPin, AlertTriangle, TrendingUp, BarChart3 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface MarketData {
    project_id: string;
    project_name: string;
    investment_grade: string;
    overall_location_score: number;
    avg_rental_yield: number;
    demand_level: string;
    pipeline_risk: string;
    overall_market_risk: number;
    appreciation_potential: number;
}

export default function MarketAdvisoryGrid({ data }: { data: MarketData[] }) {
    const t = useTranslations('ReportsOverview');

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map((item) => (
                <div key={item.project_id} className="glass p-6 rounded-2xl border border-white/5 hover:border-yellow-500/20 transition-all flex flex-col justify-between">
                    <div className="mb-4">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-bold text-slate-100">{item.project_name}</h3>
                            <span className="bg-primary/20 text-primary-foreground text-[10px] font-black px-2 py-0.5 rounded border border-primary/30 uppercase tracking-widest whitespace-nowrap">
                                ADVISORY {item.investment_grade}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            <MapPin size={12} className="text-slate-500" />
                            {t('location_score')}: <span className="text-slate-200 font-medium">{(item.overall_location_score * 10).toFixed(0)}/100</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">{t('rental_return')}</p>
                                <p className="text-sm font-bold text-slate-200">{item.avg_rental_yield}%</p>
                            </div>
                            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">{t('appreciation')}</p>
                                <p className="text-sm font-bold text-green-500">+{item.appreciation_potential}%</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-xs">
                                <div className="flex items-center gap-1.5 text-slate-400">
                                    <BarChart3 size={12} className="text-slate-500" />
                                    {t('demand_level')}
                                </div>
                                <span className={`font-bold uppercase ${
                                    item.demand_level === 'high' ? 'text-green-500' :
                                    item.demand_level === 'medium' ? 'text-yellow-500' :
                                    'text-blue-500'
                                }`}>
                                    {item.demand_level}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <div className="flex items-center gap-1.5 text-slate-400">
                                    <AlertTriangle size={12} className="text-slate-500" />
                                    {t('market_risk')}
                                </div>
                                <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-yellow-500" 
                                        style={{ width: `${item.overall_market_risk * 10}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
