import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { applicationAPI, companyAPI } from '../services/api';
import '../styles/CompanyPages.css';

function CompanyApplications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    companyAPI.getInternships()
      .then(async (internshipResponse) => {
        const internships = Array.isArray(internshipResponse.data)
          ? internshipResponse.data
          : internshipResponse.data?.internships || [];
        const responses = await Promise.all(
          internships
            .map((internship) => internship._id || internship.id)
            .filter(Boolean)
            .map((internshipId) => applicationAPI.getInternshipApplications(internshipId))
        );
        setApplications(responses.flatMap((response) => {
          const records = Array.isArray(response.data) ? response.data : response.data?.applications || [];
          return records.map((application) => ({
            ...application,
            id: application._id || application.id,
            applicantName: application.student?.name || 'Not available',
            internshipTitle: application.internship?.title || 'Not available',
            appliedDate: application.appliedDate || application.createdAt || 'Not available',
            experience: application.student?.bio || 'Not available',
            skills: application.student?.skills || [],
          }));
        }));
      })
      .catch(() => setApplications([]))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = (id) => {
    toast.info('Status update flow will be added soon');
  };

  const handleMessage = (name) => {
    toast.success(`Message sent to ${name}`);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="company-page">
      <Navbar />
      <div className="company-container">
        <div className="page-header">
          <h1>Applications</h1>
          <button className="btn-secondary" onClick={() => navigate('/company/internships')}>
            Back to Internships
          </button>
        </div>

        <div className="applications-grid">
          {applications.map(app => (
            <div className="application-card" key={app.id}>
              <div className="card-header">
                <div>
                  <h3>{app.applicantName}</h3>
                  <p>{app.internshipTitle}</p>
                </div>
                <span className={`status ${app.status.toLowerCase().replace(/ /g, '-')}`}>
                  {app.status}
                </span>
              </div>

              <div className="info-row">
                <span className="label">Applied:</span>
                <span className="value">{app.appliedDate}</span>
              </div>
              <div className="info-row">
                <span className="label">Experience:</span>
                <span className="value">{app.experience}</span>
              </div>
              <div className="info-row">
                <span className="label">Skills:</span>
                <span className="value">{app.skills.join(', ')}</span>
              </div>

              <div className="card-actions">
                <button className="btn-primary" onClick={() => handleStatusChange(app.id)}>
                  Update Status
                </button>
                <button className="btn-secondary" onClick={() => handleMessage(app.applicantName)}>
                  Message
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default CompanyApplications;
