import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/AdminPages.css';

const AdminStats = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    setStats({
      totalStudents: 824,
      totalCompanies: 118,
      totalInternships: 320,
      totalApplications: 1524,
      activePostings: 205,
      verifiedCompanies: 94
    });
  }, []);

  if (!stats) {
    return <div className="admin-loading">Loading...</div>;
  }

  return (
    <>
      <Navbar />
      <div className="admin-container">
        <div className="admin-header">
          <h1>Platform Statistics</h1>
          <p>High-level metrics for students, companies, internships, and applications.</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h2>{stats.totalStudents}</h2>
            <p>Registered Students</p>
          </div>
          <div className="stat-card">
            <h2>{stats.totalCompanies}</h2>
            <p>Registered Companies</p>
          </div>
          <div className="stat-card">
            <h2>{stats.totalInternships}</h2>
            <p>Total Internships</p>
          </div>
          <div className="stat-card">
            <h2>{stats.totalApplications}</h2>
            <p>Total Applications</p>
          </div>
          <div className="stat-card">
            <h2>{stats.activePostings}</h2>
            <p>Active Postings</p>
          </div>
          <div className="stat-card">
            <h2>{stats.verifiedCompanies}</h2>
            <p>Verified Companies</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminStats;
