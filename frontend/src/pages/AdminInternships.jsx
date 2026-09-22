import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { internshipAPI } from '../services/api';
import '../styles/AdminPages.css';

const AdminInternships = () => {
  const [internships, setInternships] = useState([]);

  useEffect(() => {
    internshipAPI.getAll({})
      .then((response) => setInternships(Array.isArray(response.data) ? response.data : response.data?.internships || []))
      .catch(() => setInternships([]));
  }, []);

  return (
    <>
      <Navbar />
      <div className="admin-container">
        <div className="admin-header">
          <h1>Manage Internships</h1>
          <p>Review, update, or archive internships posted by companies.</p>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Company</th>
                <th>Location</th>
                <th>Applicants</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {internships.map(job => (
                <tr key={job._id || job.id}>
                  <td>{job.title || 'Not available'}</td>
                  <td>{job.company?.companyName || job.companyName || 'Not available'}</td>
                  <td>{job.location || 'Not available'}</td>
                  <td>{job.applicants?.length || job.applicants || 0}</td>
                  <td>{job.status || 'Not available'}</td>
                  <td>
                    <button className="btn-secondary">View</button>
                    <button className="btn-danger">Archive</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminInternships;
