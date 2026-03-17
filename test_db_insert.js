const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const adminAuthClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function testInsert() {
    // We will use a dummy UUID to test insertion
    const dummyId = '03e53d24-85d5-4156-bfe0-64afb345face'; // From user's error string
    const dummyEmail = 'test_error_debug@example.com';

    console.log('Testing Profile Upsert...');
    const { data: newProfile, error: upsertError } = await adminAuthClient
        .from('profiles')
        .upsert({ 
            id: dummyId, 
            email: dummyEmail, 
            role: 'client',
            full_name: 'Test Debug User'
        })
        .select('role')
        .single();
    
    if (upsertError) {
        console.error('Profile Upsert Error:', upsertError);
    } else {
        console.log('Profile Upsert Success:', newProfile);
    }

    console.log('Testing Client Insert...');
    const { data: clientRecord, error: clientError } = await adminAuthClient
        .from('clients')
        .insert({
            user_id: dummyId,
            email: dummyEmail,
            full_name: 'Test Debug User',
            status: 'prospect',
            source: 'self_registered'
        })
        .select('id')
        .single();

    if (clientError) {
        console.error('Client Insert Error:', clientError);
    } else {
        console.log('Client Insert Success:', clientRecord);
    }
    
    // Cleanup
    await adminAuthClient.from('clients').delete().eq('user_id', dummyId);
    await adminAuthClient.from('profiles').delete().eq('id', dummyId);
}

testInsert();
