const Team = require('../models/Team');
const Student = require('../models/Student');
const Internship = require('../models/Internship');

// Create team
const createTeam = async (req, res) => {
  try {
    const { name, description, members, internshipId } = req.body;

    // Calculate match score based on complementary skills
    const studentDocs = await Student.find({ _id: { $in: members } });
    const allSkills = studentDocs.reduce((acc, student) => {
      return [...new Set([...acc, ...student.skills])];
    }, []);

    const team = new Team({
      name,
      description,
      members,
      company: req.userId,
      internship: internshipId,
      complementarySkills: allSkills,
      matchScore: calculateMatchScore(studentDocs),
    });

    await team.save();

    res.status(201).json({ message: 'Team created successfully', team });
  } catch (err) {
    res.status(500).json({ message: 'Error creating team', error: err.message });
  }
};

// Get all teams
const getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find()
      .populate('members', 'name skills')
      .populate('company', 'companyName')
      .populate('internship', 'title');

    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching teams', error: err.message });
  }
};

// Get company teams
const getCompanyTeams = async (req, res) => {
  try {
    const teams = await Team.find({ company: req.userId })
      .populate('members', 'name skills')
      .populate('internship', 'title');

    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching teams', error: err.message });
  }
};

// Accept team proposal
const acceptTeam = async (req, res) => {
  try {
    const team = await Team.findByIdAndUpdate(
      req.params.teamId,
      { status: 'accepted' },
      { new: true }
    );

    res.json({ message: 'Team accepted', team });
  } catch (err) {
    res.status(500).json({ message: 'Error accepting team', error: err.message });
  }
};

// Calculate match score based on skill complementarity
const calculateMatchScore = (students) => {
  if (students.length === 0) return 0;

  let score = 0;

  // Check skill diversity
  const allSkills = students.reduce((acc, student) => {
    return [...new Set([...acc, ...student.skills])];
  }, []);

  const avgSkillsPerStudent = allSkills.length / students.length;
  score += Math.min(avgSkillsPerStudent * 20, 50);

  // Check CGPA average
  const avgCGPA = students.reduce((sum, s) => sum + s.cgpa, 0) / students.length;
  score += (avgCGPA / 10) * 50;

  return Math.min(score, 100);
};

module.exports = {
  createTeam,
  getAllTeams,
  getCompanyTeams,
  acceptTeam,
  calculateMatchScore,
};
