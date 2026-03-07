import StrategicFitGauge from '@/components/advisory/StrategicFitGauge';
import { ShieldCheck } from 'lucide-react';

interface FitScorePanelProps {
    score?: {
        fit_score?: number | null;
        fit_label?: string | null;
        financial_alignment?: number | null;
        risk_alignment?: number | null;
        horizon_alignment?: number | null;
        location_alignment?: number | null;
        strategy_alignment?: number | null;
    } | null;
    analystConfidence?: number | null;
    isAdmin?: boolean;
}

export default function FitScorePanel({ score, analystConfidence, isAdmin = false }: FitScorePanelProps) {
    if (isAdmin) {
        return (
            <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
                <div className="flex items-center gap-2 text-yellow-500">
                    <ShieldCheck size={18} />
                    <p className="text-xs uppercase tracking-widest font-bold">Admin Internal View</p>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                    You are viewing this page as an administrator. Strategic fit analysis is only active for clients to ensure personalized compatibility based on their risk profiles.
                </p>
            </div>
        );
    }

    return (
        <div className="sticky top-24">
            <StrategicFitGauge
                fitScore={score?.fit_score ?? null}
                fitLabel={score?.fit_label ?? null}
                financialAlignment={score?.financial_alignment ?? null}
                riskAlignment={score?.risk_alignment ?? null}
                horizonAlignment={score?.horizon_alignment ?? null}
                locationAlignment={score?.location_alignment ?? null}
                strategyAlignment={score?.strategy_alignment ?? null}
                analystConfidence={analystConfidence ?? null}
            />
        </div>
    );
}
