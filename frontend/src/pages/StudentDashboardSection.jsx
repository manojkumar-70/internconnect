import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { applicationAPI, internshipAPI, studentAPI } from '../services/api';
import '../styles/StudentDashboard.css';
import '../styles/StudentDashboardSections.css';

const normalize = (value) => {
  const values = Array.isArray(value) ? value : String(value || '').split(/[,/|]/);
  return [...new Set(values.flatMap((item) => String(item).split(/[,/|]/)).map((item) => item.trim().toLowerCase()).filter(Boolean))];
};

const dateLabel = (value) => {
  if (!value) return 'Not available';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Not available' : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const statusLabel = (value) => String(value || 'Not available').replace(/[_-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

const getProfileTerms = (profile) => normalize([
  profile?.skills,
  profile?.interests,
  profile?.bio,
  profile?.course,
  profile?.major,
  profile?.degree,
]);

const getRecommendations = async (internships, profile) => {
  const profileTerms = getProfileTerms(profile);
  const cgpa = Number(profile?.cgpa);
  const hasCgpa = profile?.cgpa !== null && profile?.cgpa !== undefined && Number.isFinite(cgpa);
  if (!profileTerms.length && !hasCgpa) return { state: 'incomplete', items: [] };

  const results = await Promise.all(internships.map(async (internship) => {
    const requiredSkills = normalize(internship.requiredSkills || internship.skills);
    const matchedSkills = requiredSkills.filter((skill) => profileTerms.includes(skill));
    const missingSkills = requiredSkills.filter((skill) => !profileTerms.includes(skill));
    try {
      const response = await axios.post('http://localhost:5001/api/resume/match-score', {
        skills: profileTerms,
        jobSkills: requiredSkills,
        cgpa: hasCgpa ? cgpa : null,
        minCGPA: Number.isFinite(Number(internship.minCGPA)) ? Number(internship.minCGPA) : null,
      });
      if (typeof response.data?.matchScore !== 'number') return null;
      return {
        ...internship,
        match: Math.max(0, Math.min(100, response.data.matchScore)),
        matchedSkills,
        missingSkills,
      };
    } catch {
      return null;
    }
  }));

  const items = results.filter(Boolean).filter((item) => item.match > 0).sort((a, b) => b.match - a.match);
  return { state: items.length ? 'ready' : 'empty', items };
};

const DashboardSidebar = ({ section, navigate, logout }) => {
  const go = (path) => navigate(path);
  const sectionPath = (value) => navigate(value === 'overview' ? '/student-dashboard' : `/student-dashboard/${value}`);
  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-header"><h3>Menu</h3></div>
      <nav className="sidebar-nav">
        <button className={`nav-item ${section === 'overview' ? 'active' : ''}`} onClick={() => sectionPath('overview')}><span className="nav-icon">📊</span><span>Overview</span></button>
        <button className="nav-item" onClick={() => go('/my-applications')}><span className="nav-icon">📋</span><span>My Applications</span></button>
        <button className={`nav-item ${section === 'recommended' ? 'active' : ''}`} onClick={() => sectionPath('recommended')}><span className="nav-icon">🔍</span><span>Recommended</span></button>
        <button className={`nav-item ${section === 'tasks' ? 'active' : ''}`} onClick={() => sectionPath('tasks')}><span className="nav-icon">📝</span><span>Recovery Tasks</span></button>
        <button className={`nav-item ${section === 'performance' ? 'active' : ''}`} onClick={() => sectionPath('performance')}><span className="nav-icon">🏆</span><span>Performance</span></button>
        <hr className="sidebar-divider" />
        <button className="nav-item" onClick={() => go('/student/profile')}><span className="nav-icon">👤</span><span>Edit Profile</span></button>
        <button className="nav-item" onClick={() => go('/internships')}><span className="nav-icon">💼</span><span>Browse Internships</span></button>
        <button className="nav-item" onClick={() => { logout(); navigate('/login'); }}><span className="nav-icon">🚪</span><span>Logout</span></button>
      </nav>
    </aside>
  );
};

