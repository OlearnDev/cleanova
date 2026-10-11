const bcrypt = require('bcrypt');
const { query } = require('../config/db');
const { signToken } = require('../utils/token');

/**
 * POST /api/auth/register/client
 */
async function registerClient(req, res, next) {
  try {
    const { firstName, lastName, email, phone, address, password } = req.body;
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'Nom, prenom, email et mot de passe sont obligatoires.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 8 caracteres.' });
    }

    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length) {
      return res.status(409).json({ message: 'Un compte existe deja avec cet email.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const { rows } = await query(
      `INSERT INTO users (first_name, last_name, email, phone, address, password_hash, role)
       VALUES ($1, $2, $3, $4, $5, $6, 'client')
       RETURNING id, first_name, last_name, email, phone, address, role, created_at`,
      [firstName, lastName, email.toLowerCase(), phone || null, address || null, hash]
    );

    const user = rows[0];
    const token = signToken(user);
    res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/register/cleaner
 * Le compte est cree avec le statut cleaner_profiles.status = 'en_attente'
 * jusqu'a validation par un administrateur.
 */
async function registerCleaner(req, res, next) {
  try {
    const {
      firstName, lastName, email, phone, password,
      yearsExperience, skills, hourlyRate, availability,
    } = req.body;

    if (!firstName || !lastName || !email || !password || !hourlyRate) {
      return res.status(400).json({ message: 'Nom, prenom, email, mot de passe et tarif horaire sont obligatoires.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 8 caracteres.' });
    }

    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length) {
      return res.status(409).json({ message: 'Un compte existe deja avec cet email.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const photoUrl = req.file ? `/uploads/cleaners/${req.file.filename}` : null;

    const client = await require('../config/db').pool.connect();
    try {
      await client.query('BEGIN');
      const userResult = await client.query(
        `INSERT INTO users (first_name, last_name, email, phone, password_hash, role)
         VALUES ($1, $2, $3, $4, $5, 'cleaner')
         RETURNING id, first_name, last_name, email, phone, role, created_at`,
        [firstName, lastName, email.toLowerCase(), phone || null, hash]
      );
      const user = userResult.rows[0];

      const availabilityValue = availability === 'temps_plein' ? 'temps_plein' : 'partiel';
      await client.query(
        `INSERT INTO cleaner_profiles (user_id, years_experience, skills, hourly_rate, photo_url, availability, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'en_attente')`,
        [user.id, yearsExperience || 0, skills || null, hourlyRate, photoUrl, availabilityValue]
      );
      await client.query('COMMIT');

      res.status(201).json({
        message: 'Votre candidature a bien ete recue. Elle est en attente de validation par notre equipe.',
        user,
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe sont obligatoires.' });
    }

    const { rows } = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    const user = rows[0];
    if (!user || !user.is_active) {
      return res.status(401).json({ message: 'Identifiants invalides ou compte desactive.' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ message: 'Identifiants invalides.' });
    }

    let cleanerStatus = null;
    if (user.role === 'cleaner') {
      const cp = await query('SELECT status FROM cleaner_profiles WHERE user_id = $1', [user.id]);
      cleanerStatus = cp.rows[0]?.status || null;
      if (cleanerStatus === 'suspendu') {
        return res.status(403).json({ message: 'Votre compte cleaner est suspendu. Contactez l\'administration.' });
      }
    }

    const token = signToken(user);
    delete user.password_hash;
    res.json({ user: { ...user, cleanerStatus }, token });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/me
 */
async function me(req, res, next) {
  try {
    const { rows } = await query(
      'SELECT id, first_name, last_name, email, phone, address, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    res.json({ user: rows[0] });
  } catch (err) {
    next(err);
  }
}

module.exports = { registerClient, registerCleaner, login, me };
