const Internship = require('../models/Internship');
const Application = require('../models/Application');
const Student = require('../models/Student');
const Company = require('../models/Company');

// Create internship
const createInternship = async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      duration,
      stipend,
      requiredSkills,
      minCGPA,
      startDate,
      endDate,
      positionsAvailable,
      type,
    } = req.body;

    const internship = new Internship({
      title,
      description,
      company: req.userId,
      location,
      duration,
      stipend,
      requiredSkills,
      minCGPA,
      startDate,
      endDate,
      positionsAvailable,
      type,
    });

    await internship.save();

    // Add to company's posted internships
    await Company.findByIdAndUpdate(req.userId, {
      $push: { postedInternships: internship._id },
    });

    res.status(201).json({ message: 'Internship created successfully', internship });
  } catch (err) {
    res.status(500).json({ message: 'Error creating internship', error: err.message });
  }
};

// Get all internships
const getAllInternships = async (req, res) => {
  try {
    const { status, location, skills } = req.query;
    let filter = {};

    if (status) filter.status = status;
    if (location) filter.location = new RegExp(location, 'i');
    if (skills) filter.requiredSkills = { $in: skills.split(',') };

    const internships = await Internship.find(filter)
      .populate('company', 'companyName logo location')
      .limit(50);

    res.json(internships);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching internships', error: err.message });
  }
};

// Get internship by ID
const getInternshipById = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.internshipId)
      .populate('company')
      .populate({
        path: 'applicants',
        populate: {
          path: 'student',
        },
      });

    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }

    res.json(internship);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching internship', error: err.message });
  }
};

// Update internship
const updateInternship = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.internshipId);

    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }

    if (internship.company.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const updatedInternship = await Internship.findByIdAndUpdate(
      req.params.internshipId,
      req.body,
      { new: true }
    );

    res.json({ message: 'Internship updated successfully', internship: updatedInternship });
  } catch (err) {
    res.status(500).json({ message: 'Error updating internship', error: err.message });
  }
};

// Close internship
const closeInternship = async (req, res) => {
  try {
    const internship = await Internship.findByIdAndUpdate(
      req.params.internshipId,
      { status: 'closed' },
      { new: true }
    );

    res.json({ message: 'Internship closed successfully', internship });
  } catch (err) {
    res.status(500).json({ message: 'Error closing internship', error: err.message });
  }
};

module.exports = {
  createInternship,
  getAllInternships,
  getInternshipById,
  updateInternship,
  closeInternship,
};
