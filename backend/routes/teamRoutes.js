const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { auth, companyAuth } = require('../middleware/auth');

router.post('/', auth, companyAuth, teamController.createTeam);
router.get('/', teamController.getAllTeams);
router.get('/company/teams', auth, companyAuth, teamController.getCompanyTeams);
router.put('/:teamId/accept', auth, companyAuth, teamController.acceptTeam);

module.exports = router;
