import { TrendingUp, Coins, BarChart3, Target, CheckCircle2 } from 'lucide-react';
import InfoCard from './InfoCard';

interface MarketPanelProps {
    market?: {
        average_price_area?: number | null;
        price_growth_3y?: number | null;
        supply_level?: string | null;
        demand_level?: string | null;
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
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-yellow-500" />
                <h2 className="text-lg font-bold tracking-tight text-slate-100">Market Intelligence</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard icon={Coins} label="Area Avg Price" value={market.average_price_area ? formatter.format(Number(market.average_price_area)) : null} />
                <InfoCard icon={BarChart3} label="3Y Area Growth" value={market.price_growth_3y ? `${market.price_growth_3y}%` : null} />
                <InfoCard icon={Target} label="Supply Level" value={market.supply_level ?? null} />
                <InfoCard icon={CheckCircle2} label="Demand Level" value={market.demand_level ?? null} />
            </div>
        </div>
    );
}
