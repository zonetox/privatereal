import { MapPin, CheckCircle2, Layout } from 'lucide-react';
import InfoCard from './InfoCard';

interface LocationPanelProps {
    location?: {
        distance_to_cbd?: number | null;
        location_score?: number | null;
        infrastructure_score?: number | null;
        market_trend_notes?: string | null;
        amenities?: string | null;
    } | null;
}

export default function LocationPanel({ location }: LocationPanelProps) {
    if (!location) return null;

    return (
        <div className="space-y-8 h-full flex flex-col">
            <div className="flex items-center gap-2">
                <MapPin size={16} className="md:w-4.5 md:h-4.5 text-yellow-500" />
                <h2 className="text-base md:text-lg font-bold tracking-tight text-slate-100 uppercase tracking-widest">Chiến lược Vị trí</h2>
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

                {location.amenities && (
                    <div className="glass p-4 md:p-6 rounded-xl md:rounded-2xl border border-white/5 space-y-2 md:space-y-3 bg-white/[0.02]">
                        <h3 className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-500">Hệ sinh thái Tiện ích</h3>
                        <p className="text-[13px] md:text-sm text-slate-300 leading-relaxed font-medium">
                            {location.amenities}
                        </p>
                    </div>
                )}

                {location.market_trend_notes && (
                    <div className="glass p-4 md:p-6 rounded-xl md:rounded-2xl border border-white/5 space-y-2 md:space-y-3 bg-white/[0.02]">
                        <h3 className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-500">Điểm nhấn Khu vực</h3>
                        <p className="text-[13px] md:text-sm text-slate-400 leading-relaxed italic border-l-2 border-yellow-500/30 pl-3 md:pl-4">
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
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-xs font-black text-slate-200 border border-white/5">{value}</span>
            </div>
            <div className="h-2 w-full bg-slate-800/50 rounded-full overflow-hidden border border-white/5 p-[1px]">
                <div 
                    className={`h-full rounded-full transition-all duration-1000 ${colorClass} shadow-[0_0_10px_rgba(234,179,8,0.2)]`} 
                    style={{ width: `${value}%` }}
                />
            </div>
        </div>
    );
}
