const { Client } = require('pg');

const connectionString = 'postgresql://postgres.otphaldjdkbiinnaazfe:0918731411*Loi@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres';

async function extendSchema() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log('Connected to DB.');

        // Add missing columns if they don't exist
        await client.query(`
            ALTER TABLE public.projects 
            ADD COLUMN IF NOT EXISTS future_supply_notes TEXT;
        `);
        
        console.log('Column future_supply_notes added successfully.');

        // Notify PostgREST to reload schema
        await client.query("NOTIFY pgrst, 'reload schema'");
        console.log('PostgREST notified.');

    } catch (err) {
        console.error('Error extending schema:', err);
    } finally {
        await client.end();
    }
}

extendSchema();
