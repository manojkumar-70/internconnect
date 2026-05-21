import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import { internshipAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/PostInternship.css';

const PostInternship = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    skills: '',
    location: '',
    stipend: '',
    duration: '',
    company: user?.id || '',
  });

  // Check authentication
  if (!user || user.role !== 'company') {
    navigate('/login');
    return null;
  }

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
      // Validate form
      if (!formData.title.trim()) {
        toast.error('Internship title is required');
        setLoading(false);
        return;
      }

      if (!formData.description.trim()) {
        toast.error('Description is required');
        setLoading(false);
        return;
      }

      if (!formData.location.trim()) {
        toast.error('Location is required');
        setLoading(false);
        return;
      }

      if (!formData.stipend) {
        toast.error('Stipend is required');
        setLoading(false);
        return;
      }

      if (!formData.duration) {
        toast.error('Duration is required');
        setLoading(false);
        return;
      }

      // Create internship object
      const internshipData = {
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements.split(',').map((r) => r.trim()),
        skills: formData.skills.split(',').map((s) => s.trim()),
        location: formData.location,
        stipend: parseInt(formData.stipend),
        duration: formData.duration,
        company: user.id,
      };

      console.log('📝 Posting internship:', internshipData);

      // Call API to create internship
      const response = await internshipAPI.create(internshipData);
      console.log('✅ Internship posted:', response.data);

      toast.success('Internship posted successfully!');
      
      // Redirect to company internships page
      setTimeout(() => {
        navigate('/company/internships');
      }, 2000);
    } catch (err) {
      console.error('❌ Error posting internship:', err);
      toast.error(err.response?.data?.message || 'Failed to post internship');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />
      <div className="container">
        <div className="post-internship-wrapper">
          <div className="post-internship-card">
            <h1>Post a New Internship</h1>
            <p className="subtitle">Fill in the details below to create a new internship opportunity</p>

            <form onSubmit={handleSubmit} className="post-internship-form">
              {/* Title */}
              <div className="form-group">
                <label htmlFor="title">Internship Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Frontend Developer Intern"
                  required
                  disabled={loading}
                />
              </div>

              {/* Description */}
              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the internship opportunity, responsibilities, and what the intern will learn..."
                  rows="5"
                  required
                  disabled={loading}
                />
              </div>

              {/* Requirements */}
              <div className="form-group">
                <label htmlFor="requirements">Requirements (comma-separated)</label>
                <textarea
                  id="requirements"
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  placeholder="e.g., Strong problem-solving skills, Communication skills, Team player"
                  rows="3"
                  disabled={loading}
                />
              </div>

              {/* Skills */}
              <div className="form-group">
                <label htmlFor="skills">Required Skills (comma-separated) *</label>
                <input
                  type="text"
                  id="skills"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="e.g., React, JavaScript, CSS, Git"
                  required
                  disabled={loading}
                />
              </div>

              {/* Location */}
              <div className="form-group">
                <label htmlFor="location">Location *</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Bangalore, India"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-row">
                {/* Stipend */}
                <div className="form-group">
                  <label htmlFor="stipend">Stipend (per month in ₹) *</label>
                  <input
                    type="number"
                    id="stipend"
                    name="stipend"
                    value={formData.stipend}
                    onChange={handleChange}
                    placeholder="e.g., 25000"
                    required
                    disabled={loading}
                  />
                </div>

                {/* Duration */}
                <div className="form-group">
                  <label htmlFor="duration">Duration *</label>
                  <select
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  >
                    <option value="">Select Duration</option>
                    <option value="1 month">1 month</option>
                    <option value="2 months">2 months</option>
                    <option value="3 months">3 months</option>
                    <option value="4 months">4 months</option>
                    <option value="5 months">5 months</option>
                    <option value="6 months">6 months</option>
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: '100%', marginTop: '2rem' }}
              >
                {loading ? 'Posting Internship...' : 'Post Internship'}
              </button>

              {/* Cancel Button */}
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/company-dashboard')}
                disabled={loading}
                style={{ width: '100%', marginTop: '1rem' }}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PostInternship;
