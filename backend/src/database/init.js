/**
 * Cree/reinitialise le schema de la base de donnees a partir de schema.sql
 * Usage: npm run db:init
 */
const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

async function init() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');
  try {
    console.log('Application du schema PostgreSQL...');
    await pool.query(sql);
    console.log('Schema applique avec succes.');
  } catch (err) {
    console.error('Echec de l\'initialisation de la base de donnees:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

init();
