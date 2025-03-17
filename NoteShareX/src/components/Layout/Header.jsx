import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = ({ isLoggedIn, user, onLogout }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    if (onLogout) {
      await onLogout();
    }
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/" className="logo-link">
            <span className="logo-text">NoteShare</span>
          </Link>
        </div>

        <button 
          className="mobile-menu-button" 
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <span className="mobile-menu-icon"></span>
        </button>

        <nav className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`}>
          <ul className="nav-list">
            <li className="nav-item">
              <Link to="/notes" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                Browse Notes
              </Link>
            </li>
            
            {isLoggedIn ? (
              <>
                <li className="nav-item">
                  <Link to="/notes/new" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                    Create Note
                  </Link>
                </li>
                <li className="nav-item user-menu">
                  <div className="user-menu-trigger">
                    <span className="username">
                      {user ? user.username : 'User'}
                    </span>
                    <span className="dropdown-arrow">▼</span>
                  </div>
                  <div className="user-dropdown">
                    <Link 
                      to="/profile" 
                      className="dropdown-item"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      My Profile
                    </Link>
                    <button 
                      className="dropdown-item logout-button"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link to="/login" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                    Log In
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/register" className="nav-link nav-button" onClick={() => setMobileMenuOpen(false)}>
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

Header.propTypes = {
  isLoggedIn: PropTypes.bool,
  user: PropTypes.object,
  onLogout: PropTypes.func
};

export default Header;
