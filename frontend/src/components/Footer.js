import React from 'react';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <div className="footer-brand">InternConnect</div>
          <p>
            Building the next generation of internship opportunities for students,
            companies, and teams.
          </p>
        </div>

        <div>
          <div className="footer-title">Explore</div>
          <ul className="footer-list">
            <li><a href="/internships">Internships</a></li>
            <li><a href="/register">Create account</a></li>
            <li><a href="/login">Login</a></li>
          </ul>
        </div>

        <div>
          <div className="footer-title">For Students</div>
          <ul className="footer-list">
            <li>Profile matching</li>
            <li>Application tracking</li>
            <li>Recovery tasks</li>
          </ul>
        </div>

        <div>
          <div className="footer-title">For Companies</div>
          <ul className="footer-list">
            <li>Post internships</li>
            <li>Review applicants</li>
            <li>Manage teams</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        &copy; InternConnect. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
