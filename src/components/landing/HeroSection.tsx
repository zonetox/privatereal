'use client';

import { motion } from 'framer-motion';
import { Link } from '@/navigation';
import { ChevronRight } from 'lucide-react';

export default function HeroSection() {
    return (
        <section className="relative h-screen flex flex-col items-center justify-center text-center overflow-hidden">
            {/* Cinematic Background Image (Mockup for now as we would need to move the actual file to public) */}
            <div className="absolute inset-0 bg-black">
                <div className="absolute inset-0 opacity-40 bg-[url('/images/hero-bg.png')] bg-cover bg-center" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />
            </div>

            <div className="relative z-10 max-w-6xl px-4 md:px-6 space-y-8 md:y-12">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    className="space-y-4 md:space-y-6"
                >
                    <h1 className="text-4xl sm:text-5xl md:text-[110px] font-black tracking-tighter leading-[0.9] md:leading-[0.85] text-white italic">
                        Hiểu dự án <br className="sm:hidden" />
                        <span className="text-yellow-500">trước khi quyết định.</span>
                    </h1>
                    
                    <p className="max-w-3xl mx-auto text-base sm:text-lg md:text-2xl text-slate-300 font-medium leading-relaxed tracking-tight px-4 md:px-0">
                        PREIO là một văn phòng tư vấn bất động sản số hóa <br className="hidden md:block" />
                        giúp bạn hiểu rõ dự án phù hợp với mình.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-6"
                >
                    <Link
                        href="#how-it-works"
                        className="group flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.3em] text-white hover:text-yellow-500 transition-colors"
                    >
                        Khám phá cách hệ thống hoạt động
                        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <Link
                        href="/login"
                        className="px-10 py-5 rounded-full bg-yellow-500 text-slate-950 text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-yellow-500/20 hover:scale-105 active:scale-95 transition-all"
                    >
                        ĐKV Đăng nhập hệ thống
                    </Link>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute bottom-12 left-1/2 -translate-x-1/2 w-px h-12 bg-gradient-to-b from-yellow-500 to-transparent opacity-50"
            />
        </section>
    );
}
