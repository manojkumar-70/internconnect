import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/StudentDashboard.css';
import { taskAPI } from '../services/api';

const RecoveryTaskDetails = () => {
  const navigate = useNavigate();
  const { taskId } = useParams();
  const location = useLocation();
  const [task, setTask] = useState(location.state?.task || null);

  useEffect(() => {
    if (task) return;
    taskAPI.getById(taskId).then((response) => setTask(response.data)).catch(() => setTask(null));
  }, [task, taskId]);

  if (!task) {
    return <div className="task-details-page"><p>No data yet</p></div>;
  }

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
              <div className="progress-fill" style={{ width: `${task.progress || 0}%` }}></div>
            </div>
            <span>{task.progress === undefined ? 'Not available' : `${task.progress}% complete`}</span>
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
