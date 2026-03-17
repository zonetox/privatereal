import { TrendingUp, Coins, BarChart3, Target, CheckCircle2 } from 'lucide-react';
import InfoCard from './InfoCard';

interface MarketPanelProps {
    market?: {
        liquidity_score?: number | null;
        growth_score?: number | null;
        supply_level?: string | null;
        rental_demand?: string | null;
        avg_rental_yield?: number | null;
        regional_avg_price?: number | null;
    } | null;
    locale?: string;
}

export default function MarketPanel({ market, locale = 'vi' }: MarketPanelProps) {
    if (!market) return null;

    const formatter = new Intl.NumberFormat(
        locale === 'vi' ? 'vi-VN' : 'en-US',
        {
            style: 'currency',
            currency: locale === 'vi' ? 'VND' : 'USD',
            maximumFractionDigits: 0
        }
    );

    return (
        <div className="space-y-8 h-full flex flex-col">
            <div className="flex items-center gap-2">
                <TrendingUp size={16} className="md:w-4.5 md:h-4.5 text-yellow-500" />
                <h2 className="text-base md:text-lg font-bold tracking-tight text-slate-100 uppercase tracking-widest">Bối cảnh Thị trường</h2>
            </div>

            <div className="flex-1 space-y-8">
                {/* Scores Visualization */}
                <div className="grid grid-cols-1 gap-8">
                    <ScoreBar label="Khả năng Thanh khoản" value={market.liquidity_score} colorClass="bg-emerald-500" />
                    <ScoreBar label="Tiềm năng Tăng trưởng" value={market.growth_score} colorClass="bg-yellow-500" />
                </div>

                <div className="pt-6 border-t border-white/5">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Lợi suất thuê (Thực tế)</span>
                        <span className="text-2xl font-black text-emerald-400">{market.avg_rental_yield || 0}%</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <InfoCard icon={Target} label="Thế trận Cung" value={market.supply_level === 'high' ? 'Rủi ro Thừa cung' : market.supply_level === 'medium' ? 'Trung bình' : 'Cân bằng'} />
                        <InfoCard icon={CheckCircle2} label="Nhu cầu Hấp thụ" value={market.rental_demand === 'high' ? 'Rất Cao' : market.rental_demand === 'medium' ? 'Ổn định' : 'Thấp'} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function ScoreBar({ label, value, colorClass }: { label: string; value: number | null | undefined; colorClass: string }) {
    if (value === null || value === undefined) return null;
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-xs font-black text-slate-200 border border-white/5">{value}</span>
            </div>
            <div className="h-2 w-full bg-slate-800/50 rounded-full overflow-hidden border border-white/5 p-[1px]">
                <div 
                    className={`h-full rounded-full transition-all duration-1000 ${colorClass}`} 
                    style={{ width: `${value}%` }}
                />
            </div>
        </div>
    );
}
