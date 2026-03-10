'use client';

import { motion } from 'framer-motion';
import { Search, BarChart3, ShieldAlert, NotebookPen } from 'lucide-react';

const ANALYSIS_ITEMS = [
    { icon: Search, label: 'Phân tích vị trí', color: 'text-sky-500' },
    { icon: BarChart3, label: 'Bối cảnh thị trường', color: 'text-amber-500' },
    { icon: ShieldAlert, label: 'Nhận xét rủi ro', color: 'text-rose-500' },
    { icon: NotebookPen, label: 'Ghi chú tư vấn', color: 'text-emerald-500' }
];

export default function IntelligenceSection() {
    return (
        <section className="py-48 px-6 bg-white text-slate-950">
            <div className="max-w-7xl mx-auto space-y-32">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
                    <div className="lg:col-span-6 space-y-12">
                        <motion.h2 
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="text-[50px] md:text-[80px] font-black tracking-tighter leading-[0.9] italic"
                        >
                            Không chỉ là thông tin. <br />
                            <span className="text-slate-300">Đó là phân tích.</span>
                        </motion.h2>

                        <motion.p 
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="text-2xl font-medium leading-relaxed text-slate-500 max-w-xl"
                        >
                            Mỗi dự án được trình bày giống như khi môi giới tư vấn trực tiếp cho bạn.
                        </motion.p>
                    </div>

                    <div className="lg:col-span-6">
                        <div className="grid grid-cols-2 gap-6 p-8 rounded-[4rem] bg-slate-50 border border-slate-100 shadow-2xl relative overflow-hidden group">
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-yellow-500/5 blur-[100px] rounded-full group-hover:scale-150 transition-transform duration-1000" />
                            
                            {ANALYSIS_ITEMS.map((item, i) => {
                                const Icon = item.icon;
                                return (
                                    <motion.div 
                                        key={item.label}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.15 }}
                                        className="p-10 rounded-3xl bg-white shadow-sm border border-slate-100 flex flex-col items-center gap-6 text-center group/card hover:-translate-y-2 transition-transform duration-500"
                                    >
                                        <div className={`w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center ${item.color}`}>
                                            <Icon size={32} />
                                        </div>
                                        <span className="text-[12px] font-black uppercase tracking-[0.2em]">{item.label}</span>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
