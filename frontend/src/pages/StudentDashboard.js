import React, { useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { studentAPI, internshipAPI, applicationAPI, taskAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import StudentDashboardSection from './StudentDashboardSection';
import '../styles/StudentDashboard.css';

const formatDate = (value) => {
  if (!value) return 'Not available';
  try {
    return new Date(value).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return value;
  }
};

const formatStatus = (status = '') =>
  status
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const normalizeSkillList = (value) => {
  if (!value) return [];

  const values = Array.isArray(value) ? value : String(value).split(',');

  return [...new Set(
    values
      .flatMap((entry) => (typeof entry === 'string' ? entry.split(/[,/|]/) : [entry]))
      .map((entry) => String(entry).trim())
      .filter(Boolean)
  )].map((entry) => entry.toLowerCase());
};

const buildRecommendedInternships = async (internships, studentProfile) => {
  if (!studentProfile) return [];

  const rawStudentSkills = [
    studentProfile.skills,
    studentProfile.interests,
    studentProfile.bio,
    studentProfile.course,
    studentProfile.major,
    studentProfile.degree,
  ].filter(Boolean);
  const studentSkills = normalizeSkillList(rawStudentSkills);
  const studentCgpa = Number(studentProfile.cgpa);

  const hasCgpa = studentProfile.cgpa !== null && studentProfile.cgpa !== undefined && Number.isFinite(studentCgpa);
  if (!studentSkills.length && !hasCgpa) return [];

  const recommendationCandidates = await Promise.all(
    internships.map(async (item) => {
      const jobSkills = normalizeSkillList(item.requiredSkills || item.skills || []);
      const minCgpa = Number(item.minCGPA);

      let matchedSkills = [];
      let missingSkills = [];

      if (jobSkills.length > 0) {
        matchedSkills = jobSkills.filter((skill) => studentSkills.includes(skill));
        missingSkills = jobSkills.filter((skill) => !studentSkills.includes(skill));
      }

      const response = await axios.post('http://localhost:5001/api/resume/match-score', {
        skills: studentSkills,
        jobSkills,
        cgpa: Number.isFinite(studentCgpa) ? studentCgpa : null,
        minCGPA: Number.isFinite(minCgpa) ? minCgpa : null,
      });

      if (response?.data && typeof response.data.matchScore === 'number') {
        const matchScore = response.data.matchScore;
        return {
          id: item._id || item.id,
          company: item.company?.companyName || item.companyName || 'Not available',
          position: item.title || 'Not available',
          location: item.location || 'Not available',
          duration: item.duration || 'Not available',
          salary: item.stipend ? `₹${Number(item.stipend).toLocaleString('en-IN')}/month` : 'Not available',
          match: Math.max(0, Math.min(100, matchScore)),
          matchedSkills: matchedSkills.slice(0, 4),
          missingSkills: missingSkills.slice(0, 4),
          explanation: response.data.explanation || 'Match calculated from your profile and this internship.',
        };
      }

      return null;
    })
  );

  return recommendationCandidates
    .filter(Boolean)
    .filter((item) => item.match > 0)
    .sort((a, b) => b.match - a.match)
    .slice(0, 3);
};

const StudentDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [recommendedInternships, setRecommendedInternships] = useState([]);
  const [recommendationState, setRecommendationState] = useState('loading');
  const [recoveryTasks, setRecoveryTasks] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const section = location.pathname.split('/')[2];
  const activeSection = ['recommended', 'tasks', 'performance'].includes(section) ? section : 'overview';

  useEffect(() => {
    if (!user || user.role !== 'student') {
      navigate('/login');
      return;
    }

    const fetchDashboardData = async () => {
      setLoading(true);
      setError('');

      try {
        const [profileResponse, applicationsResponse, internshipsResponse, tasksResponse, interviewsResponse] =
          await Promise.allSettled([
            studentAPI.getProfile(),
            applicationAPI.getStudentApplications(),
            internshipAPI.getAll({}),
            taskAPI.getAll({}),
            studentAPI.getInterviews(),
          ]);

        if (profileResponse.status === 'fulfilled') {
          setProfile(profileResponse.value.data || null);
        }

        if (applicationsResponse.status === 'fulfilled') {
          const studentApps = Array.isArray(applicationsResponse.value.data)
            ? applicationsResponse.value.data
            : applicationsResponse.value.data?.applications || [];
          setApplications(studentApps);
        }

        if (internshipsResponse.status === 'fulfilled') {
          const items = Array.isArray(internshipsResponse.value.data)
            ? internshipsResponse.value.data
            : internshipsResponse.value.data?.internships || [];

          if (profileResponse.status !== 'fulfilled' || !profileResponse.value.data) {
            setRecommendationState('incomplete');
            setRecommendedInternships([]);
          } else if (items.length === 0) {
            setRecommendationState('empty');
            setRecommendedInternships([]);
          } else {
            const mergedStudentProfile = profileResponse.status === 'fulfilled'
              ? profileResponse.value.data || null
              : null;

            const hasProfileData = normalizeSkillList([
              mergedStudentProfile?.skills,
              mergedStudentProfile?.interests,
              mergedStudentProfile?.bio,
              mergedStudentProfile?.course,
              mergedStudentProfile?.major,
              mergedStudentProfile?.degree,
            ]).length > 0 || (
              mergedStudentProfile?.cgpa !== null &&
              mergedStudentProfile?.cgpa !== undefined &&
              Number.isFinite(Number(mergedStudentProfile.cgpa))
            );

            if (!hasProfileData) {
              setRecommendationState('incomplete');
              setRecommendedInternships([]);
            } else {
              const nextRecommendations = await buildRecommendedInternships(items, mergedStudentProfile);
              setRecommendedInternships(nextRecommendations);
              setRecommendationState(nextRecommendations.length > 0 ? 'ready' : 'empty');
            }
          }
        } else {
          setRecommendationState('error');
          setRecommendedInternships([]);
        }

        if (tasksResponse.status === 'fulfilled') {
          const tasks = Array.isArray(tasksResponse.value.data)
            ? tasksResponse.value.data
            : tasksResponse.value.data?.tasks || [];
          setRecoveryTasks(tasks.slice(0, 3));
        }

        if (interviewsResponse.status === 'fulfilled') {
          const records = Array.isArray(interviewsResponse.value.data)
            ? interviewsResponse.value.data
            : interviewsResponse.value.data?.interviews || [];
          setInterviews(records);
        }
      } catch (err) {
        setRecommendationState('error');
        setError('Some dashboard data could not be loaded.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigateTo = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const navigateToSection = (nextSection) => {
    navigateTo(nextSection === 'overview' ? '/student-dashboard' : `/student-dashboard/${nextSection}`);
  };

  const handleTaskClick = (task) => {
    navigate(`/student/tasks/${task.id}`, { state: { task } });
    setSidebarOpen(false);
  };

  const studentName = profile?.name || user?.name || 'Not available';
  const profileFields = ['name', 'college', 'cgpa', 'skills', 'resume', 'phone', 'bio', 'linkedin', 'portfolio', 'profilePicture'];
  const completedProfileFields = profileFields.filter((field) => {
    const value = profile?.[field];
    return Array.isArray(value) ? value.length > 0 : value !== null && value !== undefined && String(value).trim() !== '';
  }).length;
  const profileCompletion = profile ? Math.round((completedProfileFields / profileFields.length) * 100) : null;

  const summaryMetrics = useMemo(() => {
    const acceptedCount = applications.filter((app) => String(app.status).toLowerCase() === 'accepted').length;
    const pendingCount = applications.filter((app) => String(app.status).toLowerCase() === 'pending').length;
    return {
      totalApplications: applications.length,
      acceptedCount,
      pendingCount,
      interviews: interviews.length,
      skillFit: recommendedInternships[0]?.match ?? null,
    };
  }, [applications, interviews.length, recommendedInternships]);

  const upcomingInterviews = interviews;
  const notifications = [];

  if (!user || user.role !== 'student') {
    return null;
  }

  if (activeSection !== 'overview') {
    return (
      <StudentDashboardSection
        section={activeSection}
        user={user}
        logout={logout}
        navigate={navigate}
      />
    );
  }

  if (loading) {
    return (
      <>
        <Navbar user={user} onLogout={handleLogout} />
        <div className="dashboard-loading">
          <div className="spinner"></div>
          <p>Loading your dashboard…</p>
        </div>
        <Footer />
      </>
    );
  }

  const renderApplicationsTable = () => {
    if (applications.length === 0) {
      return (
        <div className="empty-state">
          <h3>No applications yet</h3>
          <p>Start exploring internships and apply to roles that match your profile.</p>
          <button className="primary-btn" onClick={() => navigateTo('/internships')}>
            Browse Internships
          </button>
        </div>
      );
    }

    return (
      <div className="applications-table">
        <div className="table-header">
          <span>Company</span>
          <span>Role</span>
          <span>Status</span>
          <span>Applied</span>
        </div>
        {applications.slice(0, 5).map((app) => {
          const companyName = app.company?.companyName || app.companyName || 'Not available';
          const roleName = app.internship?.title || app.position || 'Not available';
          const appStatus = String(app.status || 'Not available').toLowerCase();
          const appDate = formatDate(app.appliedDate || app.createdAt);

          return (
            <div key={app._id || app.id || roleName} className="table-row">
              <span className="cell-company">{companyName}</span>
              <span className="cell-position">{roleName}</span>
              <span className={`cell-status status-${appStatus}`}>{formatStatus(appStatus)}</span>
              <span className="cell-date">{appDate}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderRecommendedCards = () => {
    if (recommendationState === 'loading') {
      return <div className="empty-state compact"><h3>Loading recommendations...</h3></div>;
    }

    if (recommendationState === 'error') {
      return <div className="empty-state compact"><h3>Unable to load recommendations.</h3><p>Please try again later.</p></div>;
    }

    if (recommendationState === 'incomplete') {
      return <div className="empty-state compact"><h3>Complete your profile to get recommendations.</h3><button className="secondary-btn" onClick={() => navigateTo('/student/profile')}>Complete Profile</button></div>;
    }

    if (recommendedInternships.length === 0) {
      return (
        <div className="empty-state compact">
          <h3>No recommendations available.</h3>
          <p>No current internships match your profile data.</p>
        </div>
      );
    }

    return (
      <div className="internships-grid ai-grid">
        {recommendedInternships.map((internship) => (
          <article
            key={internship.id || internship._id}
            className="internship-card ai-recommendation-card"
            role="link"
            tabIndex="0"
            onClick={() => navigateTo(`/internships/${internship.id}`)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') navigateTo(`/internships/${internship.id}`);
            }}
          >
            <div className="card-header">
              <div>
                <p className="card-kicker">AI match</p>
                <h3>{internship.company}</h3>
              </div>
              <span className="match-badge">{internship.match}%</span>
            </div>

            <p className="position">{internship.position}</p>

            <div className="card-details">
              <span>📍 {internship.location}</span>
              <span>⏱️ {internship.duration}</span>
              <span>💰 {internship.salary}</span>
            </div>

            <div className="ai-score-box">
              <span className="score-label">AI Match Score</span>
              <strong>{internship.match}%</strong>
            </div>

            <div className="ai-skill-groups">
              <div>
                <span className="skill-label matched">Matched skills</span>
                <div className="skill-list">
                  {internship.matchedSkills.length > 0 ? internship.matchedSkills.map((skill) => (
                    <span key={skill} className="skill-tag matched-tag">{skill}</span>
                  )) : <span className="skill-tag neutral">No direct skill overlaps</span>}
                </div>
              </div>

              <div>
                <span className="skill-label missing">Missing skills</span>
                <div className="skill-list">
                  {internship.missingSkills.length > 0 ? internship.missingSkills.map((skill) => (
                    <span key={skill} className="skill-tag missing-tag">{skill}</span>
                  )) : <span className="skill-tag neutral">No gaps detected</span>}
                </div>
              </div>
            </div>

            <p className="ai-explanation">{internship.explanation}</p>

            <button className="secondary-btn" onClick={() => navigateTo(`/internships/${internship.id}`)}>
              View Role
            </button>
          </article>
        ))}
      </div>
    );
  };

  const renderTasks = () => {
    if (recoveryTasks.length === 0) {
      return (
        <div className="empty-state compact">
          <h3>No active tasks</h3>
          <p>Your preparation checklist is clear and ready for the next milestone.</p>
        </div>
      );
    }

    return (
      <div className="tasks-container">
        {recoveryTasks.map((task) => (
          <article key={task.id || task._id} className={`task-card status-${task.status}`}>
            <div className="task-header">
              <h3>{task.title}</h3>
              <span className={`task-status-badge ${task.status}`}>{formatStatus(task.status)}</span>
            </div>
            <p className="task-description">{task.description}</p>
            <div className="task-progress">
              <div className="progress-bar small-progress">
                <div className="progress-fill" style={{ width: `${task.progress || 0}%` }}></div>
              </div>
              <span className="progress-text">{task.progress || 0}% complete</span>
            </div>
            <button className="task-btn" onClick={() => handleTaskClick(task)}>
              {task.status === 'completed' ? 'Review' : task.status === 'in-progress' ? 'Continue' : 'Start'}
            </button>
          </article>
        ))}
      </div>
    );
  };

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />
      <div className="dashboard-container">
        <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <h3>Menu</h3>
            <button className="close-btn" onClick={() => setSidebarOpen(false)}>✕</button>
          </div>

          <nav className="sidebar-nav">
            <button
              className={`nav-item ${activeSection === 'overview' ? 'active' : ''}`}
              onClick={() => navigateToSection('overview')}
            >
              <span className="nav-icon">📊</span>
              <span>Overview</span>
            </button>

            <button
              className={`nav-item ${activeSection === 'applications' ? 'active' : ''}`}
              onClick={() => navigateTo('/my-applications')}
            >
              <span className="nav-icon">📋</span>
              <span>My Applications</span>
            </button>

            <button
              className={`nav-item ${activeSection === 'recommended' ? 'active' : ''}`}
              onClick={() => navigateToSection('recommended')}
            >
              <span className="nav-icon">🔍</span>
              <span>Recommended</span>
            </button>

            <button
              className={`nav-item ${activeSection === 'tasks' ? 'active' : ''}`}
              onClick={() => navigateToSection('tasks')}
            >
              <span className="nav-icon">📝</span>
              <span>Recovery Tasks</span>
            </button>

            <button
              className={`nav-item ${activeSection === 'performance' ? 'active' : ''}`}
              onClick={() => navigateToSection('performance')}
            >
              <span className="nav-icon">🏆</span>
              <span>Performance</span>
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

        <main className="dashboard-content">
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰ Menu
          </button>

          {error && <div className="dashboard-alert">{error}</div>}

          <section className="welcome-section">
            <div className="welcome-copy">
              <p className="eyebrow">Student dashboard</p>
              <h1>
                Welcome back, <span className="name-pill">{studentName}</span>
              </h1>
              <p className="welcome-subtitle">
                Your internship journey is moving in the right direction. Keep applying and preparing for the next opportunity.
              </p>
            </div>

            <div className="welcome-actions">
              <button className="primary-btn" onClick={() => navigateTo('/internships')}>
                Browse internships
              </button>
              <button className="ghost-btn" onClick={() => navigateTo('/student/profile')}>
                Update profile
              </button>
            </div>
          </section>

          <section className="stats-grid">
            <article className="metric-card">
              <div className="metric-icon">📄</div>
              <div>
                <p className="metric-label">Applications</p>
                <h3>{summaryMetrics.totalApplications}</h3>
              </div>
            </article>

            <article className="metric-card">
              <div className="metric-icon success">✅</div>
              <div>
                <p className="metric-label">Accepted</p>
                <h3>{summaryMetrics.acceptedCount}</h3>
              </div>
            </article>

            <article className="metric-card">
              <div className="metric-icon warning">🎯</div>
              <div>
                <p className="metric-label">Interviews</p>
                <h3>{summaryMetrics.interviews}</h3>
              </div>
            </article>

            <article className="metric-card">
              <div className="metric-icon info">📈</div>
              <div>
                <p className="metric-label">Profile fit</p>
                <h3>{summaryMetrics.skillFit === null ? 'Not available' : `${summaryMetrics.skillFit}%`}</h3>
              </div>
            </article>
          </section>

          <section className="summary-grid">
            <article className="panel profile-summary-card">
              <div className="panel-header">
                <h2>Profile Summary</h2>
                <span className="panel-tag">{profileCompletion === null ? 'Not available' : `${profileCompletion}% complete`}</span>
              </div>

              <div className="profile-summary-body">
                <div className="profile-avatar">{studentName.charAt(0).toUpperCase()}</div>
                <div className="profile-details">
                  <h3>{studentName}</h3>
                  <p>{profile?.email || user.email || 'Not available'}</p>
                  <div className="mini-stats">
                    <span>📍 {profile?.location || 'Not available'}</span>
                    <span>🎓 {profile?.college || 'Not available'}</span>
                  </div>
                </div>
              </div>

              <div className="progress-block">
                {profileCompletion !== null && (
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${profileCompletion}%` }}></div>
                  </div>
                )}
                <button className="link-btn" onClick={() => navigateTo('/student/profile')}>
                  Complete profile →
                </button>
              </div>
            </article>

            <article className="panel performance-card">
              <div className="panel-header">
                <h2>Performance Snapshot</h2>
                <span className="panel-tag accent">This term</span>
              </div>

              <div className="performance-list">
                <div className="performance-item">
                  <span>Attendance</span>
                  <strong>Not available</strong>
                </div>
                <div className="performance-item">
                  <span>CGPA</span>
                  <strong>{profile?.cgpa !== undefined && profile?.cgpa !== null ? `${profile.cgpa} / 10` : 'Not available'}</strong>
                </div>
                <div className="performance-item">
                  <span>Skill readiness</span>
                  <strong>{summaryMetrics.skillFit === null ? 'Not available' : `${summaryMetrics.skillFit}%`}</strong>
                </div>
                <div className="performance-item">
                  <span>Mentor feedback</span>
                  <strong>Not available</strong>
                </div>
              </div>
            </article>
          </section>

          {(activeSection === 'overview' || activeSection === 'applications') && (
            <section className="panel applications-panel">
              <div className="panel-header">
                <h2>Recent Applications</h2>
                <button className="text-btn" onClick={() => navigateTo('/my-applications')}>
                  View all
                </button>
              </div>
              {renderApplicationsTable()}
            </section>
          )}

          <div className="content-grid">
            {(activeSection === 'overview' || activeSection === 'recommended') && (
              <section className="panel panel-span">
                <div className="panel-header">
                  <h2>Recommended Internships</h2>
                  <button className="text-btn" onClick={() => navigateTo('/internships')}>
                    Explore more
                  </button>
                </div>
                {renderRecommendedCards()}
              </section>
            )}

            <aside className="stacked-panel">
              <section className="panel side-panel">
                <div className="panel-header">
                  <h2>Upcoming</h2>
                  <span className="panel-tag">{upcomingInterviews.length} items</span>
                </div>
                <div className="timeline-list">
                  {upcomingInterviews.map((item, index) => (
                    <div key={`${item.title}-${index}`} className="timeline-item">
                      <span className="timeline-dot" />
                      <div>
                        <h4>{item.title}</h4>
                        <p>{item.type || 'Interview'}</p>
                        <small>{formatDate(item.scheduledAt || item.date)}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="panel side-panel">
                <div className="panel-header">
                  <h2>Alerts</h2>
                  <span className="panel-tag accent">{notifications.length} items</span>
                </div>
                <ul className="alert-list">
                  {notifications.map((note, index) => (
                    <li key={`${note}-${index}`}>{note}</li>
                  ))}
                </ul>
              </section>
            </aside>
          </div>

          {(activeSection === 'overview' || activeSection === 'tasks') && (
            <section className="panel tasks-panel">
              <div className="panel-header">
                <h2>Recovery Tasks</h2>
                <button className="text-btn" onClick={() => navigateToSection('tasks')}>
                  Open tasks
                </button>
              </div>
              {renderTasks()}
            </section>
          )}

          {(activeSection === 'overview' || activeSection === 'performance') && (
            <section className="panel badges-panel">
              <div className="panel-header">
                <h2>Quick Actions</h2>
                <span className="panel-tag">Fast access</span>
              </div>
              <div className="quick-actions">
                <button className="quick-action" onClick={() => navigateTo('/internships')}>
                  <span>💼</span> Browse roles
                </button>
                <button className="quick-action" onClick={() => navigateTo('/my-applications')}>
                  <span>📋</span> My applications
                </button>
                <button className="quick-action" onClick={() => navigateTo('/student/profile')}>
                  <span>👤</span> Edit profile
                </button>
                <button className="quick-action" onClick={() => navigateToSection('tasks')}>
                  <span>📝</span> Tasks
                </button>
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
