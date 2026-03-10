'use client';

import { motion } from 'framer-motion';
import { Building2, UserCheck, LayoutDashboard } from 'lucide-react';

const PILLARS = [
    {
        id: 1,
        icon: Building2,
        title: 'Phân tích dự án',
        desc: 'Hiểu rõ vị trí, thị trường và rủi ro.'
    },
    {
        id: 2,
        icon: UserCheck,
        title: 'Hồ sơ nhu cầu khách hàng',
        desc: 'Mỗi khách hàng có mục tiêu và khả năng tài chính khác nhau.'
    },
    {
        id: 3,
        icon: LayoutDashboard,
        title: 'Đề xuất dự án phù hợp',
        desc: 'Hệ thống giúp bạn nhìn thấy những dự án đáng cân nhắc.'
    }
];

export default function IntroSection() {
    return (
        <section className="py-48 px-6 bg-slate-50 text-slate-950">
            <div className="max-w-7xl mx-auto space-y-32">
                <motion.h2 
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-[50px] md:text-[80px] font-black tracking-tighter leading-[1] text-center italic"
                >
                    PREIO hoạt động như <br />
                    một văn phòng tư vấn <br className="hidden md:block" />
                    <span className="text-slate-400">bất động sản cá nhân.</span>
                </motion.h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {PILLARS.map((pillar, i) => {
                        const Icon = pillar.icon;
                        return (
                            <motion.div 
                                key={pillar.id}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.2 }}
                                className="group p-12 rounded-[3rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/50 hover:scale-105 transition-all duration-500"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center text-yellow-500 mb- aggregation-8">
                                    <Icon size={32} />
                                </div>
                                <div className="space-y-4">
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Pillar 0{pillar.id}</span>
                                    <h3 className="text-2xl font-black tracking-tight">{pillar.title}</h3>
                                    <p className="text-slate-500 font-medium leading-relaxed">{pillar.desc}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