const RecommendedSection = ({ profile, navigate }) => {
  const [state, setState] = useState('loading');
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    Promise.all([internshipAPI.getAll({}), studentAPI.getProfile()]).then(async ([internshipsResponse, profileResponse]) => {
      const internships = Array.isArray(internshipsResponse.data) ? internshipsResponse.data : internshipsResponse.data?.internships || [];
      const result = await getRecommendations(internships, profileResponse.data || profile);
      setItems(result.items);
      setState(result.state);
    }).catch(() => { setError('Unable to load recommendations.'); setState('error'); });
  }, [profile]);
  if (state === 'loading') return <section className="section-empty"><h2>Loading recommendations...</h2></section>;
  if (state === 'error') return <section className="section-empty"><h2>{error}</h2></section>;
  if (state === 'incomplete') return <section className="section-empty"><h2>Complete your profile to get recommendations.</h2><button className="primary-btn" onClick={() => navigate('/student/profile')}>Complete Profile</button></section>;
  if (!items.length) return <section className="section-empty"><h2>No recommendations available.</h2></section>;
  return <div className="recommendation-layout"><header className="section-hero"><p className="eyebrow">Internship discovery</p><h1>Recommended for you</h1><p>AI-ranked opportunities based on your profile and each internship's requirements.</p></header><div className="recommendation-list">{items.map((item) => <article className="recommendation-row" key={item._id} onClick={() => navigate(`/internships/${item._id}`)}><div><p className="card-kicker">{item.company?.companyName || 'Not available'}</p><h2>{item.title || 'Not available'}</h2><p>{item.location || 'Not available'} · {item.stipend ? `₹${Number(item.stipend).toLocaleString('en-IN')}/month` : 'Stipend not available'}</p></div><div className="recommendation-score">{item.match}%<span>match</span></div><div className="recommendation-skills"><strong>Matched skills</strong><div>{item.matchedSkills.length ? item.matchedSkills.map((skill) => <span className="skill-tag matched-tag" key={skill}>{skill}</span>) : <span>No direct matches</span>}</div><strong>Missing skills</strong><div>{item.missingSkills.length ? item.missingSkills.map((skill) => <span className="skill-tag missing-tag" key={skill}>{skill}</span>) : <span>No gaps detected</span>}</div></div><button className="secondary-btn" onClick={(event) => { event.stopPropagation(); navigate(`/internships/${item._id}`); }}>View Details / Apply</button></article>)}</div></div>;
};

const RecoverySection = ({ navigate }) => {
  const [applications, setApplications] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { applicationAPI.getStudentApplications().then((response) => setApplications(Array.isArray(response.data) ? response.data : response.data?.applications || [])).catch(() => setError('Unable to load recovery tasks.')); }, []);
  if (error) return <section className="section-empty"><h2>{error}</h2></section>;
  if (!applications) return <section className="section-empty"><h2>Loading recovery tasks...</h2></section>;
  const rejected = applications.filter((application) => String(application.status).toLowerCase() === 'rejected');
  const taskCount = rejected.reduce((total, application) => total + (application.rejectionRecoveryTasks?.length || 0), 0);
  if (!taskCount) return <section className="section-empty"><h2>No recovery tasks available.</h2><p>Rejected applications and assigned recovery work will appear here.</p></section>;
  return <div className="recovery-layout"><header className="section-hero"><p className="eyebrow">Rejection recovery</p><h1>Turn feedback into progress</h1><p>Review skill gaps and complete tasks assigned to your rejected applications.</p></header>{rejected.map((application) => <section className="recovery-application" key={application._id}><div className="recovery-heading"><div><p className="card-kicker">{application.internship?.company?.companyName || 'Not available'}</p><h2>{application.internship?.title || 'Not available'}</h2></div><span className="status-rejected">Rejected</span></div>{application.rejectionReason && <p><strong>Feedback:</strong> {application.rejectionReason}</p>}<div className="recovery-task-list">{(application.rejectionRecoveryTasks || []).map((task) => { const submission = task.submissions?.find((item) => String(item.student) === String(application.student)); return <article className="recovery-task-row" key={task._id}><div><h3>{task.title || 'Not available'}</h3><p>{task.description || 'Not available'}</p><small>{task.taskType || 'Task type not available'} · {task.company?.companyName || 'Company not available'}</small></div><div><span>Status</span><strong>{submission ? 'Submitted' : 'Not started'}</strong></div><div><span>Deadline</span><strong>{dateLabel(task.dueDate)}</strong></div><div><span>Company review</span><strong>{submission?.feedback || submission?.score !== undefined ? 'Reviewed' : 'Not reviewed'}</strong></div><button className="secondary-btn" onClick={() => navigate(`/student/tasks/${task._id}`, { state: { task } })}>{submission ? 'Review submission' : 'Open task'}</button></article>; })}</div></section>)}</div>;
};

