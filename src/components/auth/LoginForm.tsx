'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { Shield, Mail, Lock, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';
import { useRouter, Link } from '@/navigation';

export default function LoginForm() {
    const t = useTranslations('Auth');
    const ct = useTranslations('Common');
    const router = useRouter();
    const supabase = createClient();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) {
                setError(signInError.message);
                setIsLoading(false);
                return;
            }

            // Check role and redirect
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', data.user.id)
                .single();

            if (profile?.role === 'admin') {
                router.push('/dashboard/advisor');
            } else {
                router.push('/dashboard');
            }
            
            router.refresh();
        } catch {
            setError('An unexpected error occurred. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center space-y-3">
                <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">
                    {t('welcome')}
                </h1>
                <p className="text-slate-500 text-[11px] font-bold tracking-[0.1em] uppercase">
                    ACCESS TO PRIVATE ADVISORY INFRASTRUCTURE
                </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
                {error && (
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-500 text-sm animate-in shake duration-300">
                        <AlertCircle size={18} />
                        <p>{error}</p>
                    </div>
                )}

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
                            className="block w-full pl-11 pr-4 py-4 bg-slate-900/40 border border-slate-800 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-300"
                            placeholder="••••••••"
                        />
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
                                {t('signIn')}
                                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </div>
            </form>

            <div className="text-center pt-2">
                <Link 
                    href="/register" 
                    className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.15em] hover:text-white transition-all underline underline-offset-4 decoration-slate-800 hover:decoration-primary"
                >
                    {t('noAccount')} <span className="text-primary italic">{t('signUp')}</span>
                </Link>
            </div>
        </div>
    );
}
