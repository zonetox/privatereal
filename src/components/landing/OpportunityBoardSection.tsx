'use client';

import { motion } from 'framer-motion';
import { Target, Star, AlertCircle } from 'lucide-react';

export default function OpportunityBoardSection() {
    return (
        <section className="py-48 px-6 bg-slate-50 text-slate-950">
            <div className="max-w-7xl mx-auto space-y-32">
                <div className="max-w-3xl space-y-8">
                    <motion.h2 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-[60px] md:text-[90px] font-black tracking-tighter leading-[0.9] italic"
                    >
                        Những dự án <br />
                        phù hợp với bạn.
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-2xl font-medium text-slate-500 leading-relaxed"
                    >
                        Hệ thống hiển thị các dự án được chọn lọc dựa trên hồ sơ nhu cầu của bạn.
                    </motion.p>
                </div>

                <div className="relative p-12 md:p-20 rounded-[4rem] bg-white border border-slate-100 shadow-2xl overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-20 relative z-10">
                        <div className="space-y-6">
                            <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-600 mb- aggregation-4">
                                <Target size={24} />
                            </div>
                            <h3 className="text-xl font-black uppercase tracking-widest italic">Mức độ phù hợp</h3>
                            <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    whileInView={{ width: '85%' }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 1.5, delay: 0.5 }}
                                    className="h-full bg-sky-500" 
                                />
                            </div>
                            <p className="text-sm text-slate-400 font-medium">Hệ thống tính toán tỉ lệ matching dựa trên 5 trụ cột tư vấn.</p>
                        </div>

                        <div className="space-y-6">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb- aggregation-4">
                                <Star size={24} />
                            </div>
                            <h3 className="text-xl font-black uppercase tracking-widest italic">Điểm mạnh</h3>
                            <div className="space-y-3">
                                {['Vị trí đắc địa', 'Thắng thế thị trường'].map((t, i) => (
                                    <div key={i} className="flex items-center gap-3 px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-black uppercase tracking-widest">
                                        + {t}
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm text-slate-400 font-medium">Những lý do dự án này vượt trội hơn các lựa chọn khác.</p>
                        </div>

                        <div className="space-y-6">
                            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 mb- aggregation-4">
                                <AlertCircle size={24} />
                            </div>
                            <h3 className="text-xl font-black uppercase tracking-widest italic">Cần lưu ý</h3>
                            <div className="space-y-3">
                                {['Thanh khoản trung hạn', 'Rủi ro hạ tầng'].map((t, i) => (
                                    <div key={i} className="flex items-center gap-3 px-4 py-2 rounded-lg bg-amber-50 text-amber-700 text-[11px] font-black uppercase tracking-widest italic">
                                        ! {t}
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm text-slate-400 font-medium">Cảnh báo các yếu tố rủi ro có thể gặp phải.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
