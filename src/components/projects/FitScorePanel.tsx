import StrategicFitGauge from '@/components/projects/StrategicFitGauge';
import { ShieldCheck } from 'lucide-react';

interface FitScorePanelProps {
    score?: {
        fit_score?: number | null;
        fit_label?: string | null;
        budget_alignment?: number | null;
        risk_alignment?: number | null;
        horizon_alignment?: number | null;
        location_alignment?: number | null;
        goal_alignment?: number | null;
    } | null;
    advisoryConfidence?: number | null;
    isAdmin?: boolean;
}

export default function FitScorePanel({ score, advisoryConfidence, isAdmin = false }: FitScorePanelProps) {
    if (isAdmin) {
        return (
            <div className="glass p-5 md:p-6 rounded-xl md:rounded-2xl border border-white/5 space-y-3 md:space-y-4">
                <div className="flex items-center gap-2 text-yellow-500">
                    <ShieldCheck size={16} className="md:w-4.5 md:h-4.5" />
                    <p className="text-[10px] md:text-xs uppercase tracking-widest font-bold">Admin Internal View</p>
                </div>
                <p className="text-[11px] md:text-xs text-slate-500 leading-relaxed italic">
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
                budgetAlignment={score?.budget_alignment ?? null}
                riskAlignment={score?.risk_alignment ?? null}
                horizonAlignment={score?.horizon_alignment ?? null}
                locationAlignment={score?.location_alignment ?? null}
                goalAlignment={score?.goal_alignment ?? null}
                advisoryConfidence={advisoryConfidence ?? null}
            />
        </div>
    );
}
