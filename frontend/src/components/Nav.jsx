import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Nav({ isLoggedIn }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="logo">
          <span className="logo-paw" aria-hidden>🐾</span>
          BuddyMatch
        </Link>
        <nav className="nav-links">
          {isLoggedIn ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/meetups">Meetups</Link>
              <Link to="/support">Safety tips</Link>
              <Link to="/messages">Messages</Link>
              <Link to="/profile">Profile</Link>
              <Link to="/nearby">Nearby</Link>
              <button type="button" className="btn btn-ghost nav-btn" onClick={handleLogout}>Log out</button>
            </>
          ) : (
            <>
              <Link to="/">Home</Link>
              <Link to="/support">Safety tips</Link>
              <Link to="/login">Log in</Link>
              <Link to="/register" className="btn btn-primary">Join now</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
