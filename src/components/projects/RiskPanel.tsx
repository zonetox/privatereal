import { AlertTriangle, ShieldCheck, Target, TrendingUp } from 'lucide-react';
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
                <ShieldCheck size={18} className="text-yellow-500" />
                <h2 className="text-lg font-bold tracking-tight text-slate-100 uppercase tracking-widest">Kiểm soát Rủi ro</h2>
            </div>

            <div className="flex-1 space-y-6">
                {/* Scores Visualization */}
                <div className="grid grid-cols-1 gap-6">
                    <ScoreBar label="Khung Pháp lý" value={risk.legal_score} colorClass="bg-sky-500" />
                    <ScoreBar label="Rủi ro Tổng thể" value={risk.risk_score} colorClass="bg-rose-500" />
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <InfoCard icon={AlertTriangle} label="Xác suất Rủi ro Giảm giá" value={risk.downside_risk_percent ? `${risk.downside_risk_percent}%` : 'Đang đánh giá'} />
                    <InfoCard icon={TrendingUp} label="Trạng thái Xây dựng" value={risk.construction_status ?? 'Đã phê duyệt'} />
                </div>

                <div className="glass p-6 rounded-2xl border border-white/5 space-y-3 bg-white/[0.02]">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Ghi chú Kiểm soát</h3>
                    <div className="space-y-4">
                        <div className="border-l-2 border-sky-500/30 pl-4">
                            <p className="text-[9px] uppercase font-bold text-slate-600 mb-1">Pháp lý:</p>
                            <p className="text-[13px] text-slate-400">{risk.legal_notes || 'Đã thẩm định.'}</p>
                        </div>
                    </div>
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
