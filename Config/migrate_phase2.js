/**
 * Phase 2 Migration — Add `important` column to tasks table.
 *
 * Only adds the column if it does not already exist.
 * Does NOT drop, rename, or modify any existing column.
 * Run once with: node Config/migrate_phase2.js
 **/

require("dotenv").config();
const pool = require('./db');

async function migrate() {
  try {
    // Check if column already exists
    const check = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'tasks'
        AND column_name = 'important';
    `);

    if (check.rows.length > 0) {
      console.log('Column "important" already exists — nothing to do.');
      return;
    }

    // Add the missing column
    await pool.query(`
      ALTER TABLE tasks
      ADD COLUMN important BOOLEAN NOT NULL DEFAULT false;
    `);

    console.log('Migration complete: added "important BOOLEAN NOT NULL DEFAULT false" to tasks.');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
