import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { studentAPI } from '../services/api';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/StudentProfile.css';

const StudentProfile = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    interests: '',
    linkedin: '',
    github: '',
    portfolio: '',
    twitter: '',
    profilePhoto: null,
    resume: null,
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    if (!user || user.role !== 'student') {
      navigate('/login');
      return;
    }

    fetchProfile();
  }, [user, navigate]);

  const fetchProfile = async () => {
    try {
      // Initialize with user data from context
      setFormData({
        fullName: user.name || '',
        email: user.email || '',
        interests: user.bio || '',
        linkedin: user.linkedin || '',
        github: user.github || '',
        portfolio: user.portfolio || '',
        twitter: user.twitter || '',
        profilePhoto: user.profilePicture || null,
        resume: user.resume || null,
      });
      setPhotoPreview(user.profilePhoto || null);
      setLoading(false);
    } catch (err) {
      toast.error('Failed to load profile');
      setLoading(false);
    }
  };

  const normalizeUrl = (value) => {
    if (!value) return '';
    const trimmed = value.trim();
    if (!trimmed) return '';
    if (/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(trimmed)) {
      return trimmed;
    }
    if (trimmed.startsWith('www.')) {
      return `https://${trimmed}`;
    }
    return `https://${trimmed}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePaste = (e) => {
    const { name } = e.target;
    const pasted = (e.clipboardData || window.clipboardData).getData('text');
    const normalized = normalizeUrl(pasted);
    e.preventDefault();
    setFormData((prev) => ({
      ...prev,
      [name]: normalized,
    }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Profile photo must be less than 5MB');
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setFormData((prev) => ({
          ...prev,
          profilePhoto: file,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Resume must be less than 10MB');
        return;
      }

      // Check file type
      if (file.type !== 'application/pdf') {
        toast.error('Please upload a PDF resume');
        return;
      }

      setResumeFile(file);
      setFormData((prev) => ({
        ...prev,
        resume: file.name,
      }));
      toast.success(`Resume selected: ${file.name}`);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Validate required fields
      if (!formData.fullName.trim()) {
        toast.error('Full name is required');
        setSaving(false);
        return;
      }

      if (!formData.email.trim()) {
        toast.error('Email is required');
        setSaving(false);
        return;
      }

      const submitData = {
        name: formData.fullName,
        email: formData.email,
        interests: formData.interests,
        linkedin: formData.linkedin,
        github: formData.github,
        portfolio: formData.portfolio,
        twitter: formData.twitter,
        resume: resumeFile ? resumeFile.name : formData.resume,
        profilePicture: photoPreview || formData.profilePhoto || null,
      };

      const response = await studentAPI.updateProfile(submitData);
      const updatedStudent = response.data.student;

      const mergedData = {
        ...formData,
        fullName: updatedStudent?.name || formData.fullName,
        email: updatedStudent?.email || formData.email,
        interests: updatedStudent?.bio ?? formData.interests,
        linkedin: updatedStudent?.linkedin ?? formData.linkedin,
        github: updatedStudent?.github ?? formData.github,
        portfolio: updatedStudent?.portfolio ?? formData.portfolio,
        twitter: updatedStudent?.twitter ?? formData.twitter,
        resume: updatedStudent?.resume ?? formData.resume,
        profilePhoto: updatedStudent?.profilePicture || photoPreview || formData.profilePhoto || null,
      };

      setFormData(mergedData);
      setPhotoPreview(mergedData.profilePhoto);
      setResumeFile(null);

      if (typeof updateUser === 'function' && updatedStudent) {
        updateUser(updatedStudent);
      }

      setProfile(mergedData);
      setEditing(false);
      setSaving(false);
      toast.success('Profile updated successfully! 🎉');
    } catch (err) {
      setSaving(false);
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const displayData = profile || formData;

  if (loading) {
    return (
      <>
        <Navbar user={user} onLogout={handleLogout} />
        <div className="profile-loading">
          <div className="spinner"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />
      <div className="profile-container">
        <div className="profile-wrapper">
          {/* Header Section */}
          <div className="profile-header">
            <div className="profile-header-content">
              <h1>My Profile</h1>
              <p className="profile-subtitle">Manage your professional profile</p>
            </div>
            <button
              className={`btn-edit ${editing ? 'btn-cancel' : 'btn-primary'}`}
              onClick={() => setEditing(!editing)}
            >
              {editing ? '✕ Cancel' : '✎ Edit Profile'}
            </button>
          </div>

          {/* Main Profile Card */}
          <div className="profile-main-card">
            {editing ? (
              // Edit Mode
              <form className="profile-form">
                {/* Profile Photo Section */}
                <div className="profile-photo-section">
                  <div className="photo-upload-area">
                    <div className="photo-preview">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Profile" className="profile-img" />
                      ) : (
                        <div className="photo-placeholder">
                          <span className="photo-icon">📷</span>
                          <p>No photo</p>
                        </div>
                      )}
                    </div>
                    <div className="photo-upload-input">
                      <input
                        type="file"
                        id="profilePhoto"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        hidden
                      />
                      <label htmlFor="profilePhoto" className="upload-btn">
                        📷 Upload Photo
                      </label>
                      <p className="upload-hint">Max 5MB • JPG, PNG</p>
                    </div>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="form-section">
                  <h3>📋 Basic Information</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="fullName">Full Name *</label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="email">Email Address *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your.email@example.com"
                        className="form-input"
                        disabled
                      />
                      <small className="form-hint">Email cannot be changed</small>
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div className="form-section">
                  <h3>💼 Professional Information</h3>
                  <div className="form-group">
                    <label htmlFor="interests">Interests & Career Goals</label>
                    <textarea
                      id="interests"
                      name="interests"
                      value={formData.interests}
                      onChange={handleChange}
                      placeholder="Share your career interests and goals... (e.g., Web Development, Machine Learning, Data Science)"
                      className="form-textarea"
                      rows="4"
                    ></textarea>
                  </div>
                  <div className="section-actions">
                    <button
                      type="button"
                      className="section-btn"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save Interests'}
                    </button>
                  </div>
                </div>

                <div className="resume-card">
                  <div className="resume-card-header">
                    <div>
                      <h3>📄 Resume Upload</h3>
                      <p>Upload your latest PDF resume so recruiters can review your profile.</p>
                    </div>
                  </div>

                  <div className="resume-upload-content">
                    <input
                      type="file"
                      id="resume"
                      accept="application/pdf"
                      onChange={handleResumeUpload}
                      hidden
                    />
                    <label htmlFor="resume" className="file-upload-btn resume-upload-btn">
                      Upload PDF Resume
                    </label>

                    <div className="resume-meta">
                      {resumeFile || formData.resume ? (
                        <>
                          <p className="file-name">
                            Selected file: {resumeFile ? resumeFile.name : formData.resume}
                          </p>
                          <p className="upload-hint">Only PDF files are supported. Max size 10MB.</p>
                        </>
                      ) : (
                        <p className="upload-hint">Only PDF files are supported. Max size 10MB.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                <div className="form-section">
                  <h3>🔗 Social Links</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="linkedin">LinkedIn Profile</label>
                      <div className="input-with-icon">
                        <span className="input-icon">👔</span>
                        <input
                          type="url"
                          id="linkedin"
                          name="linkedin"
                          value={formData.linkedin}
                          onChange={handleChange}
                          onPaste={handlePaste}
                          placeholder="https://linkedin.com/in/yourprofile"
                          className="form-input"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="github">GitHub Profile</label>
                      <div className="input-with-icon">
                        <span className="input-icon">🐙</span>
                        <input
                          type="url"
                          id="github"
                          name="github"
                          value={formData.github}
                          onChange={handleChange}
                          onPaste={handlePaste}
                          placeholder="https://github.com/yourprofile"
                          className="form-input"
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="portfolio">Portfolio / Website</label>
                      <div className="input-with-icon">
                        <span className="input-icon">🌐</span>
                        <input
                          type="url"
                          id="portfolio"
                          name="portfolio"
                          value={formData.portfolio}
                          onChange={handleChange}
                          onPaste={handlePaste}
                          placeholder="https://yourportfolio.com"
                          className="form-input"
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="twitter">Twitter Profile</label>
                      <div className="input-with-icon">
                        <span className="input-icon">🐦</span>
                        <input
                          type="url"
                          id="twitter"
                          name="twitter"
                          value={formData.twitter}
                          onChange={handleChange}
                          onPaste={handlePaste}
                          placeholder="https://twitter.com/yourhandle"
                          className="form-input"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="section-actions">
                    <button
                      type="button"
                      className="section-btn"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save Social Links'}
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-save"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? '⏳ Saving...' : '✓ Save Profile'}
                  </button>
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setEditing(false)}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              // View Mode
              <div className="profile-view">
                {/* Profile Photo */}
                <div className="profile-photo-display">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Profile" className="profile-img-large" />
                  ) : (
                    <div className="photo-placeholder-large">
                      <span>👤</span>
                    </div>
                  )}
                </div>

                {/* Basic Information Display */}
                <div className="profile-section">
                  <h3>📋 Basic Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Full Name</span>
                      <span className="info-value">{formData.fullName || 'Not provided'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Email</span>
                      <span className="info-value">{formData.email}</span>
                    </div>
                  </div>
                </div>

                {/* Professional Information Display */}
                <div className="profile-section">
                  <h3>💼 Professional Information</h3>
                  <div className="info-block">
                    <span className="info-label">Interests & Goals</span>
                    <p className="info-text">
                      {displayData.interests || 'No interests added yet'}
                    </p>
                  </div>
                  {displayData.resume && (
                    <div className="info-block">
                      <span className="info-label">Resume</span>
                      <p className="info-text">📄 {formData.resume}</p>
                    </div>
                  )}
                </div>

                {/* Social Links Display */}
                <div className="profile-section">
                  <h3>🔗 Social Links</h3>
                  <div className="social-links">
                    {displayData.linkedin ? (
                      <a href={displayData.linkedin} target="_blank" rel="noopener noreferrer" className="social-link">
                        <span>👔</span> LinkedIn Profile
                      </a>
                    ) : (
                      <div className="social-link disabled">👔 No LinkedIn profile added</div>
                    )}
                    {displayData.github ? (
                      <a href={displayData.github} target="_blank" rel="noopener noreferrer" className="social-link">
                        <span>🐙</span> GitHub Profile
                      </a>
                    ) : (
                      <div className="social-link disabled">🐙 No GitHub profile added</div>
                    )}
                    {displayData.portfolio ? (
                      <a href={displayData.portfolio} target="_blank" rel="noopener noreferrer" className="social-link">
                        <span>🌐</span> Portfolio
                      </a>
                    ) : (
                      <div className="social-link disabled">🌐 No portfolio link added</div>
                    )}
                    {displayData.twitter ? (
                      <a href={displayData.twitter} target="_blank" rel="noopener noreferrer" className="social-link">
                        <span>🐦</span> Twitter Profile
                      </a>
                    ) : (
                      <div className="social-link disabled">🐦 No Twitter profile added</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default StudentProfile;
