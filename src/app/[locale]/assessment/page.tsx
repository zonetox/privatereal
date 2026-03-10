import React from 'react';
import { useTranslations } from 'next-intl';
import LeadAssessmentForm from '@/components/forms/LeadAssessmentForm';

export const dynamic = 'force-dynamic';

export default function AssessmentPage() {
    const t = useTranslations('Assessment');

    return (
        <div className="min-h-screen bg-slate-950 text-white pt-24 pb-20 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Hero Section */}
                <div className="text-center mb-16 space-y-6">
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight gold-text-gradient uppercase animate-in fade-in slide-in-from-top-4 duration-700">
                        {t('title')}
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-top-6 duration-1000">
                        {t('subtitle')}
                    </p>
                    <div className="w-24 h-1 bg-primary mx-auto rounded-full mt-8" />
                </div>

                {/* Strategic Positioning */}
                <div className="grid md:grid-cols-3 gap-8 mb-20">
                    {[
                        {
                            title: "Private Advisory",
                            desc: "Access off-market data and institutional-grade analytics usually reserved for global property funds."
                        },
                        {
                            title: "Strategic Preservation",
                            desc: "Structure your real estate portfolio for long-term capital preservation against market volatility."
                        },
                        {
                            title: "Tactical Execution",
                            desc: "Precise execution of high-value transactions with complete discretion and professional oversight."
                        }
                    ].map((item, idx) => (
                        <div key={idx} className="glass p-8 border border-white/5 rounded-2xl hover:border-primary/20 transition-all duration-300">
                            <h3 className="text-primary font-bold uppercase tracking-widest text-sm mb-4">{item.title}</h3>
                            <p className="text-slate-300 leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Form Section */}
                <div id="assessment" className="glass p-8 md:p-12 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full -mr-32 -mt-32" />
                    <div className="relative">
                        <LeadAssessmentForm />
                    </div>
                </div>
            </div>
        </div>
    );
}
