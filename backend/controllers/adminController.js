const Student = require('../models/Student');
const Company = require('../models/Company');
const Internship = require('../models/Internship');
const Application = require('../models/Application');
const Interview = require('../models/Interview');

// Get dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const studentCount = await Student.countDocuments();
    const companyCount = await Company.countDocuments();
    const internshipCount = await Internship.countDocuments();
    const activeInternshipCount = await Internship.countDocuments({ status: { $in: ['open', 'in-progress'] } });
    const applicationCount = await Application.countDocuments();
    const pendingApplicationCount = await Application.countDocuments({ status: 'pending' });
    const unverifiedCompanyCount = await Company.countDocuments({ isVerified: { $ne: true } });
    const verifiedCompanyCount = await Company.countDocuments({ isVerified: true });
    const closedInternshipCount = await Internship.countDocuments({ status: { $in: ['closed', 'completed'] } });
    const notifications = [];

    if (unverifiedCompanyCount > 0) {
      notifications.push({ type: 'company-verification', count: unverifiedCompanyCount });
    }
    if (pendingApplicationCount > 0) {
      notifications.push({ type: 'application-review', count: pendingApplicationCount });
    }

    res.json({
      students: studentCount,
      companies: companyCount,
      totalInternships: internshipCount,
      internships: activeInternshipCount,
      applications: applicationCount,
      pendingActions: pendingApplicationCount + unverifiedCompanyCount,
      verifiedCompanies: verifiedCompanyCount,
      pendingCompanies: unverifiedCompanyCount,
      rejectedCompanies: 0,
      closedInternships: closedInternshipCount,
      notifications,
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

// Get one student's non-sensitive profile and related records for admins
const getStudentDetails = async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId)
      .select('-password')
      .populate('completedTasks');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const [applications, interviews] = await Promise.all([
      Application.find({ student: student._id })
        .populate({
          path: 'internship',
          populate: { path: 'company', select: 'companyName email' },
        })
        .sort({ appliedDate: -1 }),
      Interview.find({ student: student._id })
        .populate('application', 'status appliedDate')
        .sort({ scheduledAt: 1 }),
    ]);

    res.json({ student, applications, interviews });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching student details', error: err.message });
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
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const search = String(req.query.search || '').trim();
    const filter = {};
    if (req.query.status === 'verified') filter.isVerified = true;
    if (req.query.status === 'pending') filter.isVerified = false;
    if (search) filter.$or = [{ companyName: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
    const [companies, total] = await Promise.all([
      Company.find(filter).select('-password').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Company.countDocuments(filter),
    ]);
    res.json({ companies, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching companies', error: err.message });
  }
};

const manageInternships = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const search = String(req.query.search || '').trim();
    const filter = {};
    if (['open', 'in-progress', 'closed', 'completed'].includes(req.query.status)) filter.status = req.query.status;
    const query = Internship.find(filter).populate('company', 'companyName email').sort({ [req.query.sort === 'deadline' ? 'endDate' : req.query.sort === 'applicants' ? 'applicants' : 'createdAt']: req.query.direction === 'asc' ? 1 : -1 });
    let internships = await query;
    if (search) {
      const term = search.toLowerCase();
      internships = internships.filter((item) => item.title.toLowerCase().includes(term) || item.company?.companyName?.toLowerCase().includes(term));
    }
    const total = internships.length;
    internships = internships.slice((page - 1) * limit, page * limit);
    res.json({ internships, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching internships', error: err.message });
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
      shortlisted: 0,
      accepted: acceptedApplications,
      rejected: rejectedApplications,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching stats', error: err.message });
  }
};

// Get applications for administration
const manageApplications = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const filter = {};
    if (['pending', 'accepted', 'rejected'].includes(req.query.status)) filter.status = req.query.status;
    let applications = await Application.find(filter)
      .populate('student', 'name email college skills bio')
      .populate({
        path: 'internship',
        select: 'title company location',
        populate: { path: 'company', select: 'companyName email' },
      })
      .sort({ appliedDate: -1 });
    const search = String(req.query.search || '').trim().toLowerCase();
    if (search) applications = applications.filter((item) => item.student?.name?.toLowerCase().includes(search) || item.internship?.title?.toLowerCase().includes(search) || item.internship?.company?.companyName?.toLowerCase().includes(search));
    const total = applications.length;
    res.json({ applications: applications.slice((page - 1) * limit, page * limit), pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching applications', error: err.message });
  }
};

module.exports = {
  getDashboardStats,
  manageStudents,
  getStudentDetails,
  removeStudent,
  manageCompanies,
  updateCompanyVerification,
  getApplicationStats,
  manageApplications,
  manageInternships,
};
