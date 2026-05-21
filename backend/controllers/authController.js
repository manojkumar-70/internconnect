const Student = require('../models/Student');
const Company = require('../models/Company');
const Admin = require('../models/Admin');
const { generateToken } = require('../utils/jwtUtils');
const { validateEmail, validatePassword } = require('../utils/validators');

// Student Registration
const registerStudent = async (req, res) => {
  try {
    console.log('📝 REGISTER STUDENT - Request received:', req.body);
    const { name, email, password, college, cgpa, skills, resume } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    
    console.log('📝 Normalized Email:', normalizedEmail);

    // Validation
    if (!validateEmail(normalizedEmail)) {
      console.log('❌ Invalid email format:', normalizedEmail);
      return res.status(400).json({ message: 'Invalid email format' });
    }
    if (!validatePassword(password)) {
      console.log('❌ Invalid password - must be at least 8 characters');
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    // Check if student already exists
    console.log('🔍 Checking if student exists with email:', normalizedEmail);
    let student = await Student.findOne({ email: normalizedEmail });
    if (student) {
      console.log('❌ Student already registered:', normalizedEmail);
      return res.status(400).json({ message: 'Student already registered' });
    }

    // Create new student
    console.log('✨ Creating new student with email:', normalizedEmail);
    student = new Student({
      name,
      email: normalizedEmail,
      password,
      college,
      cgpa,
      skills: skills || [],
      resume,
    });

    console.log('💾 Saving student to database...');
    const savedStudent = await student.save();
    console.log('✅ Student saved successfully:', savedStudent._id);

    const token = generateToken(savedStudent._id, 'student');
    console.log('🔑 JWT Token generated');
    
    res.status(201).json({
      message: 'Student registered successfully',
      token,
      student: {
        id: savedStudent._id,
        name: savedStudent.name,
        email: savedStudent.email,
        role: 'student',
      },
    });
  } catch (err) {
    console.error('❌ Registration error:', err);
    res.status(500).json({ message: 'Error registering student', error: err.message });
  }
};

// Student Login
const loginStudent = async (req, res) => {
  try {
    console.log('🔐 LOGIN STUDENT - Request received:', { email: req.body.email, password: '***' });
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    
    console.log('🔐 Normalized Email:', normalizedEmail);

    // Validation
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find student
    console.log('🔍 Querying database for student with email:', normalizedEmail);
    const student = await Student.findOne({ email: normalizedEmail });
    
    if (!student) {
      console.log('❌ No student found with email:', normalizedEmail);
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    
    console.log('✅ Student found:', student._id);
    console.log('🔐 Student password hash in DB:', student.password.substring(0, 20) + '...');

    // Check password
    console.log('🔐 Comparing password...');
    const isMatch = await student.comparePassword(password);
    console.log('🔐 Password match result:', isMatch);
    
    if (!isMatch) {
      console.log('❌ Password does not match');
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    console.log('✅ Password matches!');
    const token = generateToken(student._id, 'student');
    console.log('🔑 JWT Token generated');
    
    res.json({
      message: 'Login successful',
      token,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        role: 'student',
      },
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ message: 'Error logging in', error: err.message });
  }
};

// Company Registration
const registerCompany = async (req, res) => {
  try {
    console.log('📝 REGISTER COMPANY - Request received:', req.body);
    const { name, email, password, companyName, industry, location, website } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    
    console.log('📝 Normalized Email:', normalizedEmail);

    // Validation
    if (!validateEmail(normalizedEmail)) {
      console.log('❌ Invalid email format:', normalizedEmail);
      return res.status(400).json({ message: 'Invalid email format' });
    }
    if (!validatePassword(password)) {
      console.log('❌ Invalid password - must be at least 8 characters');
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    // Check if company already exists
    console.log('🔍 Checking if company exists with email:', normalizedEmail);
    let company = await Company.findOne({ email: normalizedEmail });
    if (company) {
      console.log('❌ Company already registered:', normalizedEmail);
      return res.status(400).json({ message: 'Company already registered' });
    }

    // Create new company
    console.log('✨ Creating new company with email:', normalizedEmail);
    company = new Company({
      name,
      email: normalizedEmail,
      password,
      companyName,
      industry,
      location,
      website,
    });

    console.log('💾 Saving company to database...');
    const savedCompany = await company.save();
    console.log('✅ Company saved successfully:', savedCompany._id);

    const token = generateToken(savedCompany._id, 'company');
    console.log('🔑 JWT Token generated');
    
    res.status(201).json({
      message: 'Company registered successfully',
      token,
      company: {
        id: savedCompany._id,
        name: savedCompany.name,
        email: savedCompany.email,
        role: 'company',
      },
    });
  } catch (err) {
    console.error('❌ Registration error:', err);
    res.status(500).json({ message: 'Error registering company', error: err.message });
  }
};

// Company Login
const loginCompany = async (req, res) => {
  try {
    console.log('🔐 LOGIN COMPANY - Request received:', { email: req.body.email, password: '***' });
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    
    console.log('🔐 Normalized Email:', normalizedEmail);

    // Validation
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find company
    console.log('🔍 Querying database for company with email:', normalizedEmail);
    const company = await Company.findOne({ email: normalizedEmail });
    
    if (!company) {
      console.log('❌ No company found with email:', normalizedEmail);
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    
    console.log('✅ Company found:', company._id);
    console.log('🔐 Company password hash in DB:', company.password.substring(0, 20) + '...');

    // Check password
    console.log('🔐 Comparing password...');
    const isMatch = await company.comparePassword(password);
    console.log('🔐 Password match result:', isMatch);
    
    if (!isMatch) {
      console.log('❌ Password does not match');
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    console.log('✅ Password matches!');
    const token = generateToken(company._id, 'company');
    console.log('🔑 JWT Token generated');
    
    res.json({
      message: 'Login successful',
      token,
      company: {
        id: company._id,
        name: company.name,
        email: company.email,
        role: 'company',
      },
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ message: 'Error logging in', error: err.message });
  }
};

// Admin Login
const loginAdmin = async (req, res) => {
  try {
    console.log('🔐 LOGIN ADMIN - Request received:', { email: req.body.email, password: '***' });
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    
    console.log('🔐 Normalized Email:', normalizedEmail);

    // Validation
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find admin
    console.log('🔍 Querying database for admin with email:', normalizedEmail);
    const admin = await Admin.findOne({ email: normalizedEmail });
    
    if (!admin) {
      console.log('❌ No admin found with email:', normalizedEmail);
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    
    console.log('✅ Admin found:', admin._id);
    console.log('🔐 Admin password hash in DB:', admin.password.substring(0, 20) + '...');

    // Check password
    console.log('🔐 Comparing password...');
    const isMatch = await admin.comparePassword(password);
    console.log('🔐 Password match result:', isMatch);
    
    if (!isMatch) {
      console.log('❌ Password does not match');
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    console.log('✅ Password matches!');
    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    const token = generateToken(admin._id, 'admin');
    console.log('🔑 JWT Token generated');
    
    res.json({
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: 'admin',
      },
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ message: 'Error logging in', error: err.message });
  }
};

module.exports = {
  registerStudent,
  loginStudent,
  registerCompany,
  loginCompany,
  loginAdmin,
};
