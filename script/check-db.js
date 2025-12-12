import { Pool } from 'pg';

const conn = process.env.DATABASE_URL;
if (!conn) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const pool = new Pool({ connectionString: conn });

(async () => {
  try {
    console.log('Attempting simple query on database...');
    const res = await pool.query('SELECT NOW() as now');
    console.log('Connected. Server time:', res.rows[0]);
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('Database connection/query error:');
    console.error(err);
    try { await pool.end(); } catch {}
    process.exit(2);
  }
})();
