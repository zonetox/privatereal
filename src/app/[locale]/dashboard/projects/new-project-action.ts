'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from '@/navigation';

export async function createDraftProjectAction(locale: string, formData: FormData) {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect({ href: '/login', locale });
        return;
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        redirect({ href: '/dashboard', locale });
        return;
    }

    const { data: newProject, error } = await supabase
        .from('projects')
        .insert({
            name: 'New Project (Draft)',
            status: 'draft',
            visible_to_clients: false,
        })
        .select('id')
        .single();

    if (error || !newProject) {
        throw new Error('Failed to create draft project: ' + error?.message);
    }

    redirect({ href: `/dashboard/projects/${newProject.id}/manage`, locale });
}
