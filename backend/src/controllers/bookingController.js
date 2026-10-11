const { query } = require('../config/db');
const { sendMail, bookingConfirmationEmail } = require('../utils/mailer');

/**
 * POST /api/bookings (client)
 * body: { serviceId, scheduledDate, scheduledTime, address, notes, cleanerId? }
 */
async function createBooking(req, res, next) {
  try {
    const { serviceId, scheduledDate, scheduledTime, address, notes, cleanerId } = req.body;
    if (!serviceId || !scheduledDate || !scheduledTime || !address) {
      return res.status(400).json({ message: 'Service, date, heure et adresse sont obligatoires.' });
    }

    const serviceResult = await query('SELECT * FROM services WHERE id = $1 AND is_active = TRUE', [serviceId]);
    if (!serviceResult.rows.length) {
      return res.status(404).json({ message: 'Service introuvable ou indisponible.' });
    }
    const service = serviceResult.rows[0];

    // Attribution automatique si aucun cleaner n'est choisi: le cleaner
    // approuve le mieux note et le moins charge ce jour-la.
    let assignedCleanerId = cleanerId || null;
    if (!assignedCleanerId) {
      const auto = await query(
        `SELECT u.id FROM cleaner_profiles cp
         JOIN users u ON u.id = cp.user_id
         WHERE cp.status = 'approuve' AND u.is_active = TRUE
           AND u.id NOT IN (
             SELECT cleaner_id FROM bookings
             WHERE scheduled_date = $1 AND cleaner_id IS NOT NULL AND status IN ('en_attente','confirmee')
           )
         ORDER BY cp.average_rating DESC LIMIT 1`,
        [scheduledDate]
      );
      assignedCleanerId = auto.rows[0]?.id || null;
    }

    const { rows } = await query(
      `INSERT INTO bookings (client_id, service_id, cleaner_id, scheduled_date, scheduled_time, address, notes, total_price, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'en_attente') RETURNING *`,
      [req.user.id, serviceId, assignedCleanerId, scheduledDate, scheduledTime, address, notes || null, service.price]
    );
    const booking = rows[0];

    try {
      await sendMail(bookingConfirmationEmail({
        client_email: req.user.email,
        client_first_name: req.user.firstName,
        service_name: service.name,
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        status: booking.status,
      }));
    } catch (mailErr) {
      console.error('Envoi email de confirmation echoue (non bloquant):', mailErr.message);
    }

    res.status(201).json({ booking, service });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/bookings/me (client) - historique
 */
async function myBookings(req, res, next) {
  try {
    const { rows } = await query(
      `SELECT b.*, s.name AS service_name, s.image_url AS service_image,
              cu.first_name AS cleaner_first_name, cu.last_name AS cleaner_last_name
       FROM bookings b
       JOIN services s ON s.id = b.service_id
       LEFT JOIN users cu ON cu.id = b.cleaner_id
       WHERE b.client_id = $1
       ORDER BY b.scheduled_date DESC, b.scheduled_time DESC`,
      [req.user.id]
    );
    res.json({ bookings: rows });
  } catch (err) {
    next(err);
  }
}

async function getBooking(req, res, next) {
  try {
    const { rows } = await query(
      `SELECT b.*, s.name AS service_name,
              cl.first_name AS client_first_name, cl.last_name AS client_last_name, cl.email AS client_email,
              cu.first_name AS cleaner_first_name, cu.last_name AS cleaner_last_name
       FROM bookings b
       JOIN services s ON s.id = b.service_id
       JOIN users cl ON cl.id = b.client_id
       LEFT JOIN users cu ON cu.id = b.cleaner_id
       WHERE b.id = $1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Reservation introuvable.' });

    const booking = rows[0];
    const isOwner = req.user.role === 'admin'
      || booking.client_id === req.user.id
      || booking.cleaner_id === req.user.id;
    if (!isOwner) return res.status(403).json({ message: 'Acces refuse.' });

    res.json({ booking });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/bookings/:id/cancel (client ou admin)
 */
async function cancelBooking(req, res, next) {
  try {
    const existing = await query('SELECT * FROM bookings WHERE id = $1', [req.params.id]);
    if (!existing.rows.length) return res.status(404).json({ message: 'Reservation introuvable.' });
    const booking = existing.rows[0];

    if (req.user.role !== 'admin' && booking.client_id !== req.user.id) {
      return res.status(403).json({ message: 'Acces refuse.' });
    }
    if (['terminee', 'annulee'].includes(booking.status)) {
      return res.status(400).json({ message: 'Cette reservation ne peut plus etre annulee.' });
    }

    const { rows } = await query(
      `UPDATE bookings SET status = 'annulee', updated_at = NOW() WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    res.json({ booking: rows[0] });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/bookings/:id/pay (client) - paiement simule (pret pour Stripe)
 */
async function payBooking(req, res, next) {
  try {
    const existing = await query('SELECT * FROM bookings WHERE id = $1 AND client_id = $2', [req.params.id, req.user.id]);
    if (!existing.rows.length) return res.status(404).json({ message: 'Reservation introuvable.' });

    if (process.env.STRIPE_ENABLED === 'true') {
      // --- INTEGRATION STRIPE REELLE ---------------------------------
      // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      // const paymentIntent = await stripe.paymentIntents.create({
      //   amount: Math.round(existing.rows[0].total_price * 100),
      //   currency: 'cad',
      // });
      // return res.json({ clientSecret: paymentIntent.client_secret });
    }

    // Paiement simule: on marque directement comme paye.
    const { rows } = await query(
      `UPDATE bookings SET payment_status = 'paye', updated_at = NOW() WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    res.json({ booking: rows[0], message: 'Paiement simule accepte.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { createBooking, myBookings, getBooking, cancelBooking, payBooking };
