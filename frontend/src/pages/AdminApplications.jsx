import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { adminAPI } from '../services/api';
import '../styles/AdminPages.css';

const AdminApplications = () => {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    adminAPI.getApplications()
      .then((response) => setApplications(Array.isArray(response.data) ? response.data : response.data?.applications || []))
      .catch(() => setApplications([]));
  }, []);

  const handleDetails = (app) => {
    toast.info(
      `${app.student?.name || 'Not available'} applied for ${app.internship?.title || 'Not available'} at ${app.internship?.company?.companyName || 'Not available'}\nStatus: ${app.status || 'Not available'}\nSubmitted: ${app.appliedDate || 'Not available'}\nMessage: ${app.coverLetter || 'Not available'}`,
      { autoClose: 7000, pauseOnHover: true }
    );
  };

  return (
    <>
      <Navbar />
      <div className="admin-container">
        <div className="admin-header">
          <h1>Manage Applications</h1>
          <p>Monitor applications across companies and verify submission statuses.</p>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Internship</th>
                <th>Company</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app._id || app.id}>
                  <td>{app.student?.name || 'Not available'}</td>
                  <td>{app.internship?.title || 'Not available'}</td>
                  <td>{app.internship?.company?.companyName || 'Not available'}</td>
                  <td>{app.status || 'Not available'}</td>
                  <td>
                    <button className="btn-secondary" onClick={() => handleDetails(app)}>
                      Details
                    </button>
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

export default AdminApplications;
