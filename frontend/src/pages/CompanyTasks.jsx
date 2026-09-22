import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { taskAPI } from '../services/api';
import '../styles/CompanyPages.css';

function CompanyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    taskAPI.getAll({})
      .then((response) => {
        const records = Array.isArray(response.data) ? response.data : response.data?.tasks || [];
        setTasks(records.map((task) => ({
          ...task,
          id: task._id || task.id,
          dueDate: task.dueDate || 'Not available',
          status: task.status || 'Not available',
          description: task.description || 'Not available',
        })));
      })
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="company-page">
      <Navbar />
      <div className="company-container">
        <div className="page-header">
          <h1>Recovery Tasks</h1>
        </div>

        <div className="tasks-grid">
          {tasks.map(task => (
            <div className="task-card" key={task.id}>
              <div className="card-header">
                <div>
                  <h3>{task.title}</h3>
                  <p>{task.description}</p>
                </div>
                <span className={`status ${task.status.toLowerCase()}`}>
                  {task.status}
                </span>
              </div>

              <div className="info-row">
                <span className="label">Due Date:</span>
                <span className="value">{task.dueDate}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default CompanyTasks;
