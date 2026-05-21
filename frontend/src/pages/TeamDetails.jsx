import React from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/CompanyPages.css';

const TeamDetails = () => {
  const navigate = useNavigate();
  const { teamId } = useParams();
  const location = useLocation();
  const team = location.state?.team || {
    id: teamId,
    name: `Team ${teamId}`,
    description: 'No description provided.',
    members: [],
    skills: [],
    projectStatus: 'Unknown',
  };

  return (
    <div className="company-page">
      <Navbar />
      <div className="company-container">
        <div className="page-header">
          <h1>{team.name}</h1>
          <button className="btn-secondary" onClick={() => navigate('/company/teams')}>
            ← Back to Teams
          </button>
        </div>

        <div className="team-details-card">
          <div className="card-header">
            <h3>{team.name}</h3>
            <span className="members-count">{Array.isArray(team.members) ? `${team.members.length} members` : `${team.members} members`}</span>
          </div>

          <section style={{ margin: '1rem 0' }}>
            <strong>Description</strong>
            <p style={{ marginTop: 6 }}>{team.description}</p>
          </section>

          <section style={{ margin: '1rem 0' }}>
            <strong>Members</strong>
            {Array.isArray(team.members) ? (
              <ul style={{ marginTop: 6 }}>
                {team.members.map((m, idx) => <li key={idx}>{m}</li>)}
              </ul>
            ) : (
              <p style={{ marginTop: 6 }}>{team.members} members</p>
            )}
          </section>

          <section style={{ margin: '1rem 0' }}>
            <strong>Skills</strong>
            <div style={{ marginTop: 6, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {(team.skills || []).length ? (
                team.skills.map((s, i) => (
                  <span key={i} style={{ background: '#eef2ff', color: '#3730a3', padding: '6px 10px', borderRadius: 999 }}>{s}</span>
                ))
              ) : (
                <span style={{ color: '#6b7280' }}>No skills listed</span>
              )}
            </div>
          </section>

          <section style={{ margin: '1rem 0' }}>
            <strong>Project Status</strong>
            <div style={{ marginTop: 6 }}>
              <span className={`status ${String(team.projectStatus).toLowerCase().replace(/\s+/g,'-')}`}>{team.projectStatus}</span>
            </div>
          </section>

          <div className="card-actions">
            <button className="btn-primary" onClick={() => navigate(-1)}>Return</button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TeamDetails;
