const Rating = require('../models/Rating');
const Student = require('../models/Student');
const Company = require('../models/Company');

// Create rating
const createRating = async (req, res) => {
  try {
    const { ratee, rateeModel, rating, review, internship } = req.body;

    // Determine rater model based on user role
    const raterModel = req.userRole === 'student' ? 'Student' : 'Company';

    const newRating = new Rating({
      rater: req.userId,
      raterModel,
      ratee,
      rateeModel,
      rating,
      review,
      internship,
    });

    await newRating.save();

    // Update average rating
    const allRatings = await Rating.find({ ratee, rateeModel });
    const avgRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;

    if (rateeModel === 'Student') {
      await Student.findByIdAndUpdate(ratee, {
        rating: avgRating,
        ratingCount: allRatings.length,
      });
    } else {
      await Company.findByIdAndUpdate(ratee, {
        rating: avgRating,
        ratingCount: allRatings.length,
      });
    }

    res.status(201).json({ message: 'Rating created successfully', rating: newRating });
  } catch (err) {
    res.status(500).json({ message: 'Error creating rating', error: err.message });
  }
};

// Get ratings for a user
const getRatings = async (req, res) => {
  try {
    const { userId, userType } = req.params;

    const ratings = await Rating.find({
      ratee: userId,
      rateeModel: userType,
    })
      .populate('rater', 'name companyName')
      .sort({ createdAt: -1 });

    res.json(ratings);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching ratings', error: err.message });
  }
};

// Get user's rating summary
const getUserRatingSummary = async (req, res) => {
  try {
    const { userId, userType } = req.params;

    const user = userType === 'Student' 
      ? await Student.findById(userId).select('rating ratingCount')
      : await Company.findById(userId).select('rating ratingCount');

    res.json({
      rating: user.rating,
      ratingCount: user.ratingCount,
      averageRating: user.rating,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching rating summary', error: err.message });
  }
};

module.exports = {
  createRating,
  getRatings,
  getUserRatingSummary,
};
