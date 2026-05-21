import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/CompanyPages.css';

function CompanyInternships() {
  const navigate = useNavigate();
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch company's internships
    const mockInternships = [
      {
        id: 1,
        title: 'Frontend Developer Intern',
        location: 'Bangalore',
        stipend: 25000,
        duration: '3 months',
        status: 'Active',
        applicants: 12,
        postedDate: '2026-05-15'
      },
      {
        id: 2,
        title: 'Backend Engineer Intern',
        location: 'Bangalore',
        stipend: 32000,
        duration: '3 months',
        status: 'Active',
        applicants: 8,
        postedDate: '2026-05-10'
      },
      {
        id: 3,
        title: 'Data Analyst Intern',
        location: 'Mumbai',
        stipend: 30000,
        duration: '2 months',
        status: 'Closed',
        applicants: 15,
        postedDate: '2026-04-20'
      }
    ];
    
    setInternships(mockInternships);
    setLoading(false);
  }, []);

  const handleEdit = (id) => {
    toast.info('Edit functionality coming soon');
  };

  const handleDelete = (id) => {
    setInternships(internships.filter(int => int.id !== id));
    toast.success('Internship deleted successfully');
  };

  const handleViewApplications = (id) => {
    navigate('/company/applications');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="company-page">
      <Navbar />
      <div className="company-container">
        <div className="page-header">
          <h1>My Internships</h1>
          <button className="btn-primary" onClick={() => navigate('/internship/create')}>
            + Post New Internship
          </button>
        </div>

        {internships.length === 0 ? (
          <div className="empty-state">
            <p>No internships posted yet</p>
            <button className="btn-primary" onClick={() => navigate('/internship/create')}>
              Post Your First Internship
            </button>
          </div>
        ) : (
          <div className="internships-grid">
            {internships.map(internship => (
              <div key={internship.id} className="internship-card">
                <div className="card-header">
                  <h3>{internship.title}</h3>
                  <span className={`status ${internship.status.toLowerCase()}`}>
                    {internship.status}
                  </span>
                </div>

                <div className="card-body">
                  <div className="info-row">
                    <span className="label">Location:</span>
                    <span className="value">{internship.location}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Stipend:</span>
                    <span className="value">₹{internship.stipend.toLocaleString()}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Duration:</span>
                    <span className="value">{internship.duration}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Posted:</span>
                    <span className="value">{internship.postedDate}</span>
                  </div>
                  <div className="info-row highlight">
                    <span className="label">Applicants:</span>
                    <span className="value">{internship.applicants}</span>
                  </div>
                </div>

                <div className="card-actions">
                  <button className="btn-secondary" onClick={() => handleViewApplications(internship.id)}>
                    View Applications
                  </button>
                  <button className="btn-secondary" onClick={() => handleEdit(internship.id)}>
                    Edit
                  </button>
                  <button className="btn-danger" onClick={() => handleDelete(internship.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default CompanyInternships;
