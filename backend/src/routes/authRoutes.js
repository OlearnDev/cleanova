const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { makeUploader } = require('../middleware/upload');

const uploadCleanerPhoto = makeUploader('cleaners');

router.post('/register/client', authController.registerClient);
router.post('/register/cleaner', uploadCleanerPhoto.single('photo'), authController.registerCleaner);
router.post('/login', authController.login);
router.get('/me', authenticate, authController.me);

module.exports = router;
