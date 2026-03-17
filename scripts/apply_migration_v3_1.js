const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Connection string from .env.local DIRECT_URL
const connectionString = "postgresql://postgres.otphaldjdkbiinnaazfe:0918731411*Loi@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres";
const sqlPath = path.join('c:', 'Users', 'Dell', 'Desktop', 'GITHUB CODE', 'Private Real Estate Intelligence Office', 'supabase', 'migrations', '20240317000000_update_matching_v3_1.sql');

async function applyMigration() {
    const client = new Client({
        connectionString: connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('Connecting to database...');
        await client.connect();
        
        console.log(`Reading SQL file from: ${sqlPath}`);
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        console.log('Executing migration...');
        await client.query(sql);
        
        console.log('Migration applied successfully!');
    } catch (err) {
        console.error('Error applying migration:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

applyMigration();
