import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Footer from '../components/Footer';

const Home = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />
      <Hero />
      <div className="container">

        <div className="grid grid-3 mt-4">
          <div className="card text-center">
            <h3>👨‍🎓 For Students</h3>
            <p>Discover internship opportunities, build teams, and grow your skills</p>
          </div>
          <div className="card text-center">
            <h3>🏢 For Companies</h3>
            <p>Find talented interns, hire teams, and grow your organization</p>
          </div>
          <div className="card text-center">
            <h3>📊 Smart Matching</h3>
            <p>Advanced algorithms match students with perfect internships</p>
          </div>
        </div>

        <div className="card mt-4">
          <h2 className="text-center mb-3">Features</h2>
          <ul style={{ columns: 2, gap: '2rem', columnGap: '3rem' }}>
            <li>✅ JWT-based Authentication</li>
            <li>✅ Student Profiles & Resume Upload</li>
            <li>✅ Internship Posting & Applications</li>
            <li>✅ Smart Team Builder</li>
            <li>✅ Rejection Recovery Tasks</li>
            <li>✅ Resume Analysis</li>
            <li>✅ Rating & Reviews System</li>
            <li>✅ Badges & Rankings</li>
            <li>✅ Admin Dashboard</li>
            <li>✅ Responsive Design</li>
          </ul>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Home;
