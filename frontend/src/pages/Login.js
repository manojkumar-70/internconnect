import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import { authAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [userType, setUserType] = useState('student');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

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
      <div className="container">
        <div style={{ maxWidth: '400px', margin: '3rem auto' }}>
          <div className="card">
            <h2 className="text-center mb-4">Login to InternConnect</h2>

            <div className="form-group mb-4">
              <label>I am a...</label>
              <select
                name="userType"
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
              >
                <option value="student">Student</option>
                <option value="company">Company</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="your@email.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <p className="text-center mt-3">
              Don't have an account?{' '}
              <a href="/register" style={{ color: 'var(--primary-color)' }}>
                Register here
              </a>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Login;
