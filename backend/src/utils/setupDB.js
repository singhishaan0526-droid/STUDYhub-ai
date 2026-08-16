const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const run = async () => {
  try {
    const sqlPath = path.join(__dirname, '../models/init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Executing init.sql on database...');
    await pool.query(sql);
    console.log('Database initialized successfully!');
  } catch (err) {
    console.error('Failed to initialize database:', err.message);
  } finally {
    pool.end();
  }
};

run();
