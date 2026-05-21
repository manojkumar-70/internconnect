const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const { auth } = require('../middleware/auth');

router.post('/', auth, ratingController.createRating);
router.get('/:userId/:userType', ratingController.getRatings);
router.get('/:userId/:userType/summary', ratingController.getUserRatingSummary);

module.exports = router;
