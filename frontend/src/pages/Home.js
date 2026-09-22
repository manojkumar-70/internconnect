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

  const featureCards = [
    {
      icon: '👨‍🎓',
      title: 'For Students',
      text: 'Discover internships, track applications, and showcase your profile with confidence.',
    },
    {
      icon: '🏢',
      title: 'For Companies',
      text: 'Hire promising interns, manage hiring pipelines, and organize teams effectively.',
    },
    {
      icon: '📊',
      title: 'Smart Matching',
      text: 'Use role-based dashboards and resume-driven insights to optimize opportunities.',
    },
  ];

  const workflow = [
    {
      step: '1',
      title: 'Create profile',
      text: 'Students build a strong professional profile and upload their resume for better discoverability.',
    },
    {
      step: '2',
      title: 'Explore roles',
      text: 'Browse internships, filter matches, and apply to opportunities that align with your strengths.',
    },
    {
      step: '3',
      title: 'Grow faster',
      text: 'Track progress, manage tasks, collaborate with teams, and improve outcomes over time.',
    },
  ];

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />
      <Hero />

      <main className="page-shell">
        <section className="container">
          <div className="section-header">
            <span className="section-tag">Why InternConnect</span>
            <h2 className="section-title">A workspace built for internship growth</h2>
          </div>

          <div className="feature-grid">
            {featureCards.map((item) => (
              <div key={item.title} className="feature-card">
                <div className="feature-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container" style={{ marginTop: '2.5rem' }}>
          <div className="section-header">
            <span className="section-tag">How it works</span>
            <h2 className="section-title">A simple path from interest to internship</h2>
          </div>

          <div className="workflow-grid">
            {workflow.map((item) => (
              <div key={item.step} className="workflow-step" data-step={item.step}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container">
          <div className="cta-banner">
            <div className="cta-banner-inner">
              <div>
                <h3>Ready to launch your internship journey?</h3>
                <p>Sign up and join a platform designed for modern career discovery.</p>
              </div>

              <button className="btn btn-primary" onClick={() => navigate('/register')}>
                Get started
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Home;
