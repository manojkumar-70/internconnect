const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { auth, adminAuth } = require('../middleware/auth');

router.get('/stats', auth, adminAuth, adminController.getDashboardStats);
router.get('/students', auth, adminAuth, adminController.manageStudents);
router.delete('/students/:studentId', auth, adminAuth, adminController.removeStudent);
router.get('/companies', auth, adminAuth, adminController.manageCompanies);
router.put('/companies/:companyId/verify', auth, adminAuth, adminController.updateCompanyVerification);
router.get('/applications/stats', auth, adminAuth, adminController.getApplicationStats);

module.exports = router;
