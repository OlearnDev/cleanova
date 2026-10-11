const { query } = require('../config/db');
const { sendCsv } = require('../utils/csv');
const { streamInvoicePdf } = require('../utils/invoice');

// ---------------------------------------------------------------------
// Statistiques du dashboard admin
// ---------------------------------------------------------------------
async function getStats(req, res, next) {
  try {
    const [clients, cleanersActive, cleanersPending, bookingsThisMonth, revenue, monthlyRevenue] = await Promise.all([
      query(`SELECT COUNT(*) FROM users WHERE role = 'client'`),
      query(`SELECT COUNT(*) FROM cleaner_profiles WHERE status = 'approuve'`),
      query(`SELECT COUNT(*) FROM cleaner_profiles WHERE status = 'en_attente'`),
      query(`SELECT COUNT(*) FROM bookings WHERE date_trunc('month', scheduled_date) = date_trunc('month', CURRENT_DATE)`),
      query(`SELECT COALESCE(SUM(total_price), 0) AS total FROM bookings WHERE payment_status = 'paye'`),
      query(`SELECT to_char(scheduled_date, 'YYYY-MM') AS month, COALESCE(SUM(total_price), 0) AS revenue, COUNT(*) AS bookings
             FROM bookings
             WHERE scheduled_date >= (CURRENT_DATE - INTERVAL '5 months')
             GROUP BY 1 ORDER BY 1`),
    ]);

    res.json({
      totalClients: Number(clients.rows[0].count),
      activeCleaners: Number(cleanersActive.rows[0].count),
      pendingCleaners: Number(cleanersPending.rows[0].count),
      bookingsThisMonth: Number(bookingsThisMonth.rows[0].count),
      totalRevenue: Number(revenue.rows[0].total),
      monthlyChart: monthlyRevenue.rows,
    });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------
// Gestion des cleaners
// ---------------------------------------------------------------------
async function listCleaners(req, res, next) {
  try {
    const { status } = req.query;
    const conditions = [];
    const values = [];
    if (status) { conditions.push('cp.status = $1'); values.push(status); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const { rows } = await query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.is_active,
              cp.years_experience, cp.skills, cp.hourly_rate, cp.photo_url, cp.availability,
              cp.status, cp.average_rating, cp.total_reviews, cp.total_missions, cp.created_at
       FROM cleaner_profiles cp JOIN users u ON u.id = cp.user_id
       ${where}
       ORDER BY cp.created_at DESC`,
      values
    );
    res.json({ cleaners: rows });
  } catch (err) {
    next(err);
  }
}

async function setCleanerStatus(req, res, next) {
  try {
    const { status } = req.body; // 'approuve' | 'suspendu' | 'refuse' | 'en_attente'
    if (!['approuve', 'suspendu', 'refuse', 'en_attente'].includes(status)) {
      return res.status(400).json({ message: 'Statut invalide.' });
    }
    const { rows } = await query(
      `UPDATE cleaner_profiles SET status = $1, updated_at = NOW() WHERE user_id = $2 RETURNING *`,
      [status, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Cleaner introuvable.' });
    res.json({ profile: rows[0] });
  } catch (err) {
    next(err);
  }
}

async function updateCleanerProfile(req, res, next) {
  try {
    const { hourlyRate, skills, yearsExperience, isActive } = req.body;
    if (isActive !== undefined) {
      await query('UPDATE users SET is_active = $1 WHERE id = $2', [isActive === 'true' || isActive === true, req.params.id]);
    }
    const fields = [];
    const values = [];
    let idx = 1;
    if (hourlyRate !== undefined) { fields.push(`hourly_rate = $${idx++}`); values.push(hourlyRate); }
    if (skills !== undefined) { fields.push(`skills = $${idx++}`); values.push(skills); }
    if (yearsExperience !== undefined) { fields.push(`years_experience = $${idx++}`); values.push(yearsExperience); }

    if (fields.length) {
      values.push(req.params.id);
      await query(`UPDATE cleaner_profiles SET ${fields.join(', ')}, updated_at = NOW() WHERE user_id = $${idx}`, values);
    }
    const { rows } = await query(
      `SELECT u.*, cp.* FROM users u JOIN cleaner_profiles cp ON cp.user_id = u.id WHERE u.id = $1`,
      [req.params.id]
    );
    res.json({ profile: rows[0] });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------
// Gestion des clients
// ---------------------------------------------------------------------
async function listClients(req, res, next) {
  try {
    const { rows } = await query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.address, u.is_active, u.created_at,
              COUNT(b.id) AS total_bookings, COALESCE(SUM(CASE WHEN b.payment_status = 'paye' THEN b.total_price ELSE 0 END), 0) AS total_spent
       FROM users u
       LEFT JOIN bookings b ON b.client_id = u.id
       WHERE u.role = 'client'
       GROUP BY u.id
       ORDER BY u.created_at DESC`
    );
    res.json({ clients: rows });
  } catch (err) {
    next(err);
  }
}

async function getClientHistory(req, res, next) {
  try {
    const { rows } = await query(
      `SELECT b.*, s.name AS service_name FROM bookings b JOIN services s ON s.id = b.service_id
       WHERE b.client_id = $1 ORDER BY b.scheduled_date DESC`,
      [req.params.id]
    );
    res.json({ bookings: rows });
  } catch (err) {
    next(err);
  }
}

async function setClientActive(req, res, next) {
  try {
    const { isActive } = req.body;
    const { rows } = await query(
      `UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2 AND role = 'client' RETURNING id, first_name, last_name, is_active`,
      [Boolean(isActive), req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Client introuvable.' });
    res.json({ client: rows[0] });
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------
// Gestion des reservations
// ---------------------------------------------------------------------
async function listBookings(req, res, next) {
  try {
    const { status, from, to } = req.query;
    const conditions = [];
    const values = [];
    let idx = 1;
    if (status) { conditions.push(`b.status = $${idx++}`); values.push(status); }
    if (from) { conditions.push(`b.scheduled_date >= $${idx++}`); values.push(from); }
    if (to) { conditions.push(`b.scheduled_date <= $${idx++}`); values.push(to); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const { rows } = await query(
      `SELECT b.*, s.name AS service_name,
              cl.first_name AS client_first_name, cl.last_name AS client_last_name, cl.phone AS client_phone,
              cu.first_name AS cleaner_first_name, cu.last_name AS cleaner_last_name
       FROM bookings b
       JOIN services s ON s.id = b.service_id
       JOIN users cl ON cl.id = b.client_id
       LEFT JOIN users cu ON cu.id = b.cleaner_id
       ${where}
       ORDER BY b.scheduled_date DESC, b.scheduled_time DESC`,
      values
    );
    res.json({ bookings: rows });
  } catch (err) {
    next(err);
  }
}

async function assignCleaner(req, res, next) {
  try {
    const { cleanerId } = req.body;
    const { rows } = await query(
      `UPDATE bookings SET cleaner_id = $1, status = 'confirmee', updated_at = NOW() WHERE id = $2 RETURNING *`,
      [cleanerId, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Reservation introuvable.' });
    res.json({ booking: rows[0] });
  } catch (err) {
    next(err);
  }
}

async function updateBookingStatus(req, res, next) {
  try {
    const { status } = req.body;
    const allowed = ['en_attente', 'confirmee', 'en_cours', 'terminee', 'annulee', 'refusee'];
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Statut invalide.' });

    const { rows } = await query(
      `UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Reservation introuvable.' });

    if (status === 'terminee' && rows[0].cleaner_id) {
      await query(
        `UPDATE cleaner_profiles SET total_missions = total_missions + 1,
                total_earnings = total_earnings + $1, updated_at = NOW()
         WHERE user_id = $2`,
        [rows[0].total_price, rows[0].cleaner_id]
      );
    }
    res.json({ booking: rows[0] });
  } catch (err) {
    next(err);
  }
}

async function exportBookingsCsv(req, res, next) {
  try {
    const { rows } = await query(
      `SELECT b.id, s.name AS service, cl.first_name || ' ' || cl.last_name AS client,
              cu.first_name || ' ' || cu.last_name AS cleaner,
              b.scheduled_date, b.scheduled_time, b.status, b.payment_status, b.total_price
       FROM bookings b
       JOIN services s ON s.id = b.service_id
       JOIN users cl ON cl.id = b.client_id
       LEFT JOIN users cu ON cu.id = b.cleaner_id
       ORDER BY b.scheduled_date DESC`
    );
    sendCsv(res, 'reservations.csv', rows);
  } catch (err) {
    next(err);
  }
}

async function downloadInvoice(req, res, next) {
  try {
    const { rows } = await query(
      `SELECT b.*, s.name AS service_name, cl.first_name AS client_first_name, cl.last_name AS client_last_name
       FROM bookings b JOIN services s ON s.id = b.service_id JOIN users cl ON cl.id = b.client_id
       WHERE b.id = $1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Reservation introuvable.' });
    streamInvoicePdf(res, rows[0]);
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------
// Parametres, zones, plages horaires
// ---------------------------------------------------------------------
async function getSettings(req, res, next) {
  try {
    const settings = await query('SELECT * FROM settings');
    const zones = await query('SELECT * FROM service_zones ORDER BY name');
    const slots = await query('SELECT * FROM time_slots ORDER BY start_time');
    const settingsMap = {};
    settings.rows.forEach((row) => { settingsMap[row.key] = row.value; });
    res.json({ settings: settingsMap, zones: zones.rows, timeSlots: slots.rows });
  } catch (err) {
    next(err);
  }
}

async function updateSettings(req, res, next) {
  try {
    const entries = Object.entries(req.body || {});
    for (const [key, value] of entries) {
      await query(
        `INSERT INTO settings (key, value) VALUES ($1, $2)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
        [key, JSON.stringify(value)]
      );
    }
    res.json({ message: 'Parametres mis a jour.' });
  } catch (err) {
    next(err);
  }
}

async function addZone(req, res, next) {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Le nom de la zone est obligatoire.' });
    const { rows } = await query('INSERT INTO service_zones (name) VALUES ($1) RETURNING *', [name]);
    res.status(201).json({ zone: rows[0] });
  } catch (err) {
    next(err);
  }
}

async function deleteZone(req, res, next) {
  try {
    await query('DELETE FROM service_zones WHERE id = $1', [req.params.id]);
    res.json({ message: 'Zone supprimee.' });
  } catch (err) {
    next(err);
  }
}

async function addTimeSlot(req, res, next) {
  try {
    const { label, startTime, endTime } = req.body;
    if (!label || !startTime || !endTime) return res.status(400).json({ message: 'Libelle, heure de debut et de fin sont obligatoires.' });
    const { rows } = await query(
      'INSERT INTO time_slots (label, start_time, end_time) VALUES ($1, $2, $3) RETURNING *',
      [label, startTime, endTime]
    );
    res.status(201).json({ timeSlot: rows[0] });
  } catch (err) {
    next(err);
  }
}

async function deleteTimeSlot(req, res, next) {
  try {
    await query('DELETE FROM time_slots WHERE id = $1', [req.params.id]);
    res.json({ message: 'Plage horaire supprimee.' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getStats,
  listCleaners, setCleanerStatus, updateCleanerProfile,
  listClients, getClientHistory, setClientActive,
  listBookings, assignCleaner, updateBookingStatus, exportBookingsCsv, downloadInvoice,
  getSettings, updateSettings, addZone, deleteZone, addTimeSlot, deleteTimeSlot,
};
