const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/student/register', authController.registerStudent);
router.post('/student/login', authController.loginStudent);
router.post('/company/register', authController.registerCompany);
router.post('/company/login', authController.loginCompany);
router.post('/admin/login', authController.loginAdmin);
router.get('/google', authController.googleStart);
router.get('/google/callback', authController.googleCallback);
router.post('/google/exchange', authController.exchangeGoogle);
router.post('/google/complete-registration', authController.completeGoogleRegistration);

module.exports = router;
