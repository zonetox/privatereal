const { Client } = require('pg');

const connectionString = 'postgresql://postgres.otphaldjdkbiinnaazfe:0918731411*Loi@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres';

async function checkDb() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log('Connected to DB');

        // Check the function public.handle_new_user
        const funcRes = await client.query(`
            SELECT prosrc
            FROM pg_proc
            WHERE proname = 'handle_new_user';
        `);
        console.log('Function handle_new_user def:', funcRes.rows[0]?.prosrc);

        // Check the trigger on auth.users
        const triggerRes = await client.query(`
            SELECT tgname, tgenabled
            FROM pg_trigger
            WHERE tgrelid = 'auth.users'::regclass AND tgname = 'on_auth_user_created';
        `);
        console.log('Trigger on_auth_user_created:', triggerRes.rows);

    } catch (err) {
        console.error('Error connecting or querying:', err);
    } finally {
        await client.end();
    }
}

checkDb();
