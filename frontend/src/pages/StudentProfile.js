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
    college: '',
    course: '',
    interests: '',
    skills: '',
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

  const buildProfileState = (student) => ({
    fullName: student?.name || '',
    email: student?.email || '',
    college: student?.college || '',
    course: student?.course || student?.major || student?.degree || '',
    interests: student?.bio || '',
    skills: Array.isArray(student?.skills) ? student.skills.join(', ') : '',
    linkedin: student?.linkedin || '',
    github: student?.github || '',
    portfolio: student?.portfolio || '',
    twitter: student?.twitter || '',
    profilePhoto: student?.profilePicture || null,
    resume: student?.resume || null,
  });

  useEffect(() => {
    if (!user || user.role !== 'student') {
      navigate('/login');
      return;
    }

    fetchProfile();
  }, [user, navigate]);

  const fetchProfile = async () => {
    try {
      let studentData = user;

      try {
        const response = await studentAPI.getProfile();
        if (response?.data) {
          studentData = response.data;
        }
      } catch (error) {
        console.warn('Using auth context fallback for student profile', error);
      }

      const nextForm = buildProfileState(studentData);
      setFormData(nextForm);
      setProfile(nextForm);
      setPhotoPreview(studentData?.profilePicture || null);
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
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Profile photo must be less than 5MB');
        return;
      }

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
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Resume must be less than 10MB');
        return;
      }

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

      const skillArray = (formData.skills || '')
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean);

      const submitData = {
        name: formData.fullName,
        email: formData.email,
        college: formData.college,
        course: formData.course,
        bio: formData.interests,
        skills: skillArray,
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
        college: updatedStudent?.college || formData.college,
        course: updatedStudent?.course || updatedStudent?.major || updatedStudent?.degree || formData.course,
        interests: updatedStudent?.bio ?? formData.interests,
        skills: Array.isArray(updatedStudent?.skills) ? updatedStudent.skills.join(', ') : formData.skills,
        linkedin: updatedStudent?.linkedin ?? formData.linkedin,
        github: updatedStudent?.github ?? formData.github,
        portfolio: updatedStudent?.portfolio ?? formData.portfolio,
        twitter: updatedStudent?.twitter ?? formData.twitter,
        resume: updatedStudent?.resume ?? formData.resume,
        profilePhoto: updatedStudent?.profilePicture || photoPreview || formData.profilePhoto || null,
      };

      setFormData(mergedData);
      setProfile(mergedData);
      setPhotoPreview(mergedData.profilePhoto);
      setResumeFile(null);

      if (typeof updateUser === 'function' && updatedStudent) {
        updateUser(updatedStudent);
      }

      setEditing(false);
      setSaving(false);
      toast.success('Profile updated successfully!');
    } catch (err) {
      setSaving(false);
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const displayData = profile || formData;
  const activeSkills = (displayData.skills || '')
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean);

  const getInitials = (name) => {
    if (!name) return 'S';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase();
  };

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
      <div className="profile-page-shell">
        <div className="profile-page">
          <header className="profile-hero">
            <div className="profile-hero-main">
              <div className="profile-avatar-wrap">
                {photoPreview ? (
                  <img src={photoPreview} alt={formData.fullName || 'Student'} className="profile-avatar" />
                ) : (
                  <div className="profile-avatar profile-avatar-fallback">{getInitials(formData.fullName)}</div>
                )}
              </div>

              <div className="profile-hero-copy">
                <p className="eyebrow">Student Profile</p>
                <h1>{formData.fullName || 'Student Name'}</h1>
                <div className="profile-badges-row">
                  <span>{formData.college || 'College not specified'}</span>
                  <span>{formData.course || 'Course not specified'}</span>
                </div>
                <p className="profile-summary">{formData.interests || 'Add your bio or career interests to tell recruiters more about you.'}</p>
              </div>
            </div>

            <button type="button" className="profile-edit-button" onClick={() => setEditing((prev) => !prev)}>
              {editing ? 'Cancel' : 'Edit Profile'}
            </button>
          </header>

          {editing ? (
            <form className="profile-form-card" onSubmit={(e) => e.preventDefault()}>
              <div className="profile-form-grid">
                <div className="profile-photo-panel">
                  <div className="photo-upload-box">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Profile preview" className="photo-preview-image" />
                    ) : (
                      <div className="photo-preview-placeholder">👤</div>
                    )}
                  </div>
                  <input type="file" id="profilePhoto" accept="image/*" onChange={handlePhotoUpload} hidden />
                  <label htmlFor="profilePhoto" className="action-button secondary-button">Upload Photo</label>
                </div>

                <div className="profile-fields">
                  <div className="field-group">
                    <label htmlFor="fullName">Name</label>
                    <input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} />
                  </div>

                  <div className="field-group">
                    <label htmlFor="email">Email</label>
                    <input id="email" name="email" value={formData.email} onChange={handleChange} disabled />
                  </div>

                  <div className="field-group">
                    <label htmlFor="college">College</label>
                    <input id="college" name="college" value={formData.college} onChange={handleChange} placeholder="Your college or university" />
                  </div>

                  <div className="field-group">
                    <label htmlFor="course">Course / Program</label>
                    <input id="course" name="course" value={formData.course} onChange={handleChange} placeholder="B.Tech in Computer Science" />
                  </div>

                  <div className="field-group field-group-full">
                    <label htmlFor="interests">Bio / interests</label>
                    <textarea id="interests" name="interests" value={formData.interests} onChange={handleChange} rows="4" placeholder="Tell companies about your interests and goals" />
                  </div>

                  <div className="field-group field-group-full">
                    <label htmlFor="skills">Skills</label>
                    <input id="skills" name="skills" value={formData.skills} onChange={handleChange} placeholder="JavaScript, React, Python, SQL" />
                  </div>
                </div>
              </div>

              <div className="profile-form-section">
                <h3>Resume</h3>
                <div className="resume-editor-box">
                  <input type="file" id="resume" accept="application/pdf" onChange={handleResumeUpload} hidden />
                  <label htmlFor="resume" className="action-button primary-button">{formData.resume ? 'Upload New Resume' : 'Upload Resume'}</label>
                  <div className="resume-status">
                    {formData.resume ? (
                      <>
                        <span className="resume-file-name">{resumeFile ? resumeFile.name : formData.resume}</span>
                        <a href={formData.resume} target="_blank" rel="noreferrer" className="text-link">View</a>
                      </>
                    ) : (
                      <span>No resume uploaded yet</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="profile-form-section">
                <h3>Professional Links</h3>
                <div className="profile-links-grid">
                  <div className="field-group">
                    <label htmlFor="linkedin">LinkedIn</label>
                    <input id="linkedin" name="linkedin" value={formData.linkedin} onChange={handleChange} onPaste={handlePaste} placeholder="https://linkedin.com/in/..." />
                  </div>
                  <div className="field-group">
                    <label htmlFor="github">GitHub</label>
                    <input id="github" name="github" value={formData.github} onChange={handleChange} onPaste={handlePaste} placeholder="https://github.com/..." />
                  </div>
                  <div className="field-group">
                    <label htmlFor="portfolio">Portfolio</label>
                    <input id="portfolio" name="portfolio" value={formData.portfolio} onChange={handleChange} onPaste={handlePaste} placeholder="https://yourportfolio.com" />
                  </div>
                  <div className="field-group">
                    <label htmlFor="twitter">X / Twitter</label>
                    <input id="twitter" name="twitter" value={formData.twitter} onChange={handleChange} onPaste={handlePaste} placeholder="https://x.com/..." />
                  </div>
                </div>
              </div>

              <div className="profile-actions">
                <button type="button" className="action-button primary-button" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
                <button type="button" className="action-button ghost-button" onClick={() => setEditing(false)}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-content-grid">
              <main className="profile-main-column">
                <section className="profile-card">
                  <div className="card-header-row">
                    <h2>Skills</h2>
                  </div>
                  <div className="skill-tags-wrap">
                    {activeSkills.length ? (
                      activeSkills.map((skill) => (
                        <span key={skill} className="skill-tag">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="empty-state-inline">No skills added yet.</p>
                    )}
                  </div>
                </section>

                <section className="profile-card">
                  <div className="card-header-row">
                    <h2>Resume</h2>
                  </div>
                  {formData.resume ? (
                    <div className="resume-card-box">
                      <div>
                        <p className="resume-title">Resume uploaded</p>
                        <p className="resume-file-name">{formData.resume}</p>
                      </div>
                      <div className="resume-card-actions">
                        <a href={formData.resume} target="_blank" rel="noreferrer" className="action-button primary-button">View Resume</a>
                        <button type="button" className="action-button secondary-button" onClick={() => setEditing(true)}>Upload New</button>
                      </div>
                    </div>
                  ) : (
                    <div className="resume-card-box empty-resume">
                      <p>No resume uploaded yet.</p>
                      <button type="button" className="action-button primary-button" onClick={() => setEditing(true)}>Upload Resume</button>
                    </div>
                  )}
                </section>
              </main>

              <aside className="profile-side-column">
                <section className="profile-card">
                  <div className="card-header-row">
                    <h2>Contact</h2>
                  </div>

                  <div className="contact-list">
                    <div className="contact-item">
                      <span className="contact-label">Email</span>
                      <a href={`mailto:${formData.email}`}>{formData.email || 'Not provided'}</a>
                    </div>

                    <div className="contact-item">
                      <span className="contact-label">College</span>
                      <span>{formData.college || 'Not specified'}</span>
                    </div>

                    <div className="contact-item">
                      <span className="contact-label">Course</span>
                      <span>{formData.course || 'Not specified'}</span>
                    </div>
                  </div>
                </section>

                <section className="profile-card">
                  <div className="card-header-row">
                    <h2>Links</h2>
                  </div>

                  <div className="link-list">
                    {formData.linkedin ? (
                      <a href={formData.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
                    ) : (
                      <span className="empty-state-inline">LinkedIn not added</span>
                    )}
                    {formData.github ? (
                      <a href={formData.github} target="_blank" rel="noreferrer">GitHub</a>
                    ) : (
                      <span className="empty-state-inline">GitHub not added</span>
                    )}
                    {formData.portfolio ? (
                      <a href={formData.portfolio} target="_blank" rel="noreferrer">Portfolio</a>
                    ) : (
                      <span className="empty-state-inline">Portfolio not added</span>
                    )}
                    {formData.twitter ? (
                      <a href={formData.twitter} target="_blank" rel="noreferrer">X / Twitter</a>
                    ) : (
                      <span className="empty-state-inline">Twitter not added</span>
                    )}
                  </div>
                </section>
              </aside>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default StudentProfile;
