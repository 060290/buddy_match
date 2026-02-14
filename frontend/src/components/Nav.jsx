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
    <header style={{
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      padding: '0.75rem 1.25rem',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <Link to="/" style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: '1.35rem', color: 'var(--text)' }}>
          BuddyMatch
        </Link>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {isLoggedIn ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/meetups">Meetups</Link>
              <Link to="/nearby">Nearby</Link>
              <Link to="/messages">Messages</Link>
              <Link to="/profile">Profile</Link>
              <Link to="/support">Support</Link>
              <button type="button" className="btn btn-ghost" onClick={handleLogout}>Log out</button>
            </>
          ) : (
            <>
              <Link to="/login">Log in</Link>
              <Link to="/register"><span className="btn btn-primary">Sign up</span></Link>
              <Link to="/support">Support</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
