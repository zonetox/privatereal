'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { logActivityAction } from './activity-logger';

export async function createClientBookingAction(data: {
    projectId: string;
    visitDate: string;
    visitTime: string;
    visitType: string;
    note?: string;
}) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Unauthorized' };
    }

    // Get client id mapped to this user
    const { data: clientRecord, error: clientErr } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user.id)
        .single();

    if (clientErr || !clientRecord) {
        return { success: false, error: 'Client profile not found' };
    }

    // Insert Booking
    const { error: insertError } = await supabase
        .from('bookings')
        .insert({
            client_id: clientRecord.id,
            project_id: data.projectId,
            visit_date: data.visitDate,
            visit_time: data.visitTime,
            type: data.visitType,
            note: data.note || null,
            status: 'Mới đặt lịch'
        });

    if (insertError) {
        console.error('Error creating booking:', insertError);
        return { success: false, error: insertError.message };
    }

    // Log Activity automatically (Automation requested)
    await logActivityAction('visit_booked', data.projectId, 'Client requested a project visit (Mới đặt lịch)');

    revalidatePath(`/dashboard/projects/${data.projectId}`);
    return { success: true };
}

export async function updateBookingStatusAction(bookingId: string, status: string, crmNotes?: string) {
    const supabase = createClient();
    
    // Auth Check for Admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Unauthorized' };
    
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
        
    if (profile?.role !== 'admin') {
        return { success: false, error: 'Permission denied' };
    }

    const payload: any = { status };
    if (crmNotes !== undefined) {
        payload.crm_notes = crmNotes;
    }

    const { error } = await supabase
        .from('bookings')
        .update(payload)
        .eq('id', bookingId);

    if (error) {
        return { success: false, error: error.message };
    }

    // Log Activity if status changes significantly
    if (status === 'Đã đi xem') {
        await logActivityAction('site_visit_done', bookingId, `Project visit marked as done for Booking ${bookingId}`);
    } else if (status === 'Đang theo dõi') {
         await logActivityAction('follow_up_call', bookingId, `Advisor is following up Booking ${bookingId}`);
    }

    revalidatePath('/dashboard/bookings');
    return { success: true };
}
