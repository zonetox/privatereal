'use server';

import { createClient } from '@/lib/supabase/server';
import { createCalendarEvent } from '@/lib/google-calendar';
import { revalidatePath } from 'next/cache';

export async function submitBookingAction(data: {
    leadId: string;
    leadEmail: string;
    scheduledAt: string;
}) {
    const supabase = createClient();

    // 1. Create Google Calendar Event
    const startTime = new Date(data.scheduledAt);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour duration

    const googleEventId = await createCalendarEvent({
        summary: `PREIO Strategic Assessment - ${data.leadEmail}`,
        description: `Private real estate investment assessment for lead ID: ${data.leadId}`,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        attendeeEmail: data.leadEmail,
    });

    // 2. Save to bookings table
    const { error } = await supabase
        .from('bookings')
        .insert([
            {
                lead_id: data.leadId,
                scheduled_at: data.scheduledAt,
                google_event_id: googleEventId,
            }
        ]);

    if (error) {
        console.error('Booking error:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/leads');
    return { success: true };
}
