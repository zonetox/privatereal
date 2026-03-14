import { LucideIcon } from 'lucide-react';

interface InfoCardProps {
    icon: LucideIcon;
    label: string;
    value: string | number | null;
}

export default function InfoCard({ icon: Icon, label, value }: InfoCardProps) {
    return (
        <div className="glass p-3 md:p-4 rounded-xl border border-white/5 flex items-start gap-3 md:gap-4 transition-colors hover:bg-white/[0.02]">
            <div className="p-2 md:p-2.5 rounded-lg bg-white/5 text-slate-400 flex-shrink-0">
                <Icon size={16} className="md:w-4.5 md:h-4.5" />
            </div>
            <div className="min-w-0">
                <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-0.5 md:mb-1 truncate">{label}</p>
                <p className="text-xs md:text-sm font-semibold text-slate-200 truncate">{value ?? '—'}</p>
            </div>
        </div>
    );
}
