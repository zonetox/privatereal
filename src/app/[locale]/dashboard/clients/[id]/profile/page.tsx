import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import ClientProfileForm from '@/components/forms/ClientProfileForm';
import { ChevronRight, User } from 'lucide-react';
import Link from 'next/link';

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
    if (!user) redirect('/login');

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-full">
                    <User size={48} className="text-destructive" />
                </div>
                <h1 className="text-2xl font-bold">Access Restricted</h1>
                <p className="text-muted-foreground">This area is reserved for Private Real Estate Intelligence Admins only.</p>
            </div>
        );
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
        </div>
    );
}
