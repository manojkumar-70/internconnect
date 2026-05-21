const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No authorization token, access denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const adminAuth = (req, res, next) => {
  auth(req, res, () => {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Only admins can access this resource' });
    }
    next();
  });
};

const companyAuth = (req, res, next) => {
  auth(req, res, () => {
    if (req.userRole !== 'company') {
      return res.status(403).json({ message: 'Only companies can access this resource' });
    }
    next();
  });
};

const studentAuth = (req, res, next) => {
  auth(req, res, () => {
    if (req.userRole !== 'student') {
      return res.status(403).json({ message: 'Only students can access this resource' });
    }
    next();
  });
};

module.exports = { auth, adminAuth, companyAuth, studentAuth };
