const Student = require('../models/Student');
const Company = require('../models/Company');
const Admin = require('../models/Admin');
const { generateToken } = require('../utils/jwtUtils');
const { validateEmail, validatePassword } = require('../utils/validators');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback'
);
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
const authSecret = () => process.env.JWT_SECRET || 'your_jwt_secret_key';
const setAuthCookie = (res, name, value, maxAge) => {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  const cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; HttpOnly; SameSite=Lax${secure}`;
  const existing = res.getHeader('Set-Cookie');
  res.setHeader('Set-Cookie', existing ? [...(Array.isArray(existing) ? existing : [existing]), cookie] : [cookie]);
};
const clearAuthCookie = (res, name) => setAuthCookie(res, name, '', 0);
const readCookie = (req, name) => {
  const entry = String(req.headers.cookie || '').split(';').find((cookie) => cookie.trim().startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.trim().slice(name.length + 1)) : null;
};
const signGoogleData = (data, expiresIn = '5m') => jwt.sign(data, authSecret(), { expiresIn });
const verifyGoogleData = (token) => {
  const data = jwt.verify(token, authSecret());
  if (data.type !== 'google-handoff') throw new Error('Invalid Google handoff');
  return data;
};
const publicUser = (account, role) => ({ id: account._id, name: account.name, email: account.email, role });

const googleStart = (req, res) => {
  const role = req.query.role;
  if (!['student', 'company'].includes(role)) return res.status(400).json({ message: 'Choose Student or Company before using Google sign-in.' });
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) return res.status(503).json({ message: 'Google sign-in is not configured.' });
  const state = signGoogleData({ type: 'google-state', role, nonce: crypto.randomBytes(16).toString('hex') });
  return res.redirect(googleClient.generateAuthUrl({ scope: ['openid', 'email', 'profile'], response_type: 'code', state, prompt: 'select_account' }));
};

const googleCallback = async (req, res) => {
  try {
    const state = jwt.verify(req.query.state, authSecret());
    if (state.type !== 'google-state' || !['student', 'company'].includes(state.role)) throw new Error('Invalid Google state');
    const { tokens } = await googleClient.getToken(req.query.code);
    const ticket = await googleClient.verifyIdToken({ idToken: tokens.id_token, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    if (!payload?.sub || !payload.email || payload.email_verified !== true) throw new Error('Google email is not verified');
    setAuthCookie(res, 'google_handoff', signGoogleData({ type: 'google-handoff', role: state.role, googleId: payload.sub, email: payload.email.toLowerCase(), name: payload.name || payload.email, picture: payload.picture || null }), 300);
    return res.redirect(`${frontendUrl}/auth/google/callback`);
  } catch (err) {
    return res.redirect(`${frontendUrl}/login?googleError=${encodeURIComponent('Google sign-in could not be completed.')}`);
  }
};

const exchangeGoogle = async (req, res) => {
  try {
    const handoff = verifyGoogleData(readCookie(req, 'google_handoff'));
    clearAuthCookie(res, 'google_handoff');
    const [studentAccount, companyAccount] = await Promise.all([
      Student.findOne({ email: handoff.email }),
      Company.findOne({ email: handoff.email }),
    ]);
    const account = studentAccount || companyAccount;
    if (account) {
      const role = studentAccount ? 'student' : 'company';
      if (!account.googleId) { account.googleId = handoff.googleId; await account.save(); }
      return res.json({ token: generateToken(account._id, role), user: publicUser(account, role) });
    }
    setAuthCookie(res, 'google_signup', signGoogleData(handoff, '10m'), 600);
    return res.json({ requiresRegistration: true, role: handoff.role, google: { email: handoff.email, name: handoff.name, picture: handoff.picture } });
  } catch (err) {
    clearAuthCookie(res, 'google_handoff');
    return res.status(400).json({ message: 'Google sign-in session expired. Please try again.' });
  }
};

const completeGoogleRegistration = async (req, res) => {
  try {
    const handoff = verifyGoogleData(readCookie(req, 'google_signup'));
    const existingStudent = await Student.findOne({ email: handoff.email });
    const existingCompany = await Company.findOne({ email: handoff.email });
    if (existingStudent || existingCompany) return res.status(409).json({ message: 'An account with this email already exists. Sign in again with Google.' });
    const generatedPassword = crypto.randomBytes(32).toString('hex');
    const Model = handoff.role === 'student' ? Student : Company;
    const account = new Model(handoff.role === 'student'
      ? { name: handoff.name, email: handoff.email, password: generatedPassword, college: req.body.college, cgpa: req.body.cgpa, skills: req.body.skills || [], googleId: handoff.googleId }
      : { name: req.body.name || handoff.name, email: handoff.email, password: generatedPassword, companyName: req.body.companyName, industry: req.body.industry, location: req.body.location, website: req.body.website || '', googleId: handoff.googleId });
    await account.save();
    clearAuthCookie(res, 'google_signup');
    return res.status(201).json({ token: generateToken(account._id, handoff.role), user: publicUser(account, handoff.role) });
  } catch (err) {
    return res.status(400).json({ message: err.message || 'Unable to complete Google registration.' });
  }
};

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
  googleStart,
  googleCallback,
  exchangeGoogle,
  completeGoogleRegistration,
};
