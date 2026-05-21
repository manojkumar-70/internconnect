import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Register = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('student');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    college: '',
    cgpa: '',
    skills: '',
    companyName: '',
    industry: '',
    location: '',
    website: '',
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
        console.log('📤 Sending Student Registration Request:', data);
        response = await authAPI.registerStudent(data);
        console.log('✅ Student Registration Response:', response.data);
      } else {
        data = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          companyName: formData.companyName,
          industry: formData.industry,
          location: formData.location,
          website: formData.website,
        };
        console.log('📤 Sending Company Registration Request:', data);
        response = await authAPI.registerCompany(data);
        console.log('✅ Company Registration Response:', response.data);
      }

      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      console.error('❌ Registration Error:', err);
      console.error('Error Response:', err.response?.data);
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar user={null} />
      <div className="container">
        <div style={{ maxWidth: '500px', margin: '2rem auto' }}>
          <div className="card">
            <h2 className="text-center mb-4">Register to InternConnect</h2>

            <div className="form-group mb-4">
              <label>I am a...</label>
              <select
                name="userType"
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
              >
                <option value="student">Student</option>
                <option value="company">Company</option>
              </select>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
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
                  placeholder="At least 8 characters"
                />
              </div>

              {userType === 'student' && (
                <>
                  <div className="form-group">
                    <label htmlFor="college">College/University</label>
                    <input
                      type="text"
                      id="college"
                      name="college"
                      value={formData.college}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="cgpa">CGPA</label>
                    <input
                      type="number"
                      id="cgpa"
                      name="cgpa"
                      value={formData.cgpa}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      max="10"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="skills">
                      Skills (comma-separated)
                    </label>
                    <input
                      type="text"
                      id="skills"
                      name="skills"
                      value={formData.skills}
                      onChange={handleChange}
                      placeholder="e.g., Python, React, Node.js"
                    />
                  </div>
                </>
              )}

              {userType === 'company' && (
                <>
                  <div className="form-group">
                    <label htmlFor="companyName">Company Name</label>
                    <input
                      type="text"
                      id="companyName"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="industry">Industry</label>
                    <input
                      type="text"
                      id="industry"
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="location">Location</label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="website">Website</label>
                    <input
                      type="url"
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%' }}
                disabled={loading}
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            </form>

            <p className="text-center mt-3">
              Already have an account?{' '}
              <a href="/login" style={{ color: 'var(--primary-color)' }}>
                Login here
              </a>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Register;
