/* eslint-disable @typescript-eslint/no-require-imports */
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function migrate() {
    const directUrl = process.env.DIRECT_URL;
    if (!directUrl) {
        console.error('DIRECT_URL is missing in .env.local');
        process.exit(1);
    }

    const client = new Client({
        connectionString: directUrl,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        console.log('--- Database Connection Established ---');

        const migrationsDir = path.join(__dirname, '../supabase/migrations');
        const files = fs.readdirSync(migrationsDir)
            .filter(f => f.endsWith('.sql'))
            .sort();

        console.log(`Found ${files.length} migration files.`);

        for (const file of files) {
            const filePath = path.join(migrationsDir, file);
            const sql = fs.readFileSync(filePath, 'utf8');

            console.log(`\n[Migrating] ${file}...`);
            try {
                // We wrap each file in a transaction if possible, or just run it
                await client.query(sql);
                console.log(`[Success] ${file} applied.`);
            } catch (fileErr) {
                // If the error is "already exists", we might want to skip or log it
                // For this environment, we'll log it but keep going if it's a "relation already exists"
                if (fileErr.code === '42P07' || fileErr.code === '42710') {
                    console.log(`[Notice] Objects already exist in ${file}, skipping conflicts.`);
                } else {
                    console.error(`[Error] Failed applying ${file}:`, fileErr.message);
                    throw fileErr; // Stop on serious errors
                }
            }
        }

        console.log('\n--- All Migrations Processed Successfully ---');

    } catch (err) {
        console.error('\n--- Migration Batch Failed ---');
        console.error(err.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

migrate();
