'use client';

import { motion } from 'framer-motion';
import { Save, Scale, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function DecisionWorkspaceSection() {
    return (
        <section className="py-48 px-6 bg-slate-950 text-white overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            
            <div className="max-w-7xl mx-auto space-y-32">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div className="space-y-12">
                        <motion.h2 
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="text-[40px] md:text-[90px] font-black tracking-tighter leading-[1] md:leading-[0.9] italic"
                        >
                            Không gian <br />
                            <span className="text-yellow-500">để bạn cân nhắc.</span>
                        </motion.h2>

                        <div className="space-y-8">
                            {[
                                { icon: Save, text: 'Lưu các dự án quan tâm' },
                                { icon: Scale, text: 'So sánh các lựa chọn' },
                                { icon: CheckCircle2, text: 'Theo dõi tiến trình quyết định' }
                            ].map((item, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, x: -30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-center gap-4 md:gap-6 group"
                                >
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/10 flex items-center justify-center text-slate-500 group-hover:border-yellow-500 group-hover:text-yellow-500 transition-all">
                                        <item.icon size={18} className="md:w-5 md:h-5" />
                                    </div>
                                    <span className="text-lg md:text-xl font-medium tracking-tight text-slate-300 group-hover:text-white transition-colors">{item.text}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="relative">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] bg-slate-900 border border-white/5 shadow-2xl relative z-10"
                        >
                            <div className="space-y-6 md:space-y-8">
                                <div className="flex items-center justify-between border-b border-white/5 pb-4 md:pb-6">
                                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-500">Analysis Workspace</span>
                                    <div className="flex gap-1.5 md:gap-2">
                                        <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-rose-500/20" />
                                        <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-amber-500/20" />
                                        <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-emerald-500/20" />
                                    </div>
                                </div>
                                <div className="space-y-3 md:space-y-4">
                                    <div className="w-full h-10 md:h-12 rounded-lg md:rounded-xl bg-white/5 animate-pulse" />
                                    <div className="w-[80%] h-10 md:h-12 rounded-lg md:rounded-xl bg-white/5 animate-pulse" />
                                    <div className="w-full h-24 md:h-32 rounded-lg md:rounded-xl bg-white/5 animate-pulse" />
                                </div>
                                <p className="text-xs md:text-sm italic text-slate-500 text-center pt-2 md:pt-4">PREIO giúp bạn hiểu rõ trước khi đưa ra quyết định.</p>
                            </div>
                        </motion.div>
                        {/* Decorative background blur */}
                        <div className="absolute -inset-10 bg-yellow-500/5 blur-[100px] -z-10 rounded-full" />
                    </div>
                </div>
            </div>
        </section>
    );
}
