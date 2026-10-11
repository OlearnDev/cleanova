const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { authenticate, authorize, optionalAuthenticate } = require('../middleware/auth');
const { makeUploader } = require('../middleware/upload');

const uploadServiceImage = makeUploader('services');

router.get('/categories', serviceController.listCategories);
router.get('/', optionalAuthenticate, serviceController.listServices);
router.get('/:id', serviceController.getService);

// Admin uniquement
router.post('/', authenticate, authorize('admin'), uploadServiceImage.single('image'), serviceController.createService);
router.put('/:id', authenticate, authorize('admin'), uploadServiceImage.single('image'), serviceController.updateService);
router.delete('/:id', authenticate, authorize('admin'), serviceController.deleteService);

module.exports = router;
