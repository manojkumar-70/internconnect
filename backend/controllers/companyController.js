const Company = require('../models/Company');

// Get company profile
const getCompanyProfile = async (req, res) => {
  try {
    const company = await Company.findById(req.userId).select('-password');
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    res.json(company);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching profile', error: err.message });
  }
};

// Update company profile
const updateCompanyProfile = async (req, res) => {
  try {
    const { description, logo, phone, website } = req.body;
    const company = await Company.findByIdAndUpdate(
      req.userId,
      { description, logo, phone, website },
      { new: true }
    ).select('-password');

    res.json({ message: 'Profile updated successfully', company });
  } catch (err) {
    res.status(500).json({ message: 'Error updating profile', error: err.message });
  }
};

// Get all companies (admin only)
const getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find().select('-password').limit(100);
    res.json(companies);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching companies', error: err.message });
  }
};

// Get company internships
const getCompanyInternships = async (req, res) => {
  try {
    const company = await Company.findById(req.userId).populate('postedInternships');
    res.json(company.postedInternships);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching internships', error: err.message });
  }
};

// Verify company
const verifyCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(
      req.params.companyId,
      { isVerified: true },
      { new: true }
    );
    res.json({ message: 'Company verified successfully', company });
  } catch (err) {
    res.status(500).json({ message: 'Error verifying company', error: err.message });
  }
};

module.exports = {
  getCompanyProfile,
  updateCompanyProfile,
  getAllCompanies,
  getCompanyInternships,
  verifyCompany,
};
