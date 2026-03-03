'use client';

import React, { useState } from 'react';
import {
    Save,
    ShieldAlert,
    Zap,
    Scale
} from 'lucide-react';
import { updateClientProfileAction } from '@/app/actions/client-profile';
import { clsx } from 'clsx';

interface ClientProfileFormProps {
    clientId: string;
    initialData: {
        risk_score?: number;
        risk_profile?: string;
        liquid_capital?: number;
        annual_business_revenue?: number;
        debt_obligations?: number;
        real_estate_allocation_percent?: number;
        max_drawdown_percent?: number;
        liquidity_preference?: string;
        crash_reaction?: string;
        leverage_preference?: string;
        target_annual_return?: number;
        succession_planning?: boolean;
        international_exposure_interest?: boolean;
        decision_style?: string;
    };
}

export default function ClientProfileForm({ clientId, initialData }: ClientProfileFormProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [status, setStatus] = useState<{ risk_score?: number, risk_profile?: string } | null>(
        initialData.risk_score ? { risk_score: initialData.risk_score, risk_profile: initialData.risk_profile } : null
    );
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        liquid_capital: initialData.liquid_capital || 0,
        annual_business_revenue: initialData.annual_business_revenue || 0,
        debt_obligations: initialData.debt_obligations || 0,
        real_estate_allocation_percent: initialData.real_estate_allocation_percent || 0,

        max_drawdown_percent: initialData.max_drawdown_percent || 10,
        liquidity_preference: initialData.liquidity_preference || 'medium',
        crash_reaction: initialData.crash_reaction || 'hold',
        leverage_preference: initialData.leverage_preference || 'none',

        target_annual_return: initialData.target_annual_return || 0,
        succession_planning: initialData.succession_planning || false,
        international_exposure_interest: initialData.international_exposure_interest || false,
        decision_style: initialData.decision_style || 'data_driven',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        const result = await updateClientProfileAction(clientId, formData);

        setIsSaving(false);
        if (result.success) {
            setStatus({ risk_score: result.risk_score, risk_profile: result.risk_profile });
        } else {
            setError(result.error || 'Failed to save');
        }
    };

    const getBadgeStyles = (profile?: string) => {
        switch (profile) {
            case 'conservative': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'balanced': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'aggressive': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
            default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 pb-20">
            {/* Header / Score Display */}
            {status && (
                <div className="glass p-6 rounded-xl border border-primary/20 flex items-center justify-between sticky top-20 z-10 bg-background/80 backdrop-blur-md">
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Current Risk Score</span>
                            <span className="text-4xl font-black gold-text-gradient">{status.risk_score}</span>
                        </div>
                        <div className="h-10 w-[1px] bg-border mx-2" />
                        <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Category</span>
                            <span className={clsx(
                                "px-3 py-1 rounded-full text-sm font-bold border uppercase tracking-tighter mt-1",
                                getBadgeStyles(status.risk_profile)
                            )}>
                                {status.risk_profile || 'Unknown'}
                            </span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSaving}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg transition-all hover:scale-105 disabled:opacity-50"
                    >
                        {isSaving ? <Zap size={18} className="animate-pulse" /> : <Save size={18} />}
                        Save Profiling
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Section 1: Financial Intelligence */}
                <div className="glass p-8 rounded-2xl border border-white/5 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Zap className="text-primary" size={20} />
                        </div>
                        <h2 className="text-xl font-bold">Financial Intelligence</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">Liquid Capital (Billion VND)</label>
                            <input
                                name="liquid_capital"
                                type="number"
                                step="0.1"
                                value={formData.liquid_capital}
                                onChange={handleChange}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-3 outline-none focus:border-primary/50 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">Annual Business Revenue</label>
                            <input
                                name="annual_business_revenue"
                                type="number"
                                step="0.1"
                                value={formData.annual_business_revenue}
                                onChange={handleChange}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-3 outline-none focus:border-primary/50 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">Debt Obligations</label>
                            <input
                                name="debt_obligations"
                                type="number"
                                step="0.1"
                                value={formData.debt_obligations}
                                onChange={handleChange}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-3 outline-none focus:border-primary/50 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">Real Estate Allocation (%)</label>
                            <input
                                name="real_estate_allocation_percent"
                                type="number"
                                value={formData.real_estate_allocation_percent}
                                onChange={handleChange}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-3 outline-none focus:border-primary/50 transition-colors"
                            />
                        </div>
                    </div>
                </div>

                {/* Section 2: Risk Psychology */}
                <div className="glass p-8 rounded-2xl border border-white/5 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <ShieldAlert className="text-emerald-500" size={20} />
                        </div>
                        <h2 className="text-xl font-bold">Risk Psychology</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">Max Drawdown Tolerance (%)</label>
                            <input
                                name="max_drawdown_percent"
                                type="number"
                                value={formData.max_drawdown_percent}
                                onChange={handleChange}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-3 outline-none focus:border-primary/50 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">Liquidity Preference</label>
                            <select
                                name="liquidity_preference"
                                value={formData.liquidity_preference}
                                onChange={handleChange}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-3 outline-none focus:border-primary/50 transition-colors"
                            >
                                <option value="low">Low (Long term)</option>
                                <option value="medium">Medium</option>
                                <option value="high">High (Immediate)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">Market Crash Reaction</label>
                            <select
                                name="crash_reaction"
                                value={formData.crash_reaction}
                                onChange={handleChange}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-3 outline-none focus:border-primary/50 transition-colors"
                            >
                                <option value="panic_sell">Panic Sell</option>
                                <option value="hold">Hold</option>
                                <option value="buy_more">Buy More</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">Leverage Preference</label>
                            <select
                                name="leverage_preference"
                                value={formData.leverage_preference}
                                onChange={handleChange}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-3 outline-none focus:border-primary/50 transition-colors"
                            >
                                <option value="none">None</option>
                                <option value="moderate">Moderate (Conservative LTV)</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Section 3: Strategic Intent */}
                <div className="glass p-8 rounded-2xl border border-white/5 space-y-6 md:col-span-2">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-amber-500/10 rounded-lg">
                            <Scale className="text-amber-500" size={20} />
                        </div>
                        <h2 className="text-xl font-bold">Strategic Intent</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">Target Annual Return (%)</label>
                                <input
                                    name="target_annual_return"
                                    type="number"
                                    value={formData.target_annual_return}
                                    onChange={handleChange}
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-3 outline-none focus:border-primary/50 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">Decision Making Style</label>
                                <select
                                    name="decision_style"
                                    value={formData.decision_style}
                                    onChange={handleChange}
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-3 outline-none focus:border-primary/50 transition-colors"
                                >
                                    <option value="data_driven">Data Driven</option>
                                    <option value="emotional">Emotional / Intuitive</option>
                                    <option value="delegative">Delegative</option>
                                    <option value="control_oriented">Control Oriented</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-6 pt-4">
                            <label className="flex items-center gap-4 cursor-pointer group">
                                <input
                                    name="succession_planning"
                                    type="checkbox"
                                    checked={formData.succession_planning}
                                    onChange={handleChange}
                                    className="w-5 h-5 rounded border-white/10 bg-slate-900/50 accent-primary"
                                />
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold group-hover:text-primary transition-colors">Succession Planning</span>
                                    <span className="text-xs text-muted-foreground">Interested in legacy and inheritance strategy</span>
                                </div>
                            </label>

                            <label className="flex items-center gap-4 cursor-pointer group">
                                <input
                                    name="international_exposure_interest"
                                    type="checkbox"
                                    checked={formData.international_exposure_interest}
                                    onChange={handleChange}
                                    className="w-5 h-5 rounded border-white/10 bg-slate-900/50 accent-primary"
                                />
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold group-hover:text-primary transition-colors">International Exposure</span>
                                    <span className="text-xs text-muted-foreground">Interested in cross-border investment opportunities</span>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg flex items-center gap-3">
                    <ShieldAlert size={18} />
                    <span className="text-sm font-semibold">{error}</span>
                </div>
            )}

            {!status && (
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-xl font-bold flex items-center gap-2 shadow-xl transition-all hover:scale-105 disabled:opacity-50"
                    >
                        {isSaving ? <Zap size={20} className="animate-pulse" /> : <Save size={20} />}
                        Save Intelligence Profile
                    </button>
                </div>
            )}
        </form>
    );
}
