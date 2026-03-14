import { TrendingUp, Coins, BarChart3, Target, CheckCircle2 } from 'lucide-react';
import InfoCard from './InfoCard';

interface MarketPanelProps {
    market?: {
        liquidity_score?: number | null;
        growth_score?: number | null;
        supply_level?: string | null;
        rental_demand?: string | null;
        avg_rental_yield?: number | null;
    } | null;
    locale?: string;
}

export default function MarketPanel({ market, locale = 'vi' }: MarketPanelProps) {
    if (!market) return null;

    return (
        <div className="space-y-8 h-full flex flex-col">
            <div className="flex items-center gap-2">
                <TrendingUp size={16} className="md:w-4.5 md:h-4.5 text-yellow-500" />
                <h2 className="text-base md:text-lg font-bold tracking-tight text-slate-100 uppercase tracking-widest">Bối cảnh Thị trường</h2>
            </div>

            <div className="flex-1 space-y-6">
                {/* Scores Visualization */}
                <div className="grid grid-cols-1 gap-6">
                    <ScoreBar label="Khả năng Thanh khoản" value={market.liquidity_score} colorClass="bg-emerald-500" />
                    <ScoreBar label="Tiềm năng Tăng trưởng" value={market.growth_score} colorClass="bg-yellow-500" />
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <InfoCard icon={Coins} label="Tỷ suất Lợi nhuận (Cho thuê)" value={market.avg_rental_yield ? `${market.avg_rental_yield}% / năm` : 'Đang cập nhật'} />
                    <InfoCard icon={Target} label="Thế trận Cung" value={market.supply_level === 'high' ? 'Rủi ro Thừa cung' : market.supply_level === 'medium' ? 'Trung bình' : 'Cân bằng'} />
                    <InfoCard icon={CheckCircle2} label="Nhu cầu Hấp thụ" value={market.rental_demand === 'high' ? 'Rất Cao' : market.rental_demand === 'medium' ? 'Ổn định' : 'Thấp'} />
                </div>
            </div>
        </div>
    );
}

function ScoreBar({ label, value, colorClass }: { label: string; value: number | null | undefined; colorClass: string }) {
    if (value === null || value === undefined) return null;
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</span>
                <span className="text-sm font-bold text-slate-200">{value}/100</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                    className={`h-full rounded-full transition-all duration-1000 ${colorClass}`} 
                    style={{ width: `${value}%` }}
                />
            </div>
        </div>
    );
}
