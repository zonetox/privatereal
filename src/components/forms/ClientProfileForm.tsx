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
        
        // New Advisory Fields
        purchase_goal?: string;
        preferred_locations?: string[];
        holding_period?: string;
        risk_tolerance?: string;
        budget_range?: string;
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

        // New Advisory Fields
        purchase_goal: initialData.purchase_goal || 'investment',
        preferred_locations: initialData.preferred_locations || [],
        holding_period: initialData.holding_period || '3_7_years',
        risk_tolerance: initialData.risk_tolerance || 'balanced',
        budget_range: initialData.budget_range || '5_10_billion',
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
                {/* Section 1: Advisory Intent */}
                <div className="glass p-8 rounded-2xl border border-white/5 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Zap className="text-primary" size={20} />
                        </div>
                        <h2 className="text-xl font-bold">Advisory Intent</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">Primary Purchase Goal</label>
                            <select
                                name="purchase_goal"
                                value={formData.purchase_goal}
                                onChange={handleChange}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-3 outline-none focus:border-primary/50 transition-colors"
                            >
                                <option value="living">End-User / Living</option>
                                <option value="investment">Capital Growth</option>
                                <option value="rental">Rental Yield / Passive Income</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">Target Holding Period</label>
                            <select
                                name="holding_period"
                                value={formData.holding_period}
                                onChange={handleChange}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-3 outline-none focus:border-primary/50 transition-colors"
                            >
                                <option value="under_3_years">Short Term ({"<"} 3 years)</option>
                                <option value="3_7_years">Medium Term (3 - 7 years)</option>
                                <option value="7_years_plus">Long Term ({">"} 7 years)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">Preferred Locations</label>
                            <input
                                name="preferred_locations_input"
                                type="text"
                                placeholder="e.g. District 1, District 2, Thao Dien"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const val = (e.target as HTMLInputElement).value.trim();
                                        if (val && !formData.preferred_locations.includes(val)) {
                                            setFormData(prev => ({
                                                ...prev,
                                                preferred_locations: [...prev.preferred_locations, val]
                                            }));
                                            (e.target as HTMLInputElement).value = '';
                                        }
                                    }
                                }}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-3 outline-none focus:border-primary/50 transition-colors"
                            />
                            <div className="flex flex-wrap gap-2 mt-3">
                                {formData.preferred_locations.map(loc => (
                                    <span key={loc} className="bg-primary/20 text-primary-foreground text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 group">
                                        {loc}
                                        <button 
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, preferred_locations: prev.preferred_locations.filter(l => l !== loc) }))}
                                            className="hover:text-white"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 2: Purchase Parameters */}
                <div className="glass p-8 rounded-2xl border border-white/5 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <Scale className="text-emerald-500" size={20} />
                        </div>
                        <h2 className="text-xl font-bold">Purchase Parameters</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">Allocated Budget Range</label>
                            <select
                                name="budget_range"
                                value={formData.budget_range}
                                onChange={handleChange}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-3 outline-none focus:border-primary/50 transition-colors"
                            >
                                <option value="1_3_billion">1 - 3 Billion VND</option>
                                <option value="3_5_billion">3 - 5 Billion VND</option>
                                <option value="5_10_billion">5 - 10 Billion VND</option>
                                <option value="10_20_billion">10 - 20 Billion VND</option>
                                <option value="20_billion_plus">Above 20 Billion VND</option>
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
                                <option value="none">Zero Leverage (All Cash)</option>
                                <option value="moderate">Moderate (30% - 50% LTV)</option>
                                <option value="high">High Leverage ({">"} 50% LTV)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">Liquidity Requirement</label>
                            <select
                                name="liquidity_preference"
                                value={formData.liquidity_preference}
                                onChange={handleChange}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-3 outline-none focus:border-primary/50 transition-colors"
                            >
                                <option value="low">Low (Long-term preservation)</option>
                                <option value="medium">Medium (Standard real estate exit)</option>
                                <option value="high">High (Quick secondary market exit)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Section 3: Advisory Strategy */}
                <div className="glass p-8 rounded-2xl border border-white/5 space-y-6 md:col-span-2">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-amber-500/10 rounded-lg">
                            <ShieldAlert className="text-amber-500" size={20} />
                        </div>
                        <h2 className="text-xl font-bold">Advisory Strategy</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">Risk Tolerance Grade</label>
                                <select
                                    name="risk_tolerance"
                                    value={formData.risk_tolerance}
                                    onChange={handleChange}
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-3 outline-none focus:border-primary/50 transition-colors"
                                >
                                    <option value="conservative">Conservative (Capital focus)</option>
                                    <option value="balanced">Balanced (Growth & Safety)</option>
                                    <option value="aggressive">Aggressive (Maximum upside)</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">Target Rental Return (%)</label>
                                <input
                                    name="target_annual_return"
                                    type="number"
                                    step="0.1"
                                    value={formData.target_annual_return}
                                    onChange={handleChange}
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-3 outline-none focus:border-primary/50 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">Decision Style</label>
                                <select
                                    name="decision_style"
                                    value={formData.decision_style}
                                    onChange={handleChange}
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-3 outline-none focus:border-primary/50 transition-colors"
                                >
                                    <option value="data_driven">Data Driven Audit</option>
                                    <option value="emotional">Intuitive / Personal Fit</option>
                                    <option value="delegative">Delegated to Office</option>
                                    <option value="control_oriented">Active Oversight</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-6 pt-4">
                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">Legacy Objectives</label>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-4 cursor-pointer group">
                                        <input
                                            name="succession_planning"
                                            type="checkbox"
                                            checked={formData.succession_planning}
                                            onChange={handleChange}
                                            className="w-5 h-5 rounded border-white/10 bg-slate-900/50 accent-primary"
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold group-hover:text-primary transition-colors">Inheritance & Succession</span>
                                            <span className="text-xs text-muted-foreground">Focus on cross-generational property transfer</span>
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
                                            <span className="text-sm font-bold group-hover:text-primary transition-colors">Cross-Border Interest</span>
                                            <span className="text-xs text-muted-foreground">Open to international property opportunities</span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                            
                            {/* Hidden technical fields for backward compatibility/migrated data storage */}
                            <div className="opacity-40 border-t border-white/5 pt-4">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Institutional Metadata (Audit only)</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[9px] font-bold text-muted-foreground uppercase block mb-1">Annual Revenue (B)</label>
                                        <input name="annual_business_revenue" type="number" value={formData.annual_business_revenue} onChange={handleChange} className="w-full bg-slate-900/80 border border-white/10 rounded p-1 text-xs outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-bold text-muted-foreground uppercase block mb-1">Debt Index (B)</label>
                                        <input name="debt_obligations" type="number" value={formData.debt_obligations} onChange={handleChange} className="w-full bg-slate-900/80 border border-white/10 rounded p-1 text-xs outline-none" />
                                    </div>
                                </div>
                            </div>
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
                        Save Advisory Profile
                    </button>
                </div>
            )}
        </form>
    );
}
