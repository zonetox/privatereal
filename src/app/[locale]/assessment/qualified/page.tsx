import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import BookingForm from '@/components/forms/BookingForm';
import { CheckCircle2, Star, ShieldCheck, Trophy } from 'lucide-react';

interface QualifiedPageProps {
    searchParams: { id?: string };
}

export const dynamic = 'force-dynamic';

export default async function QualifiedPage({ searchParams }: QualifiedPageProps) {
    const leadId = searchParams.id;
    if (!leadId) notFound();

    const supabase = createClient();
    const { data: lead, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single();

    if (error || !lead || lead.status !== 'qualified') {
        notFound();
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white pt-32 pb-20 px-4">
            <div className="max-w-4xl mx-auto space-y-12">
                {/* Verification Banner */}
                <div className="flex justify-center animate-in fade-in zoom-in duration-700">
                    <div className="bg-primary/10 border border-primary/20 px-6 py-2 rounded-full flex items-center gap-2">
                        <ShieldCheck className="text-primary w-5 h-5" />
                        <span className="text-primary text-sm font-bold uppercase tracking-widest">Eligibility Verified</span>
                    </div>
                </div>

                {/* Executive Header */}
                <div className="text-center space-y-6">
                    <h1 className="text-4xl md:text-6xl font-extrabold gold-text-gradient uppercase tracking-tight">
                        Strategic Fit Confirmed
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Congratulations, <span className="text-white font-bold">{lead.full_name}</span>. Your assessment indicates a high-level strategic alignment with PREIO&apos;s institutional investment parameters.
                    </p>
                </div>

                {/* Value Props */}
                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        { icon: Star, title: "Priority Access", desc: "First-look at off-market distressed assets." },
                        { icon: Trophy, title: "Elite Network", desc: "Invitation to exclusive client roundtables." },
                        { icon: CheckCircle2, title: "Custom Strategy", desc: "Bespoke 10-year capital growth roadmap." }
                    ].map((item, idx) => (
                        <div key={idx} className="glass p-6 rounded-2xl border border-white/5 space-y-3">
                            <item.icon className="text-primary w-8 h-8" />
                            <h3 className="font-bold text-lg">{item.title}</h3>
                            <p className="text-sm text-slate-400">{item.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Booking Section */}
                <div className="glass p-8 md:p-12 rounded-3xl border border-primary/20 bg-slate-900/40 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                        <div className="w-32 h-32 bg-primary/10 blur-3xl rounded-full" />
                    </div>

                    <div className="relative space-y-8">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold">Secure Your Private Consultation</h2>
                            <p className="text-slate-400">Select your preferred window for a 1-on-1 strategic briefing with our senior advisor.</p>
                        </div>

                        <BookingForm leadId={lead.id} leadEmail={lead.email} />
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-xs text-slate-600 uppercase tracking-widest">Strict Confidentiality Guaranteed • Institutional Grade Privacy</p>
                </div>
            </div>
        </div>
    );
}
