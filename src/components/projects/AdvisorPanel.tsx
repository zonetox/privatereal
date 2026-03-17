import { FileText, CheckCircle2, Target, AlertTriangle, TrendingUp } from 'lucide-react';

interface AdvisorPanelProps {
    notes?: {
        evaluation_notes?: string | null;
        key_advantages?: string | null;
        buyer_suitability?: string | null;
        not_suitable_for?: string | null;
        key_concerns?: string | null;
        analyst_confidence_level?: number | null;
    } | null;
}

export default function AdvisorPanel({ notes }: AdvisorPanelProps) {
    if (!notes) return null;

    return (
        <div className="space-y-8 h-full flex flex-col">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FileText size={16} className="md:w-4.5 md:h-4.5 text-yellow-500" />
                    <h2 className="text-base md:text-lg font-bold tracking-tight text-slate-100 uppercase tracking-widest">Luận điểm Cố vấn</h2>
                </div>
                {notes.analyst_confidence_level !== undefined && notes.analyst_confidence_level !== null && (
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                        <span className="text-[10px] font-black uppercase tracking-widest text-yellow-500">Confidence: {notes.analyst_confidence_level}%</span>
                    </div>
                )}
            </div>
            
            <div className="flex-1 space-y-6 overflow-hidden">
                <div className="grid grid-cols-1 gap-4">
                    {/* Pros */}
                    <div className="space-y-1.5">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-500/70">Ưu điểm Vượt trội</h4>
                        <div className="text-xs text-slate-300 space-y-1.5 list-none">
                            {(notes.key_advantages || '').split('\n').map((item, idx) => (
                                <p key={idx} className="flex gap-2 leading-relaxed">
                                    <span className="text-emerald-500">•</span> {item.replace(/^•\s*/, '')}
                                </p>
                            ))}
                        </div>
                    </div>

                    {/* Suitability */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-sky-500/70">Phù hợp với</h4>
                            <div className="text-xs text-slate-400 space-y-1 content-list">
                                {(notes.buyer_suitability || '').split('\n').map((item, idx) => (
                                    <p key={idx} className="flex gap-2">
                                        <span className="text-sky-500/60">•</span> {item.replace(/^•\s*/, '')}
                                    </p>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-rose-500/70">Không phù hợp</h4>
                            <div className="text-xs text-slate-400 space-y-1 content-list">
                                {(notes.not_suitable_for || '').split('\n').map((item, idx) => (
                                    <p key={idx} className="flex gap-2">
                                        <span className="text-rose-500/60">•</span> {item.replace(/^•\s*/, '')}
                                    </p>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Thesis */}
                    <div className="mt-4 pt-6 border-t border-white/5 space-y-2">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Luận điểm Tư vấn (Thesis)</h4>
                        <p className="text-[13px] md:text-sm text-slate-200 leading-relaxed italic font-serif">
                            &quot;{notes.evaluation_notes}&quot;
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
