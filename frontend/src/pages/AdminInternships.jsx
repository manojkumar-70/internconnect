import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/AdminPages.css';

const AdminInternships = () => {
  const [internships, setInternships] = useState([]);

  useEffect(() => {
    setInternships([
      { id: 1, title: 'Frontend Developer Intern', company: 'Tech Company', location: 'Bangalore', applicants: 12, status: 'Active' },
      { id: 2, title: 'Data Analyst Intern', company: 'Growth Labs', location: 'Mumbai', applicants: 9, status: 'Closed' },
      { id: 3, title: 'DevOps Engineer Intern', company: 'Urban Travel', location: 'Hyderabad', applicants: 6, status: 'Active' }
    ]);
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
                <tr key={job.id}>
                  <td>{job.title}</td>
                  <td>{job.company}</td>
                  <td>{job.location}</td>
                  <td>{job.applicants}</td>
                  <td>{job.status}</td>
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
