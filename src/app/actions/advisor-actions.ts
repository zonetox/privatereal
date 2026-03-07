'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

interface AdvisorNoteData {
    client_id: string;
    note_type: 'meeting' | 'strategy' | 'risk_alert' | 'general';
    content: string;
    action_items?: string[];
}

export async function addAdvisorClientNoteAction(data: AdvisorNoteData) {
    const supabase = createClient();

    // 1. Admin Verification & Get Advisor ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        return { success: false, error: 'Unauthorized. Admin access only.' };
    }

    // 2. Validate Input
    if (!data.client_id || !data.content || !data.note_type) {
        return { success: false, error: 'Missing required note fields.' };
    }

    // 3. Insert Note
    const { data: newNote, error } = await supabase
        .from('advisor_client_notes')
        .insert({
            client_id: data.client_id,
            advisor_id: user.id, // The current admin is the advisor
            note_type: data.note_type,
            content: data.content,
            action_items: data.action_items || []
        })
        .select()
        .single();

    if (error) {
        console.error('Add advisor note failed:', error);
        return { success: false, error: error.message };
    }

    revalidatePath(`/dashboard/clients/${data.client_id}/profile`);
    revalidatePath(`/dashboard/advisor`);

    return {
        success: true,
        note: newNote
    };
}
