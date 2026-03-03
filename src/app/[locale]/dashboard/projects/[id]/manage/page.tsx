import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { redirect } from '@/navigation';
import { updateProjectAction } from './actions';

interface ManageProjectPageProps {
    params: { locale: string; id: string };
}

// Reusable form field components (server-safe)
function FormField({ label, name, defaultValue, type = 'text', readOnly = false }: {
    label: string;
    name: string;
    defaultValue?: string | number | null;
    type?: string;
    readOnly?: boolean;
}) {
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest text-slate-500 font-medium">
                {label}
            </label>
            <input
                type={type}
                name={name}
                defaultValue={defaultValue ?? ''}
                readOnly={readOnly}
                className={`w-full bg-slate-800/60 border rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-yellow-700/50 transition-all ${readOnly
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
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-yellow-600/70 font-medium">
                        Admin — Project Control
                    </p>
                    <h1 className="text-3xl font-black tracking-tighter text-slate-100">
                        {project.name}
                    </h1>
                    <p className="text-slate-500 text-sm">{project.location}</p>
                </div>

                <div className="mb-1">
                    {isValid ? (
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Ready for Publication
                        </div>
                    ) : (
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-bold uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Draft – Incomplete
                        </div>
                    )}
                </div>
            </div>

            <form action={handleUpdate} className="space-y-8">
                {/* Section 1 – Project Identity */}
                <div className="rounded-2xl border border-slate-700/40 bg-slate-900/60 backdrop-blur-sm p-6 space-y-5">
                    <SectionHeader title="Project Identity" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <FormField label="Name" name="name" defaultValue={project.name} />
                        <FormField label="Location" name="location" defaultValue={project.location} />
                        <FormField label="Developer" name="developer" defaultValue={project.developer} />
                        <FormField label="Launch Year" name="launch_year" type="number" defaultValue={project.launch_year} />
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase tracking-widest text-slate-500 font-medium">
                                Property Type
                            </label>
                            <select
                                name="property_type"
                                defaultValue={project.property_type ?? ''}
                                className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-yellow-700/50 hover:border-slate-600 transition-all"
                            >
                                <option value="">— Select —</option>
                                <option value="apartment">Apartment</option>
                                <option value="villa">Villa</option>
                                <option value="townhouse">Townhouse</option>
                                <option value="land">Land</option>
                                <option value="mixed_use">Mixed Use</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase tracking-widest text-slate-500 font-medium">
                                Target Segment
                            </label>
                            <select
                                name="target_segment"
                                defaultValue={project.target_segment ?? ''}
                                className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-yellow-700/50 hover:border-slate-600 transition-all"
                            >
                                <option value="">— Select —</option>
                                <option value="mass">Mass</option>
                                <option value="mid">Mid</option>
                                <option value="high_end">High End</option>
                                <option value="luxury">Luxury</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Section 2 – Intelligence Metrics */}
                <div className="rounded-2xl border border-slate-700/40 bg-slate-900/60 backdrop-blur-sm p-6 space-y-5">
                    <SectionHeader title="Intelligence Metrics" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                        <FormField label="Legal Score (0–100)" name="legal_score" type="number" defaultValue={project.legal_score} />
                        <FormField label="Location Score (0–100)" name="location_score" type="number" defaultValue={project.location_score} />
                        <FormField label="Infrastructure Score (0–100)" name="infrastructure_score" type="number" defaultValue={project.infrastructure_score} />
                        <FormField label="Liquidity Score (0–100)" name="liquidity_score" type="number" defaultValue={project.liquidity_score} />
                        <FormField label="Growth Score (0–100)" name="growth_score" type="number" defaultValue={project.growth_score} />
                        <FormField label="Risk Score (0–100)" name="risk_score" type="number" defaultValue={project.risk_score} />
                    </div>
                    {/* Read-only computed outputs */}
                    <div className="grid grid-cols-2 gap-5 pt-2 border-t border-slate-800">
                        <FormField label="Final Score (computed)" name="final_score" defaultValue={project.final_score} readOnly />
                        <FormField label="Investment Grade (computed)" name="investment_grade" defaultValue={project.investment_grade} readOnly />
                    </div>
                </div>

                {/* Section 3 – Governance */}
                <div className="rounded-2xl border border-slate-700/40 bg-slate-900/60 backdrop-blur-sm p-6 space-y-5">
                    <SectionHeader title="Governance" />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase tracking-widest text-slate-500 font-medium">
                                Status
                            </label>
                            <select
                                name="status"
                                defaultValue={project.status ?? 'draft'}
                                className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-yellow-700/50 hover:border-slate-600 transition-all"
                            >
                                <option value="draft">Draft</option>
                                <option value="active">Active</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase tracking-widest text-slate-500 font-medium">
                                Visible to Clients
                            </label>
                            <select
                                name="visible_to_clients"
                                defaultValue={project.visible_to_clients ? 'true' : 'false'}
                                className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-yellow-700/50 hover:border-slate-600 transition-all"
                            >
                                <option value="false">Hidden</option>
                                <option value="true">Published</option>
                            </select>
                        </div>
                        <FormField
                            label="Analyst Confidence (0–100)"
                            name="analyst_confidence_level"
                            type="number"
                            defaultValue={project.analyst_confidence_level}
                        />
                    </div>
                </div>

                {/* Section 4 – Notes */}
                <div className="rounded-2xl border border-slate-700/40 bg-slate-900/60 backdrop-blur-sm p-6 space-y-5">
                    <SectionHeader title="Internal Notes" />
                    <div className="grid grid-cols-1 gap-5">
                        <FormTextarea label="Evaluation Notes" name="evaluation_notes" defaultValue={project.evaluation_notes} />
                        <FormTextarea label="Legal Notes" name="legal_notes" defaultValue={project.legal_notes} />
                        <FormTextarea label="Risk Notes" name="risk_notes" defaultValue={project.risk_notes} />
                    </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="px-8 py-2.5 rounded-xl bg-yellow-700/20 border border-yellow-700/40 text-yellow-400 text-sm font-semibold tracking-wider uppercase hover:bg-yellow-700/30 hover:border-yellow-600/60 transition-all duration-200"
                    >
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
}
