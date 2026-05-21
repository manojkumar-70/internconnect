const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/student/register', authController.registerStudent);
router.post('/student/login', authController.loginStudent);
router.post('/company/register', authController.registerCompany);
router.post('/company/login', authController.loginCompany);
router.post('/admin/login', authController.loginAdmin);

module.exports = router;
