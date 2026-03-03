'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function convertLeadToClientAction(leadId: string) {
    // 1. Verify Admin Permissions
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Unauthorized' };

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        return { success: false, error: 'Unauthorized. Admin only.' };
    }

    // 2. Fetch Lead Data
    const { data: lead, error: leadError } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single();

    if (leadError || !lead) {
        return { success: false, error: 'Lead not found' };
    }

    if (lead.status === 'converted') {
        return { success: false, error: 'Lead is already converted' };
    }

    const adminClient = createAdminClient();
    const tempPassword = `PREIO_${Math.random().toString(36).slice(-8)}!`;

    try {
        // 3. Create Auth User (Admin only via service role)
        const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
            email: lead.email,
            password: tempPassword,
            email_confirm: true,
            user_metadata: { full_name: lead.full_name }
        });

        if (authError) throw authError;

        const newUserId = authData.user.id;

        // 4. Update Profile (Role already handled by DB triggers if any, but let's be explicit)
        // Note: In our core schema, profiles are created automatically for auth.users via triggers usually,
        // but if not, we must insert it. Based on our 000001_core_schema.sql, we manually created tables.
        // Let's ensure the profile exists and has the correct role.
        const { error: profileError } = await adminClient
            .from('profiles')
            .upsert({
                id: newUserId,
                email: lead.email,
                role: 'client'
            });

        if (profileError) throw profileError;

        // 5. Create Client Record
        const { error: clientError } = await adminClient
            .from('clients')
            .insert({
                user_id: newUserId,
                full_name: lead.full_name,
                email: lead.email,
                phone: lead.phone,
                status: 'active'
            });

        if (clientError) throw clientError;

        // 6. Update Lead Status
        const { error: updateLeadError } = await adminClient
            .from('leads')
            .update({ status: 'converted' })
            .eq('id', leadId);

        if (updateLeadError) throw updateLeadError;

        // 7. Mock Welcome Email (In a real app, integrate with Resend/SendGrid)
        console.log(`--- WELCOME EMAIL MOCK ---`);
        console.log(`To: ${lead.email}`);
        console.log(`Subject: Welcome to PREIO Elite Portfolio`);
        console.log(`Content: Your account has been created. Password: ${tempPassword}`);
        console.log(`--------------------------`);

        revalidatePath('/dashboard/leads');
        revalidatePath('/dashboard/clients');

        return {
            success: true,
            message: `Lead ${lead.full_name} converted successfully.`,
            tempPassword
        };

    } catch (err: unknown) {
        const error = err as Error;
        console.error('Conversion failed:', error);
        return { success: false, error: error.message || 'Conversion process failed' };
    }
}
