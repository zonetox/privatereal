import { AlertTriangle, ShieldCheck, Target, TrendingUp } from 'lucide-react';
import InfoCard from './InfoCard';

interface RiskPanelProps {
    risk?: {
        legal_risk?: string | null;
        construction_risk?: string | null;
        supply_risk?: string | null;
        market_risk?: string | null;
    } | null;
}

export default function RiskPanel({ risk }: RiskPanelProps) {
    if (!risk) return null;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-yellow-500" />
                <h2 className="text-lg font-bold tracking-tight text-slate-100">Contextual Risk Intelligence</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard icon={ShieldCheck} label="Legal Risk" value={risk.legal_risk ?? null} />
                <InfoCard icon={AlertTriangle} label="Construction Risk" value={risk.construction_risk ?? null} />
                <InfoCard icon={Target} label="Supply Risk" value={risk.supply_risk ?? null} />
                <InfoCard icon={TrendingUp} label="Market Risk" value={risk.market_risk ?? null} />
            </div>
        </div>
    );
}
