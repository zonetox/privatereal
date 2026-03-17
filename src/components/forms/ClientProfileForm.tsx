'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
    Save,
    ShieldAlert,
    Zap,
    Scale,
    Target,
    MapPin,
    Clock
} from 'lucide-react';
import { updateClientProfileAction } from '@/app/actions/client-profile';
import { clsx } from 'clsx';

interface ClientProfileFormProps {
    clientId: string;
    initialData: {
        full_name?: string;
        phone?: string;
        email?: string;
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
    const t = useTranslations('AdvisoryProfile');
    const authT = useTranslations('Auth');
    const [isSaving, setIsSaving] = useState(false);
    const [status, setStatus] = useState<{ risk_score?: number, risk_profile?: string } | null>(
        initialData.risk_score ? { risk_score: initialData.risk_score, risk_profile: initialData.risk_profile } : null
    );
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        full_name: initialData.full_name || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        
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
            // In a real app, you might want to show a success toast here
        } else {
            setError(result.error || 'Failed to save');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-12 pb-32 max-w-5xl mx-auto">
            
            {/* STICKY HEADER — ACTIONS & SUMMARY */}
            <div className="sticky top-20 z-30 bg-background/60 backdrop-blur-xl border-b border-white/5 py-4 -mx-4 px-4 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    {status && (
                        <div className="flex items-center gap-6">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{t('current_risk_score')}</span>
                                <span className="text-3xl font-black text-slate-100 tabular-nums">{status.risk_score}</span>
                            </div>
                            <div className="h-8 w-px bg-white/10" />
                            <div className="flex flex-col">
                                <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{t('category')}</span>
                                <span className="text-sm font-bold text-yellow-500 uppercase tracking-tighter">
                                    {status.risk_profile ? t(`risk_${status.risk_profile}`) : authT('unknown')}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isSaving}
                    className="bg-slate-100 hover:bg-white text-slate-900 px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-all active:scale-95 disabled:opacity-50 shadow-2xl shadow-white/5"
                >
                    {isSaving ? <Zap size={14} className="animate-pulse" /> : <Save size={14} />}
                    {t('save_profiling')}
                </button>
            </div>

            <div className="grid grid-cols-1 gap-12">
                
                {/* 1. PERSONAL INFO SECTION */}
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="h-px flex-1 bg-white/5" />
                        <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-600">{t('personal_info')}</h2>
                        <div className="h-px flex-1 bg-white/5" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">{t('full_name')}</label>
                            <input
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                placeholder="e.g. Nguyễn Văn A"
                                className="w-full bg-slate-950/50 border border-white/5 rounded-xl p-4 text-sm font-medium outline-none focus:border-white/20 transition-all text-slate-200"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">{t('email')}</label>
                            <input
                                name="email"
                                value={formData.email}
                                readOnly
                                className="w-full bg-slate-950/20 border border-white/5 rounded-xl p-4 text-sm font-medium outline-none text-slate-500 cursor-not-allowed"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">{t('phone')}</label>
                            <input
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="e.g. 0901234567"
                                className="w-full bg-slate-950/50 border border-white/5 rounded-xl p-4 text-sm font-medium outline-none focus:border-white/20 transition-all text-slate-200"
                            />
                        </div>
                    </div>
                </div>

