const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/', authenticate, authorize('client'), reviewController.createReview);
router.get('/cleaner/:cleanerId', reviewController.listReviewsForCleaner);
router.put('/:id/moderate', authenticate, authorize('admin'), reviewController.moderateReview);

module.exports = router;
