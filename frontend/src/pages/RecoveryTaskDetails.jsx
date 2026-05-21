import React from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/StudentDashboard.css';

const defaultTask = {
  title: 'Recovery Task',
  description: 'Details about this recovery task will appear here.',
  status: 'pending',
  progress: 0,
};

const RecoveryTaskDetails = () => {
  const navigate = useNavigate();
  const { taskId } = useParams();
  const location = useLocation();
  const task = location.state?.task || { ...defaultTask, title: `Task ${taskId}` };

  return (
    <>
      <Navbar />
      <div className="task-details-page">
        <div className="task-details-card">
          <div className="task-details-header">
            <button className="btn-back" onClick={() => navigate(-1)}>
              ← Back
            </button>
            <h1>{task.title}</h1>
            <span className={`task-status-badge ${task.status}`}>{task.status}</span>
          </div>

          <p className="task-details-description">{task.description}</p>

          <div className="task-details-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${task.progress}%` }}></div>
            </div>
            <span>{task.progress}% complete</span>
          </div>

          <div className="task-actions">
            <button className="btn-complete-profile" onClick={() => navigate('/student-dashboard')}>
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default RecoveryTaskDetails;
