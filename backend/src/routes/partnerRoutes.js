const express = require('express');
const router = express.Router();
const partnerController = require('../controllers/partnerController');
const { authenticate, authorize, optionalAuthenticate } = require('../middleware/auth');
const { makeUploader } = require('../middleware/upload');

const uploadLogo = makeUploader('partners');

router.get('/', optionalAuthenticate, partnerController.listPartners);
router.post('/', authenticate, authorize('admin'), uploadLogo.single('logo'), partnerController.createPartner);
router.put('/:id', authenticate, authorize('admin'), uploadLogo.single('logo'), partnerController.updatePartner);
router.delete('/:id', authenticate, authorize('admin'), partnerController.deletePartner);

module.exports = router;
