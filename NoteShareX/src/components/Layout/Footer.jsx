import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title">NoteShare</h3>
            <p className="footer-description">
              A platform for students to share and discover academic notes.
            </p>
          </div>
          
          <div className="footer-section">
            <h3 className="footer-heading">Quick Links</h3>
            <ul className="footer-links">
              <li>
                <Link to="/" className="footer-link">Home</Link>
              </li>
              <li>
                <Link to="/notes" className="footer-link">Browse Notes</Link>
              </li>
              <li>
                <Link to="/login" className="footer-link">Log In</Link>
              </li>
              <li>
                <Link to="/register" className="footer-link">Sign Up</Link>
              </li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3 className="footer-heading">Helpful Resources</h3>
            <ul className="footer-links">
              <li>
                <Link to="/about" className="footer-link">About Us</Link>
              </li>
              <li>
                <Link to="/faq" className="footer-link">FAQs</Link>
              </li>
              <li>
                <Link to="/privacy" className="footer-link">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms" className="footer-link">Terms of Service</Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p className="copyright">
            &copy; {currentYear} NoteShare. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
