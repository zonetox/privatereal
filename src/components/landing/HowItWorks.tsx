'use client';

import { motion } from 'framer-motion';

const STEPS = [
    { id: 1, title: 'Môi giới nhập dự án', desc: 'Môi giới nhập dự án vào hệ thống.' },
    { id: 2, title: 'Phân tích cấu trúc', desc: 'Dự án được phân tích theo cấu trúc rõ ràng.' },
    { id: 3, title: 'Hồ sơ nhu cầu', desc: 'Khách hàng tạo hồ sơ nhu cầu.' },
    { id: 4, title: 'Đánh giá phù hợp', desc: 'Hệ thống đánh giá mức độ phù hợp.' },
    { id: 5, title: 'Xem đề xuất', desc: 'Khách hàng xem những dự án phù hợp với mình.' }
];

export default function HowItWorks() {
    return (
        <section id="how-it-works" className="py-48 px-6 bg-slate-950 text-white overflow-hidden">
            <div className="max-w-7xl mx-auto space-y-32">
                <div className="text-center space-y-6">
                    <motion.span 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-[12px] font-black uppercase tracking-[0.6em] text-yellow-600"
                    >
                        Lộ trình tư vấn
                    </motion.span>
                    <motion.h2 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-[50px] md:text-[80px] font-black tracking-tighter leading-none italic"
                    >
                        Quy trình tại PREIO.
                    </motion.h2>
                </div>

                <div className="relative flex flex-col md:flex-row justify-between gap-12 md:gap-4">
                    {/* Progress Line */}
                    <div className="absolute top-10 left-10 md:left-0 md:right-0 h-full md:h-px bg-slate-800 -z-10" />
                    
                    {STEPS.map((step, i) => (
                        <motion.div 
                            key={step.id}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.15, duration: 0.8 }}
                            className="flex md:flex-col items-center md:items-start gap-8 md:gap-12 flex-1"
                        >
                            <div className="w-20 h-20 rounded-full bg-slate-900 border-4 border-slate-950 flex items-center justify-center text-3xl font-black text-yellow-500 shadow-2xl relative">
                                {step.id}
                                <div className="absolute inset-0 rounded-full border border-yellow-500/20 animate-pulse" />
                            </div>
                            <div className="space-y-3 text-left">
                                <h3 className="text-xl font-bold tracking-tight text-slate-100">{step.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed font-medium max-w-[200px]">{step.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
