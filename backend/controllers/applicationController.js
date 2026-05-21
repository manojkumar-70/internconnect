const Application = require('../models/Application');
const Student = require('../models/Student');
const Internship = require('../models/Internship');

// Apply for internship
const applyForInternship = async (req, res) => {
  try {
    const { internshipId, coverLetter } = req.body;

    // Check if student already applied
    const existingApp = await Application.findOne({
      student: req.userId,
      internship: internshipId,
    });

    if (existingApp) {
      return res.status(400).json({ message: 'Already applied for this internship' });
    }

    // Create application
    const application = new Application({
      internship: internshipId,
      student: req.userId,
      coverLetter,
    });

    await application.save();

    // Add to student's applied internships
    await Student.findByIdAndUpdate(req.userId, {
      $push: { appliedInternships: internshipId },
    });

    // Add to internship's applicants
    await Internship.findByIdAndUpdate(internshipId, {
      $push: { applicants: application._id },
    });

    res.status(201).json({ message: 'Application submitted successfully', application });
  } catch (err) {
    res.status(500).json({ message: 'Error applying for internship', error: err.message });
  }
};

// Get student applications
const getStudentApplications = async (req, res) => {
  try {
    const applications = await Application.find({ student: req.userId }).populate('internship');
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching applications', error: err.message });
  }
};

// Get internship applications (company only)
const getInternshipApplications = async (req, res) => {
  try {
    const applications = await Application.find({
      internship: req.params.internshipId,
    }).populate('student');

    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching applications', error: err.message });
  }
};

// Accept application
const acceptApplication = async (req, res) => {
  try {
    const application = await Application.findByIdAndUpdate(
      req.params.appId,
      { status: 'accepted' },
      { new: true }
    );

    // Add student to internship's selected students
    await Internship.findByIdAndUpdate(application.internship, {
      $push: { selectedStudents: application.student },
    });

    res.json({ message: 'Application accepted', application });
  } catch (err) {
    res.status(500).json({ message: 'Error accepting application', error: err.message });
  }
};

// Reject application
const rejectApplication = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const application = await Application.findByIdAndUpdate(
      req.params.appId,
      { status: 'rejected', rejectionReason },
      { new: true }
    );

    res.json({ message: 'Application rejected', application });
  } catch (err) {
    res.status(500).json({ message: 'Error rejecting application', error: err.message });
  }
};

module.exports = {
  applyForInternship,
  getStudentApplications,
  getInternshipApplications,
  acceptApplication,
  rejectApplication,
};
