import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <section style={{ padding: '3rem 1.25rem', textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
      <h1 style={{ fontSize: 'clamp(2rem, 5vw, 2.75rem)', marginBottom: '0.5rem' }}>
        Connect safely with other reactive dog owners
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2rem' }}>
        Coordinate training meetups, share experiences, and find support in a location-aware community built for you and your dog.
      </p>
      {user ? (
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/meetups" className="btn btn-primary">Browse meetups</Link>
          <Link to="/meetups/new" className="btn btn-secondary">Create a meetup</Link>
          <Link to="/nearby" className="btn btn-ghost">Find buddies nearby</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" className="btn btn-primary">Get started</Link>
          <Link to="/login" className="btn btn-secondary">Log in</Link>
          <Link to="/support" className="btn btn-ghost">Learn more</Link>
        </div>
      )}
      <div style={{ marginTop: '3rem', padding: '1.5rem', background: 'var(--accent-soft)', borderRadius: 'var(--radius)', textAlign: 'left' }}>
        <h2 style={{ fontSize: '1.15rem', marginBottom: '0.75rem' }}>Why BuddyMatch?</h2>
        <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-muted)' }}>
          <li>Find people nearby who get it</li>
          <li>Plan safe meetups (e.g. parallel walks)</li>
          <li>Message and coordinate in one place</li>
          <li>Tips and support when you need them</li>
        </ul>
      </div>
    </section>
  );
}
