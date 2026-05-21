import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/StudentDashboard.css';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');

  // Profile completion calculation
  const [profileCompletion] = useState(65); // Demo value

  // Sample data for recommended internships
  const [recommendedInternships] = useState([
    {
      id: 1,
      company: 'Tech Innovations Inc',
      position: 'Frontend Developer',
      location: 'New York, NY',
      match: 92,
      duration: '3 months',
      salary: '$2000/month'
    },
    {
      id: 2,
      company: 'Data Solutions Ltd',
      position: 'Data Analyst',
      location: 'San Francisco, CA',
      match: 85,
      duration: '6 months',
      salary: '$2500/month'
    },
    {
      id: 3,
      company: 'Creative Studios',
      position: 'UX/UI Designer',
      location: 'Los Angeles, CA',
      match: 78,
      duration: '3 months',
      salary: '$1800/month'
    }
  ]);

  // Sample data for applied internships
  const [appliedInternships] = useState([
    {
      id: 1,
      company: 'Google',
      position: 'Software Engineer Intern',
      status: 'pending',
      appliedDate: '2024-05-10'
    },
    {
      id: 2,
      company: 'Microsoft',
      position: 'Data Science Intern',
      status: 'accepted',
      appliedDate: '2024-05-05'
    },
    {
      id: 3,
      company: 'Amazon',
      position: 'Product Manager Intern',
      status: 'rejected',
      appliedDate: '2024-04-30'
    }
  ]);

  // Sample badges and rankings
  const [badges] = useState([
    { icon: '⭐', name: 'Rising Star', description: 'Applied to 5+ internships' },
    { icon: '🎯', name: 'Quick Learner', description: 'Completed 3 recovery tasks' },
    { icon: '🔥', name: 'On Fire', description: '2+ acceptance rates' }
  ]);

  // Sample recovery tasks
  const [recoveryTasks] = useState([
    {
      id: 1,
      title: 'Improve Resume',
      description: 'Add more technical skills and projects',
      status: 'in-progress',
      progress: 60
    },
    {
      id: 2,
      title: 'Practice Interview',
      description: 'Complete 5 technical interview questions',
      status: 'pending',
      progress: 0
    },
    {
      id: 3,
      title: 'Build Portfolio',
      description: 'Create 2 showcase projects',
      status: 'completed',
      progress: 100
    }
  ]);

  // Check authentication on mount
  useEffect(() => {
    if (!user || user.role !== 'student') {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navigateTo = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const handleTaskClick = (task) => {
    navigate(`/student/tasks/${task.id}`, { state: { task } });
    setSidebarOpen(false);
  };

  // Show loading state while checking auth
  if (!user || user.role !== 'student') {
    return null;
  }

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />
      <div className="dashboard-container">
        {/* Sidebar */}
        <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <h3>Menu</h3>
            <button className="close-btn" onClick={() => setSidebarOpen(false)}>✕</button>
          </div>

          <nav className="sidebar-nav">
            <button
              className={`nav-item ${activeSection === 'overview' ? 'active' : ''}`}
              onClick={() => { setActiveSection('overview'); setSidebarOpen(false); }}
            >
              <span className="nav-icon">📊</span>
              <span>Overview</span>
            </button>

            <button
              className={`nav-item ${activeSection === 'applications' ? 'active' : ''}`}
              onClick={() => { setActiveSection('applications'); setSidebarOpen(false); }}
            >
              <span className="nav-icon">📋</span>
              <span>My Applications</span>
            </button>

            <button
              className={`nav-item ${activeSection === 'recommended' ? 'active' : ''}`}
              onClick={() => { setActiveSection('recommended'); setSidebarOpen(false); }}
            >
              <span className="nav-icon">🔍</span>
              <span>Recommended</span>
            </button>

            <button
              className={`nav-item ${activeSection === 'tasks' ? 'active' : ''}`}
              onClick={() => { setActiveSection('tasks'); setSidebarOpen(false); }}
            >
              <span className="nav-icon">📝</span>
              <span>Recovery Tasks</span>
            </button>

            <button
              className={`nav-item ${activeSection === 'badges' ? 'active' : ''}`}
              onClick={() => { setActiveSection('badges'); setSidebarOpen(false); }}
            >
              <span className="nav-icon">🏆</span>
              <span>Badges & Rankings</span>
            </button>

            <hr className="sidebar-divider" />

            <button className="nav-item" onClick={() => navigateTo('/student/profile')}>
              <span className="nav-icon">👤</span>
              <span>Edit Profile</span>
            </button>

            <button className="nav-item" onClick={() => navigateTo('/internships')}>
              <span className="nav-icon">💼</span>
              <span>Browse Internships</span>
            </button>

            <button className="nav-item" onClick={handleLogout}>
              <span className="nav-icon">🚪</span>
              <span>Logout</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="dashboard-content">
          {/* Mobile Toggle */}
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰ Menu
          </button>

          {/* Welcome Section */}
          <section className="welcome-section">
            <div className="welcome-content">
              <h1>Welcome back, <span className="name">{user.name}!</span> 👋</h1>
              <p className="welcome-subtitle">Continue your journey to find the perfect internship</p>
            </div>
            <div className="welcome-stats">
              <div className="stat-card">
                <span className="stat-number">3</span>
                <span className="stat-label">Applications</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">1</span>
                <span className="stat-label">Accepted</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">3</span>
                <span className="stat-label">Badges</span>
              </div>
            </div>
          </section>

          {/* Profile Completion Section */}
          <section className="profile-completion-section">
            <h2>Profile Completion</h2>
            <div className="completion-card">
              <div className="completion-info">
                <div className="completion-percentage">{profileCompletion}%</div>
                <div className="completion-text">
                  <h3>Almost there!</h3>
                  <p>Complete your profile to improve your match rate</p>
                </div>
              </div>
              <div className="progress-bar-wrapper">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${profileCompletion}%` }}></div>
                </div>
              </div>
              <button className="btn-complete-profile" onClick={() => navigateTo('/student/profile')}>
                Complete Profile →
              </button>
            </div>
          </section>

          {/* Recommended Internships Section */}
          {(activeSection === 'overview' || activeSection === 'recommended') && (
            <section className="internships-section">
              <div className="section-header">
                <h2>🔍 Recommended Internships</h2>
                <button className="view-all-btn" onClick={() => navigateTo('/internships')}>
                  View All →
                </button>
              </div>
              <div className="internships-grid">
                {recommendedInternships.map((internship) => (
                  <div key={internship.id} className="internship-card">
                    <div className="card-header">
                      <h3>{internship.company}</h3>
                      <span className="match-badge">{internship.match}% Match</span>
                    </div>
                    <p className="position">{internship.position}</p>
                    <div className="card-details">
                      <span className="detail">📍 {internship.location}</span>
                      <span className="detail">⏱️ {internship.duration}</span>
                      <span className="detail">💰 {internship.salary}</span>
                    </div>
                    <button className="btn-apply">Apply Now</button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Applied Internships Section */}
          {(activeSection === 'overview' || activeSection === 'applications') && (
            <section className="applications-section">
              <div className="section-header">
                <h2>📋 My Applications</h2>
                <button className="view-all-btn" onClick={() => navigateTo('/my-applications')}>
                  View All →
                </button>
              </div>
              <div className="applications-table">
                <div className="table-header">
                  <span className="col-company">Company</span>
                  <span className="col-position">Position</span>
                  <span className="col-status">Status</span>
                  <span className="col-date">Applied Date</span>
                </div>
                {appliedInternships.map((app) => (
                  <div key={app.id} className="table-row">
                    <span className="col-company">{app.company}</span>
                    <span className="col-position">{app.position}</span>
                    <span className={`col-status status-${app.status}`}>{app.status}</span>
                    <span className="col-date">{app.appliedDate}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Badges & Rankings Section */}
          {(activeSection === 'overview' || activeSection === 'badges') && (
            <section className="badges-section">
              <h2>🏆 Your Badges & Rankings</h2>
              <div className="badges-grid">
                {badges.map((badge, index) => (
                  <div key={index} className="badge-card">
                    <div className="badge-icon">{badge.icon}</div>
                    <h4>{badge.name}</h4>
                    <p>{badge.description}</p>
                  </div>
                ))}
              </div>

              <div className="ranking-card">
                <h3>Overall Ranking</h3>
                <div className="ranking-content">
                  <div className="rank-position">
                    <span className="rank-number">#47</span>
                    <span className="rank-label">Out of 1,000</span>
                  </div>
                  <div className="rank-details">
                    <p>You're in the top 5%! Keep applying and completing tasks to improve your ranking.</p>
                    <div className="rank-metrics">
                      <div className="metric">
                        <span className="metric-value">4.2</span>
                        <span className="metric-label">Avg Rating</span>
                      </div>
                      <div className="metric">
                        <span className="metric-value">67%</span>
                        <span className="metric-label">Acceptance</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Recovery Tasks Section */}
          {(activeSection === 'overview' || activeSection === 'tasks') && (
            <section className="tasks-section">
              <h2>📝 Recovery Tasks</h2>
              <div className="tasks-container">
                {recoveryTasks.map((task) => (
                  <div key={task.id} className={`task-card status-${task.status}`}>
                    <div className="task-header">
                      <h3>{task.title}</h3>
                      <span className={`task-status-badge ${task.status}`}>{task.status}</span>
                    </div>
                    <p className="task-description">{task.description}</p>
                    <div className="task-progress">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${task.progress}%` }}></div>
                      </div>
                      <span className="progress-text">{task.progress}% complete</span>
                    </div>
                    <button className="btn-task" onClick={() => handleTaskClick(task)}>
                      {task.status === 'completed' ? '✓ Completed' : task.status === 'in-progress' ? 'Continue' : 'Start'}
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
      <Footer />
    </>
  );
};

export default StudentDashboard;
