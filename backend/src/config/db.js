const { Pool } = require('pg');
require('dotenv').config();

// Pool de connexions PostgreSQL, configure via variables d'environnement (.env)
const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT || 5432,
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  database: process.env.PGDATABASE || 'cleanova',
});

pool.on('error', (err) => {
  console.error('Erreur inattendue du pool PostgreSQL', err);
});

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
};
