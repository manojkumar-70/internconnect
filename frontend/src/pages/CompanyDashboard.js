import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  // Check authentication on mount
  useEffect(() => {
    if (!user || user.role !== 'company') {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Show loading state while checking auth
  if (!user || user.role !== 'company') {
    return null;
  }

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />
      <div className="container">
        <div className="card mt-4">
          <h2>Company Dashboard</h2>
          <p>Welcome, {user.companyName || user.name}!</p>

          <div className="grid grid-2 mt-4">
            <div className="card">
              <h3>📝 Post Internship</h3>
              <p>Create new internship positions</p>
              <a href="/internship/create" className="btn btn-primary mt-2">
                Post Internship
              </a>
            </div>

            <div className="card">
              <h3>📊 My Internships</h3>
              <p>Manage your posted internships</p>
              <a href="/company/internships" className="btn btn-primary mt-2">
                View Internships
              </a>
            </div>

            <div className="card">
              <h3>📥 Applications</h3>
              <p>Review student applications</p>
              <a href="/company/applications" className="btn btn-primary mt-2">
                View Applications
              </a>
            </div>

            <div className="card">
              <h3>👥 Teams</h3>
              <p>Create and manage teams</p>
              <a href="/company/teams" className="btn btn-primary mt-2">
                Manage Teams
              </a>
            </div>

            <div className="card">
              <h3>📋 Recovery Tasks</h3>
              <p>Post recovery tasks for rejected candidates</p>
              <a href="/company/tasks" className="btn btn-primary mt-2">
                Create Task
              </a>
            </div>

            <div className="card">
              <h3>⭐ Ratings & Reviews</h3>
              <p>View company ratings and reviews</p>
              <a href="/company/ratings" className="btn btn-primary mt-2">
                View Reviews
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CompanyDashboard;
