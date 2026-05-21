import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/AdminPages.css';

const AdminStudents = () => {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    setStudents([
      { id: 1, name: 'Ananya Rao', email: 'ananya@gmail.com', college: 'IIT Delhi', status: 'Active' },
      { id: 2, name: 'Rohan Verma', email: 'rohan@gmail.com', college: 'NIT Trichy', status: 'Active' },
      { id: 3, name: 'Priya Patel', email: 'priya@gmail.com', college: 'BITS Pilani', status: 'Suspended' }
    ]);
  }, []);

  const handleView = (student) => {
    toast.info(`${student.name} • ${student.college} • ${student.email}`);
  };

  const handleSuspend = (studentId) => {
    setStudents((prevStudents) =>
      prevStudents.map((student) => {
        if (student.id === studentId) {
          const newStatus = student.status === 'Suspended' ? 'Active' : 'Suspended';
          toast.success(`${student.name} is now ${newStatus}`);
          return { ...student, status: newStatus };
        }
        return student;
      })
    );
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
                <tr key={student.id}>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>{student.college}</td>
                  <td>{student.status}</td>
                  <td>
                    <button className="btn-secondary" onClick={() => handleView(student)}>
                      View
                    </button>
                    <button className="btn-danger" onClick={() => handleSuspend(student.id)}>
                      {student.status === 'Suspended' ? 'Revoke' : 'Suspend'}
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
