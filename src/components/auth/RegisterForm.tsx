'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { Shield, Mail, Lock, User, ChevronRight, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { Link, useRouter } from '@/navigation';

export default function RegisterForm() {
    const t = useTranslations('Auth');
    const router = useRouter();
    const supabase = createClient();

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setError(t('error_passwords_dont_match') || 'Passwords do not match');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const { error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        role: 'client'
                    }
                }
            });

            if (signUpError) {
                setError(signUpError.message);
                setIsLoading(false);
                return;
            }

            // Success
            router.push('/dashboard');
        } catch {
            setError('An unexpected error occurred. Please try again.');
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="text-center space-y-6 py-4 animate-in fade-in zoom-in duration-500">
                <div className="flex justify-center">
                    <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <CheckCircle2 className="text-emerald-500 w-10 h-10" />
                    </div>
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">{t('successRegister')}</h2>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-[280px] mx-auto">
                        Please check your inbox to confirm your elite advisory account.
                    </p>
                </div>
                <div className="pt-4">
                    <Link 
                        href="/login" 
                        className="text-primary font-bold text-xs uppercase tracking-[0.2em] hover:text-yellow-400 transition-colors"
                    >
                        {t('backToLogin')}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center space-y-3">
                <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">
                    {t('registerTitle')}
                </h1>
                <p className="text-slate-500 text-[11px] font-bold tracking-[0.1em] uppercase">
                    {t('registerSubtitle')}
                </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-5">
                {error && (
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-500 text-sm animate-in shake duration-300">
                        <AlertCircle size={18} />
                        <p>{error}</p>
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-1">
                        {t('fullName')}
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary transition-colors">
                            <User size={18} />
                        </div>
                        <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="block w-full pl-11 pr-4 py-4 bg-slate-900/40 border border-slate-800 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-300"
                            placeholder="Your Full Name"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-1">
                        {t('email')}
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary transition-colors">
                            <Mail size={18} />
                        </div>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full pl-11 pr-4 py-4 bg-slate-900/40 border border-slate-800 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-300"
                            placeholder="executive@preio.office"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-1">
                            {t('password')}
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary transition-colors">
                                <Lock size={18} />
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full pl-11 pr-4 py-4 bg-slate-900/40 border border-slate-800 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-300 text-xs"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-1">
                            {confirmPassword ? (password === confirmPassword ? '✓ Matches' : '✗ Password mismatch') : t('confirmPassword')}
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary transition-colors">
                                <Lock size={18} />
                            </div>
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="block w-full pl-11 pr-4 py-4 bg-slate-900/40 border border-slate-800 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-300 text-xs"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary text-primary-foreground font-black py-4 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:hover:scale-100 uppercase tracking-widest text-xs"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                {t('signUp')}
                                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </div>
            </form>

            <div className="text-center pt-2">
                <Link 
                    href="/login" 
                    className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.15em] hover:text-white transition-all underline underline-offset-4 decoration-slate-800 hover:decoration-primary"
                >
                    {t('hasAccount')} <span className="text-primary italic">{t('signIn')}</span>
                </Link>
            </div>
        </div>
    );
}
