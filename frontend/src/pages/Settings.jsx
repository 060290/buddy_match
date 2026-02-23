import React from 'react';
import { Link } from 'react-router-dom';

export default function Settings() {
  return (
    <div className="app-page">
      <div className="app-page-content">
        <h1>Settings</h1>
        <p className="app-page-lead">Manage your account and preferences.</p>

        <section className="card settings-section">
          <h2 style={{ marginTop: 0 }}>Account</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Update your name, location, and profile picture.
          </p>
          <Link to="/profile" className="btn btn-primary">Edit profile</Link>
        </section>

        <section className="card settings-section">
          <h2 style={{ marginTop: 0 }}>Safety</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Take the Safety Pledge and review tips for force-free meetups.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            <Link to="/profile#safety-pledge" className="btn btn-secondary">Safety pledge</Link>
            <Link to="/support" className="btn btn-secondary">Safety tips</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
