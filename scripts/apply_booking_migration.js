const fs = require('fs');
const { Client } = require('pg');

async function run() {
    const dbUrl = "postgresql://postgres.otphaldjdkbiinnaazfe:0918731411*Loi@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres";
    const client = new Client({ connectionString: dbUrl });
    
    try {
        console.log('Connecting to Supabase...');
        await client.connect();
        console.log('Connected. Running migration...');
        
        const sql = fs.readFileSync('supabase/migrations/20240317000001_enhance_bookings_table.sql', 'utf8');
        await client.query(sql);
        console.log('Migration SUCCESS');
    } catch (e) {
        console.error('Migration FAILED:', e);
    } finally {
        await client.end();
        console.log('Connection closed.');
    }
}

run();
