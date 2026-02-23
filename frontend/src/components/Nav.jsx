import React, { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export default function Nav({ isLoggedIn, variant = 'header' }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [hasMessages, setHasMessages] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || variant !== 'sidebar') return;
    api.get('/messages/conversations')
      .then((r) => setHasMessages(Array.isArray(r.data) && r.data.length > 0))
      .catch(() => setHasMessages(false));
  }, [isLoggedIn, variant]);

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
    const nameStr = (user?.name && typeof user.name === 'string') ? user.name.trim() : '';
    const initials = nameStr
      ? nameStr.split(/\s+/).map((n) => n[0]).slice(0, 2).join('').toUpperCase()
      : user?.email?.[0]?.toUpperCase() ?? '?';
    return (
      <aside className="app-sidebar">
        <div className="app-sidebar-header">{logo}</div>
        <nav className="nav-sidebar nav-sidebar--primary" aria-label="Main">
          <NavLink to="/dashboard" end>Home</NavLink>
          <NavLink to="/dogs">Dogs</NavLink>
          <NavLink to="/meetups">Meetups</NavLink>
          <NavLink to="/messages" className="nav-sidebar-link-with-badge">
            Messages
            {hasMessages && <span className="nav-sidebar-badge" aria-label="You have messages">!</span>}
          </NavLink>
          <NavLink to="/tips">Tips</NavLink>
          <NavLink to="/profile">Profile</NavLink>
        </nav>
        <nav className="nav-sidebar nav-sidebar--secondary" aria-label="More">
          <NavLink to="/settings">Settings</NavLink>
        </nav>
        <div className="app-sidebar-footer">
          <Link to="/profile" className="app-sidebar-user" title="Go to profile">
            <span className="sidebar-avatar-link">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="sidebar-avatar-img" />
              ) : (
                <span className="sidebar-avatar-initials">{initials}</span>
              )}
            </span>
            <span className="sidebar-user-name">{user?.name || 'Buddy'}</span>
          </Link>
          <button type="button" className="btn btn-ghost nav-sidebar-btn" onClick={handleLogout}>Log out</button>
        </div>
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
              <Link to="/dashboard">Home</Link>
              <Link to="/meetups">Meetups</Link>
              <Link to="/tips">Tips</Link>
              <Link to="/messages">Messages</Link>
              <button type="button" className="btn btn-ghost nav-btn" onClick={handleLogout}>Log out</button>
            </>
          ) : (
            <>
              <Link to="/">Home</Link>
              <Link to="/login">Log in</Link>
              <Link to="/register" className="btn btn-primary">Join now</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
