import { MapPin, CheckCircle2, Layout } from 'lucide-react';
import InfoCard from './InfoCard';

interface LocationPanelProps {
    location?: {
        distance_to_cbd?: number | null;
        metro_access?: string | null;
        highway_access?: boolean | null;
        neighborhood_quality?: string | null;
        infrastructure_pipeline?: string[] | null;
    } | null;
}

export default function LocationPanel({ location }: LocationPanelProps) {
    if (!location) return null;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <MapPin size={18} className="text-yellow-500" />
                <h2 className="text-lg font-bold tracking-tight text-slate-100">Location Strategy</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard icon={MapPin} label="Distance to CBD" value={location.distance_to_cbd ? `${location.distance_to_cbd} km` : null} />
                <InfoCard icon={CheckCircle2} label="Metro Access" value={location.metro_access ?? null} />
                <InfoCard icon={CheckCircle2} label="Highway Access" value={location.highway_access ? 'Yes' : 'No'} />
                <InfoCard icon={Layout} label="Neighborhood" value={location.neighborhood_quality ?? null} />
            </div>
            {location.infrastructure_pipeline && location.infrastructure_pipeline.length > 0 && (
                <div className="glass p-6 rounded-2xl border border-white/5 space-y-3">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-200">Infrastructure Pipeline</h3>
                    <ul className="space-y-2">
                        {location.infrastructure_pipeline.map((item: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-slate-400">
                                <span className="text-yellow-500 mt-1">•</span> {item}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
