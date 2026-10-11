const { query } = require('../config/db');

async function listMyNotifications(req, res, next) {
  try {
    const { rows } = await query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );
    res.json({ notifications: rows });
  } catch (err) {
    next(err);
  }
}

async function markAsRead(req, res, next) {
  try {
    const { rows } = await query(
      'UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Notification introuvable.' });
    res.json({ notification: rows[0] });
  } catch (err) {
    next(err);
  }
}

module.exports = { listMyNotifications, markAsRead };
