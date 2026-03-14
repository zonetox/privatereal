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
  'supabase/migrations/20240316000005_bulk_matching_engine.sql',
  'supabase/migrations/20240316000006_lock_matching_engine.sql',
  'supabase/migrations/20240316000007_data_integrity_lock.sql'
];

async function applyMigrations() {
  const client = new Client({
    connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to Supabase database.');

    // 1. Create migrations tracking table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS public._migrations (
        name TEXT PRIMARY KEY,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `);

    // 2. Fetch already applied migrations
    const { rows } = await client.query('SELECT name FROM public._migrations');
    const appliedMigrations = new Set(rows.map(r => r.name));

    for (const migrationPath of migrations) {
      if (appliedMigrations.has(migrationPath)) {
        console.log(`Skipping already applied: ${migrationPath}`);
        continue;
      }

      console.log(`Applying migration: ${migrationPath}`);
      const fullPath = path.resolve(process.cwd(), migrationPath);
      const sql = fs.readFileSync(fullPath, 'utf8');
      
      await client.query(sql);
      await client.query('INSERT INTO public._migrations (name) VALUES ($1)', [migrationPath]);
      console.log(`Successfully applied: ${migrationPath}`);
    }

    console.log('All new migrations applied successfully.');
  } catch (err) {
    console.error('Error applying migrations:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

applyMigrations();
