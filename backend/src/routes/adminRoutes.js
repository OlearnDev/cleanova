const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('admin'));

router.get('/stats', adminController.getStats);

router.get('/cleaners', adminController.listCleaners);
router.put('/cleaners/:id/status', adminController.setCleanerStatus);
router.put('/cleaners/:id', adminController.updateCleanerProfile);

router.get('/clients', adminController.listClients);
router.get('/clients/:id/history', adminController.getClientHistory);
router.put('/clients/:id/active', adminController.setClientActive);

router.get('/bookings', adminController.listBookings);
router.get('/bookings/export/csv', adminController.exportBookingsCsv);
router.get('/bookings/:id/invoice', adminController.downloadInvoice);
router.put('/bookings/:id/assign', adminController.assignCleaner);
router.put('/bookings/:id/status', adminController.updateBookingStatus);

router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);
router.post('/zones', adminController.addZone);
router.delete('/zones/:id', adminController.deleteZone);
router.post('/time-slots', adminController.addTimeSlot);
router.delete('/time-slots/:id', adminController.deleteTimeSlot);

module.exports = router;
