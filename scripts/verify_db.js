/* eslint-disable @typescript-eslint/no-require-imports */
const { Client } = require('pg');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function verify() {
    const client = new Client({
        connectionString: process.env.DIRECT_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

        console.log('Tables in "public" schema:');
        res.rows.forEach(row => console.log(`- ${row.table_name}`));

        const rlsRes = await client.query(`
      SELECT tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public';
    `);
        console.log('\nRLS Status:');
        rlsRes.rows.forEach(row => console.log(`- ${row.tablename}: ${row.rowsecurity ? 'ENABLED' : 'DISABLED'}`));

    } catch (err) {
        console.error('Verification failed:', err);
    } finally {
        await client.end();
    }
}

verify();
