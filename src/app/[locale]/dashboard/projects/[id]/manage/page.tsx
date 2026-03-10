import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { redirect } from '@/navigation';
import ProjectIntakeForm from '@/components/projects/ProjectIntakeForm';
import { ChevronRight } from 'lucide-react';

interface ManageProjectPageProps {
    params: { locale: string; id: string };
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

    return (
        <div className="max-w-6xl mx-auto py-8 px-4 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Breadcrumb & Navigation */}
            <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                <span className="opacity-60">Dashboard</span>
                <ChevronRight size={14} />
                <span className="opacity-60">Advisory Hub</span>
                <ChevronRight size={14} />
                <span className="text-yellow-500">Expert Intake</span>
            </nav>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-white/5 pb-8">
                <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-yellow-600/80 font-bold">
                        Institutional Project Intake
                    </p>
                    <h1 className="text-4xl font-black tracking-tighter text-slate-100">
                        {project.name ?? 'New Advisory Property'}
                    </h1>
                    <div className="flex items-center gap-3 text-slate-500 text-sm">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            ID: {id.slice(0, 8)}...
                        </span>
                        <span>{project.location ?? 'Global Market'}</span>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-3 text-right">
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Curation Status</p>
                    {isValid ? (
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-[0.15em]">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Ready for Publication
                        </div>
                    ) : (
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-black uppercase tracking-[0.15em]">
                            <span className="w-2 h-2 rounded-full bg-rose-500" />
                            Draft – Incomplete Profile
                        </div>
                    )}
                </div>
            </div>

            {/* Step-based Form Engine */}
            <ProjectIntakeForm project={project} locale={locale} />
        </div>
    );
}
