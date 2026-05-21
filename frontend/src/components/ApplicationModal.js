import React, { useState } from 'react';
import { toast } from 'react-toastify';
import '../styles/ApplicationModal.css';

const ApplicationModal = ({ internship, user, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    coverLetter: '',
    resumeFile: null,
    resumeFileName: '',
  });

  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload PDF or Word document only');
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setFormData({
        ...formData,
        resumeFile: file,
        resumeFileName: file.name,
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    if (!formData.coverLetter.trim()) {
      toast.error('Please write a cover letter');
      return false;
    }

    if (formData.coverLetter.trim().length < 50) {
      toast.error('Cover letter must be at least 50 characters');
      return false;
    }

    if (!formData.resumeFile) {
      toast.error('Please upload your resume');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Create application object
      const applicationData = {
        studentId: user._id,
        studentName: user.name,
        studentEmail: user.email,
        internshipId: internship._id,
        internshipTitle: internship.title,
        companyName: internship.company.companyName,
        coverLetter: formData.coverLetter,
        resumeFileName: formData.resumeFileName,
        applicationDate: new Date().toISOString(),
        status: 'pending',
      };

      // Call the submit handler
      if (onSubmit) {
        onSubmit(applicationData);
      }

      // Show success message
      setShowSuccess(true);

      // Reset form
      setFormData({
        coverLetter: '',
        resumeFile: null,
        resumeFileName: '',
      });

      // Auto close after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="application-modal-overlay" onClick={onClose}>
      <div className="application-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Success Message */}
        {showSuccess ? (
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h2>Application Submitted!</h2>
            <p>We've received your application for</p>
            <p className="highlight">{internship.title} at {internship.company.companyName}</p>
            <p className="subtitle">You'll be notified about the status soon.</p>
          </div>
        ) : (
          <>
            {/* Modal Header */}
            <div className="application-modal-header">
              <div>
                <h2>Apply for Internship</h2>
                <p className="job-title">{internship.title}</p>
                <p className="company-name">{internship.company.companyName}</p>
              </div>
              <button className="modal-close-btn" onClick={onClose}>✕</button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="application-form">
              {/* Internship Summary */}
              <div className="internship-summary">
                <div className="summary-item">
                  <span className="label">Location</span>
                  <span className="value">{internship.location}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Duration</span>
                  <span className="value">{internship.duration}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Stipend</span>
                  <span className="value">₹{internship.stipend.toLocaleString()}/month</span>
                </div>
              </div>

              {/* Cover Letter */}
              <div className="form-group">
                <label htmlFor="coverLetter">
                  Cover Letter
                  <span className="required">*</span>
                </label>
                <textarea
                  id="coverLetter"
                  name="coverLetter"
                  placeholder="Tell the company why you're interested in this internship and what you can bring to the team. (Minimum 50 characters)"
                  value={formData.coverLetter}
                  onChange={handleChange}
                  rows="6"
                  maxLength="1000"
                  className="form-textarea"
                />
                <div className="char-count">
                  {formData.coverLetter.length}/1000 characters
                </div>
              </div>

              {/* Resume Upload */}
              <div className="form-group">
                <label>
                  Upload Resume
                  <span className="required">*</span>
                </label>
                <div className="resume-upload">
                  <input
                    type="file"
                    id="resumeInput"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeUpload}
                    className="file-input"
                  />
                  <label htmlFor="resumeInput" className="file-input-label">
                    <div className="upload-icon">📎</div>
                    <div className="upload-text">
                      {formData.resumeFileName ? (
                        <>
                          <p className="filename">✓ {formData.resumeFileName}</p>
                          <p className="subtext">Click to change file</p>
                        </>
                      ) : (
                        <>
                          <p className="main-text">Click to upload or drag and drop</p>
                          <p className="subtext">PDF or Word document (Max 5MB)</p>
                        </>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {/* Student Info (Read-only) */}
              <div className="student-info">
                <h4>Your Information</h4>
                <div className="info-row">
                  <span className="label">Name</span>
                  <span className="value">{user.name}</span>
                </div>
                <div className="info-row">
                  <span className="label">Email</span>
                  <span className="value">{user.email}</span>
                </div>
              </div>

              {/* Form Actions */}
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ApplicationModal;
