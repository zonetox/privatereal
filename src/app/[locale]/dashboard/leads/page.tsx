import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import {
  Mail,
  Phone,
  Trash2,
  Calendar
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import ConvertLeadButton from '@/components/dashboard/ConvertLeadButton';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LeadsPageProps {
  searchParams: { status?: string };
}

export const dynamic = 'force-dynamic';

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    // This is normally handled by the parent layout, but we'll be safe
    return null;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  const statusFilter = searchParams.status;

  let query = supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }

  const { data: leads, error } = await query;
  if (error) console.error('Error fetching leads:', error);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Elite Lead Engine</h1>
          <p className="text-muted-foreground mt-1">Manage and track your strategic leads and high-net-worth assessments.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="glass px-4 py-2 rounded-lg border border-border flex items-center gap-2">
            <span className="text-sm font-medium text-slate-400">Total Leads:</span>
            <span className="text-sm font-bold text-primary">{leads?.length || 0}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 bg-slate-900/50 p-1 rounded-lg border border-border">
          {['all', 'qualified', 'new', 'rejected'].map((s) => (
            <a
              key={s}
              href={`?status=${s}`}
              className={cn(
                "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                (statusFilter === s || (!statusFilter && s === 'all'))
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              <span className="capitalize">{s}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/50 border-b border-border">
              <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-500">Name / Contact</th>
              <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-500 text-center">Capital</th>
              <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-500 text-center">Score</th>
              <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-500 text-center">Status</th>
              <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-500">Date</th>
              <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-500 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {leads?.map((lead) => (
              <tr key={lead.id} className="hover:bg-white/5 transition-colors group">
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="font-semibold text-white group-hover:text-primary transition-colors">{lead.full_name}</span>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Mail size={12} /> {lead.email}</span>
                      <span className="flex items-center gap-1"><Phone size={12} /> {lead.phone}</span>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-center">
                  <span className="text-sm font-medium text-slate-300 uppercase tracking-tighter">
                    {lead.capital_range?.replace('capital_', '').replace('_', '-')}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-primary/20 bg-primary/5">
                    <span className="text-sm font-bold text-primary">{lead.lead_score}</span>
                  </div>
                </td>
                <td className="p-4 text-center">
                  <span className={cn(
                    "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                    lead.status === 'qualified' && "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
                    lead.status === 'new' && "bg-blue-500/10 text-blue-500 border border-blue-500/20",
                    lead.status === 'rejected' && "bg-rose-500/10 text-rose-500 border border-rose-500/20",
                    lead.status === 'converted' && "bg-purple-500/10 text-purple-500 border border-purple-500/20"
                  )}>
                    {lead.status}
                  </span>
                </td>
                <td className="p-4">
                  <span className="text-sm text-slate-400">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {lead.status !== 'converted' && (
                      <ConvertLeadButton
                        leadId={lead.id}
                        leadName={lead.full_name}
                      />
                    )}
                    <button className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                      <Calendar size={16} />
                    </button>
                    <button className="p-2 hover:bg-rose-500/10 rounded-lg text-slate-400 hover:text-rose-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {(!leads || leads.length === 0) && (
              <tr>
                <td colSpan={6} className="p-12 text-center text-slate-500 italic">
                  No leads found. Strategic assessments will appear here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
