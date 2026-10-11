const { query, pool } = require('../config/db');

/**
 * POST /api/reviews (client) - uniquement pour une reservation terminee, non deja notee.
 * body: { bookingId, rating, comment }
 */
async function createReview(req, res, next) {
  const client = await pool.connect();
  try {
    const { bookingId, rating, comment } = req.body;
    if (!bookingId || !rating) {
      return res.status(400).json({ message: 'La reservation et la note sont obligatoires.' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'La note doit etre comprise entre 1 et 5.' });
    }

    const bookingResult = await client.query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
    const booking = bookingResult.rows[0];
    if (!booking) return res.status(404).json({ message: 'Reservation introuvable.' });
    if (booking.client_id !== req.user.id) return res.status(403).json({ message: 'Acces refuse.' });
    if (booking.status !== 'terminee') {
      return res.status(400).json({ message: 'Vous ne pouvez noter qu\'une prestation terminee.' });
    }
    if (!booking.cleaner_id) {
      return res.status(400).json({ message: 'Aucun cleaner associe a cette reservation.' });
    }

    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO reviews (booking_id, client_id, cleaner_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [bookingId, req.user.id, booking.cleaner_id, rating, comment || null]
    );

    // Recalcule la note moyenne du cleaner
    const agg = await client.query(
      `SELECT AVG(rating)::numeric(3,2) AS avg_rating, COUNT(*) AS total
       FROM reviews WHERE cleaner_id = $1 AND is_visible = TRUE`,
      [booking.cleaner_id]
    );
    await client.query(
      `UPDATE cleaner_profiles SET average_rating = $1, total_reviews = $2, updated_at = NOW() WHERE user_id = $3`,
      [agg.rows[0].avg_rating || 0, agg.rows[0].total, booking.cleaner_id]
    );

    await client.query('COMMIT');
    res.status(201).json({ review: rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') {
      return res.status(409).json({ message: 'Cette reservation a deja ete notee.' });
    }
    next(err);
  } finally {
    client.release();
  }
}

async function listReviewsForCleaner(req, res, next) {
  try {
    const { rows } = await query(
      `SELECT r.id, r.rating, r.comment, r.created_at, u.first_name AS client_first_name
       FROM reviews r JOIN users u ON u.id = r.client_id
       WHERE r.cleaner_id = $1 AND r.is_visible = TRUE
       ORDER BY r.created_at DESC`,
      [req.params.cleanerId]
    );
    res.json({ reviews: rows });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/reviews/:id/moderate (admin) - body: { isVisible }
 */
async function moderateReview(req, res, next) {
  try {
    const { isVisible } = req.body;
    const { rows } = await query(
      `UPDATE reviews SET is_visible = $1 WHERE id = $2 RETURNING *`,
      [Boolean(isVisible), req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Avis introuvable.' });
    res.json({ review: rows[0] });
  } catch (err) {
    next(err);
  }
}

module.exports = { createReview, listReviewsForCleaner, moderateReview };
