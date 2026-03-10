import { LucideIcon } from 'lucide-react';

interface InfoCardProps {
    icon: LucideIcon;
    label: string;
    value: string | number | null;
}

export default function InfoCard({ icon: Icon, label, value }: InfoCardProps) {
    return (
        <div className="glass p-4 rounded-xl border border-white/5 flex items-start gap-4">
            <div className="p-2.5 rounded-lg bg-white/5 text-slate-400">
                <Icon size={18} />
            </div>
            <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">{label}</p>
                <p className="text-sm font-semibold text-slate-200">{value ?? '—'}</p>
            </div>
        </div>
    );
}
