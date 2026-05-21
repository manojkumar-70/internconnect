import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/CompanyPages.css';

function CompanyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockTasks = [
      {
        id: 201,
        title: 'Resume Review Task',
        dueDate: '2026-05-28',
        status: 'Open',
        description: 'Review incoming applicant resumes for front-end internships.'
      },
      {
        id: 202,
        title: 'Interview Prep Session',
        dueDate: '2026-06-02',
        status: 'Scheduled',
        description: 'Prepare shortlisted candidates for technical interview rounds.'
      }
    ];

    setTasks(mockTasks);
    setLoading(false);
  }, []);

  const handleCreateTask = () => {
    setTasks([...tasks, {
      id: tasks.length + 203,
      title: 'New Recovery Task',
      dueDate: '2026-06-10',
      status: 'Open',
      description: 'This is a placeholder recovery task. Fill details later.'
    }]);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="company-page">
      <Navbar />
      <div className="company-container">
        <div className="page-header">
          <h1>Recovery Tasks</h1>
          <button className="btn-primary" onClick={handleCreateTask}>
            + Create Task
          </button>
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
