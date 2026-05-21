const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { auth, studentAuth, companyAuth } = require('../middleware/auth');

router.post('/', auth, studentAuth, applicationController.applyForInternship);
router.get('/student/applications', auth, applicationController.getStudentApplications);
router.get('/:internshipId/applications', auth, companyAuth, applicationController.getInternshipApplications);
router.put('/:appId/accept', auth, companyAuth, applicationController.acceptApplication);
router.put('/:appId/reject', auth, companyAuth, applicationController.rejectApplication);

module.exports = router;
