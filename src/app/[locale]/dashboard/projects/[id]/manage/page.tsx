import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { redirect } from '@/navigation';
import { updateProjectAction } from './actions';

interface ManageProjectPageProps {
    params: { locale: string; id: string };
}

// Reusable form field components (server-safe)
function FormField({
    label,
    name,
    defaultValue,
    type = 'text',
    readOnly = false,
    min,
    max,
    helperText
}: {
    label: string;
    name: string;
    defaultValue?: string | number | null;
    type?: string;
    readOnly?: boolean;
    min?: number;
    max?: number;
    helperText?: string;
}) {
    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
                <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                    {label}
                </label>
                {helperText && (
                    <span className="text-[9px] text-slate-400/60 italic font-medium">
                        {helperText}
                    </span>
                )}
            </div>
            <input
                type={type}
                name={name}
                defaultValue={defaultValue ?? ''}
                readOnly={readOnly}
                min={min}
                max={max}
                className={`w-full bg-slate-900/40 border rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-yellow-700/50 transition-all ${readOnly
                    ? 'border-slate-700/30 text-slate-500 cursor-not-allowed'
                    : 'border-slate-700/50 hover:border-slate-600'
                    }`}
            />
        </div>
    );
}

function FormTextarea({ label, name, defaultValue }: {
    label: string;
    name: string;
    defaultValue?: string | null;
}) {
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest text-slate-500 font-medium">
                {label}
            </label>
            <textarea
                name={name}
                defaultValue={defaultValue ?? ''}
                rows={4}
                className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-yellow-700/50 hover:border-slate-600 transition-all resize-none"
            />
        </div>
    );
}

function SectionHeader({ title }: { title: string }) {
    return (
        <div className="border-b border-slate-800 pb-3 mb-5">
            <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-semibold">
                {title}
            </p>
        </div>
    );
}

export const dynamic = 'force-dynamic';

