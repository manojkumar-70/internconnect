const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { auth, studentAuth } = require('../middleware/auth');

router.get('/profile', auth, studentController.getStudentProfile);
router.put('/profile', auth, studentController.updateStudentProfile);
router.get('/all', auth, studentController.getAllStudents);
router.get('/search', auth, studentController.searchStudentsBySkills);
router.get('/applications', auth, studentController.getStudentApplications);

module.exports = router;
