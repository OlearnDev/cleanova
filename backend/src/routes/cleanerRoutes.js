const express = require('express');
const router = express.Router();
const cleanerController = require('../controllers/cleanerController');
const { authenticate, authorize } = require('../middleware/auth');

// Routes "me" AVANT la route generique /:id pour eviter les collisions
router.put('/me/availability', authenticate, authorize('cleaner'), cleanerController.updateMyAvailability);
router.get('/me/stats', authenticate, authorize('cleaner'), cleanerController.myStats);
router.get('/me/bookings', authenticate, authorize('cleaner'), cleanerController.myBookings);
router.put('/me/bookings/:id/respond', authenticate, authorize('cleaner'), cleanerController.respondToBooking);

router.get('/', cleanerController.listCleaners);
router.get('/:id', cleanerController.getCleaner);

module.exports = router;
