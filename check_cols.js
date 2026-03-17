const { Client } = require('pg');

const connectionString = 'postgresql://postgres.otphaldjdkbiinnaazfe:0918731411*Loi@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres';

async function checkColumns() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log('Connected. Checking columns...');

        const profRes = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'profiles' AND table_schema = 'public';
        `);
        console.log('Profiles columns:', profRes.rows.map(r => r.column_name).join(', '));

        const cliRes = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'clients' AND table_schema = 'public';
        `);
        console.log('Clients columns:', cliRes.rows.map(r => r.column_name).join(', '));

        // Let's also reload PostgREST schema cache just in case
        await client.query(`NOTIFY pgrst, 'reload schema'`);
        console.log('Reloaded PostgREST schema cache');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

checkColumns();
