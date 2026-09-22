import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/AdminPages.css';
import { adminAPI } from '../services/api';

const AdminStats = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    Promise.all([adminAPI.getDashboardStats(), adminAPI.getApplicationStats(), adminAPI.getCompanies()])
      .then(([dashboardResponse, applicationResponse, companiesResponse]) => {
        const dashboard = dashboardResponse.data || {};
        const companies = Array.isArray(companiesResponse.data) ? companiesResponse.data : [];
        setStats({
          totalStudents: dashboard.students || 0,
          totalCompanies: dashboard.companies || 0,
          totalInternships: dashboard.internships || 0,
          totalApplications: dashboard.applications || 0,
          activePostings: dashboard.internships || 0,
          verifiedCompanies: companies.filter((company) => company.isVerified).length,
        });
      })
      .catch(() => setStats({
        totalStudents: 0,
        totalCompanies: 0,
        totalInternships: 0,
        totalApplications: 0,
        activePostings: 0,
        verifiedCompanies: 0,
      }));
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
