'use server';

import { createClient } from '@/lib/supabase/server';

export type ActivityType = 
    | 'login' 
    | 'project_view' 
    | 'workspace_add' 
    | 'workspace_remove'
    | 'compare_projects' 
    | 'brief_generated'
    | 'search_performed'
    | 'visit_booked'
    | 'site_visit_done'
    | 'follow_up_call';

export async function logActivityAction(
    type: ActivityType, 
    entityId?: string, 
    note?: string,
    metadata: Record<string, any> = {}
) {
    const supabase = createClient();

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Unauthenticated' };

    // 2. Resolve client_id if not an admin
    // Admins don't usually need their activity logged in the client table, 
    // but if an admin is "impersonating" or navigating, we mainly care about CLIENT activity.
    const { data: client } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user.id)
        .single();

    if (!client) {
        // Not a client (e.g., an admin or a public user). We skip logging for non-clients.
        return { success: true, skipped: true };
    }

    // 3. Insert activity record
    const { error } = await supabase
        .from('activities')
        .insert({
            client_id: client.id,
            type,
            entity_id: entityId || null,
            note: note || null,
            metadata
        });

    if (error) {
        console.error(`[ActivityLogger] Failed to log ${type}:`, error);
        return { success: false, error: error.message };
    }

    return { success: true };
}
