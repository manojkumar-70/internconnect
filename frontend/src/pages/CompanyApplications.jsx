import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/CompanyPages.css';

function CompanyApplications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockApplications = [
      {
        id: 101,
        applicantName: 'Arjun Mehta',
        internshipTitle: 'Frontend Developer Intern',
        status: 'Shortlisted',
        appliedDate: '2026-05-16',
        experience: '2 months internship at a startup',
        skills: ['React', 'CSS', 'JavaScript']
      },
      {
        id: 102,
        applicantName: 'Nisha Patel',
        internshipTitle: 'Backend Engineer Intern',
        status: 'Interview Scheduled',
        appliedDate: '2026-05-15',
        experience: 'Database internship at a tech firm',
        skills: ['Node.js', 'MongoDB', 'Express']
      },
      {
        id: 103,
        applicantName: 'Rahul Singh',
        internshipTitle: 'Data Analyst Intern',
        status: 'New',
        appliedDate: '2026-05-17',
        experience: 'Data science coursework and campus projects',
        skills: ['SQL', 'Python', 'Excel']
      }
    ];

    setApplications(mockApplications);
    setLoading(false);
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
