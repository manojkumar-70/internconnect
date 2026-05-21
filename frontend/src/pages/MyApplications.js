import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { applicationAPI } from '../services/api';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MyApplications = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    if (!user || user.role !== 'student') {
      navigate('/login');
      return;
    }

    fetchApplications();
  }, [user]);

  const fetchApplications = async () => {
    try {
      const response = await applicationAPI.getStudentApplications();
      setApplications(response.data);
      setLoading(false);
    } catch (err) {
      toast.error('Failed to load applications');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar user={user} onLogout={handleLogout} />
        <div className="spinner"></div>
      </>
    );
  }

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />
      <div className="container">
        <div className="card mt-4">
          <h2>My Applications</h2>

          {applications.length === 0 ? (
            <p className="text-center mt-4">You haven't applied to any internships yet</p>
          ) : (
            <div className="grid grid-1 mt-4">
              {applications.map((app) => (
                <div key={app._id} className="card">
                  <h3>{app.internship?.title}</h3>
                  <p>
                    <strong>Company:</strong> {app.internship?.company?.companyName}
                  </p>
                  <p>
                    <strong>Applied on:</strong>{' '}
                    {new Date(app.appliedDate).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Status:</strong>{' '}
                    <span
                      style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '0.25rem',
                        backgroundColor:
                          app.status === 'accepted'
                            ? '#d1fae5'
                            : app.status === 'pending'
                            ? '#fef3c7'
                            : '#fee2e2',
                        color:
                          app.status === 'accepted'
                            ? '#065f46'
                            : app.status === 'pending'
                            ? '#92400e'
                            : '#991b1b',
                      }}
                    >
                      {app.status?.toUpperCase()}
                    </span>
                  </p>

                  {app.rejectionReason && (
                    <div className="alert alert-warning mt-2">
                      <strong>Rejection Reason:</strong> {app.rejectionReason}
                    </div>
                  )}

                  {app.rejectionRecoveryTasks?.length > 0 && (
                    <div className="mt-2">
                      <p>
                        <strong>Recovery Tasks:</strong> {app.rejectionRecoveryTasks.length} task(s)
                      </p>
                      <a href="/tasks" className="btn btn-secondary btn-sm">
                        View Tasks
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MyApplications;
