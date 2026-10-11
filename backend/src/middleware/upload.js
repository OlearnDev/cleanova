const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * Fabrique un middleware Multer qui stocke les images uploadees dans
 * backend/uploads/<subfolder>/ avec un nom de fichier unique.
 */
function makeUploader(subfolder) {
  const dir = path.join(__dirname, '..', '..', 'uploads', subfolder);
  fs.mkdirSync(dir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, dir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, unique);
    },
  });

  const fileFilter = (req, file, cb) => {
    const allowed = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) {
      return cb(new Error('Format d\'image non supporte. Utilisez png, jpg, jpeg, webp ou gif.'));
    }
    cb(null, true);
  };

  const maxMb = Number(process.env.MAX_UPLOAD_MB || 5);
  return multer({
    storage,
    fileFilter,
    limits: { fileSize: maxMb * 1024 * 1024 },
  });
}

module.exports = { makeUploader };
