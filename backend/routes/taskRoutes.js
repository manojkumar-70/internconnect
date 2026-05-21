const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { auth, companyAuth, studentAuth } = require('../middleware/auth');

router.post('/', auth, companyAuth, taskController.createTask);
router.get('/', taskController.getAllTasks);
router.get('/:taskId', taskController.getTaskById);
router.post('/:taskId/submit', auth, studentAuth, taskController.submitTask);
router.put('/:taskId/submission/:submissionId/review', auth, companyAuth, taskController.reviewSubmission);

module.exports = router;
