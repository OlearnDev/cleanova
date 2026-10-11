const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/', authenticate, authorize('client'), bookingController.createBooking);
router.get('/me', authenticate, authorize('client'), bookingController.myBookings);
router.get('/:id', authenticate, bookingController.getBooking);
router.put('/:id/cancel', authenticate, bookingController.cancelBooking);
router.put('/:id/pay', authenticate, authorize('client'), bookingController.payBooking);

module.exports = router;
