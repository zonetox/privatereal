'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function togglePublishAction(projectId: string, currentVisibility: boolean) {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Unauthenticated' };

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        return { success: false, error: 'Access denied' };
    }

    const newVisibility = !currentVisibility;

    const { error } = await supabase
        .from('projects')
        .update({ visible_to_clients: newVisibility })
        .eq('id', projectId);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/[locale]/dashboard/projects', 'page');
    revalidatePath('/[locale]/dashboard/recommendations', 'page');

    return { success: true, newVisibility };
}