                {/* ADVISORY CORE GRID (2x2) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    
                    {/* 2. PURCHASE GOAL */}
                    <div className="bg-slate-950/20 p-8 rounded-[2rem] border border-white/5 space-y-6">
                        <div className="flex items-center gap-3">
                            <Target size={18} className="text-sky-500" />
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-200">{t('primary_goal')}</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {['living', 'investment', 'rental'].map((goal) => (
                                <label 
                                    key={goal}
                                    className={clsx(
                                        "flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group",
                                        formData.purchase_goal === goal 
                                            ? "bg-sky-500/10 border-sky-500/30 text-sky-400" 
                                            : "bg-slate-900/40 border-white/5 text-slate-500 hover:border-white/10"
                                    )}
                                >
                                    <span className="text-xs font-bold uppercase tracking-widest">{t(`goal_${goal}`)}</span>
                                    <input
                                        type="radio"
                                        name="purchase_goal"
                                        value={goal}
                                        checked={formData.purchase_goal === goal}
                                        onChange={handleChange}
                                        className="hidden"
                                    />
                                    {formData.purchase_goal === goal && <div className="w-2 h-2 rounded-full bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.5)]" />}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* 3. BUDGET RANGE */}
                    <div className="bg-slate-950/20 p-8 rounded-[2rem] border border-white/5 space-y-6">
                        <div className="flex items-center gap-3">
                            <Scale size={18} className="text-emerald-500" />
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-200">{t('budget_range')}</h3>
                        </div>
                        <div className="space-y-4">
                            <select
                                name="budget_range"
                                value={formData.budget_range}
                                onChange={handleChange}
                                className="w-full bg-slate-900/60 border border-white/10 rounded-2xl p-4 outline-none focus:border-emerald-500/50 transition-all text-slate-300 font-bold uppercase tracking-widest text-[10px]"
                            >
                                <option value="1_3_billion">{t('budget_1_3')}</option>
                                <option value="3_5_billion">{t('budget_3_5')}</option>
                                <option value="5_10_billion">{t('budget_5_10')}</option>
                                <option value="10_20_billion">{t('budget_10_20')}</option>
                                <option value="20_billion_plus">{t('budget_20_plus')}</option>
                            </select>
                            <p className="text-[10px] text-slate-500 leading-relaxed font-medium uppercase tracking-[0.1em]">
                                Hạn mức ngân sách ảnh hưởng trực tiếp đến bộ lọc dự án và khả năng khớp lệnh tổ chức (Strategic Alignment).
                            </p>
                        </div>
                    </div>

                    {/* 4. PREFERRED LOCATION */}
                    <div className="bg-slate-950/20 p-8 rounded-[2rem] border border-white/5 space-y-6">
                        <div className="flex items-center gap-3">
                            <MapPin size={18} className="text-yellow-500" />
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-200">{t('preferred_locations')}</h3>
                        </div>
                        <div className="space-y-4">
                            <input
                                name="location_input"
                                type="text"
                                placeholder="Nhập Quận/Khu vực và nhấn Enter..."
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
                                className="w-full bg-slate-900/60 border border-white/10 rounded-2xl p-4 text-xs font-medium outline-none focus:border-yellow-500/50 transition-all text-slate-300"
                            />
                            <div className="flex flex-wrap gap-2">
                                {formData.preferred_locations.map(loc => (
                                    <span key={loc} className="bg-yellow-500/10 text-yellow-500 text-[10px] font-black px-4 py-2 rounded-full flex items-center gap-2 border border-yellow-500/20 group">
                                        {loc}
                                        <button 
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, preferred_locations: prev.preferred_locations.filter(l => l !== loc) }))}
                                            className="hover:text-white transition-colors"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                                {formData.preferred_locations.length === 0 && (
                                    <p className="text-[10px] text-slate-600 font-medium italic">Chưa chọn khu vực ưu tiên...</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 5. HOLDING PERIOD */}
                    <div className="bg-slate-950/20 p-8 rounded-[2rem] border border-white/5 space-y-6">
                        <div className="flex items-center gap-3">
                            <Clock size={18} className="text-indigo-500" />
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-200">{t('holding_period')}</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {['under_3_years', '3_7_years', '7_years_plus'].map((period) => (
                                <label 
                                    key={period}
                                    className={clsx(
                                        "flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group",
                                        formData.holding_period === period 
                                            ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400" 
                                            : "bg-slate-900/40 border-white/5 text-slate-500 hover:border-white/10"
                                    )}
                                >
                                    <span className="text-xs font-bold uppercase tracking-widest">{t(`period_${period.includes('under') ? 'short' : period.includes('3_7') ? 'medium' : 'long'}`)}</span>
                                    <input
                                        type="radio"
                                        name="holding_period"
                                        value={period}
                                        checked={formData.holding_period === period}
                                        onChange={handleChange}
                                        className="hidden"
                                    />
                                    {formData.holding_period === period && <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />}
                                </label>
                            ))}
                        </div>
                    </div>

                </div>

                {/* 6. RISK TOLERANCE SECTION (Full Width) */}
                <div className="space-y-8 pt-8 border-t border-white/5">
                    <div className="flex items-center gap-4">
                        <ShieldAlert size={18} className="text-rose-500" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-200">{t('risk_tolerance')}</h3>
                        <div className="h-px flex-1 bg-white/5" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {['conservative', 'balanced', 'aggressive'].map((risk) => (
                            <label 
                                key={risk}
                                className={clsx(
                                    "relative p-8 rounded-[2rem] border transition-all cursor-pointer group flex flex-col gap-4 overflow-hidden",
                                    formData.risk_tolerance === risk 
                                        ? "bg-rose-500/10 border-rose-500/30 ring-1 ring-rose-500/20" 
                                        : "bg-slate-900/20 border-white/5 hover:border-white/10"
                                )}
                            >
                                <div className="z-10 space-y-2">
                                    <h4 className={clsx(
                                        "text-xs font-black uppercase tracking-[0.2em]",
                                        formData.risk_tolerance === risk ? "text-rose-400" : "text-slate-400"
                                    )}>
                                        {t(`risk_${risk}`)}
                                    </h4>
                                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                                        {risk === 'conservative' && "Ưu tiên bảo toàn vốn tuyệt đối, chấp nhận lợi nhuận thấp để đổi lấy an toàn."}
                                        {risk === 'balanced' && "Cân bằng giữa tăng trưởng và an toàn, sẵn sàng chấp nhận biến động nhẹ."}
                                        {risk === 'aggressive' && "Tối ưu hóa lợi nhuận, sẵn sàng tiếp cận các dự án rủi ro cao để đột phá."}
                                    </p>
                                </div>
                                <input
                                    type="radio"
                                    name="risk_tolerance"
                                    value={risk}
                                    checked={formData.risk_tolerance === risk}
                                    onChange={handleChange}
                                    className="hidden"
                                />
                                {formData.risk_tolerance === risk && (
                                    <div className="absolute top-4 right-4 text-rose-500">
                                        <Zap size={16} fill="currentColor" />
                                    </div>
                                )}
                            </label>
                        ))}
                    </div>
                </div>

            </div>

            {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                    <ShieldAlert size={18} />
                    <span className="text-xs font-black uppercase tracking-widest">{error}</span>
                </div>
            )}
        </form>
    );
}
