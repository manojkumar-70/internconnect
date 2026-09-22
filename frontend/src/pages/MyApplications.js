import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { applicationAPI, studentAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/MyApplications.css';

const formatDate = (value) => {
  if (!value) return 'Not available';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Not available' : date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const formatStatus = (value) => String(value || 'Not available')
  .replace(/[_-]+/g, ' ')
  .replace(/\b\w/g, (character) => character.toUpperCase());

const MyApplications = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    if (!user || user.role !== 'student') {
      navigate('/login');
      return;
    }

    const fetchApplications = async () => {
      setLoading(true);
      setError('');
      try {
        const [applicationsResult, interviewsResult] = await Promise.allSettled([
          applicationAPI.getStudentApplications(),
          studentAPI.getInterviews(),
        ]);
        if (applicationsResult.status !== 'fulfilled') {
          throw new Error('Applications could not be loaded');
        }
        const applicationData = applicationsResult.value.data;
        const applicationRecords = Array.isArray(applicationData)
          ? applicationData
          : applicationData?.applications || [];
        const interviewData = interviewsResult.status === 'fulfilled' ? interviewsResult.value.data : [];
        const interviewRecords = Array.isArray(interviewData)
          ? interviewData
          : interviewData?.interviews || [];
        setApplications(applicationRecords);
        setInterviews(interviewRecords);
      } catch (err) {
        setApplications([]);
        setInterviews([]);
        setError('Unable to load your applications right now. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [user, navigate]);

  if (loading) {
    return (
      <>
        <Navbar user={user} onLogout={handleLogout} />
        <div className="applications-page-state">Loading your applications...</div>
      </>
    );
  }

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />
      <div className="container applications-page">
        <div className="applications-header">
          <div>
            <p className="section-tag">Student workspace</p>
            <h1>My Applications</h1>
            <p>Track your real internship applications and interview progress.</p>
          </div>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/internships')}>
            Browse Internships
          </button>
        </div>

        {error && <div className="applications-error" role="alert">{error}</div>}

        {!error && applications.length === 0 ? (
          <div className="applications-empty">
            <h2>You haven't applied to any internships yet.</h2>
            <p>Browse current opportunities and submit your first application.</p>
            <button type="button" className="btn btn-primary" onClick={() => navigate('/internships')}>
              Browse Internships
            </button>
          </div>
        ) : (
          <div className="applications-list">
            {applications.map((application) => {
              const interview = interviews.find((record) => String(record.application?._id || record.application) === String(application._id));
              const internshipId = application.internship?._id;
              return (
                <article key={application._id} className="application-record">
                  <div className="application-record-header">
                    <div>
                      <p className="application-kicker">Internship application</p>
                      <h2>{application.internship?.title || 'Not available'}</h2>
                      <p className="application-company">{application.internship?.company?.companyName || application.internship?.company?.name || 'Not available'}</p>
                    </div>
                    <span className={`application-status status-${String(application.status || 'not-available').toLowerCase()}`}>
                      {formatStatus(application.status)}
                    </span>
                  </div>

                  <div className="application-details">
                    <div><span>Applied</span><strong>{formatDate(application.appliedDate)}</strong></div>
                    <div><span>Interview</span><strong>{interview ? formatStatus(interview.type || 'Scheduled') : 'Not scheduled'}</strong></div>
                    <div><span>Interview date</span><strong>{formatDate(interview?.scheduledAt)}</strong></div>
                  </div>

                  {application.rejectionReason && <p className="application-note"><strong>Rejection reason:</strong> {application.rejectionReason}</p>}

                  <div className="application-actions">
                    {internshipId && <button type="button" className="btn btn-secondary" onClick={() => navigate(`/internships/${internshipId}`)}>View Internship</button>}
                    {application.rejectionRecoveryTasks?.length > 0 && <button type="button" className="btn btn-secondary" onClick={() => navigate('/student-dashboard/tasks')}>View Recovery Tasks</button>}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default MyApplications;