const PerformanceSection = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { Promise.all([studentAPI.getProfile(), applicationAPI.getStudentApplications(), studentAPI.getInterviews()]).then(([profile, applications, interviews]) => setData({ profile: profile.data, applications: Array.isArray(applications.data) ? applications.data : [], interviews: Array.isArray(interviews.data) ? interviews.data : [] })).catch(() => setError('Unable to load performance data.')); }, []);
  if (error) return <section className="section-empty"><h2>{error}</h2></section>;
  if (!data) return <section className="section-empty"><h2>Loading performance data...</h2></section>;
  const { profile, applications, interviews } = data;
  const rejected = applications.filter((item) => item.status === 'rejected').length;
  const accepted = applications.filter((item) => item.status === 'accepted').length;
  const skills = normalize(profile?.skills);
  const improvementAreas = [...new Set(applications.flatMap((item) => (item.rejectionRecoveryTasks || []).flatMap((task) => normalize(task.category))))];
  const activity = applications.map((application) => ({ date: application.appliedDate, label: `${statusLabel(application.status)} application` })).sort((a, b) => new Date(b.date) - new Date(a.date));
  return <div className="performance-layout"><header className="section-hero"><p className="eyebrow">Performance</p><h1>Your progress</h1><p>Academic information and real activity from your InternConnect account.</p></header><div className="performance-grid"><section className="performance-feature"><span>Academic</span><strong>{profile?.cgpa !== undefined && profile?.cgpa !== null ? `${profile.cgpa} / 10` : 'No data available'}</strong><p>CGPA</p></section><section className="performance-feature"><span>Attendance</span><strong>No data available</strong><p>Attendance records are not available.</p></section><section className="performance-feature"><span>Skills</span><strong>{skills.length || 'No data available'}</strong><p>Skills listed in your profile</p></section></div><div className="performance-columns"><section className="performance-panel"><h2>Application activity</h2><div className="performance-stat-list"><div><span>Total applications</span><strong>{applications.length}</strong></div><div><span>Accepted</span><strong>{accepted}</strong></div><div><span>Rejected</span><strong>{rejected}</strong></div><div><span>Interviews</span><strong>{interviews.length}</strong></div></div></section><section className="performance-panel"><h2>Activity trend</h2>{activity.length ? <div className="performance-activity">{activity.map((item, index) => <div key={`${item.date}-${index}`}><span>{dateLabel(item.date)}</span><strong>{item.label}</strong></div>)}</div> : <p>No data available</p>}</section><section className="performance-panel"><h2>Areas for improvement</h2>{improvementAreas.length ? <div className="skill-list">{improvementAreas.map((area) => <span className="skill-tag missing-tag" key={area}>{area}</span>)}</div> : <p>No data available</p>}</section></div></div>;
};

const StudentDashboardSection = ({ section, user, logout, navigate }) => {
  return <><Navbar user={user} onLogout={() => { logout(); navigate('/login'); }} /><div className="dashboard-container"><DashboardSidebar section={section} navigate={navigate} logout={logout} /><main className="dashboard-content dashboard-section-content">{section === 'recommended' && <RecommendedSection navigate={navigate} />}{section === 'tasks' && <RecoverySection navigate={navigate} />}{section === 'performance' && <PerformanceSection />}</main></div><Footer /></>;
};

export default StudentDashboardSection;