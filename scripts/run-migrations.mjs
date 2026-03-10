import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local from project root
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const connectionString = process.env.DIRECT_URL;

if (!connectionString) {
  console.error('DIRECT_URL not found in .env.local');
  process.exit(1);
}

async function runMigrations() {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('Connected to database.');

    const migrationsDir = path.join(__dirname, '../supabase/migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

    console.log(`Found ${files.length} migration files.`);

    for (const file of files) {
      console.log(`\n--------------------------------------------------`);
      console.log(`Executing ${file}...`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      try {
        // Execute the SQL. Note: for very large files with multiple statements, 
        // some drivers might behave differently, but 'pg' handles semi-colon separated strings.
        await client.query(sql);
        console.log(`✅ Finished ${file}`);
      } catch (err) {
        if (err.message.includes('already exists') || err.message.includes('already a member')) {
          console.warn(`⚠️ Skipped ${file}: ${err.message}`);
        } else {
          console.error(`❌ Error executing ${file}:`, err.message);
          // In some cases we might want to stop, but for "catch-up" migrations, 
          // we often want to push through other files.
          // For now, let's keep going but log carefully.
        }
      }
    }

    console.log(`\n==================================================`);
    console.log('Migration process completed.');
  } catch (err) {
    console.error('Connection failed:', err.message);
  } finally {
    await client.end();
  }
}

runMigrations().catch(err => {
  console.error('Fatal Migration Error:', err);
  process.exit(1);
});
