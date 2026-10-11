/**
 * Insere des donnees de demonstration (categories, services, admin, clients,
 * cleaners, partenaires, parametres, zones, plages horaires).
 * Usage: npm run db:seed
 */
const bcrypt = require('bcrypt');
const { pool } = require('../config/db');

const DEMO_PASSWORD = 'Password123!';

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const hash = await bcrypt.hash(DEMO_PASSWORD, 10);

    // --- Categories ---------------------------------------------------
    const categories = ['Residentiel', 'Commercial', 'Regulier', 'Ponctuel'];
    const categoryIds = {};
    for (const name of categories) {
      const slug = name.toLowerCase();
      const { rows } = await client.query(
        `INSERT INTO service_categories (name, slug) VALUES ($1, $2)
         ON CONFLICT (name) DO UPDATE SET slug = EXCLUDED.slug RETURNING id`,
        [name, slug]
      );
      categoryIds[name] = rows[0].id;
    }

    // --- Services -------------------------------------------------------
    const services = [
      ['Nettoyage residentiel', 'Entretien complet de votre residence (maison, condo, appartement).', 90, 120, categoryIds['Residentiel']],
      ['Nettoyage commercial / bureaux', 'Nettoyage professionnel de bureaux et locaux commerciaux.', 150, 180, categoryIds['Commercial']],
      ['Nettoyage regulier hebdomadaire', 'Formule d\'entretien recurrent chaque semaine.', 80, 90, categoryIds['Regulier']],
      ['Nettoyage ponctuel', 'Intervention unique selon vos besoins.', 100, 120, categoryIds['Ponctuel']],
      ['Nettoyage apres demenagement', 'Remise a neuf complete avant ou apres un demenagement.', 180, 240, categoryIds['Ponctuel']],
      ['Nettoyage de vitres', 'Lavage professionnel des vitres interieures et exterieures.', 70, 60, categoryIds['Ponctuel']],
      ['Deneigement (saisonnier)', 'Deneigement des entrees et acces exterieurs en hiver.', 60, 45, categoryIds['Ponctuel']],
      ['Petits travaux de maintenance', 'Menus travaux d\'entretien general.', 50, 60, categoryIds['Commercial']],
    ];
    for (const [name, description, price, duration, categoryId] of services) {
      await client.query(
        `INSERT INTO services (name, description, price, duration_minutes, category_id)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT DO NOTHING`,
        [name, description, price, duration, categoryId]
      );
    }

    // --- Utilisateurs -----------------------------------------------------
    async function upsertUser(firstName, lastName, email, phone, role) {
      const { rows } = await client.query(
        `INSERT INTO users (first_name, last_name, email, phone, password_hash, role)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (email) DO UPDATE SET first_name = EXCLUDED.first_name
         RETURNING id`,
        [firstName, lastName, email, phone, hash, role]
      );
      return rows[0].id;
    }

    const adminId = await upsertUser('Christelle', 'Kouame', 'admin@cleanova.ca', '+14389351427', 'admin');
    const clientId = await upsertUser('Marie', 'Tremblay', 'client@cleanova.ca', '+15145550001', 'client');
    const cleanerId = await upsertUser('Ahmed', 'Haddad', 'cleaner@cleanova.ca', '+15145550002', 'cleaner');
    const cleanerPendingId = await upsertUser('Junior', 'Diabate', 'cleaner2@cleanova.ca', '+15145550003', 'cleaner');

    await client.query(
      `INSERT INTO cleaner_profiles (user_id, years_experience, skills, hourly_rate, availability, status, average_rating, total_reviews, total_missions)
       VALUES ($1, 5, 'Nettoyage residentiel, vitres, planchers', 25, 'temps_plein', 'approuve', 4.8, 12, 34)
       ON CONFLICT (user_id) DO NOTHING`,
      [cleanerId]
    );
    await client.query(
      `INSERT INTO cleaner_profiles (user_id, years_experience, skills, hourly_rate, availability, status)
       VALUES ($1, 1, 'Nettoyage commercial', 20, 'partiel', 'en_attente')
       ON CONFLICT (user_id) DO NOTHING`,
      [cleanerPendingId]
    );

    // --- Partenaires --------------------------------------------------
    const partners = [
      ['ProNettoyage Fournitures', 'Fournisseur', 'https://example.com'],
      ['EcoClean Products', 'Fournisseur', 'https://example.com'],
      ['Immo Plus', 'Immobilier', 'https://example.com'],
    ];
    for (const [name, category, url] of partners) {
      await client.query(
        `INSERT INTO partners (name, category, website_url) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
        [name, category, url]
      );
    }

    // --- Zones et plages horaires --------------------------------------
    const zones = ['Abidjan - Plateau', 'Abidjan - Cocody', 'Abidjan - Marcory', 'Montreal', 'Laval'];
    for (const z of zones) {
      await client.query(`INSERT INTO service_zones (name) VALUES ($1) ON CONFLICT DO NOTHING`, [z]);
    }
    const slots = [
      ['Matin', '08:00', '12:00'],
      ['Apres-midi', '13:00', '17:00'],
      ['Soir', '17:30', '20:00'],
    ];
    for (const [label, start, end] of slots) {
      await client.query(`INSERT INTO time_slots (label, start_time, end_time) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`, [label, start, end]);
    }

    // --- Parametres generaux --------------------------------------------
    const settings = [
      ['company_name', JSON.stringify('Cleanova Solutions')],
      ['company_email', JSON.stringify('contact@cleanova.ca')],
      ['company_phone', JSON.stringify('+1 438 935 1427')],
      ['default_currency', JSON.stringify('CAD')],
      ['default_visit_price', JSON.stringify(90)],
    ];
    for (const [key, value] of settings) {
      await client.query(
        `INSERT INTO settings (key, value) VALUES ($1, $2)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
        [key, value]
      );
    }

    await client.query('COMMIT');
    console.log('Donnees de demonstration inserees avec succes.');
    console.log('Comptes de demonstration (mot de passe pour tous):', DEMO_PASSWORD);
    console.log('  admin@cleanova.ca (admin)');
    console.log('  client@cleanova.ca (client)');
    console.log('  cleaner@cleanova.ca (cleaner, approuve)');
    console.log('  cleaner2@cleanova.ca (cleaner, en attente de validation)');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Echec du seed:', err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
