const express = require('express');
const router = express.Router();
const internshipController = require('../controllers/internshipController');
const { auth, companyAuth } = require('../middleware/auth');

router.post('/', auth, companyAuth, internshipController.createInternship);
router.get('/', internshipController.getAllInternships);
router.get('/:internshipId', internshipController.getInternshipById);
router.put('/:internshipId', auth, companyAuth, internshipController.updateInternship);
router.put('/:internshipId/close', auth, companyAuth, internshipController.closeInternship);

module.exports = router;
