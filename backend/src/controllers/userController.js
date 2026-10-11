const bcrypt = require('bcrypt');
const { query } = require('../config/db');

async function getProfile(req, res, next) {
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

async function updateProfile(req, res, next) {
  try {
    const { firstName, lastName, phone, address, password } = req.body;
    const fields = [];
    const values = [];
    let idx = 1;

    if (firstName) { fields.push(`first_name = $${idx++}`); values.push(firstName); }
    if (lastName) { fields.push(`last_name = $${idx++}`); values.push(lastName); }
    if (phone !== undefined) { fields.push(`phone = $${idx++}`); values.push(phone); }
    if (address !== undefined) { fields.push(`address = $${idx++}`); values.push(address); }
    if (password) {
      if (password.length < 8) {
        return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 8 caracteres.' });
      }
      const hash = await bcrypt.hash(password, 10);
      fields.push(`password_hash = $${idx++}`);
      values.push(hash);
    }

    if (!fields.length) {
      return res.status(400).json({ message: 'Aucune donnee a mettre a jour.' });
    }

    fields.push(`updated_at = NOW()`);
    values.push(req.user.id);

    const { rows } = await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx}
       RETURNING id, first_name, last_name, email, phone, address, role`,
      values
    );
    res.json({ user: rows[0] });
  } catch (err) {
    next(err);
  }
}

module.exports = { getProfile, updateProfile };
