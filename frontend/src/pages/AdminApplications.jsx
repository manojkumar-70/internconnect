import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/AdminPages.css';

const AdminApplications = () => {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    setApplications([
      {
        id: 1,
        student: 'Arjun Mehta',
        internship: 'Frontend Developer Intern',
        company: 'Tech Company',
        status: 'Pending',
        summary: 'Strong React skills with UI experience.',
        submittedOn: '2026-05-16',
        message: 'I am eager to contribute to frontend design and build polished user experiences.'
      },
      {
        id: 2,
        student: 'Nisha Patel',
        internship: 'Data Analyst Intern',
        company: 'Growth Labs',
        status: 'Reviewed',
        summary: 'SQL and Excel expert with analytics coursework.',
        submittedOn: '2026-05-15',
        message: 'I have completed multiple data science projects and can help generate actionable insights.'
      },
      {
        id: 3,
        student: 'Rahul Singh',
        internship: 'DevOps Engineer Intern',
        company: 'Urban Travel',
        status: 'Accepted',
        summary: 'Hands-on with CI/CD pipelines and cloud automation.',
        submittedOn: '2026-05-17',
        message: 'I enjoy optimizing workflows and automating deployment processes for fast-moving teams.'
      }
    ]);
  }, []);

  const handleDetails = (app) => {
    toast.info(
      `${app.student} applied for ${app.internship} at ${app.company}\nStatus: ${app.status}\nSubmitted: ${app.submittedOn}\nSummary: ${app.summary}\nMessage: ${app.message}`,
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
                <tr key={app.id}>
                  <td>{app.student}</td>
                  <td>{app.internship}</td>
                  <td>{app.company}</td>
                  <td>{app.status}</td>
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
