import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';
import '../styles/Auth.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('student');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    college: '',
    cgpa: '',
    skills: '',
    companyName: '',
    industry: '',
    location: '',
    website: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};

    // Common validations
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Student-specific validations
    if (userType === 'student') {
      if (!formData.college.trim()) {
        newErrors.college = 'College name is required';
      }

      if (!formData.cgpa) {
        newErrors.cgpa = 'CGPA is required';
      } else {
        const cgpaNum = parseFloat(formData.cgpa);
        if (isNaN(cgpaNum) || cgpaNum < 0 || cgpaNum > 10) {
          newErrors.cgpa = 'CGPA must be between 0 and 10';
        }
      }

      if (!formData.skills.trim()) {
        newErrors.skills = 'Please add at least one skill';
      }
    }

    // Company-specific validations
    if (userType === 'company') {
      if (!formData.companyName.trim()) {
        newErrors.companyName = 'Company name is required';
      }

      if (!formData.industry.trim()) {
        newErrors.industry = 'Industry is required';
      }

      if (!formData.location.trim()) {
        newErrors.location = 'Location is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      let data, response;

      if (userType === 'student') {
        data = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          college: formData.college,
          cgpa: parseFloat(formData.cgpa),
          skills: formData.skills.split(',').map((s) => s.trim()),
        };
        response = await authAPI.registerStudent(data);
      } else {
        data = {
          name: formData.companyName,
          email: formData.email,
          password: formData.password,
          industry: formData.industry,
          location: formData.location,
          website: formData.website || '',
        };
        response = await authAPI.registerCompany(data);
      }

      toast.success('Registration successful! Please log in.');
      navigate('/login');
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page register-page">
      <div className="auth-wrapper">
        {/* Left Side - Form */}
        <div className="auth-form-section">
          <div className="auth-logo">
            <h2>InternConnect</h2>
          </div>

          <div className="auth-card">
            <div className="auth-header">
              <h1>Create Account</h1>
              <p>Join InternConnect and start your journey today.</p>
            </div>

            {/* User Type Tabs */}
            <div className="user-type-tabs">
              <button
                type="button"
                className={`tab-btn ${userType === 'student' ? 'active' : ''}`}
                onClick={() => setUserType('student')}
              >
                Student
              </button>
              <button
                type="button"
                className={`tab-btn ${userType === 'company' ? 'active' : ''}`}
                onClick={() => setUserType('company')}
              >
                Company
              </button>
            </div>

            <form onSubmit={handleSubmit} className="auth-form register-form">
              {/* Name Field */}
              <div className="form-group">
                <label htmlFor="name">
                  {userType === 'student' ? 'Full Name' : 'Company Name'}
                </label>
                <input
                  type="text"
                  id="name"
                  name={userType === 'student' ? 'name' : 'companyName'}
                  value={userType === 'student' ? formData.name : formData.companyName}
                  onChange={handleChange}
                  placeholder={
                    userType === 'student'
                      ? 'Enter your full name'
                      : 'Enter company name'
                  }
                  className={`form-input ${
                    errors[userType === 'student' ? 'name' : 'companyName']
                      ? 'input-error'
                      : ''
                  }`}
                  disabled={loading}
                />
                {errors[userType === 'student' ? 'name' : 'companyName'] && (
                  <span className="error-message">
                    {errors[userType === 'student' ? 'name' : 'companyName']}
                  </span>
                )}
              </div>

              {/* Email Field */}
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@university.edu"
                  className={`form-input ${errors.email ? 'input-error' : ''}`}
                  disabled={loading}
                />
                {errors.email && (
                  <span className="error-message">{errors.email}</span>
                )}
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                    className={`form-input ${
                      errors.password ? 'input-error' : ''
                    }`}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="password-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {errors.password && (
                  <span className="error-message">{errors.password}</span>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className={`form-input ${
                      errors.confirmPassword ? 'input-error' : ''
                    }`}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="password-eye-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex="-1"
                    aria-label="Toggle password visibility"
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="error-message">
                    {errors.confirmPassword}
                  </span>
                )}
              </div>

              {/* Student-Specific Fields */}
              {userType === 'student' && (
                <>
                  <div className="form-group">
                    <label htmlFor="college">College Name</label>
                    <input
                      type="text"
                      id="college"
                      name="college"
                      value={formData.college}
                      onChange={handleChange}
                      placeholder="Enter your college name"
                      className={`form-input ${
                        errors.college ? 'input-error' : ''
                      }`}
                      disabled={loading}
                    />
                    {errors.college && (
                      <span className="error-message">{errors.college}</span>
                    )}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="cgpa">CGPA</label>
                      <input
                        type="number"
                        id="cgpa"
                        name="cgpa"
                        value={formData.cgpa}
                        onChange={handleChange}
                        placeholder="0.0 - 10.0"
                        min="0"
                        max="10"
                        step="0.01"
                        className={`form-input ${
                          errors.cgpa ? 'input-error' : ''
                        }`}
                        disabled={loading}
                      />
                      {errors.cgpa && (
                        <span className="error-message">{errors.cgpa}</span>
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="skills">Skills (comma-separated)</label>
                    <textarea
                      id="skills"
                      name="skills"
                      value={formData.skills}
                      onChange={handleChange}
                      placeholder="e.g., React, Node.js, Python, Data Analysis"
                      className={`form-input textarea ${
                        errors.skills ? 'input-error' : ''
                      }`}
                      rows="3"
                      disabled={loading}
                    />
                    {errors.skills && (
                      <span className="error-message">{errors.skills}</span>
                    )}
                  </div>
                </>
              )}

              {/* Company-Specific Fields */}
              {userType === 'company' && (
                <>
                  <div className="form-group">
                    <label htmlFor="industry">Industry</label>
                    <input
                      type="text"
                      id="industry"
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
                      placeholder="e.g., Technology, Finance, Healthcare"
                      className={`form-input ${
                        errors.industry ? 'input-error' : ''
                      }`}
                      disabled={loading}
                    />
                    {errors.industry && (
                      <span className="error-message">{errors.industry}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="location">Location</label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="City, Country"
                      className={`form-input ${
                        errors.location ? 'input-error' : ''
                      }`}
                      disabled={loading}
                    />
                    {errors.location && (
                      <span className="error-message">{errors.location}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="website">Website (Optional)</label>
                    <input
                      type="url"
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="https://yourcompany.com"
                      className="form-input"
                      disabled={loading}
                    />
                  </div>
                </>
              )}

              {/* Submit Error */}
              {errors.submit && (
                <div className="error-alert">
                  <span>{errors.submit}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="submit-btn"
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Create Account'}
                {!loading && <span className="btn-arrow">→</span>}
              </button>
            </form>

            {/* Login Link */}
            <div className="auth-footer">
              <p>
                Already have an account?{' '}
                <Link to="/login" className="auth-link">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Promo Card */}
        <div className="auth-promo-section">
          <div className="promo-card">
            <div className="promo-icon">🚀</div>
            <h2>Build Your Future Today</h2>
            <p>Connect with companies seeking talented individuals and advance your career with real opportunities.</p>
            <div className="promo-stats">
              <div className="stat">
                <div className="stat-number">12k+</div>
                <div className="stat-label">STUDENTS</div>
              </div>
              <div className="stat">
                <div className="stat-number">500+</div>
                <div className="stat-label">COMPANIES</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
