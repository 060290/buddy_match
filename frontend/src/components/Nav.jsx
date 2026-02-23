import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Nav({ isLoggedIn, variant = 'header' }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const logo = (
    <Link to="/" className="logo">
      <span className="logo-paw" aria-hidden>🐾</span>
      BuddyMatch
    </Link>
  );

  if (variant === 'sidebar' && isLoggedIn) {
    return (
      <aside className="app-sidebar">
        <div className="app-sidebar-header">{logo}</div>
        <nav className="nav-sidebar">
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/meetups">Meetups</NavLink>
          <NavLink to="/support">Safety tips</NavLink>
          <NavLink to="/messages">Messages</NavLink>
          <NavLink to="/profile">Profile</NavLink>
          <NavLink to="/nearby">Nearby</NavLink>
          <button type="button" className="btn btn-ghost nav-sidebar-btn" onClick={handleLogout}>Log out</button>
        </nav>
      </aside>
    );
  }

  return (
    <header className="site-header">
      <div className="container header-inner">
        {logo}
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
