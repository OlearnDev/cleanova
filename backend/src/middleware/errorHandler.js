/**
 * Middleware d'erreur global. Renvoie toujours un JSON { message } propre,
 * jamais une stacktrace brute au client.
 */
function notFound(req, res) {
  res.status(404).json({ message: `Route introuvable: ${req.method} ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error(err);

  if (err.name === 'MulterError' || /image/i.test(err.message || '')) {
    return res.status(400).json({ message: err.message });
  }

  if (err.code === '23505') {
    return res.status(409).json({ message: 'Cette valeur existe deja (conflit d\'unicite).' });
  }

  if (err.code === '23503') {
    return res.status(409).json({ message: 'Operation impossible: une donnee liee est referencee ailleurs.' });
  }

  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Erreur interne du serveur.' });
}

module.exports = { notFound, errorHandler };
