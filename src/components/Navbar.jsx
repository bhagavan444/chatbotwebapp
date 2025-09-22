import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../firebase';
import './Navbar.css';

function Navbar({ handleLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">ChatBot</Link>
      </div>

      <div className={`navbar-links ${menuOpen ? 'active' : ''}`}>
        {/* Always visible links */}
        <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
        <Link to="/about" onClick={() => setMenuOpen(false)}>About</Link>
        <Link to="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>

        {/* Only show Chat link if logged in */}
        {isLoggedIn && (
          <Link to="/chat" onClick={() => setMenuOpen(false)}>Chat</Link>
        )}

        {/* Login / Logout button */}
        {!isLoggedIn ? (
          <Link
            to="/login"
            className="navbar-btn"
            onClick={() => setMenuOpen(false)}
          >
            Login
          </Link>
        ) : (
          <button
            className="navbar-btn"
            onClick={() => { handleLogout(); setMenuOpen(false); }}
          >
            Logout
          </button>
        )}
      </div>

      {/* Hamburger for mobile */}
      <div
        className={`navbar-hamburger ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle navigation menu"
        tabIndex="0"
        role="button"
        onKeyPress={(e) => { if (e.key === 'Enter') setMenuOpen(!menuOpen); }}
      >
        <span />
        <span />
        <span />
      </div>
    </nav>
  );
}

export default Navbar;
