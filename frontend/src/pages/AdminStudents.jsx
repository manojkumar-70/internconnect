import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { adminAPI } from '../services/api';
import '../styles/AdminPages.css';

const AdminStudents = () => {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    adminAPI.getStudents()
      .then((response) => setStudents(Array.isArray(response.data) ? response.data : response.data?.students || []))
      .catch(() => setStudents([]));
  }, []);

  const handleView = (student) => {
    toast.info(`${student.name} • ${student.college} • ${student.email}`);
  };

  return (
    <>
      <Navbar />
      <div className="admin-container">
        <div className="admin-header">
          <h1>Manage Students</h1>
          <p>Review, verify, or suspend student accounts from the platform.</p>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>College</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student._id || student.id}>
                  <td>{student.name || 'Not available'}</td>
                  <td>{student.email || 'Not available'}</td>
                  <td>{student.college || 'Not available'}</td>
                  <td>{student.status || 'Not available'}</td>
                  <td>
                    <button className="btn-secondary" onClick={() => handleView(student)}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminStudents;
