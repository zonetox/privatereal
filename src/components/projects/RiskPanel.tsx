import { AlertTriangle, ShieldCheck, TrendingUp } from 'lucide-react';
import InfoCard from './InfoCard';

interface RiskPanelProps {
    risk?: {
        legal_score?: number | null;
        risk_score?: number | null;
        downside_risk_percent?: number | null;
        construction_status?: string | null;
        legal_notes?: string | null;
        risk_notes?: string | null;
    } | null;
}

export default function RiskPanel({ risk }: RiskPanelProps) {
    if (!risk) return null;

    return (
        <div className="space-y-8 h-full flex flex-col">
            <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="md:w-4.5 md:h-4.5 text-yellow-500" />
                <h2 className="text-base md:text-lg font-bold tracking-tight text-slate-100 uppercase tracking-widest">Kiểm soát Rủi ro</h2>
            </div>

            <div className="flex-1 space-y-8">
                {/* Scores Visualization */}
                <div className="grid grid-cols-1 gap-8">
                    <ScoreBar label="Khung Pháp lý" value={risk.legal_score} colorClass="bg-sky-500" />
                    <ScoreBar label="Rủi ro Tổng thể" value={risk.risk_score} colorClass="bg-rose-500" />
                </div>

                <div className="pt-6 border-t border-white/5">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Kịch bản xấu nhất (Downside)</span>
                        <span className="text-2xl font-black text-rose-500">-{risk.downside_risk_percent || 0}%</span>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        <div className="border-l-2 border-sky-500/30 pl-4 py-1">
                            <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Ghi chú Pháp lý:</p>
                            <p className="text-xs text-slate-400 leading-relaxed">{risk.legal_notes || 'Đã thẩm định.'}</p>
                        </div>
                        {risk.risk_notes && (
                            <div className="border-l-2 border-rose-500/30 pl-4 py-1">
                                <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Cảnh báo Rủi ro:</p>
                                <p className="text-xs text-slate-400 leading-relaxed">{risk.risk_notes}</p>
                            </div>
                        )}
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
