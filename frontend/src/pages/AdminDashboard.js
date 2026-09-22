import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { adminAPI } from '../services/api';
import { internshipAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/AdminPages.css';

const formatStatus = (value = '') =>
  String(value)
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCompanies: 0,
    activeInternships: 0,
    totalApplications: 0,
    pendingActions: 0,
    verifiedCompanies: 0,
  });
  const [students, setStudents] = useState([]);
  const [applications, setApplications] = useState([]);
  const [internships, setInternships] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }

    const fetchDashboardData = async () => {
      setLoading(true);
      setError('');

      try {
        const [statsResult, studentsResult, applicationsResult, companiesResult, internshipsResult] = await Promise.allSettled([
          adminAPI.getDashboardStats(),
          adminAPI.getStudents(),
          adminAPI.getApplications(),
          adminAPI.getCompanies(),
          internshipAPI.getAll({}),
        ]);

        if (statsResult.status === 'fulfilled') {
          const payload = statsResult.value?.data ?? statsResult.value ?? {};
          setStats({
            totalStudents: payload.totalStudents ?? payload.students ?? 0,
            totalCompanies: payload.totalCompanies ?? payload.companies ?? 0,
            activeInternships: payload.activeInternships ?? payload.internships ?? 0,
            totalApplications: payload.totalApplications ?? payload.applications ?? 0,
            pendingActions: payload.pendingActions ?? payload.pending ?? 0,
            verifiedCompanies: payload.verifiedCompanies ?? payload.verified ?? 0,
          });
        }

        if (studentsResult.status === 'fulfilled') {
          const payload = studentsResult.value?.data ?? studentsResult.value ?? [];
          const studentList = Array.isArray(payload)
            ? payload
            : Array.isArray(payload.students)
            ? payload.students
            : [];
          setStudents(studentList.map((student) => ({
            id: student._id || student.id,
            name: student.name || 'Not available',
            email: student.email || 'Not available',
            college: student.college || 'Not available',
            status: student.status || 'Not available',
            performance: student.performance || 'Not available',
          })));
        }

        if (applicationsResult.status === 'fulfilled') {
          const payload = applicationsResult.value?.data ?? applicationsResult.value ?? {};
          const recent = Array.isArray(payload)
            ? payload
            : Array.isArray(payload.recentApplications)
            ? payload.recentApplications
            : [];
          setApplications(recent.map((app) => ({
            id: app._id || app.id,
            student: app.student?.name || 'Not available',
            internship: app.internship?.title || 'Not available',
            company: app.company?.companyName || 'Not available',
            status: app.status || 'Not available',
            date: app.appliedDate || app.submittedOn || 'Not available',
          })));
        }

        if (internshipsResult.status === 'fulfilled') {
          const payload = internshipsResult.value?.data ?? internshipsResult.value ?? [];
          const internshipList = Array.isArray(payload)
            ? payload
            : Array.isArray(payload.internships)
            ? payload.internships
            : [];
          setInternships(internshipList.slice(0, 5));
        }

        if (companiesResult.status === 'fulfilled') {
          const payload = companiesResult.value?.data ?? companiesResult.value ?? [];
          const companyList = Array.isArray(payload)
            ? payload
            : Array.isArray(payload.companies)
            ? payload.companies
            : [];
          if (companyList.length > 0) {
            setAlerts(companyList
              .filter((company) => !company.isVerified)
              .map((company) => `${company.companyName || 'Company'} requires verification.`));
          }
        }
      } catch (err) {
        setError('Some dashboard data could not be loaded. Showing the latest available information.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.college.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || student.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [students, searchTerm, statusFilter]);

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />
      <div className="admin-dashboard-shell">
        <div className="admin-dashboard-header">
          <div>
            <p className="admin-kicker">Mentor dashboard</p>
            <h1>Welcome back, {user.name || 'Admin'}.</h1>
          </div>
          <div className="admin-header-actions">
            <Link to="/admin/stats" className="admin-primary-btn">Platform stats</Link>
            <Link to="/admin/settings" className="admin-secondary-btn">Settings</Link>
          </div>
        </div>

        {error && <div className="admin-alert">{error}</div>}

        {loading ? (
          <div className="admin-loading-block">
            <div className="admin-spinner"></div>
            <p>Loading dashboard data…</p>
          </div>
        ) : (
          <>
            <section className="admin-metrics-grid">
              <article className="admin-metric-card">
                <div className="admin-metric-icon blue">👨‍🎓</div>
                <div>
                  <p>Total students</p>
                  <h3>{stats.totalStudents}</h3>
                </div>
              </article>

              <article className="admin-metric-card">
                <div className="admin-metric-icon green">💼</div>
                <div>
                  <p>Active internships</p>
                  <h3>{stats.activeInternships}</h3>
                </div>
              </article>

              <article className="admin-metric-card">
                <div className="admin-metric-icon purple">📥</div>
                <div>
                  <p>Applications</p>
                  <h3>{stats.totalApplications}</h3>
                </div>
              </article>

              <article className="admin-metric-card">
                <div className="admin-metric-icon orange">⚠️</div>
                <div>
                  <p>Pending actions</p>
                  <h3>{stats.pendingActions}</h3>
                </div>
              </article>
            </section>

            <section className="admin-main-grid">
              <article className="admin-panel admin-panel-large">
                <div className="admin-panel-header">
                  <h2>Student performance overview</h2>
                  <Link to="/admin/students" className="admin-link">View all</Link>
                </div>

                <div className="admin-performance-list">
                  {students.slice(0, 4).map((student) => (
                    <div key={student.id} className="admin-performance-item">
                      <div>
                        <h4>{student.name}</h4>
                        <small>{student.college}</small>
                      </div>
                      <div className="admin-performance-right">
                        <span className={`admin-status-badge ${student.status.toLowerCase()}`}>
                          {student.status}
                        </span>
                        <strong>{student.performance}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article className="admin-panel">
                <div className="admin-panel-header">
                  <h2>Notifications</h2>
                  <span className="admin-tag">Live</span>
                </div>
                <ul className="admin-alert-list">
                  {alerts.map((alert, index) => (
                    <li key={`${alert}-${index}`}>{alert}</li>
                  ))}
                </ul>
              </article>
            </section>

            <section className="admin-content-grid">
              <article className="admin-panel">
                <div className="admin-panel-header">
                  <h2>Recent applications</h2>
                  <Link to="/admin/applications" className="admin-link">View all</Link>
                </div>

                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((application) => (
                        <tr key={application.id}>
                          <td>{application.student}</td>
                          <td>{application.internship}</td>
                          <td>
                            <span className={`admin-status-badge ${String(application.status).toLowerCase()}`}>
                              {formatStatus(application.status)}
                            </span>
                          </td>
                          <td>{new Date(application.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>

              <article className="admin-panel">
                <div className="admin-panel-header">
                  <h2>Quick actions</h2>
                </div>
                <div className="admin-quick-actions">
                  <Link className="admin-action-btn" to="/admin/students">👨‍🎓 Students</Link>
                  <Link className="admin-action-btn" to="/admin/companies">🏢 Companies</Link>
                  <Link className="admin-action-btn" to="/admin/internships">📋 Internships</Link>
                  <Link className="admin-action-btn" to="/admin/applications">📥 Applications</Link>
                </div>
              </article>
            </section>

            <section className="admin-panel admin-panel-wide">
              <div className="admin-panel-header">
                <h2>Student directory</h2>
                <div className="admin-filter-row">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search student, email or college"
                    aria-label="Search students"
                  />
                  <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter students by status">
                    <option value="all">All statuses</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              {filteredStudents.length === 0 ? (
                <div className="admin-empty-state">
                  <h3>No students match this filter.</h3>
                  <p>Try a different search or reset the status filter.</p>
                </div>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>College</th>
                        <th>Status</th>
                        <th>Performance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((student) => (
                        <tr key={student.id}>
                          <td>{student.name}</td>
                          <td>{student.email}</td>
                          <td>{student.college}</td>
                          <td>
                            <span className={`admin-status-badge ${student.status.toLowerCase()}`}>
                              {student.status}
                            </span>
                          </td>
                          <td>{student.performance}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="admin-panel admin-panel-wide">
              <div className="admin-panel-header">
                <h2>Internship management</h2>
                <Link to="/admin/internships" className="admin-link">Manage all</Link>
              </div>

              <div className="admin-internship-list">
                {internships.map((internship) => (
                  <article key={internship.id} className="admin-internship-card">
                    <div className="admin-internship-top">
                      <div>
                        <p className="admin-card-label">Internship</p>
                        <h3>{internship.title}</h3>
                      </div>
                      <span className={`admin-status-badge ${String(internship.status).toLowerCase()}`}>
                        {internship.status}
                      </span>
                    </div>

                    <div className="admin-internship-meta">
                      <span>🏢 {internship.company}</span>
                      <span>📍 {internship.location}</span>
                      <span>📨 {internship.applicants} applicants</span>
                    </div>

                    <div className="admin-internship-actions">
                      <button className="admin-small-btn secondary" type="button">View</button>
                      <button className="admin-small-btn danger" type="button">Archive</button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
      <Footer />
    </>
  );
};

export default AdminDashboard;
