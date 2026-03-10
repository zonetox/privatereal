'use client';

import { useState } from 'react';
import { ChevronRight, ChevronLeft, Save, BadgeCheck, MapPin, BarChart3, ShieldAlert, BookOpen } from 'lucide-react';
import { updateProjectAction } from '@/app/[locale]/dashboard/projects/[id]/manage/actions';
import { useRouter } from '@/navigation';

interface ProjectIntakeFormProps {
    project: any;
    locale: string;
}

export default function ProjectIntakeForm({ project, locale }: ProjectIntakeFormProps) {
    const [step, setStep] = useState(1);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const router = useRouter();

    const sections = [
        { id: 1, title: 'Project Identity', icon: <BadgeCheck size={18} /> },
        { id: 2, title: 'Location & Area', icon: <MapPin size={18} /> },
        { id: 3, title: 'Market Context', icon: <BarChart3 size={18} /> },
        { id: 4, title: 'Risk & Considerations', icon: <ShieldAlert size={18} /> },
        { id: 5, title: 'Advisor Notes', icon: <BookOpen size={18} /> },
    ];

    async function handleSubmit(formData: FormData) {
        setIsSaving(true);
        setMessage(null);
        try {
            const result = await updateProjectAction(project.id, formData);
            if (result?.success) {
                setMessage({ type: 'success', text: 'Intelligence data committed successfully.' });
                router.refresh();
            } else {
                setMessage({ type: 'error', text: result?.error || 'Failed to update project.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'An unexpected error occurred.' });
        } finally {
            setIsSaving(false);
        }
    }

    const nextStep = () => setStep(s => Math.min(s + 1, 5));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    return (
        <div className="space-y-8">
            {/* Step Navigation */}
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-4 no-scrollbar">
                {sections.map((s) => (
                    <button
                        key={s.id}
                        onClick={() => setStep(s.id)}
                        className={`flex-1 min-w-[140px] flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                            step === s.id 
                            ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500' 
                            : 'bg-slate-900/40 border-white/5 text-slate-500 hover:bg-slate-800/40'
                        }`}
                    >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${step === s.id ? 'bg-yellow-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                            {s.icon}
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] uppercase tracking-widest font-bold opacity-60">Step 0{s.id}</p>
                            <p className="text-xs font-bold whitespace-nowrap">{s.title}</p>
                        </div>
                    </button>
                ))}
            </div>

            {message && (
                <div className={`p-4 rounded-xl text-xs font-bold uppercase tracking-widest border animate-in fade-in slide-in-from-top-2 ${
                    message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                }`}>
                    {message.text}
                </div>
            )}

            <form action={handleSubmit} className="space-y-8 pb-24">
                {/* STEP 1 — IDENTITY */}
                {step === 1 && (
                    <div className="glass p-8 rounded-3xl border border-white/5 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="border-b border-white/5 pb-4">
                            <h2 className="text-xl font-bold text-slate-200">Step 1 — Project Identity & DNS</h2>
                            <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">Basic project classification and governance</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <FormLabel label="Project Name" />
                                <input name="name" defaultValue={project.name} className="form-input" placeholder="e.g., Grand Marina Saigon" />
                            </div>
                            <div>
                                <FormLabel label="Developer" />
                                <input name="developer" defaultValue={project.developer} className="form-input" />
                            </div>
                            <div>
                                <FormLabel label="Category" />
                                <select name="property_type" defaultValue={project.property_type || ''} className="form-input">
                                    <option value="apartment">Luxury Apartment</option>
                                    <option value="mid_apartment">Mid Apartment</option>
                                    <option value="townhouse">Townhouse</option>
                                    <option value="villa">Villa</option>
                                    <option value="resort">Resort</option>
                                    <option value="land">Land</option>
                                    <option value="mixed_use">Mixed Use</option>
                                </select>
                            </div>
                            <div>
                                <FormLabel label="Target Segment" />
                                <select name="target_segment" defaultValue={project.target_segment || ''} className="form-input">
                                    <option value="mass">Mass / Entry</option>
                                    <option value="mid">Mid-Market</option>
                                    <option value="high_end">High End</option>
                                    <option value="luxury">Ultra-Luxury</option>
                                </select>
                            </div>
                            <div>
                                <FormLabel label="Launch/Completion Year" />
                                <input name="launch_year" type="number" defaultValue={project.launch_year} className="form-input" />
                            </div>
                            <div>
                                <FormLabel label="System Status" />
                                <select name="status" defaultValue={project.status || 'draft'} className="form-input">
                                    <option value="draft">Draft</option>
                                    <option value="active">Active</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>
                            <div>
                                <FormLabel label="Portal Visibility" />
                                <select name="visible_to_clients" defaultValue={project.visible_to_clients ? 'true' : 'false'} className="form-input">
                                    <option value="false">Hidden</option>
                                    <option value="true">Visible to Clients</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2 — LOCATION */}
                {step === 2 && (
                    <div className="glass p-8 rounded-3xl border border-white/5 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="border-b border-white/5 pb-4">
                            <h2 className="text-xl font-bold text-slate-200">Step 2 — Location & Area Highlights</h2>
                            <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">Geographic strategic analysis</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <FormLabel label="Primary Location Address" />
                                <input name="location" defaultValue={project.location} className="form-input" />
                            </div>
                            <div>
                                <FormLabel label="Distance to CBD (km)" />
                                <input name="distance_to_cbd" type="number" step="0.1" defaultValue={project.distance_to_cbd} className="form-input" />
                            </div>
                            <div>
                                <FormLabel label="Infrastructure Pipeline Score (0-100)" />
                                <input name="infrastructure_score" type="number" defaultValue={project.infrastructure_score} className="form-input" />
                            </div>
                            <div className="md:col-span-2">
                                <FormLabel label="Area Development Highlights" />
                                <textarea name="market_trend_notes" defaultValue={project.market_trend_notes} rows={4} className="form-input" placeholder="Nearby infrastructure, transport access, amenities..." />
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 3 — MARKET */}
                {step === 3 && (
                    <div className="glass p-8 rounded-3xl border border-white/5 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="border-b border-white/5 pb-4">
                            <h2 className="text-xl font-bold text-slate-200">Step 3 — Market Context</h2>
                            <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">Comparative value and performance markers</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <FormLabel label="Price per m² (Avg)" />
                                <input name="price_per_m2" type="number" defaultValue={project.price_per_m2} className="form-input" />
                            </div>
                            <div>
                                <FormLabel label="Avg Rental Yield (%)" />
                                <input name="avg_rental_yield" type="number" step="0.1" defaultValue={project.avg_rental_yield} className="form-input" />
                            </div>
                            <div>
                                <FormLabel label="Expected Capital Growth (% p.a.)" />
                                <input name="expected_growth_rate" type="number" step="0.1" defaultValue={project.expected_growth_rate} className="form-input" />
                            </div>
                            <div>
                                <FormLabel label="Rec. Holding Period (Years)" />
                                <input name="holding_period_recommendation" type="number" defaultValue={project.holding_period_recommendation} className="form-input" />
                            </div>
                            <div>
                                <FormLabel label="Rental Demand Level" />
                                <select name="rental_demand" defaultValue={project.rental_demand || 'medium'} className="form-input">
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                            <div>
                                <FormLabel label="Supply Level in Area" />
                                <select name="supply_level" defaultValue={project.supply_level || 'medium'} className="form-input">
                                    <option value="low">Balanced / Low</option>
                                    <option value="medium">Moderate</option>
                                    <option value="high">Oversupply Risk</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 4 — RISK */}
                {step === 4 && (
                    <div className="glass p-8 rounded-3xl border border-white/5 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="border-b border-white/5 pb-4">
                            <h2 className="text-xl font-bold text-slate-200">Step 4 — Risk & Considerations</h2>
                            <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">Transparency and critical evaluative notes</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <FormLabel label="Legal Framework Score (0-100)" />
                                <input name="legal_score" type="number" defaultValue={project.legal_score} className="form-input" />
                            </div>
                            <div>
                                <FormLabel label="Overall Risk Index (0-100)" />
                                <input name="risk_score" type="number" defaultValue={project.risk_score} className="form-input" />
                            </div>
                            <div className="md:col-span-2">
                                <FormLabel label="Construction & Legal Status" />
                                <input name="construction_status" defaultValue={project.construction_status} className="form-input" placeholder="Permit status, construction floor level..." />
                            </div>
                            <div className="md:col-span-2">
                                <FormLabel label="Market Risks & Other Considerations" />
                                <textarea name="key_concerns" defaultValue={project.key_concerns} rows={4} className="form-input" placeholder="Specify supply risks, interest rate impact, or developer history..." />
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 5 — ADVISORY */}
                {step === 5 && (
                    <div className="glass p-8 rounded-3xl border border-yellow-500/10 border-yellow-500/20 bg-yellow-500/5 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="border-b border-yellow-500/10 pb-4">
                            <h2 className="text-xl font-bold text-yellow-500">Step 5 — Broker Advisory Thesis</h2>
                            <p className="text-xs text-yellow-600/70 mt-1 uppercase tracking-widest">The Expert Alpha — Insights not found in brochures</p>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <FormLabel label="Strategic Buyer Suitability (Who is this for?)" />
                                <textarea name="buyer_suitability" defaultValue={project.buyer_suitability} rows={3} className="form-input !bg-slate-900" />
                            </div>
                            <div>
                                <FormLabel label="Who this project does NOT suit?" />
                                <textarea name="not_suitable_for" defaultValue={project.not_suitable_for} rows={2} className="form-input !bg-slate-900" />
                            </div>
                            <div>
                                <FormLabel label="Potential Advantages (Key Highlights)" />
                                <textarea name="key_advantages" defaultValue={project.key_advantages} rows={3} className="form-input !bg-slate-900" />
                            </div>
                            <div>
                                <FormLabel label="Analyst Confidence Level (0-100)" />
                                <input name="analyst_confidence_level" type="number" defaultValue={project.analyst_confidence_level} className="form-input !bg-slate-900" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="fixed bottom-0 left-0 right-0 p-6 bg-slate-950/80 backdrop-blur-xl border-t border-white/5 z-50">
                    <div className="max-w-5xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={prevStep}
                                disabled={step === 1}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 border border-white/10 text-slate-300 text-xs font-bold uppercase tracking-widest hover:bg-slate-800 disabled:opacity-30 transition-all"
                            >
                                <ChevronLeft size={16} /> Back
                            </button>
                            <button
                                type="button"
                                onClick={nextStep}
                                disabled={step === 5}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 border border-white/10 text-slate-300 text-xs font-bold uppercase tracking-widest hover:bg-slate-800 disabled:opacity-30 transition-all"
                            >
                                Next <ChevronRight size={16} />
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex items-center gap-2 px-10 py-3 rounded-xl bg-yellow-500 text-slate-950 text-xs font-black uppercase tracking-[0.2em] hover:bg-yellow-400 hover:scale-[1.05] active:scale-95 disabled:opacity-50 transition-all shadow-xl shadow-yellow-500/20"
                        >
                            {isSaving ? 'Committing...' : <><Save size={16} /> Commit Intelligence Hub</>}
                        </button>
                    </div>
                </div>
            </form>

            <style jsx>{`
                .form-input {
                    display: block;
                    width: 100%;
                    background-color: rgba(15, 23, 42, 0.4);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 0.75rem;
                    padding: 0.75rem 1rem;
                    font-size: 0.875rem;
                    color: #f1f5f9;
                    transition: all 0.2s;
                }
                .form-input:focus {
                    outline: none;
                    border-color: rgba(234, 179, 8, 0.3);
                    background-color: rgba(15, 23, 42, 0.6);
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}

function FormLabel({ label }: { label: string }) {
    return (
        <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">
            {label}
        </label>
    );
}
