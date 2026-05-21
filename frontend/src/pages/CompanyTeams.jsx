import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/CompanyPages.css';

function CompanyTeams() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleTeamClick = (team) => {
    navigate(`/company/teams/${team.id}`, { state: { team } });
  };

  useEffect(() => {
    const mockTeams = [
      {
        id: 1,
        name: 'Frontend Squad',
        description: 'Focused on user interfaces, component libraries and design systems.',
        members: ['Alice Johnson', 'Bob Lee', 'Carla Gomez'],
        skills: ['React', 'TypeScript', 'CSS'],
        projectStatus: 'Active',
        lastUpdated: '2026-05-10'
      },
      {
        id: 2,
        name: 'Backend Crew',
        description: 'Builds APIs, manages databases and authentication flows.',
        members: ['David Kim', 'Eva Brown', 'Frank Miller'],
        skills: ['Node.js', 'Express', 'MongoDB'],
        projectStatus: 'Planning',
        lastUpdated: '2026-05-12'
      }
    ];

    setTeams(mockTeams);
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="company-page">
      <Navbar />
      <div className="company-container">
        <div className="page-header">
          <h1>Teams</h1>
          <button className="btn-primary" onClick={() => navigate('/company/internships')}>
            Back to Internships
          </button>
        </div>

        <div className="teams-grid">
          {teams.map(team => (
            <div
              className="team-card"
              key={team.id}
              role="button"
              tabIndex={0}
              onClick={() => handleTeamClick(team)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleTeamClick(team); }}
            >
              <div className="card-header">
                <h3>{team.name}</h3>
                <span className="members-count">{team.members} members</span>
              </div>
              <p>{team.focus}</p>
              <div className="info-row">
                <span className="label">Last Updated:</span>
                <span className="value">{team.lastUpdated}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="empty-block">
          <h2>Want to create a new team?</h2>
          <p>Team creation and assignment will be available in the next update.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default CompanyTeams;
