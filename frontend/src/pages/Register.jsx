import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';
import '../styles/Auth.css';

const Register = () => {
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
      // Show first error field
      const firstError = Object.values(errors).find(error => error);
      toast.error(firstError || 'Please fix the errors in the form');
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
        console.log('📝 Registering student with data:', data);
        response = await authAPI.registerStudent(data);
        console.log('✅ Student registration successful:', response);
      } else {
        data = {
          name: formData.companyName,
          email: formData.email,
          password: formData.password,
          industry: formData.industry,
          location: formData.location,
          website: formData.website || '',
        };
        console.log('📝 Registering company with data:', data);
        response = await authAPI.registerCompany(data);
        console.log('✅ Company registration successful:', response);
      }

      toast.success('Registration successful! Please log in.');
      navigate('/login');
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Registration failed. Please try again.';
      console.error('❌ Registration error:', error.response?.data || error);
      toast.error(errorMessage);
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Form Section - Left */}
      <div className="auth-form-section">
        <div className="auth-form-wrapper">
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join InternConnect and start your internship journey today.</p>

          {/* Role Selector */}
          <div className="role-selector">
            <button
              type="button"
              className={`role-btn ${userType === 'student' ? 'active' : ''}`}
              onClick={() => setUserType('student')}
            >
              Student
            </button>
            <button
              type="button"
              className={`role-btn ${userType === 'company' ? 'active' : ''}`}
              onClick={() => setUserType('company')}
            >
              Company
            </button>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit}>
            {/* Name Field */}
            <div className="form-group">
              <label>{userType === 'student' ? 'Full Name' : 'Company Name'}</label>
              <input
                type="text"
                name={userType === 'student' ? 'name' : 'companyName'}
                value={userType === 'student' ? formData.name : formData.companyName}
                onChange={handleChange}
                placeholder={
                  userType === 'student'
                    ? 'Enter your full name'
                    : 'Enter company name'
                }
                disabled={loading}
              />
              {errors[userType === 'student' ? 'name' : 'companyName'] && (
                <span style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                  {errors[userType === 'student' ? 'name' : 'companyName']}
                </span>
              )}
            </div>

            {/* Email Field */}
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={
                  userType === 'student' ? 'you@university.edu' : 'contact@company.com'
                }
                disabled={loading}
              />
              {errors.email && (
                <span style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                  {errors.email}
                </span>
              )}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label>Password</label>
              <div className="password-input-group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.password && (
                <span style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                  {errors.password}
                </span>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="form-group">
              <label>Confirm Password</label>
              <div className="password-input-group">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.confirmPassword && (
                <span style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                  {errors.confirmPassword}
                </span>
              )}
            </div>

            {/* Student-Specific Fields */}
            {userType === 'student' && (
              <>
                <div className="form-group">
                  <label>College/University</label>
                  <input
                    type="text"
                    name="college"
                    value={formData.college}
                    onChange={handleChange}
                    placeholder="Name of your college"
                    disabled={loading}
                  />
                  {errors.college && (
                    <span style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                      {errors.college}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label>CGPA (0-10)</label>
                  <input
                    type="number"
                    name="cgpa"
                    value={formData.cgpa}
                    onChange={handleChange}
                    placeholder="e.g., 8.5"
                    step="0.1"
                    min="0"
                    max="10"
                    disabled={loading}
                  />
                  {errors.cgpa && (
                    <span style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                      {errors.cgpa}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label>Skills (comma-separated)</label>
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    placeholder="e.g., Python, React, JavaScript"
                    disabled={loading}
                  />
                  {errors.skills && (
                    <span style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                      {errors.skills}
                    </span>
                  )}
                </div>
              </>
            )}

            {/* Company-Specific Fields */}
            {userType === 'company' && (
              <>
                <div className="form-group">
                  <label>Industry</label>
                  <input
                    type="text"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    placeholder="e.g., Technology, Finance"
                    disabled={loading}
                  />
                  {errors.industry && (
                    <span style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                      {errors.industry}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="City, Country"
                    disabled={loading}
                  />
                  {errors.location && (
                    <span style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                      {errors.location}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label>Website (Optional)</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://yourcompany.com"
                    disabled={loading}
                  />
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-primary btn-login"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Footer */}
          <div className="auth-footer">
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section - Right */}
      <div className="auth-hero-section">
        <div className="hero-content">
          <div className="hero-icon">🚀</div>
          <h2 className="hero-title">Welcome to InternConnect</h2>
          <p className="hero-subtitle">
            Find the perfect internship opportunity that matches your skills and goals.
          </p>

          <div className="hero-stats">
            <div className="stat">
              <div className="stat-number">5000+</div>
              <div className="stat-label">Active Students</div>
            </div>
            <div className="stat">
              <div className="stat-number">500+</div>
              <div className="stat-label">Companies</div>
            </div>
            <div className="stat">
              <div className="stat-number">2000+</div>
              <div className="stat-label">Internships</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
