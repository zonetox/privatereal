const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const migrations = [
    'supabase/migrations/20240308000003_add_advisory_intake_fields.sql',
    'supabase/migrations/20240308000004_consolidate_intelligence_fields.sql',
    'supabase/migrations/20240308000005_update_matching_engine_v3_core.sql'
];

async function runMigrations() {
    const client = new Client({
        connectionString: process.env.DIRECT_URL,
    });

    try {
        await client.connect();
        console.log('Connected to database.');

        for (const migrationPath of migrations) {
            console.log(`Running migration: ${migrationPath}`);
            const sql = fs.readFileSync(path.resolve(migrationPath), 'utf8');
            await client.query(sql);
            console.log(`Successfully completed: ${migrationPath}`);
        }
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

runMigrations();
