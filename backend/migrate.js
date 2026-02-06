const fs = require('fs');
const path = require('path');
const pgPromise = require('pg-promise');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pgp = pgPromise();
const db = pgp(process.env.DATABASE_URL);

async function migrate() {
  try {
    console.log('Connecting to Supabase...');
    await db.connect();
    console.log('Connected.');

    console.log('Reading schema.sql...');
    const schemaSql = fs.readFileSync(path.join(__dirname, '../database/schema.sql'), 'utf8');

    console.log('Running migration (this may take a moment)...');
    await db.none(schemaSql);
    console.log('Migration successful!');
  } catch (err) {
    console.error('Migration failed:', err.message);
    if (err.position) {
      console.error('At position:', err.position);
    }
  } finally {
    pgp.end();
  }
}

migrate();