export default async function ManageProjectPage({ params }: ManageProjectPageProps) {
    const { locale, id } = await Promise.resolve(params);
    const supabase = createClient();

    // 1. Auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect({ href: '/login', locale });
        return null;
    }

    // 2. Admin check
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        redirect({ href: '/dashboard', locale });
        return null;
    }

    // 3. Fetch project
    const { data: project, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !project) notFound();

    // 4. Check validation status
    const { data: isValid } = await supabase.rpc('validate_project_for_publish', {
        p_project_id: id
    });

    // Server Action bound to this project
    const handleUpdate = async (formData: FormData) => {
        await updateProjectAction(id, formData);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-10 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-white/5 pb-8">
                <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-yellow-600/80 font-bold">
                        Institutional Project Intake
                    </p>
                    <h1 className="text-4xl font-black tracking-tighter text-slate-100">
                        {project.name ?? 'New Intelligence Asset'}
                    </h1>
                    <div className="flex items-center gap-3 text-slate-500 text-sm">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            ID: {id.slice(0, 8)}...
                        </span>
                        <span>{project.location ?? 'Global Market'}</span>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                    {isValid ? (
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-[0.15em]">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Ready for Publication
                        </div>
                    ) : (
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-black uppercase tracking-[0.15em]">
                            <span className="w-2 h-2 rounded-full bg-rose-500" />
                            Draft – Incomplete
                        </div>
                    )}
                </div>
            </div>

            <form action={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-20">
                {/* SECTION 1 — Project Identity */}
                <div className="glass p-8 rounded-3xl border border-white/5 space-y-6 md:col-span-2">
                    <SectionHeader title="Section 1 — Project Identity & Governance" />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="sm:col-span-2">
                            <FormField label="Full Project Name" name="name" defaultValue={project.name} />
                        </div>
                        <FormField label="Developer / Sponsor" name="developer" defaultValue={project.developer} />
                        <FormField label="Primary Location" name="location" defaultValue={project.location} />
                        <FormField label="Launch Year" name="launch_year" type="number" defaultValue={project.launch_year} />
                        <FormField label="Price per m² (Current)" name="price_per_m2" type="number" defaultValue={project.price_per_m2} />

                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Property Type</label>
                            <select name="property_type" defaultValue={project.property_type ?? ''} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-slate-200">
                                <option value="">— Select —</option>
                                <option value="apartment">Apartment</option>
                                <option value="villa">Villa</option>
                                <option value="townhouse">Townhouse</option>
                                <option value="land">Land</option>
                                <option value="mixed_use">Mixed Use</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Target Segment</label>
                            <select name="target_segment" defaultValue={project.target_segment ?? ''} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-slate-200">
                                <option value="">— Select —</option>
                                <option value="mass">Mass / Entry</option>
                                <option value="mid">Mid-Market</option>
                                <option value="high_end">High End</option>
                                <option value="luxury">Ultra-Luxury</option>
                            </select>
                        </div>
                        <div className="space-y-1.5 pt-6 sm:col-span-3 border-t border-white/5" />

                        {/* Governance preserved */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">System Status</label>
                            <select name="status" defaultValue={project.status ?? 'draft'} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-slate-200">
                                <option value="draft">Draft</option>
                                <option value="active">Active</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Client Visibility</label>
                            <select name="visible_to_clients" defaultValue={project.visible_to_clients ? 'true' : 'false'} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-slate-200">
                                <option value="false">Hidden from Portal</option>
                                <option value="true">Visible to Clients</option>
                            </select>
                        </div>
                        <FormField
                            label="Analyst Confidence (0–100)"
                            name="analyst_confidence_level"
                            type="number"
                            min={0}
                            max={100}
                            defaultValue={project.analyst_confidence_level}
                            helperText="Confidence in internal data"
                        />
                    </div>
                </div>

                {/* SECTION 2 — Legal Foundation */}
                <div className="glass p-8 rounded-3xl border border-white/5 space-y-6">
                    <SectionHeader title="Section 2 — Legal Foundation" />
                    <FormField
                        label="Legal Framework Score (0–100)"
                        name="legal_score"
                        type="number"
                        min={0}
                        max={100}
                        defaultValue={project.legal_score}
                        helperText="0 = Unclear, 100 = Completed"
                    />
                    <FormTextarea label="Legal Analysis & Compliance Notes" name="legal_notes" defaultValue={project.legal_notes} />
                </div>

                {/* SECTION 3 — Location & Infrastructure */}
                <div className="glass p-8 rounded-3xl border border-white/5 space-y-6">
                    <SectionHeader title="Section 3 — Location & Infrastructure" />
                    <div className="grid grid-cols-2 gap-5">
                        <FormField
                            label="Location Score"
                            name="location_score"
                            type="number"
                            min={0}
                            max={100}
                            defaultValue={project.location_score}
                            helperText="Connectivity/Area"
                        />
                        <FormField
                            label="Infrastructure Score"
                            name="infrastructure_score"
                            type="number"
                            min={0}
                            max={100}
                            defaultValue={project.infrastructure_score}
                            helperText="Utilities/Roads"
                        />
                    </div>
                    <FormTextarea label="Asset Evaluation Summary" name="evaluation_notes" defaultValue={project.evaluation_notes} />
                </div>

                {/* SECTION 4 — Market Liquidity */}
                <div className="glass p-8 rounded-3xl border border-white/5 space-y-6">
                    <SectionHeader title="Section 4 — Market Liquidity" />
                    <div className="grid grid-cols-2 gap-5">
                        <FormField
                            label="Liquidity Score"
                            name="liquidity_score"
                            type="number"
                            min={0}
                            max={100}
                            defaultValue={project.liquidity_score}
                            helperText="Resale speed"
                        />
                        <FormField label="Avg. Rental Yield (%)" name="avg_rental_yield" type="number" defaultValue={project.avg_rental_yield} />
                    </div>
                </div>

                {/* SECTION 5 — Growth Potential */}
                <div className="glass p-8 rounded-3xl border border-white/5 space-y-6">
                    <SectionHeader title="Section 5 — Growth Potential" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <FormField
                            label="Growth Score"
                            name="growth_score"
                            type="number"
                            min={0}
                            max={100}
                            defaultValue={project.growth_score}
                            helperText="Appreciation potential"
                        />
                        <FormField label="Exp. Growth Rate (% p.a.)" name="expected_growth_rate" type="number" defaultValue={project.expected_growth_rate} />
                        <div className="sm:col-span-2">
                            <FormField label="Recommended Holding Period (Years)" name="holding_period_recommendation" type="number" defaultValue={project.holding_period_recommendation} />
                        </div>
                    </div>
                </div>

                {/* SECTION 6 — Risk Exposure */}
                <div className="glass p-8 rounded-3xl border border-white/5 space-y-6">
                    <SectionHeader title="Section 6 — Risk Exposure" />
                    <div className="grid grid-cols-2 gap-5">
                        <FormField
                            label="Risk Index (0–100)"
                            name="risk_score"
                            type="number"
                            min={0}
                            max={100}
                            defaultValue={project.risk_score}
                            helperText="0 = Low, 100 = High"
                        />
                        <FormField label="Downside Risk (%)" name="downside_risk_percent" type="number" defaultValue={project.downside_risk_percent} />
                    </div>
                    <FormTextarea label="Risk Mitigation Statement" name="risk_notes" defaultValue={project.risk_notes} />
                </div>

                {/* SECTION 7 — Advisory Output */}
                <div className="glass p-8 rounded-3xl border border-yellow-500/20 bg-yellow-500/5 space-y-6">
                    <SectionHeader title="Section 7 — Advisory Output (Read-only)" />
                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase tracking-widest text-yellow-600 font-bold">Computed Final Score</label>
                            <div className="text-3xl font-black text-slate-100 py-2 border-b border-white/10">{project.final_score ?? '—'}</div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase tracking-widest text-yellow-600 font-bold">Investment Grade</label>
                            <div className="text-3xl font-black text-slate-100 py-2 border-b border-white/10">{project.investment_grade ?? '—'}</div>
                        </div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5">
                        <p className="text-[10px] text-slate-500 leading-relaxed uppercase tracking-widest font-bold mb-2">System Intel</p>
                        <p className="text-xs text-slate-400 italic leading-relaxed">
                            Scores and Grade are automatically calculated by the Intelligence Engine based on the weighted metrics provided above.
                        </p>
                    </div>
                </div>

                {/* Submit */}
                <div className="md:col-span-2 flex justify-end pt-8">
                    <button
                        type="submit"
                        className="px-12 py-4 rounded-2xl bg-yellow-600 text-slate-950 text-sm font-black tracking-[0.2em] uppercase hover:bg-yellow-500 hover:scale-[1.02] transform transition-all duration-300 shadow-2xl shadow-yellow-600/20 active:scale-95"
                    >
                        Synchronize Asset Data
                    </button>
                </div>
            </form>
        </div>
    );
}
