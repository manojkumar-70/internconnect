import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import { authAPI } from '../services/api';
import Navbar from '../components/Navbar';
import '../styles/Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [userType, setUserType] = useState('student');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('🔐 Login Attempt:', { email: formData.email, userType, password: '***' });
      let response;

      if (userType === 'student') {
        console.log('📤 Sending Student Login Request...');
        response = await authAPI.loginStudent(formData);
      } else if (userType === 'company') {
        console.log('📤 Sending Company Login Request...');
        response = await authAPI.loginCompany(formData);
      } else {
        console.log('📤 Sending Admin Login Request...');
        response = await authAPI.loginAdmin(formData);
      }

      console.log('✅ Login Response:', response.data);
      const { token, student, company, admin } = response.data;
      const user = student || company || admin;
      
      console.log('📦 User data extracted:', user);
      console.log('🔑 Token received:', token.substring(0, 20) + '...');

      login(user, token);
      toast.success('Login successful!');

      if (userType === 'student') {
        navigate('/student-dashboard');
      } else if (userType === 'company') {
        navigate('/company-dashboard');
      } else {
        navigate('/admin-dashboard');
      }
    } catch (err) {
      console.error('❌ Login Error:', err);
      console.error('Error Response:', err.response?.data);
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar user={null} />
      <div className="auth-container">
        {/* Form Section */}
        <div className="auth-form-section">
          <div className="auth-form-wrapper">
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">
              Sign in to access your dashboard and track your growth.
            </p>

            {/* Role Selection */}
            <div className="role-selector">
              <button
                className={`role-btn ${userType === 'student' ? 'active' : ''}`}
                onClick={() => setUserType('student')}
              >
                Student
              </button>
              <button
                className={`role-btn ${userType === 'company' ? 'active' : ''}`}
                onClick={() => setUserType('company')}
              >
                Company
              </button>
              <button
                className={`role-btn ${userType === 'admin' ? 'active' : ''}`}
                onClick={() => setUserType('admin')}
              >
                Admin
              </button>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="name@university.edu"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="password-input-group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              <div className="form-remember">
                <label className="checkbox-label">
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>
                <a href="#forgot" className="forgot-link">
                  Forgot password?
                </a>
              </div>

              <button type="submit" className="btn-primary btn-login" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            {/* Social Login */}
            <div className="social-divider">
              <span>OR CONTINUE WITH</span>
            </div>

            <div className="social-buttons">
              <button type="button" className="social-btn google-btn">
                <span>G</span> Google
              </button>
              <button type="button" className="social-btn linkedin-btn">
                <span>in</span> LinkedIn
              </button>
            </div>

            {/* Sign Up Link */}
            <p className="auth-footer">
              Don't have an account?{' '}
              <a href="/register" className="auth-link">
                Sign up
              </a>
            </p>
          </div>
        </div>

        {/* Hero Section */}
        <div className="auth-hero-section">
          <div className="hero-content">
            <div className="hero-icon">🚀</div>
            <h2 className="hero-title">Elevate Your Career with Data-Driven Matches</h2>
            <p className="hero-subtitle">
              Join thousands of students and companies building the future of work through our AI-powered internship ecosystem.
            </p>

            <div className="hero-stats">
              <div className="stat">
                <div className="stat-number">5000+</div>
                <div className="stat-label">STUDENTS PLACED</div>
              </div>
              <div className="stat">
                <div className="stat-number">500+</div>
                <div className="stat-label">TOP COMPANIES</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
