import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { companyAPI, applicationAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/CompanyPages.css';

const formatDate = (value) => {
  if (!value) return 'Recently';

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

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [companyProfile, setCompanyProfile] = useState(null);
  const [internships, setInternships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!user || user.role !== 'company') {
      navigate('/login');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const [profileResponse, internshipsResponse] = await Promise.allSettled([
          companyAPI.getProfile(),
          companyAPI.getInternships(),
        ]);

        const companyData = profileResponse.status === 'fulfilled' ? profileResponse.value.data : user;
        setCompanyProfile(companyData);

        const companyInternships = internshipsResponse.status === 'fulfilled'
          ? (Array.isArray(internshipsResponse.value.data)
              ? internshipsResponse.value.data
              : internshipsResponse.value.data?.postedInternships || [])
          : [];

        setInternships(companyInternships);

        const applicantResults = await Promise.allSettled(
          companyInternships.map(async (internship) => {
            const internshipId = internship._id || internship.id;
            if (!internshipId) return [];

            const response = await applicationAPI.getInternshipApplications(internshipId);
            const items = Array.isArray(response.data) ? response.data : response.data?.applications || [];

            return items.map((application) => ({
              ...application,
              internship: application.internship || internship,
              student: application.student || null,
              _id: application._id || application.id,
            }));
          })
        );

        const flattenedApplications = applicantResults
          .filter((result) => result.status === 'fulfilled')
          .flatMap((result) => result.value)
          .filter(Boolean);

        setApplications(flattenedApplications);
      } catch {
        setApplications([]);
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

  const handleStatusAction = async (applicationId, action) => {
    try {
      if (action === 'accept') {
        await applicationAPI.accept(applicationId);
      } else {
        await applicationAPI.reject(applicationId, { rejectionReason: 'Not selected for this role.' });
      }

      setApplications((prev) =>
        prev.map((item) =>
          item._id === applicationId
            ? { ...item, status: action === 'accept' ? 'accepted' : 'rejected' }
            : item
        )
      );
    } catch (error) {
      console.error('Status update failed', error);
    }
  };

  const summaryMetrics = useMemo(() => {
    const activeInternships = internships.filter((internship) => {
      const value = String(internship.status || '').toLowerCase();
      return value === 'open' || value === 'active' || value === 'in-progress';
    }).length;

    const shortlistedCandidates = applications.filter((app) => String(app.status || '').toLowerCase() === 'accepted').length;
    const pendingApplications = applications.filter((app) => String(app.status || '').toLowerCase() === 'pending').length;

    return {
      activeInternships,
      totalApplications: applications.length,
      shortlistedCandidates,
      pendingApplications,
    };
  }, [applications, internships]);

  const recentApplicants = useMemo(
    () => [...applications].sort((a, b) => new Date(b.appliedDate || b.createdAt || 0) - new Date(a.appliedDate || a.createdAt || 0)).slice(0, 5),
    [applications]
  );

  const filteredApplicants = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return applications.filter((application) => {
      const applicantName = application.student?.name || 'Unknown candidate';
      const internshipTitle = application.internship?.title || 'Role';
      const status = String(application.status || 'pending').toLowerCase();
      const skills = (application.student?.skills || []).join(' ').toLowerCase();

      const matchesSearch =
        !query ||
        applicantName.toLowerCase().includes(query) ||
        internshipTitle.toLowerCase().includes(query) ||
        skills.includes(query);

      const matchesStatus = statusFilter === 'all' || status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [applications, searchTerm, statusFilter]);

  if (!user || user.role !== 'company') {
    return null;
  }

  if (loading) {
    return (
      <>
        <Navbar user={user} onLogout={handleLogout} />
        <div className="company-dashboard-loading">
          <div className="company-spinner"></div>
          <p>Loading hiring dashboard…</p>
        </div>
        <Footer />
      </>
    );
  }

  const companyName = companyProfile?.companyName || user.companyName || user.name || 'Company';

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />
      <div className="company-dashboard-shell">
        <div className="company-dashboard-container">
          <header className="company-dashboard-header">
            <div>
              <p className="section-kicker">Recruiter dashboard</p>
              <h1>Welcome back, {companyName}</h1>
            </div>

            <div className="header-actions">
              <button className="btn-primary" onClick={() => navigate('/internship/create')}>Post internship</button>
              <button className="btn-secondary" onClick={() => navigate('/company/internships')}>Manage internships</button>
            </div>
          </header>

          <section className="stats-grid company-stats-grid">
            <article className="company-stat-card">
              <div className="company-stat-icon blue">📈</div>
              <div>
                <p>Active internships</p>
                <strong>{summaryMetrics.activeInternships}</strong>
              </div>
            </article>

            <article className="company-stat-card">
              <div className="company-stat-icon purple">📥</div>
              <div>
                <p>Total applications</p>
                <strong>{summaryMetrics.totalApplications}</strong>
              </div>
            </article>

            <article className="company-stat-card">
              <div className="company-stat-icon green">✅</div>
              <div>
                <p>Shortlisted</p>
                <strong>{summaryMetrics.shortlistedCandidates}</strong>
              </div>
            </article>

            <article className="company-stat-card">
              <div className="company-stat-icon orange">⏳</div>
              <div>
                <p>Pending</p>
                <strong>{summaryMetrics.pendingApplications}</strong>
              </div>
            </article>
          </section>

          <section className="company-main-grid">
            <div className="company-main-panel">
              <div className="panel-header-row">
                <h2>Recent applicants</h2>
                <button className="text-link" onClick={() => navigate('/company/applications')}>View all</button>
              </div>

              <div className="recent-applicant-list">
                {recentApplicants.length > 0 ? recentApplicants.map((application) => (
                  <div className="recent-applicant-item" key={application._id}>
                    <div className="avatar-circle">
                      {(application.student?.name || 'C').charAt(0).toUpperCase()}
                    </div>
                    <div className="recent-applicant-copy">
                      <h3>{application.student?.name || 'Unknown candidate'}</h3>
                      <p>{application.internship?.title || 'Role application'}</p>
                    </div>
                    <span className={`status-pill status-${String(application.status || 'pending').toLowerCase()}`}>
                      {formatStatus(String(application.status || 'pending'))}
                    </span>
                  </div>
                )) : (
                  <div className="empty-mini-state">No recent applications yet.</div>
                )}
              </div>
            </div>

            <aside className="company-side-panel">
              <div className="panel-header-row">
                <h2>Internship management</h2>
              </div>

              <div className="internship-mini-list">
                {internships.length > 0 ? internships.slice(0, 4).map((internship) => (
                  <div className="mini-internship-card" key={internship._id || internship.id}>
                    <div>
                      <h3>{internship.title}</h3>
                      <p>{internship.location || 'Remote'}</p>
                    </div>
                    <div className="mini-internship-meta">
                      <span>{internship.applicants?.length || internship.applicants || 0} applicants</span>
                      <button className="text-link" onClick={() => navigate('/company/internships')}>Open</button>
                    </div>
                  </div>
                )) : (
                  <div className="empty-mini-state">No internships posted yet.</div>
                )}
              </div>
            </aside>
          </section>

          <section className="company-applicants-panel">
            <div className="panel-header-row applicant-toolbar">
              <h2>Applicant pipeline</h2>

              <div className="toolbar-controls">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search candidates or skills"
                  className="applicant-search"
                />

                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="status-filter"
                >
                  <option value="all">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {filteredApplicants.length > 0 ? (
              <div className="applicant-list">
                {filteredApplicants.map((application) => {
                  const student = application.student || {};
                  const skills = Array.isArray(student.skills) ? student.skills : [];
                  const applicantStatus = String(application.status || 'pending').toLowerCase();

                  return (
                    <article className="applicant-card" key={application._id}>
                      <div className="applicant-header">
                        <div className="applicant-profile">
                          <div className="avatar-circle large">
                            {(student.name || 'C').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3>{student.name || 'Candidate'}</h3>
                            <p>{application.internship?.title || 'Internship application'}</p>
                          </div>
                        </div>

                        <span className={`status-pill status-${applicantStatus}`}>
                          {formatStatus(applicantStatus)}
                        </span>
                      </div>

                      <div className="applicant-meta-grid">
                        <div>
                          <span className="meta-label">College</span>
                          <strong>{student.college || 'Not provided'}</strong>
                        </div>
                        <div>
                          <span className="meta-label">CGPA</span>
                          <strong>{student.cgpa ?? '—'}</strong>
                        </div>
                        <div>
                          <span className="meta-label">Applied</span>
                          <strong>{formatDate(application.appliedDate || application.createdAt)}</strong>
                        </div>
                      </div>

                      <div className="candidate-summary-box">
                        <span className="meta-label">Profile summary</span>
                        <p>
                          {student.bio || 'Candidate profile is active and ready for review.'}
                        </p>
                      </div>

                      <div className="skills-stack">
                        <span className="meta-label">Skills</span>
                        <div className="skill-badges">
                          {skills.length > 0 ? skills.slice(0, 8).map((skill) => (
                            <span className="skill-badge" key={`${student.name}-${skill}`}>{skill}</span>
                          )) : <span className="skill-badge empty-skill">No skills listed</span>}
                        </div>
                      </div>

                      <div className="applicant-actions">
                        <button className="btn-primary small-btn" onClick={() => handleStatusAction(application._id, 'accept')}>Shortlist</button>
                        <button className="btn-secondary small-btn" onClick={() => handleStatusAction(application._id, 'reject')}>Reject</button>
                        <button className="text-link" onClick={() => navigate('/company/applications')}>View profile</button>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state-box">No applications match your current filter.</div>
            )}
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CompanyDashboard;
