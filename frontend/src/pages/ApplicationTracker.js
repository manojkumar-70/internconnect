import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/ApplicationTracker.css';

const ApplicationTracker = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  // Sample application data - In production, this would come from the backend
  const [applications] = useState([
    {
      _id: '1',
      studentId: user?._id,
      internshipTitle: 'Frontend Developer',
      companyName: 'Tech Innovations Inc',
      companyLogo: 'https://via.placeholder.com/60?text=TII',
      location: 'Bangalore, India',
      stipend: 25000,
      applicationDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      progress: 30,
    },
    {
      _id: '2',
      studentId: user?._id,
      internshipTitle: 'Full Stack Developer',
      companyName: 'Tech Innovations Inc',
      companyLogo: 'https://via.placeholder.com/60?text=TII',
      location: 'Bangalore, India',
      stipend: 38000,
      applicationDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'accepted',
      progress: 100,
    },
    {
      _id: '3',
      studentId: user?._id,
      internshipTitle: 'Data Analyst',
      companyName: 'Data Solutions Ltd',
      companyLogo: 'https://via.placeholder.com/60?text=DSL',
      location: 'Mumbai, India',
      stipend: 30000,
      applicationDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'rejected',
      progress: 0,
    },
    {
      _id: '4',
      studentId: user?._id,
      internshipTitle: 'Backend Engineer',
      companyName: 'Cloud Systems Inc',
      companyLogo: 'https://via.placeholder.com/60?text=CSI',
      location: 'Delhi, India',
      stipend: 32000,
      applicationDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'interview',
      progress: 60,
    },
    {
      _id: '5',
      studentId: user?._id,
      internshipTitle: 'Machine Learning Intern',
      companyName: 'Data Solutions Ltd',
      companyLogo: 'https://via.placeholder.com/60?text=DSL',
      location: 'Mumbai, India',
      stipend: 40000,
      applicationDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      progress: 30,
    },
  ]);

  const [filteredApplications, setFilteredApplications] = useState(applications);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Check authentication on mount
  useEffect(() => {
    if (!user || user.role !== 'student') {
      navigate('/login');
    }
  }, [user, navigate]);

  // Filter and sort applications
  useEffect(() => {
    let filtered = applications;

    // Filter by status
    if (activeFilter !== 'all') {
      filtered = filtered.filter((app) => app.status === activeFilter);
    }

    // Sort
    if (sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.applicationDate) - new Date(a.applicationDate));
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.applicationDate) - new Date(b.applicationDate));
    } else if (sortBy === 'stipend-high') {
      filtered.sort((a, b) => b.stipend - a.stipend);
    } else if (sortBy === 'stipend-low') {
      filtered.sort((a, b) => a.stipend - b.stipend);
    }

    setFilteredApplications(filtered);
  }, [activeFilter, sortBy, applications]);

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      interview: '📞',
      accepted: '✅',
      rejected: '❌',
      withdrawn: '↩️',
    };
    return icons[status] || '📋';
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffc107',
      interview: '#17a2b8',
      accepted: '#28a745',
      rejected: '#dc3545',
      withdrawn: '#6c757d',
    };
    return colors[status] || '#667eea';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Statistics
  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === 'pending').length,
    accepted: applications.filter((a) => a.status === 'accepted').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  };

  if (!user || user.role !== 'student') {
    return null;
  }

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />
      <div className="application-tracker-container">
        {/* Header Section */}
        <section className="tracker-header">
          <h1>Application Status Tracker</h1>
          <p>Track all your internship applications in one place</p>
        </section>

        {/* Statistics */}
        <section className="stats-section">
          <div className="stat-card">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Applications</div>
          </div>
          <div className="stat-card accent-pending">
            <div className="stat-number">{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card accent-accepted">
            <div className="stat-number">{stats.accepted}</div>
            <div className="stat-label">Accepted</div>
          </div>
          <div className="stat-card accent-rejected">
            <div className="stat-number">{stats.rejected}</div>
            <div className="stat-label">Rejected</div>
          </div>
        </section>

        {/* Filters and Sorting */}
        <section className="controls-section">
          <div className="filter-controls">
            <button
              className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All Applications
            </button>
            <button
              className={`filter-btn ${activeFilter === 'pending' ? 'active' : ''}`}
              onClick={() => setActiveFilter('pending')}
            >
              ⏳ Pending
            </button>
            <button
              className={`filter-btn ${activeFilter === 'interview' ? 'active' : ''}`}
              onClick={() => setActiveFilter('interview')}
            >
              📞 Interview
            </button>
            <button
              className={`filter-btn ${activeFilter === 'accepted' ? 'active' : ''}`}
              onClick={() => setActiveFilter('accepted')}
            >
              ✅ Accepted
            </button>
            <button
              className={`filter-btn ${activeFilter === 'rejected' ? 'active' : ''}`}
              onClick={() => setActiveFilter('rejected')}
            >
              ❌ Rejected
            </button>
          </div>

          <div className="sort-controls">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest First</option>
              <option value="stipend-high">Highest Stipend</option>
              <option value="stipend-low">Lowest Stipend</option>
            </select>
          </div>
        </section>

        {/* Applications List */}
        <section className="applications-list-section">
          {filteredApplications.length === 0 ? (
            <div className="no-applications">
              <p className="emoji">📭</p>
              <p className="message">No applications found</p>
              <button onClick={() => navigate('/internships')} className="btn-browse">
                Browse Internships →
              </button>
            </div>
          ) : (
            <div className="applications-container">
              {filteredApplications.map((app) => (
                <div key={app._id} className="application-card">
                  {/* Card Header */}
                  <div className="app-card-header">
                    <div className="company-info">
                      <img src={app.companyLogo} alt={app.companyName} className="company-logo" />
                      <div className="company-details">
                        <h3 className="job-title">{app.internshipTitle}</h3>
                        <p className="company-name">{app.companyName}</p>
                        <p className="location">📍 {app.location}</p>
                      </div>
                    </div>
                    <div className="status-badge" style={{ borderColor: getStatusColor(app.status) }}>
                      <span className="status-icon">{getStatusIcon(app.status)}</span>
                      <span className="status-text">{app.status}</span>
                    </div>
                  </div>

                  {/* Card Details */}
                  <div className="app-card-details">
                    <div className="detail-item">
                      <span className="label">Applied</span>
                      <span className="value">{formatDate(app.applicationDate)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Stipend</span>
                      <span className="value">₹{app.stipend.toLocaleString()}/month</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="progress-section">
                    <div className="progress-info">
                      <span className="progress-label">Application Progress</span>
                      <span className="progress-percent">{app.progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${app.progress}%`,
                          backgroundColor: getStatusColor(app.status),
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Status Timeline */}
                  <div className="status-timeline">
                    <div className={`timeline-item ${app.status === 'pending' || ['interview', 'accepted', 'rejected'].includes(app.status) ? 'active' : ''}`}>
                      <div className="timeline-dot">✓</div>
                      <span>Applied</span>
                    </div>
                    <div className={`timeline-item ${['interview', 'accepted', 'rejected'].includes(app.status) ? 'active' : ''}`}>
                      <div className="timeline-dot">📞</div>
                      <span>Interview</span>
                    </div>
                    <div className={`timeline-item ${app.status === 'accepted' ? 'active' : ''}`}>
                      <div className="timeline-dot">✓</div>
                      <span>Accepted</span>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="app-card-actions">
                    {app.status === 'interview' && (
                      <button className="btn-action btn-interview">📞 Schedule Interview</button>
                    )}
                    {app.status === 'accepted' && (
                      <button className="btn-action btn-accepted">🎉 Celebrate!</button>
                    )}
                    {app.status === 'rejected' && (
                      <button className="btn-action btn-rejected" onClick={() => navigate('/internships')}>
                        🔄 Browse More
                      </button>
                    )}
                    {app.status === 'pending' && (
                      <button className="btn-action btn-pending">⏳ Waiting for Response</button>
                    )}
                    <button className="btn-action btn-details">View Details →</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
      <Footer />
    </>
  );
};

export default ApplicationTracker;
