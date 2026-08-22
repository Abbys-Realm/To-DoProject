const pool = require('./db');

async function run() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'tasks'
      ORDER BY ordinal_position;
    `);
    console.log('--- TASKS TABLE COLUMNS ---');
    for (const row of res.rows) {
      console.log(`${row.column_name} | ${row.data_type} | default: ${row.column_default} | nullable: ${row.is_nullable}`);
    }
  } catch (err) {
    console.error('Check error:', err.message);
  } finally {
    await pool.end();
  }
}

run();
