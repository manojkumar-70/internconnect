import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import { internshipAPI, applicationAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/InternshipDetail.css';

const formatCurrency = (value) => {
  const num = Number(value || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
};

const formatDate = (value) => {
  if (!value) return 'Not specified';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const InternshipDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, logout } = useContext(AuthContext);

  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    const fetchInternship = async () => {
      try {
        const response = await internshipAPI.getById(id);
        setInternship(response.data);

        if (user && user.role === 'student') {
          const applicationsResponse = await applicationAPI.getStudentApplications();
          const applications = Array.isArray(applicationsResponse.data)
            ? applicationsResponse.data
            : Array.isArray(applicationsResponse.data?.applications)
            ? applicationsResponse.data.applications
            : [];

          const matchedApplication = applications.find(
            (item) => String(item.internship?._id || item.internship) === String(id)
          );

          if (matchedApplication) {
            setApplicationStatus(matchedApplication.status || 'pending');
          }
        }
      } catch (err) {
        toast.error('Failed to load internship');
      } finally {
        setLoading(false);
      }
    };

    fetchInternship();
  }, [id, user]);

  const handleApply = async (event) => {
    event.preventDefault();

    if (!user || user.role !== 'student') {
      toast.error('Only students can apply for internships');
      navigate('/login');
      return;
    }

    try {
      setApplying(true);
      const response = await applicationAPI.apply({
        internshipId: id,
        coverLetter,
      });

      const nextStatus = response?.data?.application?.status || 'pending';
      setApplicationStatus(nextStatus);
      setCoverLetter('');
      toast.success('Application submitted successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar user={user} onLogout={handleLogout} />
        <div className="internship-detail-loading">
          <div className="internship-detail-spinner"></div>
          <p>Loading internship details...</p>
        </div>
      </>
    );
  }

  if (!internship) {
    return (
      <>
        <Navbar user={user} onLogout={handleLogout} />
        <div className="internship-detail-empty">
          <h2>Internship not found</h2>
          <p>The internship you are looking for is unavailable or has been removed.</p>
        </div>
      </>
    );
  }

  const companyLogo =
    internship.company?.logo ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      internship.company?.companyName || internship.company?.name || 'Company'
    )}&background=1d4ed8&color=ffffff`;

  const deadline = internship.endDate || internship.deadline || internship.applicationDeadline;
  const eligibility = internship.minCGPA
    ? `Minimum CGPA: ${internship.minCGPA}`
    : 'Eligibility details will be shared by the company during review.';

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />

      <div className="internship-detail-page">
        <div className="internship-detail-shell">
          <div className="internship-detail-hero">
            <div className="internship-company-block">
              <img src={companyLogo} alt={internship.company?.companyName || 'Company'} className="internship-company-logo" />
              <div>
                <p className="internship-company-name">{internship.company?.companyName || 'Company'}</p>
                <span className={`internship-status-badge internship-status-${internship.status || 'open'}`}>
                  {internship.status || 'Open'}
                </span>
              </div>
            </div>

            <div className="internship-hero-main">
              <p className="internship-overline">Internship opportunity</p>
              <h1>{internship.title}</h1>
            </div>

            {user?.role === 'student' && applicationStatus && (
              <div className="application-status-pill">Application status: {applicationStatus}</div>
            )}
          </div>

          <div className="internship-detail-grid">
            <main className="internship-detail-main">
              <section className="internship-card-panel">
                <h2>About this internship</h2>
                <p>{internship.description}</p>
              </section>

              <section className="internship-card-panel">
                <h2>Required skills</h2>
                {internship.requiredSkills?.length ? (
                  <div className="skill-tags">
                    {internship.requiredSkills.map((skill) => (
                      <span key={skill} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                ) : (
                  <p className="muted-copy">No specific skills were listed for this internship.</p>
                )}
              </section>

              <section className="internship-card-panel">
                <h2>Eligibility</h2>
                <p>{eligibility}</p>
              </section>
            </main>

            <aside className="internship-detail-sidebar">
              <div className="internship-summary-card">
                <h3>Opportunity overview</h3>
                <div className="summary-list">
                  <div className="summary-item">
                    <span className="summary-label">Location</span>
                    <strong>{internship.location || 'Remote'}</strong>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Duration</span>
                    <strong>{internship.duration || 'Flexible'}</strong>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Stipend</span>
                    <strong>{formatCurrency(internship.stipend)}</strong>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Application deadline</span>
                    <strong>{formatDate(deadline)}</strong>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Type</span>
                    <strong>{internship.type || 'Full-time'}</strong>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Open positions</span>
                    <strong>{internship.positionsAvailable ?? 'Open'}</strong>
                  </div>
                </div>

                {user?.role === 'student' && internship.status === 'open' && !applicationStatus && (
                  <form onSubmit={handleApply} className="internship-apply-form">
                    <label htmlFor="cover-letter">Why do you want to apply?</label>
                    <textarea
                      id="cover-letter"
                      value={coverLetter}
                      onChange={(event) => setCoverLetter(event.target.value)}
                      rows="5"
                      placeholder="Tell the company why you're a good fit for this internship..."
                    />

                    <button type="submit" className="apply-primary-btn" disabled={applying}>
                      {applying ? 'Applying...' : 'Apply Now'}
                    </button>
                  </form>
                )}

                {user?.role === 'student' && applicationStatus && (
                  <div className="applied-state-box">
                    <p className="applied-title">Application status</p>
                    <strong>{applicationStatus}</strong>
                  </div>
                )}

                {user?.role === 'student' && internship.status !== 'open' && (
                  <div className="internship-closed-banner">
                    This internship is currently closed.
                  </div>
                )}

                {!user && (
                  <div className="login-prompt-box">
                    <p>Please log in as a student to apply for this internship.</p>
                    <button type="button" className="apply-primary-btn" onClick={() => navigate('/login')}>
                      Log in
                    </button>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default InternshipDetail;
