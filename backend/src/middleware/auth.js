const jwt = require('jsonwebtoken');

/**
 * Verifie le token JWT envoye dans l'entete Authorization: Bearer <token>
 * et attache le payload decode (id, role, email) a req.user.
 */
function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Authentification requise.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Session invalide ou expiree. Veuillez vous reconnecter.' });
  }
}

/**
 * Autorise uniquement les roles listes. A utiliser apres `authenticate`.
 * Exemple: router.get('/admin', authenticate, authorize('admin'), handler)
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Acces refuse pour votre role.' });
    }
    next();
  };
}

/**
 * Comme `authenticate` mais ne bloque pas la requete si aucun token n'est
 * fourni ou s'il est invalide - utile pour des routes publiques dont le
 * comportement varie legerement si l'utilisateur est connecte (ex: admin
 * voit aussi les services inactifs).
 */
function optionalAuthenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next();
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    // Token invalide -> on continue simplement sans req.user
  }
  next();
}

module.exports = { authenticate, authorize, optionalAuthenticate };
