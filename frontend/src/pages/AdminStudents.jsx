import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { adminAPI } from '../services/api';
import '../styles/AdminPages.css';

const displayValue = (item) => item === undefined || item === null || item === '' ? 'Not available' : item;
const formatDate = (item) => item ? new Date(item).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not available';
const formatStatus = (item) => String(item || 'Not available').replace(/[_-]+/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase());
const Detail = ({ label, value }) => <div className="student-detail-row"><span>{label}</span><strong>{displayValue(value)}</strong></div>;

const StudentDetails = ({ details, close }) => {
  const { student, applications = [], interviews = [] } = details;
  const skills = Array.isArray(student.skills) ? student.skills : [];
  const completedTasks = Array.isArray(student.completedTasks) ? student.completedTasks : [];
  return (
    <div className="management-backdrop" onClick={close}>
      <aside className="management-modal student-details-drawer" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={close}>Close</button>
        <header className="student-details-header">
          {student.profilePicture ? <img src={student.profilePicture} alt={student.name || 'Student'} /> : <div className="student-details-avatar">{student.name ? student.name.charAt(0).toUpperCase() : '?'}</div>}
          <div><p className="admin-kicker">Student profile</p><h2>{displayValue(student.name)}</h2><p>{displayValue(student.email)}</p><span className="management-status">Account status: Not available</span></div>
        </header>
        <section className="student-detail-section"><h3>Basic Information</h3><Detail label="Phone" value={student.phone} /><Detail label="Date of birth" value={student.dateOfBirth} /><Detail label="Gender" value={student.gender} /></section>
        <section className="student-detail-section"><h3>Education</h3><Detail label="College / University" value={student.college} /><Detail label="Degree" value={student.degree || student.course} /><Detail label="Branch / Department" value={student.branch || student.department || student.major} /><Detail label="Semester / Year" value={student.semester || student.year} /><Detail label="CGPA" value={student.cgpa !== undefined && student.cgpa !== null ? `${student.cgpa} / 10` : null} /><Detail label="Graduation year" value={student.graduationYear} /><Detail label="10th marks" value={student.tenthMarks} /><Detail label="12th / PUEC marks" value={student.twelfthMarks || student.puecMarks} /></section>
        <section className="student-detail-section"><h3>Location</h3><Detail label="City" value={student.city || student.location} /><Detail label="State" value={student.state} /><Detail label="Country" value={student.country} /><Detail label="Address" value={student.address} /></section>
        <section className="student-detail-section"><h3>Skills</h3>{skills.length ? <div className="student-skill-list">{skills.map((skill) => <span key={skill}>{skill}</span>)}</div> : <p>Not available</p>}</section>
        <section className="student-detail-section"><h3>About & Career Preferences</h3><Detail label="Bio" value={student.bio} /><Detail label="Interests" value={student.interests} /><Detail label="Preferred role" value={student.preferredRole || student.preferredInternshipRole} /><Detail label="Preferred location" value={student.preferredLocation} /><Detail label="Work preference" value={student.workPreference} /></section>
        <section className="student-detail-section"><h3>Resume</h3><p>{student.resume ? 'Resume uploaded' : 'No resume uploaded'}</p>{student.resume && <a className="admin-secondary-btn" href={student.resume} target="_blank" rel="noreferrer">View Resume</a>}</section>
        <section className="student-detail-section"><h3>Applications</h3><p>Total applications: {applications.length}</p>{applications.length ? <div className="student-related-list">{applications.map((application) => <div key={application._id}><strong>{displayValue(application.internship?.title)}</strong><span>{displayValue(application.internship?.company?.companyName)} · {formatStatus(application.status)} · {formatDate(application.appliedDate)}</span></div>)}</div> : <p>No applications yet</p>}</section>
        <section className="student-detail-section"><h3>Performance</h3><Detail label="CGPA" value={student.cgpa !== undefined && student.cgpa !== null ? `${student.cgpa} / 10` : null} /><Detail label="Attendance" value={student.attendance} /><Detail label="Skills assessment" value={student.skillsAssessment} /><Detail label="Interviews" value={interviews.length ? `${interviews.length} recorded` : null} /><Detail label="Completed recovery tasks" value={student.completedTasks ? completedTasks.length : null} />{interviews.length > 0 && <div className="student-related-list">{interviews.map((interview) => <div key={interview._id}><strong>{displayValue(interview.title)}</strong><span>{displayValue(interview.type)} · {formatDate(interview.scheduledAt)}</span></div>)}</div>}</section>
        <section className="student-detail-section"><h3>Account Information</h3><Detail label="Registered" value={formatDate(student.createdAt)} /><Detail label="Last updated" value={formatDate(student.updatedAt)} /><Detail label="Verification" value={student.isVerified} /></section>
      </aside>
    </div>
  );
};

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    adminAPI.getStudents().then((response) => setStudents(Array.isArray(response.data) ? response.data : response.data?.students || [])).catch(() => setError('Unable to load student records.')).finally(() => setLoading(false));
  }, []);

  const handleView = async (studentId) => {
    setSelectedId(studentId); setDetails(null); setDetailsLoading(true);
    try { const response = await adminAPI.getStudentDetails(studentId); setDetails(response.data); }
    catch { setError('Unable to load this student profile.'); }
    finally { setDetailsLoading(false); }
  };

  const closeDetails = () => { setSelectedId(null); setDetails(null); };

  return (
    <>
      <Navbar />
      <main className="admin-container">
        <div className="admin-header"><h1>Manage Students</h1><p>Review registered student profiles and their real platform activity.</p></div>
        {error && <div className="admin-alert">{error}</div>}
        <div className="admin-table-wrapper">
          {loading ? <div className="management-state"><h3>Loading students...</h3></div> : students.length === 0 ? <div className="management-state"><h3>No students registered yet</h3><p>Student records will appear here once students create accounts.</p></div> : <table className="admin-table"><thead><tr><th>Name</th><th>Email</th><th>College</th><th>CGPA</th><th>Actions</th></tr></thead><tbody>{students.map((student) => <tr key={student._id}><td>{displayValue(student.name)}</td><td>{displayValue(student.email)}</td><td>{displayValue(student.college)}</td><td>{student.cgpa !== undefined && student.cgpa !== null ? `${student.cgpa} / 10` : 'Not Available'}</td><td><button className="btn-secondary" onClick={() => handleView(student._id)}>View</button></td></tr>)}</tbody></table>}
        </div>
      </main>
      {selectedId && (detailsLoading ? <div className="management-backdrop"><div className="management-state student-details-loading"><h3>Loading student details...</h3></div></div> : details && <StudentDetails details={details} close={closeDetails} />)}
      <Footer />
    </>
  );
};

export default AdminStudents;
