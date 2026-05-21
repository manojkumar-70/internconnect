import React, { useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  // Check authentication on mount
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Show loading state while checking auth
  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />
      <div className="container">
        <div className="card mt-4">
          <h2>Admin Dashboard</h2>
          <p>System Administration and Management</p>

          <div className="grid grid-2 mt-4">
            <div className="card">
              <h3>📊 Dashboard Stats</h3>
              <p>View platform statistics and metrics</p>
              <Link to="/admin/stats" className="btn btn-primary mt-2">
                View Stats
              </Link>
            </div>

            <div className="card">
              <h3>👨‍🎓 Manage Students</h3>
              <p>View and manage student accounts</p>
              <Link to="/admin/students" className="btn btn-primary mt-2">
                Students
              </Link>
            </div>

            <div className="card">
              <h3>🏢 Manage Companies</h3>
              <p>Verify and manage company accounts</p>
              <Link to="/admin/companies" className="btn btn-primary mt-2">
                Companies
              </Link>
            </div>

            <div className="card">
              <h3>📋 Internships</h3>
              <p>Manage all posted internships</p>
              <Link to="/admin/internships" className="btn btn-primary mt-2">
                Internships
              </Link>
            </div>

            <div className="card">
              <h3>📥 Applications</h3>
              <p>Monitor application statistics</p>
              <Link to="/admin/applications" className="btn btn-primary mt-2">
                Applications
              </Link>
            </div>

            <div className="card">
              <h3>⚙️ Settings</h3>
              <p>Platform configuration and settings</p>
              <Link to="/admin/settings" className="btn btn-primary mt-2">
                Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminDashboard;
