const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const migrations = [
  'supabase/migrations/20240316000000_fix_matching_engine_horizon_and_goal.sql',
  'supabase/migrations/20240316000001_workspace_activity_view.sql',
  'supabase/migrations/20240316000002_update_publish_validation.sql',
  'supabase/migrations/20240316000003_standardize_matching_engine.sql',
  'supabase/migrations/20240316000004_ensure_clients_intelligence.sql',
  'supabase/migrations/20240316000005_bulk_matching_engine.sql'
];

async function applyMigrations() {
  const client = new Client({
    connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to Supabase database.');

    for (const migrationPath of migrations) {
      console.log(`Applying migration: ${migrationPath}`);
      const fullPath = path.resolve(process.cwd(), migrationPath);
      const sql = fs.readFileSync(fullPath, 'utf8');
      
      await client.query(sql);
      console.log(`Successfully applied: ${migrationPath}`);
    }

    console.log('All migrations applied successfully.');
  } catch (err) {
    console.error('Error applying migrations:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

applyMigrations();
