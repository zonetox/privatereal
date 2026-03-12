import { FileText, CheckCircle2, Target, AlertTriangle, TrendingUp } from 'lucide-react';

interface AdvisorPanelProps {
    notes?: {
        evaluation_notes?: string | null;
        key_advantages?: string | null;
        buyer_suitability?: string | null;
        not_suitable_for?: string | null;
        key_concerns?: string | null;
    } | null;
}

export default function AdvisorPanel({ notes }: AdvisorPanelProps) {
    if (!notes) return null;

    return (
        <div className="space-y-8 h-full flex flex-col">
            <div className="flex items-center gap-2">
                <FileText size={18} className="text-yellow-500" />
                <h2 className="text-lg font-bold tracking-tight text-slate-100 uppercase tracking-widest">Luận điểm Cố vấn PREIO</h2>
            </div>
            
            <div className="flex-1 space-y-6 overflow-hidden">
                {/* Executive Thesis */}
                {notes.evaluation_notes && (
                    <div className="glass p-6 rounded-2xl border border-white/5 space-y-3 bg-white/[0.02]">
                        <div className="flex items-center gap-3 text-yellow-500/80">
                            <CheckCircle2 size={16} />
                            <h3 className="text-[10px] font-black uppercase tracking-widest">Tóm tắt Thẩm định (Executive Thesis)</h3>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed italic">
                            &quot;{notes.evaluation_notes}&quot;
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                    {/* Advantages */}
                    <div className="glass p-5 rounded-2xl border border-white/5 space-y-3">
                        <div className="flex items-center gap-2 text-emerald-400">
                            <TrendingUp size={14} />
                            <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400">Ưu điểm Cốt lõi</h4>
                        </div>
                        <p className="text-[13px] text-slate-400 leading-relaxed whitespace-pre-line">
                            {notes.key_advantages || 'Chưa cập nhật luận điểm ưu điểm.'}
                        </p>
                    </div>

                    {/* Suitability */}
                    <div className="glass p-5 rounded-2xl border border-white/5 space-y-3">
                        <div className="flex items-center gap-2 text-sky-400">
                            <Target size={14} />
                            <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400">Đối tượng Phù hợp</h4>
                        </div>
                        <p className="text-[13px] text-slate-400 leading-relaxed whitespace-pre-line">
                            {notes.buyer_suitability || 'Chưa cập nhật đối tượng mục tiêu.'}
                        </p>
                    </div>
                </div>

                {/* Warnings (Compact) */}
                {(notes.not_suitable_for || notes.key_concerns) && (
                    <div className="glass p-5 rounded-2xl border border-rose-500/10 bg-rose-500/[0.01] space-y-3">
                        <div className="flex items-center gap-2 text-rose-500">
                            <AlertTriangle size={14} />
                            <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400 uppercase">Lưu ý & Hạn chế</h4>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {notes.not_suitable_for && (
                                <p className="text-[12px] text-slate-500 italic leading-snug">
                                    <span className="font-bold text-rose-500/70 not-italic mr-1">Hạn chế:</span> 
                                    {notes.not_suitable_for}
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
