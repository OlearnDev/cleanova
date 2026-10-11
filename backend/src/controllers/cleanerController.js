const { query } = require('../config/db');

/**
 * GET /api/cleaners - annuaire public des cleaners approuves
 */
async function listCleaners(req, res, next) {
  try {
    const { search, availability, minRating } = req.query;
    const conditions = [`cp.status = 'approuve'`, 'u.is_active = TRUE'];
    const values = [];
    let idx = 1;

    if (search) {
      conditions.push(`(u.first_name ILIKE $${idx} OR u.last_name ILIKE $${idx} OR cp.skills ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }
    if (availability) {
      conditions.push(`cp.availability = $${idx++}`);
      values.push(availability);
    }
    if (minRating) {
      conditions.push(`cp.average_rating >= $${idx++}`);
      values.push(minRating);
    }

    const { rows } = await query(
      `SELECT u.id, u.first_name, u.last_name, cp.years_experience, cp.skills, cp.hourly_rate,
              cp.photo_url, cp.availability, cp.average_rating, cp.total_reviews
       FROM cleaner_profiles cp JOIN users u ON u.id = cp.user_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY cp.average_rating DESC`,
      values
    );
    res.json({ cleaners: rows });
  } catch (err) {
    next(err);
  }
}

async function getCleaner(req, res, next) {
  try {
    const { rows } = await query(
      `SELECT u.id, u.first_name, u.last_name, cp.years_experience, cp.skills, cp.hourly_rate,
              cp.photo_url, cp.availability, cp.average_rating, cp.total_reviews
       FROM cleaner_profiles cp JOIN users u ON u.id = cp.user_id
       WHERE u.id = $1 AND cp.status = 'approuve'`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Cleaner introuvable.' });

    const reviews = await query(
      `SELECT r.rating, r.comment, r.created_at, u.first_name AS client_first_name
       FROM reviews r JOIN users u ON u.id = r.client_id
       WHERE r.cleaner_id = $1 AND r.is_visible = TRUE ORDER BY r.created_at DESC LIMIT 20`,
      [req.params.id]
    );
    res.json({ cleaner: rows[0], reviews: reviews.rows });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/cleaners/me/availability
 */
async function updateMyAvailability(req, res, next) {
  try {
    const { availability, hourlyRate, skills } = req.body;
    const fields = [];
    const values = [];
    let idx = 1;

    if (availability) { fields.push(`availability = $${idx++}`); values.push(availability); }
    if (hourlyRate !== undefined) { fields.push(`hourly_rate = $${idx++}`); values.push(hourlyRate); }
    if (skills !== undefined) { fields.push(`skills = $${idx++}`); values.push(skills); }
    if (!fields.length) return res.status(400).json({ message: 'Aucune donnee a mettre a jour.' });

    fields.push('updated_at = NOW()');
    values.push(req.user.id);

    const { rows } = await query(
      `UPDATE cleaner_profiles SET ${fields.join(', ')} WHERE user_id = $${idx} RETURNING *`,
      values
    );
    res.json({ profile: rows[0] });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/cleaners/me/stats
 */
async function myStats(req, res, next) {
  try {
    const { rows } = await query('SELECT * FROM cleaner_profiles WHERE user_id = $1', [req.user.id]);
    if (!rows.length) return res.status(404).json({ message: 'Profil cleaner introuvable.' });

    const upcoming = await query(
      `SELECT COUNT(*) FROM bookings WHERE cleaner_id = $1 AND status IN ('confirmee', 'en_attente') AND scheduled_date >= CURRENT_DATE`,
      [req.user.id]
    );

    res.json({
      profile: rows[0],
      upcomingMissions: Number(upcoming.rows[0].count),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/cleaners/me/bookings
 */
async function myBookings(req, res, next) {
  try {
    const { status } = req.query;
    const conditions = ['b.cleaner_id = $1'];
    const values = [req.user.id];
    if (status) {
      conditions.push(`b.status = $2`);
      values.push(status);
    }
    const { rows } = await query(
      `SELECT b.*, s.name AS service_name, u.first_name AS client_first_name, u.last_name AS client_last_name, u.phone AS client_phone
       FROM bookings b
       JOIN services s ON s.id = b.service_id
       JOIN users u ON u.id = b.client_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY b.scheduled_date ASC, b.scheduled_time ASC`,
      values
    );
    res.json({ bookings: rows });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/cleaners/me/bookings/:id/respond   body: { action: 'accept' | 'refuse' }
 */
async function respondToBooking(req, res, next) {
  try {
    const { action } = req.body;
    if (!['accept', 'refuse'].includes(action)) {
      return res.status(400).json({ message: 'Action invalide (accept ou refuse attendu).' });
    }
    const newStatus = action === 'accept' ? 'confirmee' : 'refusee';

    const { rows } = await query(
      `UPDATE bookings SET status = $1, updated_at = NOW()
       WHERE id = $2 AND cleaner_id = $3 RETURNING *`,
      [newStatus, req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Reservation introuvable ou non assignee a vous.' });
    res.json({ booking: rows[0] });
  } catch (err) {
    next(err);
  }
}

module.exports = { listCleaners, getCleaner, updateMyAvailability, myStats, myBookings, respondToBooking };
