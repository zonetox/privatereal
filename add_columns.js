const { Client } = require('pg');

const connectionString = 'postgresql://postgres.otphaldjdkbiinnaazfe:0918731411*Loi@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres';

async function fixColumns() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log('Connected. Altering tables...');

        await client.query(`
            ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
            ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
            ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'prospect';
            ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'self_registered';
        `);
        console.log('Successfully added missing columns to profiles and clients');

        // Reload schema cache
        await client.query(`NOTIFY pgrst, 'reload schema'`);
        console.log('Reloaded PostgREST schema cache');

    } catch (err) {
        console.error('Error altering schema:', err);
    } finally {
        await client.end();
    }
}

fixColumns();
