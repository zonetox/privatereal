import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { redirect, Link } from '@/navigation';
import ClientProfileForm from '@/components/forms/ClientProfileForm';
import ClientNotesTimeline from '@/components/advisory/ClientNotesTimeline';
import { ChevronRight, User } from 'lucide-react';

interface ClientProfilePageProps {
    params: {
        id: string;
        locale: string;
    };
}

export default async function ClientProfilePage({ params }: ClientProfilePageProps) {
    const supabase = createClient();

    // 1. Admin Verification (SSR)
    const { data: { user } } = await supabase.auth.getUser();
    const { locale } = params;

    if (!user) redirect({ href: '/login', locale });
    if (!user) return null;

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        redirect({ href: '/dashboard', locale });
    }

    // 2. Fetch Client Data
    const { data: client, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', params.id)
        .single();

    if (error || !client) {
        notFound();
    }

    // 3. Fetch Advisor Notes
    const { data: initialNotes } = await supabase
        .from('advisor_client_notes')
        .select('*')
        .eq('client_id', params.id)
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/dashboard/clients" className="hover:text-primary transition-colors">Clients</Link>
                <ChevronRight size={14} />
                <span className="text-foreground font-medium">{client.full_name}</span>
                <ChevronRight size={14} />
                <span className="text-primary font-semibold">Intelligence Profile</span>
            </nav>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black tracking-tighter">
                        Client Intelligence <span className="gold-text-gradient">Profiling</span>
                    </h1>
                    <p className="text-slate-400 max-w-2xl">
                        Strategic assessment and risk parameters for <strong className="text-white">{client.full_name}</strong>.
                        Data entered here fuels the portfolio allocation engine.
                    </p>
                </div>
            </div>

            <ClientProfileForm clientId={client.id} initialData={client} />

            <div className="pt-8 border-t border-white/10 mt-8">
                <ClientNotesTimeline clientId={client.id} initialNotes={initialNotes || []} />
            </div>
        </div>
    );
}
