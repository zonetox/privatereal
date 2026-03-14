import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { redirect, Link } from '@/navigation';
import ClientProfileForm from '@/components/forms/ClientProfileForm';
import ClientNotesTimeline from '@/components/projects/ClientNotesTimeline';
import { ChevronRight, User } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

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

    // 2. Fetch Client Data (Aggregated from Domain Tables)
    const { data: clientBase, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', params.id)
        .single();

    if (error || !clientBase) {
        notFound();
    }

    const { data: financials } = await supabase.from('client_financials').select('*').eq('client_id', params.id).single();
    const { data: preferences } = await supabase.from('client_preferences').select('*').eq('client_id', params.id).single();
    const { data: priorities } = await supabase.from('client_priorities').select('*').eq('client_id', params.id).single();

    // Reconstruct full client object for the form
    const client = {
        ...clientBase,
        ...financials,
        ...preferences,
        ...priorities
    };

    // 3. Fetch Advisor Notes
    const { data: initialNotes } = await supabase
        .from('advisor_client_notes')
        .select('*')
        .eq('client_id', params.id)
        .order('created_at', { ascending: false });

    // 3. i18n setup
    const t = await getTranslations('AdvisoryProfile');

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/dashboard/clients" className="hover:text-primary transition-colors">{t('breadcrumb_clients')}</Link>
                <ChevronRight size={14} />
                <span className="text-foreground font-medium">{client.full_name}</span>
                <ChevronRight size={14} />
                <span className="text-primary font-semibold">{t('breadcrumb_profile')}</span>
            </nav>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black tracking-tighter">
                        {t('title')} <span className="gold-text-gradient">{t('title_highlight')}</span>
                    </h1>
                    <p className="text-slate-400 max-w-2xl">
                        {t('description', { name: <strong className="text-white" key="name">{client.full_name}</strong> })}
                        <br />
                        {t('engine_note')}
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
