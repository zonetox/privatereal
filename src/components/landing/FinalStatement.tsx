'use client';

import { motion } from 'framer-motion';
import { Link } from '@/navigation';
import { ArrowUpRight } from 'lucide-react';

export default function FinalStatement() {
    return (
        <section className="py-64 px-6 bg-white text-slate-950 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02)_0%,transparent_100%)]" />
            
            <div className="max-w-7xl mx-auto space-y-20 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="space-y-4 px-4"
                >
                    <h2 className="text-[42px] md:text-[120px] font-black tracking-tighter leading-[0.9] md:leading-[0.8] italic uppercase">
                        Hiểu rõ dự án. <br />
                        <span className="text-slate-200 group-hover:text-slate-300 transition-colors">Quyết định tự tin.</span>
                    </h2>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-col items-center gap-12 px-6"
                >
                    <Link
                        href="/login"
                        className="group flex items-center gap-4 md:gap-6 px-10 py-6 md:px-16 md:py-8 rounded-full bg-slate-950 text-white text-base md:text-xl font-black uppercase tracking-[0.3em] hover:bg-yellow-500 hover:text-slate-950 transition-all duration-500 shadow-2xl"
                    >
                        Đăng nhập hệ thống PREIO
                        <ArrowUpRight size={20} className="md:w-6 md:h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </Link>

                    <div className="flex flex-col items-center gap-4 opacity-30">
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Private Real Estate Intelligence Office</span>
                        <div className="w-24 h-px bg-slate-200" />
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
