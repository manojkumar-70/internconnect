const Student = require('../models/Student');
const Company = require('../models/Company');
const Internship = require('../models/Internship');
const Application = require('../models/Application');

// Get dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const studentCount = await Student.countDocuments();
    const companyCount = await Company.countDocuments();
    const internshipCount = await Internship.countDocuments();
    const applicationCount = await Application.countDocuments();

    res.json({
      students: studentCount,
      companies: companyCount,
      internships: internshipCount,
      applications: applicationCount,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching dashboard stats', error: err.message });
  }
};

// Manage students
const manageStudents = async (req, res) => {
  try {
    const students = await Student.find().select('-password').limit(50);
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching students', error: err.message });
  }
};

// Remove student
const removeStudent = async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.studentId);
    res.json({ message: 'Student removed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error removing student', error: err.message });
  }
};

// Manage companies
const manageCompanies = async (req, res) => {
  try {
    const companies = await Company.find().select('-password').limit(50);
    res.json(companies);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching companies', error: err.message });
  }
};

// Verify/unverify company
const updateCompanyVerification = async (req, res) => {
  try {
    const { isVerified } = req.body;
    const company = await Company.findByIdAndUpdate(
      req.params.companyId,
      { isVerified },
      { new: true }
    );

    res.json({ message: 'Company verification updated', company });
  } catch (err) {
    res.status(500).json({ message: 'Error updating company', error: err.message });
  }
};

// Get application statistics
const getApplicationStats = async (req, res) => {
  try {
    const totalApplications = await Application.countDocuments();
    const pendingApplications = await Application.countDocuments({ status: 'pending' });
    const acceptedApplications = await Application.countDocuments({ status: 'accepted' });
    const rejectedApplications = await Application.countDocuments({ status: 'rejected' });

    res.json({
      total: totalApplications,
      pending: pendingApplications,
      accepted: acceptedApplications,
      rejected: rejectedApplications,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching stats', error: err.message });
  }
};

module.exports = {
  getDashboardStats,
  manageStudents,
  removeStudent,
  manageCompanies,
  updateCompanyVerification,
  getApplicationStats,
};
