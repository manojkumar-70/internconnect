const Student = require('../models/Student');

// Get student profile
const getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.userId).select('-password');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching profile', error: err.message });
  }
};

// Update student profile
const updateStudentProfile = async (req, res) => {
  try {
    const {
      name,
      bio,
      interests,
      skills,
      phone,
      profilePicture,
      resume,
      linkedin,
      portfolio,
      twitter,
    } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (interests !== undefined) updateData.bio = interests;
    if (skills !== undefined) updateData.skills = Array.isArray(skills)
      ? skills
      : typeof skills === 'string' && skills.length
      ? skills.split(',').map((skill) => skill.trim())
      : [];
    if (phone !== undefined) updateData.phone = phone;
    if (profilePicture !== undefined) updateData.profilePicture = profilePicture;
    if (resume !== undefined) updateData.resume = resume;
    if (linkedin !== undefined) updateData.linkedin = linkedin;
    if (portfolio !== undefined) updateData.portfolio = portfolio;
    if (twitter !== undefined) updateData.twitter = twitter;

    const student = await Student.findByIdAndUpdate(
      req.userId,
      updateData,
      { new: true }
    ).select('-password');

    res.json({ message: 'Profile updated successfully', student });
  } catch (err) {
    res.status(500).json({ message: 'Error updating profile', error: err.message });
  }
};

// Get all students (admin only)
const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().select('-password').limit(100);
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching students', error: err.message });
  }
};

// Search students by skills
const searchStudentsBySkills = async (req, res) => {
  try {
    const { skills } = req.query;
    const skillArray = skills ? skills.split(',') : [];

    const students = await Student.find({
      skills: { $in: skillArray },
    }).select('-password');

    res.json(students);
  } catch (err) {
    res.status(500).json({ message: 'Error searching students', error: err.message });
  }
};

// Get student applications
const getStudentApplications = async (req, res) => {
  try {
    const student = await Student.findById(req.userId).populate('appliedInternships');
    res.json(student.appliedInternships);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching applications', error: err.message });
  }
};

module.exports = {
  getStudentProfile,
  updateStudentProfile,
  getAllStudents,
  searchStudentsBySkills,
  getStudentApplications,
};
