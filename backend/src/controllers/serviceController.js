const { query } = require('../config/db');

async function listCategories(req, res, next) {
  try {
    const { rows } = await query('SELECT * FROM service_categories ORDER BY name');
    res.json({ categories: rows });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/services?category=slug&active=true&search=texte
 * Public: par defaut seuls les services actifs sont renvoyes.
 */
async function listServices(req, res, next) {
  try {
    const { category, search, includeInactive } = req.query;
    const conditions = [];
    const values = [];
    let idx = 1;

    if (!includeInactive || req.user?.role !== 'admin') {
      conditions.push('s.is_active = TRUE');
    }
    if (category) {
      conditions.push(`c.slug = $${idx++}`);
      values.push(category);
    }
    if (search) {
      conditions.push(`(s.name ILIKE $${idx} OR s.description ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const { rows } = await query(
      `SELECT s.*, c.name AS category_name, c.slug AS category_slug
       FROM services s
       LEFT JOIN service_categories c ON c.id = s.category_id
       ${where}
       ORDER BY s.created_at DESC`,
      values
    );
    res.json({ services: rows });
  } catch (err) {
    next(err);
  }
}

async function getService(req, res, next) {
  try {
    const { rows } = await query(
      `SELECT s.*, c.name AS category_name, c.slug AS category_slug
       FROM services s LEFT JOIN service_categories c ON c.id = s.category_id
       WHERE s.id = $1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Service introuvable.' });
    res.json({ service: rows[0] });
  } catch (err) {
    next(err);
  }
}

async function createService(req, res, next) {
  try {
    const { name, description, price, durationMinutes, categoryId } = req.body;
    if (!name || !price) {
      return res.status(400).json({ message: 'Nom et prix sont obligatoires.' });
    }
    const imageUrl = req.file ? `/uploads/services/${req.file.filename}` : null;

    const { rows } = await query(
      `INSERT INTO services (name, description, price, duration_minutes, category_id, image_url)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, description || null, price, durationMinutes || 60, categoryId || null, imageUrl]
    );
    res.status(201).json({ service: rows[0] });
  } catch (err) {
    next(err);
  }
}

async function updateService(req, res, next) {
  try {
    const { name, description, price, durationMinutes, categoryId, isActive } = req.body;
    const fields = [];
    const values = [];
    let idx = 1;

    if (name !== undefined) { fields.push(`name = $${idx++}`); values.push(name); }
    if (description !== undefined) { fields.push(`description = $${idx++}`); values.push(description); }
    if (price !== undefined) { fields.push(`price = $${idx++}`); values.push(price); }
    if (durationMinutes !== undefined) { fields.push(`duration_minutes = $${idx++}`); values.push(durationMinutes); }
    if (categoryId !== undefined) { fields.push(`category_id = $${idx++}`); values.push(categoryId); }
    if (isActive !== undefined) { fields.push(`is_active = $${idx++}`); values.push(isActive === 'true' || isActive === true); }
    if (req.file) { fields.push(`image_url = $${idx++}`); values.push(`/uploads/services/${req.file.filename}`); }

    if (!fields.length) return res.status(400).json({ message: 'Aucune donnee a mettre a jour.' });

    fields.push('updated_at = NOW()');
    values.push(req.params.id);

    const { rows } = await query(
      `UPDATE services SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    if (!rows.length) return res.status(404).json({ message: 'Service introuvable.' });
    res.json({ service: rows[0] });
  } catch (err) {
    next(err);
  }
}

async function deleteService(req, res, next) {
  try {
    const { rowCount } = await query('DELETE FROM services WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ message: 'Service introuvable.' });
    res.json({ message: 'Service supprime.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listCategories, listServices, getService, createService, updateService, deleteService };
