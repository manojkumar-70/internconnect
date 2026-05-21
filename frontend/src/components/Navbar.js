import React, { useState } from 'react';
import '../styles/navbar.css';

const Navbar = ({ user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <a href="/" className="navbar-brand" onClick={closeMenu}>
          🚀 InternConnect
        </a>

        {/* Hamburger Menu Icon */}
        <button
          className={`hamburger ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Navbar Links */}
        <ul className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
          <li>
            <a href="/" onClick={closeMenu}>
              Home
            </a>
          </li>
          <li>
            <a href="/internships" onClick={closeMenu}>
              Internships
            </a>
          </li>

          {user ? (
            <>
              {user.role === 'student' && (
                <>
                  <li>
                    <a href="/student-dashboard" onClick={closeMenu}>
                      Dashboard
                    </a>
                  </li>
                  <li>
                    <a href="/student/profile" onClick={closeMenu}>
                      Profile
                    </a>
                  </li>
                </>
              )}
              {user.role === 'company' && (
                <>
                  <li>
                    <a href="/company-dashboard" onClick={closeMenu}>
                      Dashboard
                    </a>
                  </li>
                  <li>
                    <a href="/company/profile" onClick={closeMenu}>
                      Profile
                    </a>
                  </li>
                </>
              )}
              {user.role === 'admin' && (
                <li>
                  <a href="/admin-dashboard" onClick={closeMenu}>
                    Admin
                  </a>
                </li>
              )}
              <li>
                <button
                  onClick={() => {
                    onLogout();
                    closeMenu();
                  }}
                  className="btn-logout"
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <a href="/login" onClick={closeMenu}>
                  Login
                </a>
              </li>
              <li>
                <a href="/register" className="btn-register" onClick={closeMenu}>
                  Register
                </a>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
