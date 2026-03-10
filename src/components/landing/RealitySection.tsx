'use client';

import { motion } from 'framer-motion';

export default function RealitySection() {
    return (
        <section className="py-48 px-6 bg-white text-slate-950">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-20">
                <div className="lg:col-span-12">
                    <motion.h2 
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-[60px] md:text-[90px] font-black tracking-tighter leading-[0.9] italic"
                    >
                        Mua bất động sản <br />
                        là một quyết định lớn.
                    </motion.h2>
                </div>
                
                <div className="lg:col-span-5 lg:col-start-8 space-y-12">
                    <motion.p 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-2xl md:text-3xl font-medium leading-normal tracking-tight text-slate-600"
                    >
                        Nhưng phần lớn người mua nhà phải đưa ra quyết định khi chưa thật sự hiểu dự án.
                    </motion.p>

                    <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.4 }}
                        className="space-y-6 pt-12 border-t border-slate-200"
                    >
                        {['Thông tin rời rạc.', 'Quá nhiều quảng cáo.', 'Khó so sánh giữa các lựa chọn.'].map((text, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                <span className="text-[14px] font-black uppercase tracking-[0.2em] text-slate-400">{text}</span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
