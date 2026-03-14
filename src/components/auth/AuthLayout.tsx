'use client';

import React from 'react';
import { Shield } from 'lucide-react';
import { Link } from '@/navigation';

interface AuthLayoutProps {
    children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col relative overflow-hidden">
            {/* Premium Animated Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-yellow-600/5 rounded-full blur-[120px] animate-pulse delay-700" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />
            </div>

            {/* Header / Logo */}
            <header className="relative z-10 p-6 md:p-10 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center group-hover:border-primary/50 transition-all shadow-xl shadow-black/40">
                        <Shield className="text-primary w-5 h-5" />
                    </div>
                    <span className="text-xl font-black tracking-tighter text-white uppercase italic">
                        PREIO <span className="text-primary">ADVISORY</span>
                    </span>
                </Link>
            </header>

            {/* Main Content */}
            <main className="relative z-10 flex-1 flex items-center justify-center p-6 pb-20">
                <div className="w-full max-w-md">
                    {/* Glass Container */}
                    <div className="glass p-8 md:p-10 rounded-[2.5rem] border border-white/5 shadow-2xl shadow-black/80 relative overflow-hidden">
                        {/* Inner decorative light */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] -mr-16 -mt-16" />
                        
                        {children}
                    </div>

                    {/* Footer Info */}
                    <div className="mt-12 text-center space-y-4">
                        <div className="flex items-center justify-center gap-6">
                            <span className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">Confidential</span>
                            <div className="w-1 h-1 rounded-full bg-slate-800" />
                            <span className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">Institutional</span>
                            <div className="w-1 h-1 rounded-full bg-slate-800" />
                            <span className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">Secure</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
