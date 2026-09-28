import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL, authAPI } from '../services/api';
import { FiArrowRight, FiEye, FiEyeOff, FiLock, FiMail } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { FaLinkedinIn } from 'react-icons/fa';
import '../styles/Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [userType, setUserType] = useState('student');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
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
      let response;

      if (userType === 'student') {
        response = await authAPI.loginStudent(formData);
      } else if (userType === 'company') {
        response = await authAPI.loginCompany(formData);
      } else {
        response = await authAPI.loginAdmin(formData);
      }

      const { token, student, company, admin } = response.data;
      const user = student || company || admin;

      login(user, token);
      toast.success('Login successful!');

      // Navigate based on user type
      if (student) navigate('/student-dashboard');
      else if (company) navigate('/company-dashboard');
      else navigate('/admin-dashboard');
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(errorMessage);
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (userType === 'admin') {
      toast.info('Google sign-in is available for Student and Company accounts.');
      return;
    }
    window.location.assign(`${API_BASE_URL}/auth/google?role=${userType}`);
  };

  return (
    <div className="auth-page login-page">
      <div className="auth-wrapper">
        <section className="auth-promo-section" aria-label="About InternConnect">
          <div className="brand-panel">
            <Link to="/" className="brand-lockup" aria-label="InternConnect home">
              <span className="brand-mark"><FiArrowRight aria-hidden="true" /></span>
              <span>InternConnect</span>
            </Link>
            <div className="brand-message">
              <span className="brand-eyebrow">Build what comes next</span>
              <h1>Where ambition meets opportunity.</h1>
              <p>Find the people, experience, and next steps to move your career forward.</p>
            </div>
            <div className="career-visual" aria-hidden="true">
              <div className="visual-grid" />
              <div className="visual-track visual-track-one" />
              <div className="visual-track visual-track-two" />
              <div className="visual-node visual-node-start"><span /></div>
              <div className="visual-node visual-node-middle"><span /></div>
              <div className="visual-node visual-node-end"><span /></div>
              <div className="visual-label visual-label-start">Skills</div>
              <div className="visual-label visual-label-middle">Experience</div>
              <div className="visual-label visual-label-end">Opportunity</div>
              <div className="visual-coordinate">IC / 01</div>
            </div>
            <div className="brand-panel-footer">
              <span>Internships with direction.</span>
              <span className="brand-footer-line" />
            </div>
          </div>
        </section>

        <section className="auth-form-section">
          <div className="auth-card">
            <Link to="/" className="mobile-brand-lockup" aria-label="InternConnect home">
              <span className="brand-mark"><FiArrowRight aria-hidden="true" /></span>
              <span>InternConnect</span>
            </Link>
            <div className="auth-header">
              <span className="auth-kicker">YOUR NEXT CHAPTER STARTS HERE</span>
              <h2>Welcome back</h2>
              <p>Sign in to continue to your InternConnect account.</p>
            </div>

            {/* User Type Tabs */}
            <div className="user-type-tabs" role="tablist" aria-label="Choose account type">
              <button
                type="button"
                className={`tab-btn ${userType === 'student' ? 'active' : ''}`}
                onClick={() => setUserType('student')}
                role="tab"
                aria-selected={userType === 'student'}
              >
                Student
              </button>
              <button
                type="button"
                className={`tab-btn ${userType === 'company' ? 'active' : ''}`}
                onClick={() => setUserType('company')}
                role="tab"
                aria-selected={userType === 'company'}
              >
                Recruiter
              </button>
              <button
                type="button"
                className={`tab-btn ${userType === 'admin' ? 'active' : ''}`}
                onClick={() => setUserType('admin')}
                role="tab"
                aria-selected={userType === 'admin'}
              >
                Admin
              </button>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
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
                <FiMail className="field-icon" aria-hidden="true" />
                {errors.email && <span className="error-message">{errors.email}</span>}
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
                    placeholder="Enter your password"
                    className={`form-input ${errors.password ? 'input-error' : ''}`}
                    disabled={loading}
                  />
                  <FiLock className="field-icon" aria-hidden="true" />
                  <button
                    type="button"
                    className="password-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
                  </button>
                </div>
                {errors.password && (
                  <span className="error-message">{errors.password}</span>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="form-footer-row">
                <label className="remember-me">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading}
                  />
                  <span>Remember me</span>
                </label>
                <Link to="/forgot-password" className="forgot-password-link">
                  Forgot password?
                </Link>
              </div>

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
                {loading ? 'Signing in...' : 'Sign in'}
                {!loading && <FiArrowRight aria-hidden="true" />}
              </button>
            </form>

            {/* Social Login */}
            <div className="social-login">
              <div className="divider">
                <span>OR</span>
              </div>
              <div className="social-buttons">
                <button type="button" className="social-btn google-btn" disabled={loading} onClick={handleGoogleLogin}>
                  <FcGoogle aria-hidden="true" />
                  Google
                </button>
                <button type="button" className="social-btn linkedin-btn" disabled={loading}>
                  <FaLinkedinIn aria-hidden="true" />
                  LinkedIn
                </button>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="auth-footer">
              <p>
                Don't have an account?{' '}
                <Link to="/register" className="auth-link">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;
