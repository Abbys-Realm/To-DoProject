const pool = require('./db');

async function run() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'tasks'
      ORDER BY ordinal_position;
    `);
   
      } catch (err) {
    .error('Check error:', err.message);
  } finally {
    await pool.end();
  }
}

run();
