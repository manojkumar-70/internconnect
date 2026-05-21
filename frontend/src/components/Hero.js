import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/hero.css';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="hero-section">
      {/* Animated gradient background */}
      <div className="hero-background">
        <div className="gradient-blob blob-1"></div>
        <div className="gradient-blob blob-2"></div>
        <div className="gradient-blob blob-3"></div>
        <div className="grid-pattern"></div>
      </div>

      {/* Main content container */}
      <div className="hero-container">
        {/* Left side - Text content */}
        <div className="hero-content">
          {/* Icon badge */}
          <div className="hero-badge">
            <span className="badge-icon">🚀</span>
            <span className="badge-text">InternConnect Platform</span>
          </div>

          {/* Main heading */}
          <h1 className="hero-title">
            Connect <span className="gradient-text">Skills</span> with <span className="gradient-text">Opportunities</span>
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle">
            InternConnect helps students, companies and teams collaborate through smart internship matching. Find your perfect opportunity or hire top talent.
          </p>

          {/* Stats Section */}
          <div className="hero-stats">
            <div className="stat-card">
              <div className="stat-number">5000+</div>
              <div className="stat-label">Active Students</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">500+</div>
              <div className="stat-label">Companies</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">2000+</div>
              <div className="stat-label">Internships</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="hero-buttons">
            <button
              className="btn btn-primary"
              onClick={() => navigate('/register')}
            >
              <span className="btn-icon">🎯</span>
              <span className="btn-text">Get Started</span>
              <span className="btn-arrow">→</span>
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/internships')}
            >
              <span className="btn-icon">🔍</span>
              <span className="btn-text">Explore Internships</span>
            </button>
          </div>

          {/* Trust indicators */}
          <div className="hero-trust">
            <p className="trust-label">Trusted by leading organizations</p>
            <div className="trust-badges">
              <span className="trust-badge">💻 Tech</span>
              <span className="trust-badge">🏛️ Finance</span>
              <span className="trust-badge">🎨 Creative</span>
              <span className="trust-badge">📱 Startup</span>
            </div>
          </div>
        </div>

        {/* Right side - Illustration */}
        <div className="hero-illustration-container">
          <div className="illustration-wrapper">
            <div className="floating-card card-1">
              <div className="card-icon">📊</div>
              <div className="card-text">Smart Analytics</div>
            </div>
            <div className="floating-card card-2">
              <div className="card-icon">🎯</div>
              <div className="card-text">Perfect Match</div>
            </div>
            <div className="floating-card card-3">
              <div className="card-icon">🤝</div>
              <div className="card-text">Collaboration</div>
            </div>
            <div className="illustration-glow"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
