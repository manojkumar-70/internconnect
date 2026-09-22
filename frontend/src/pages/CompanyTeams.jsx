import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { teamAPI } from '../services/api';
import '../styles/CompanyPages.css';

function CompanyTeams() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleTeamClick = (team) => {
    navigate(`/company/teams/${team.id}`, { state: { team } });
  };

  useEffect(() => {
    teamAPI.getCompanyTeams()
      .then((response) => {
        const records = Array.isArray(response.data) ? response.data : response.data?.teams || [];
        setTeams(records.map((team) => ({
          ...team,
          id: team._id || team.id,
          lastUpdated: team.updatedAt || team.createdAt || 'Not available',
        })));
      })
      .catch(() => setTeams([]))
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
                <span className="members-count">{team.members?.length || 0} members</span>
              </div>
              <p>{team.description || 'Not available'}</p>
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
