import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';

/**
 * Cached version of fetching the current client record.
 * This ensures that multiple components in the same request tree
 * sharing the same client data won't trigger redundant DB calls.
 */
export const getCachedClient = cache(async () => {
    const supabase = createClient();
    
    // 1. Get Auth User
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // 2. Get Profile & Client record
    const { data: client } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .single();
    
    return client;
});

/**
 * Cached version of fetching the user profile role
 */
export const getCachedProfile = cache(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
    
    return profile;
});
