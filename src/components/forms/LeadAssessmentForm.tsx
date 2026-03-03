'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { submitLeadAction, LeadSubmissionData } from '@/app/actions/leads';
import { CapitalRange, CashflowRange, Occupation, Objective } from '@/lib/scoring';
import { getTrackingDetails } from '@/lib/tracking';
import { useRouter } from '@/navigation';

const STEPS = 5;

export default function LeadAssessmentForm() {
    const t = useTranslations('LeadForm');
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [honeypot, setHoneypot] = useState('');

    const [formData, setFormData] = useState({
        capital: '' as CapitalRange,
        cashflow: '' as CashflowRange,
        occupation: '' as Occupation,
        objective: '' as Objective,
        fullName: '',
        email: '',
        phone: '',
    });

    const updateField = (field: keyof typeof formData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const nextStep = () => setStep((s) => Math.min(s + 1, STEPS));
    const prevStep = () => setStep((s) => Math.max(s - 1, 1));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (step < STEPS) {
            nextStep();
            return;
        }

        setIsSubmitting(true);

        const tracking = getTrackingDetails() as LeadSubmissionData['tracking'];

        if (formData.capital && formData.cashflow && formData.occupation && formData.objective) {
            const submissionData: LeadSubmissionData = {
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                capital: formData.capital,
                cashflow: formData.cashflow,
                occupation: formData.occupation,
                objective: formData.objective,
                tracking,
                honeypot
            };

            const result = await submitLeadAction(submissionData);

            setIsSubmitting(false);

            if (result.success) {
                if (result.isQualified) {
                    router.push(`/consultation/qualified?id=${result.lead!.id}`);
                } else {
                    setIsSuccess(true);
                }
            } else {
                alert(result.error || 'Submission failed');
            }
        } else {
            setIsSubmitting(false);
            alert('Please complete all steps');
        }
    };

    if (isSuccess) {
        return (
            <div className="glass p-12 text-center space-y-6 max-w-2xl mx-auto rounded-2xl animate-in fade-in zoom-in duration-500">
                <div className="flex justify-center">
                    <CheckCircle2 className="text-primary w-20 h-20" />
                </div>
                <h2 className="text-3xl font-bold gold-text-gradient">{t('success')}</h2>
                <p className="text-slate-400 text-lg">{t('success_msg')}</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-12">
                <div className="flex justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-primary">
                        Step {step} of {STEPS}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                        {Math.round((step / STEPS) * 100)}% Complete
                    </span>
                </div>
                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-500 ease-out"
                        style={{ width: `${(step / STEPS) * 100}%` }}
                    />
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                {/* Honeypot */}
                <input
                    type="text"
                    name="website"
                    className="sr-only"
                    tabIndex={-1}
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                />

                {step === 1 && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-white mb-8">{t('step1')}</h2>
                        <div className="grid gap-4">
                            {['capital_1_3', 'capital_3_5', 'capital_5_10', 'capital_10_20', 'capital_20plus'].map((val) => (
                                <label
                                    key={val}
                                    className={`flex items-center p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${formData.capital === val
                                        ? 'border-primary bg-primary/10 shadow-lg shadow-primary/5'
                                        : 'border-slate-800 hover:border-slate-700 bg-slate-900/50'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="capital"
                                        value={val}
                                        required
                                        checked={formData.capital === val}
                                        onChange={(e) => updateField('capital', e.target.value)}
                                        className="sr-only"
                                    />
                                    <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${formData.capital === val ? 'border-primary' : 'border-slate-600'}`}>
                                        {formData.capital === val && <div className="w-2 h-2 rounded-full bg-primary" />}
                                    </div>
                                    <span className="text-lg font-medium">{t(val)}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-white mb-8">{t('step2')}</h2>
                        <div className="grid gap-4">
                            {['cashflow_lt100', 'cashflow_100_300', 'cashflow_300_1b', 'cashflow_gt1b'].map((val) => (
                                <label
                                    key={val}
                                    className={`flex items-center p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${formData.cashflow === val
                                        ? 'border-primary bg-primary/10'
                                        : 'border-slate-800 hover:border-slate-700 bg-slate-900/50'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="cashflow"
                                        value={val}
                                        required
                                        checked={formData.cashflow === val}
                                        onChange={(e) => updateField('cashflow', e.target.value)}
                                        className="sr-only"
                                    />
                                    <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${formData.cashflow === val ? 'border-primary' : 'border-slate-600'}`}>
                                        {formData.cashflow === val && <div className="w-2 h-2 rounded-full bg-primary" />}
                                    </div>
                                    <span className="text-lg font-medium">{t(val)}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-white mb-8">{t('step3')}</h2>
                        <div className="grid gap-4">
                            {['owner', 'executive', 'investor', 'other'].map((val) => (
                                <label
                                    key={val}
                                    className={`flex items-center p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${formData.occupation === val
                                        ? 'border-primary bg-primary/10'
                                        : 'border-slate-800 hover:border-slate-700 bg-slate-900/50'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="occupation"
                                        value={val}
                                        required
                                        checked={formData.occupation === val}
                                        onChange={(e) => updateField('occupation', e.target.value)}
                                        className="sr-only"
                                    />
                                    <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${formData.occupation === val ? 'border-primary' : 'border-slate-600'}`}>
                                        {formData.occupation === val && <div className="w-2 h-2 rounded-full bg-primary" />}
                                    </div>
                                    <span className="text-lg font-medium">{t(val)}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-white mb-8">{t('step4')}</h2>
                        <div className="grid gap-4">
                            {['preserve', 'diversify', 'income', 'growth'].map((val) => (
                                <label
                                    key={val}
                                    className={`flex items-center p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${formData.objective === val
                                        ? 'border-primary bg-primary/10'
                                        : 'border-slate-800 hover:border-slate-700 bg-slate-900/50'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="objective"
                                        value={val}
                                        required
                                        checked={formData.objective === val}
                                        onChange={(e) => updateField('objective', e.target.value)}
                                        className="sr-only"
                                    />
                                    <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${formData.objective === val ? 'border-primary' : 'border-slate-600'}`}>
                                        {formData.objective === val && <div className="w-2 h-2 rounded-full bg-primary" />}
                                    </div>
                                    <span className="text-lg font-medium">{t(val)}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {step === 5 && (
                    <div className="space-y-8">
                        <h2 className="text-2xl font-bold text-white mb-8">{t('step5')}</h2>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">{t('fullName')}</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="John Doe"
                                    value={formData.fullName}
                                    onChange={(e) => updateField('fullName', e.target.value)}
                                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl p-4 focus:border-primary outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">{t('email')}</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="john@example.com"
                                    value={formData.email}
                                    onChange={(e) => updateField('email', e.target.value)}
                                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl p-4 focus:border-primary outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">{t('phone')}</label>
                                <input
                                    type="tel"
                                    required
                                    placeholder="+84 900 000 000"
                                    value={formData.phone}
                                    onChange={(e) => updateField('phone', e.target.value)}
                                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl p-4 focus:border-primary outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex gap-4 pt-8">
                    {step > 1 && (
                        <button
                            type="button"
                            onClick={prevStep}
                            className="px-8 py-4 rounded-xl border border-slate-700 hover:bg-slate-800 transition-colors flex items-center gap-2"
                        >
                            <ChevronLeft size={20} />
                            {t('prev')}
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-primary text-primary-foreground font-bold py-4 rounded-xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                    >
                        {isSubmitting ? '...' : (step === STEPS ? t('submit') : t('next'))}
                        {step < STEPS && <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                    </button>
                </div>
            </form>
        </div>
    );
}
