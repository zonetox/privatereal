import { createClient } from '@/lib/supabase/server';
import { redirect } from '@/navigation';
import { notFound } from 'next/navigation';
import { Link } from '@/navigation';
import {
  Settings2,
  Eye,
  EyeOff,
  Plus,
  Building2,
  CheckCircle2,
  Clock,
  Archive,
  BarChart2,
} from 'lucide-react';
import { togglePublishAction } from './actions';
import { createDraftProjectAction } from './new-project-action';

export const dynamic = 'force-dynamic';

interface ProjectsPageProps {
  params: { locale: string };
}

type Project = {
  id: string;
  name: string | null;
  location: string | null;
  developer: string | null;
  status: string | null;
  visible_to_clients: boolean;
  analyst_confidence_level: number | null;
  final_score: number | null;
  investment_grade: string | null;
  updated_at: string | null;
};

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  draft: {
    label: 'Draft',
    className: 'bg-slate-800 text-slate-400 border border-slate-700',
  },
  active: {
    label: 'Active',
    className: 'bg-emerald-950 text-emerald-400 border border-emerald-700/40',
  },
  archived: {
    label: 'Archived',
    className: 'bg-amber-950 text-amber-500 border border-amber-700/40',
  },
};

const GRADE_CONFIG: Record<string, string> = {
  A: 'text-emerald-400',
  B: 'text-sky-400',
  C: 'text-amber-400',
  D: 'text-rose-400',
};

function StatusBadge({ status }: { status: string | null }) {
  const cfg = STATUS_CONFIG[status ?? 'draft'] ?? STATUS_CONFIG.draft;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

function GradeBadge({ grade }: { grade: string | null }) {
  if (!grade) return <span className="text-slate-600 text-xs">—</span>;
  const colorClass = GRADE_CONFIG[grade] ?? 'text-slate-400';
  return (
    <span className={`text-base font-black ${colorClass}`}>{grade}</span>
  );
}

function VisibleBadge({ visible }: { visible: boolean }) {
  return visible ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-700/40">
      <CheckCircle2 size={10} /> Published
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-500 border border-slate-700">
      <Clock size={10} /> Hidden
    </span>
  );
}

export default async function ProjectsPage({ params }: ProjectsPageProps) {
  const { locale } = params;
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect({ href: '/login', locale });
    return null;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect({ href: '/dashboard', locale });
    return null;
  }

  const { data: projects, error } = await supabase
    .from('projects')
    .select('id, name, location, developer, status, visible_to_clients, analyst_confidence_level, final_score, investment_grade, updated_at')
    .order('created_at', { ascending: false })
    .returns<Project[]>();

  if (error) {
    console.error('Failed to fetch projects:', error);
  }

  const allProjects = projects ?? [];

  // Bind createDraftProjectAction with locale for the form
  const createProjectWithLocale = createDraftProjectAction.bind(null, locale);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-[0.2em] text-yellow-600/70 font-medium">
            Admin Control
          </p>
          <h1 className="text-3xl font-black tracking-tighter text-slate-100">
            Project{' '}
            <span className="bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
              Intelligence
            </span>
          </h1>
          <p className="text-sm text-slate-500">
            {allProjects.length} project{allProjects.length !== 1 ? 's' : ''} in system
          </p>
        </div>

        <form action={createProjectWithLocale}>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-yellow-700/15 border border-yellow-700/30 text-yellow-400 text-xs font-bold uppercase tracking-widest hover:bg-yellow-700/25 hover:border-yellow-600/50 transition-all duration-200"
          >
            <Plus size={14} />
            Create New Project
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm overflow-hidden">
        {allProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-600">
              <Building2 size={22} />
            </div>
            <p className="text-slate-400 font-semibold">No projects in system</p>
            <p className="text-slate-600 text-sm">Create a new project to begin the intelligence intake process.</p>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Project</th>
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Status</th>
                <th className="px-5 py-3 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Visibility</th>
                <th className="px-5 py-3 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Confidence</th>
                <th className="px-5 py-3 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Score</th>
                <th className="px-5 py-3 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Grade</th>
                <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {allProjects.map((project) => {
                const canPublish = project.status === 'active' && !project.visible_to_clients;
                const canUnpublish = project.visible_to_clients;
                const toggleWithId = togglePublishAction.bind(null, project.id, project.visible_to_clients);

                return (
                  <tr key={project.id} className="group hover:bg-slate-800/30 transition-all duration-150">
                    {/* Project Name & Location */}
                    <td className="px-5 py-4">
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold text-slate-100 group-hover:text-yellow-400 transition-colors">
                          {project.name ?? '—'}
                        </p>
                        <p className="text-xs text-slate-500 truncate max-w-[200px]">
                          {project.location ?? project.developer ?? '—'}
                        </p>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <StatusBadge status={project.status} />
                    </td>

                    {/* Visibility */}
                    <td className="px-5 py-4 text-center">
                      <VisibleBadge visible={project.visible_to_clients} />
                    </td>

                    {/* Confidence */}
                    <td className="px-5 py-4 text-center">
                      {project.analyst_confidence_level !== null ? (
                        <div className="inline-flex items-center gap-1.5">
                          <BarChart2 size={12} className="text-yellow-600/60" />
                          <span className="text-sm font-bold text-slate-300">
                            {project.analyst_confidence_level}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-600 text-xs">—</span>
                      )}
                    </td>

                    {/* Final Score */}
                    <td className="px-5 py-4 text-center">
                      <span className="text-sm font-bold text-slate-300">
                        {project.final_score !== null ? project.final_score.toFixed(1) : '—'}
                      </span>
                    </td>

                    {/* Investment Grade */}
                    <td className="px-5 py-4 text-center">
                      <GradeBadge grade={project.investment_grade} />
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {/* Publish / Unpublish toggle */}
                        {(canPublish || canUnpublish) && (
                          <form action={toggleWithId}>
                            <button
                              type="submit"
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 ${canUnpublish
                                  ? 'bg-rose-950 text-rose-400 border border-rose-800/50 hover:bg-rose-900/40'
                                  : 'bg-emerald-950 text-emerald-400 border border-emerald-800/50 hover:bg-emerald-900/40'
                                }`}
                            >
                              {canUnpublish ? (
                                <><EyeOff size={10} /> Unpublish</>
                              ) : (
                                <><Eye size={10} /> Publish</>
                              )}
                            </button>
                          </form>
                        )}

                        {/* Manage link */}
                        <Link
                          href={`/dashboard/projects/${project.id}/manage`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white transition-all duration-200"
                        >
                          <Settings2 size={10} />
                          Manage
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
