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
                            className="text-[60px] md:text-[90px] font-black tracking-tighter leading-[0.9] italic"
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
                                    className="flex items-center gap-6 group"
                                >
                                    <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-slate-500 group-hover:border-yellow-500 group-hover:text-yellow-500 transition-all">
                                        <item.icon size={20} />
                                    </div>
                                    <span className="text-xl font-medium tracking-tight text-slate-300 group-hover:text-white transition-colors">{item.text}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="relative">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="p-10 rounded-[3rem] bg-slate-900 border border-white/5 shadow-2xl relative z-10"
                        >
                            <div className="space-y-8">
                                <div className="flex items-center justify-between border-b border-white/5 pb-6">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Analysis Workspace</span>
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-rose-500/20" />
                                        <div className="w-3 h-3 rounded-full bg-amber-500/20" />
                                        <div className="w-3 h-3 rounded-full bg-emerald-500/20" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="w-full h-12 rounded-xl bg-white/5 animate-pulse" />
                                    <div className="w-[80%] h-12 rounded-xl bg-white/5 animate-pulse" />
                                    <div className="w-full h-32 rounded-xl bg-white/5 animate-pulse" />
                                </div>
                                <p className="text-sm italic text-slate-500 text-center pt-4">PREIO giúp bạn hiểu rõ trước khi đưa ra quyết định.</p>
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
