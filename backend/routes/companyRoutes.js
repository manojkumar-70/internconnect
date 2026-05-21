const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { auth, companyAuth, adminAuth } = require('../middleware/auth');

router.get('/profile', auth, companyController.getCompanyProfile);
router.put('/profile', auth, companyController.updateCompanyProfile);
router.get('/all', auth, companyController.getAllCompanies);
router.get('/internships', auth, companyController.getCompanyInternships);
router.put('/verify/:companyId', auth, adminAuth, companyController.verifyCompany);

module.exports = router;
