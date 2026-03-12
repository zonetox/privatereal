import { MapPin, CheckCircle2, Layout } from 'lucide-react';
import InfoCard from './InfoCard';

interface LocationPanelProps {
    location?: {
        distance_to_cbd?: number | null;
        location_score?: number | null;
        infrastructure_score?: number | null;
        market_trend_notes?: string | null;
    } | null;
}

export default function LocationPanel({ location }: LocationPanelProps) {
    if (!location) return null;

    return (
        <div className="space-y-8 h-full flex flex-col">
            <div className="flex items-center gap-2">
                <MapPin size={18} className="text-yellow-500" />
                <h2 className="text-lg font-bold tracking-tight text-slate-100 uppercase tracking-widest">Chiến lược Vị trí</h2>
            </div>
            
            <div className="flex-1 space-y-6">
                {/* Scores Visualization */}
                <div className="grid grid-cols-1 gap-6">
                    <ScoreBar label="Vị trí Chiến lược" value={location.location_score} colorClass="bg-yellow-500" />
                    <ScoreBar label="Hạ tầng Tuyến tính" value={location.infrastructure_score} colorClass="bg-sky-500" />
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <InfoCard icon={MapPin} label="Khoảng cách tới trung tâm" value={location.distance_to_cbd ? `${location.distance_to_cbd} km` : 'Chưa xác định'} />
                </div>

                {location.market_trend_notes && (
                    <div className="glass p-6 rounded-2xl border border-white/5 space-y-3 bg-white/[0.02]">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Điểm nhấn Khu vực</h3>
                        <p className="text-sm text-slate-400 leading-relaxed italic border-l-2 border-yellow-500/30 pl-4">
                            {location.market_trend_notes}
                        </p>
                    </div>
                )}
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
