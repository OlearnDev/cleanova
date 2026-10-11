const { query } = require('../config/db');

async function listPartners(req, res, next) {
  try {
    const onlyActive = req.user?.role !== 'admin';
    const { rows } = await query(
      `SELECT * FROM partners ${onlyActive ? 'WHERE is_active = TRUE' : ''} ORDER BY name`
    );
    res.json({ partners: rows });
  } catch (err) {
    next(err);
  }
}

async function createPartner(req, res, next) {
  try {
    const { name, websiteUrl, category, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Le nom du partenaire est obligatoire.' });
    const logoUrl = req.file ? `/uploads/partners/${req.file.filename}` : null;

    const { rows } = await query(
      `INSERT INTO partners (name, logo_url, website_url, category, description) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, logoUrl, websiteUrl || null, category || null, description || null]
    );
    res.status(201).json({ partner: rows[0] });
  } catch (err) {
    next(err);
  }
}

async function updatePartner(req, res, next) {
  try {
    const { name, websiteUrl, category, description, isActive } = req.body;
    const fields = [];
    const values = [];
    let idx = 1;

    if (name !== undefined) { fields.push(`name = $${idx++}`); values.push(name); }
    if (websiteUrl !== undefined) { fields.push(`website_url = $${idx++}`); values.push(websiteUrl); }
    if (category !== undefined) { fields.push(`category = $${idx++}`); values.push(category); }
    if (description !== undefined) { fields.push(`description = $${idx++}`); values.push(description); }
    if (isActive !== undefined) { fields.push(`is_active = $${idx++}`); values.push(isActive === 'true' || isActive === true); }
    if (req.file) { fields.push(`logo_url = $${idx++}`); values.push(`/uploads/partners/${req.file.filename}`); }

    if (!fields.length) return res.status(400).json({ message: 'Aucune donnee a mettre a jour.' });
    values.push(req.params.id);

    const { rows } = await query(`UPDATE partners SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, values);
    if (!rows.length) return res.status(404).json({ message: 'Partenaire introuvable.' });
    res.json({ partner: rows[0] });
  } catch (err) {
    next(err);
  }
}

async function deletePartner(req, res, next) {
  try {
    const { rowCount } = await query('DELETE FROM partners WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ message: 'Partenaire introuvable.' });
    res.json({ message: 'Partenaire supprime.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listPartners, createPartner, updatePartner, deletePartner };
