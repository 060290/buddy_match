import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function Meetups() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLoc, setUserLoc] = useState({ lat: null, lng: null });

  useEffect(() => {
    const params = new URLSearchParams();
    if (userLoc.lat != null && userLoc.lng != null) {
      params.set('lat', userLoc.lat);
      params.set('lng', userLoc.lng);
      params.set('radiusKm', '50');
    }
    api.get(`/posts?${params}`)
      .then((r) => setPosts(Array.isArray(r.data) ? r.data : []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [userLoc.lat, userLoc.lng]);

  const requestLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {}
    );
  };

  return (
    <div className="container" style={{ paddingTop: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>Meetups</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={requestLocation}>
            Use my location
          </button>
          <Link to="/meetups/new" className="btn btn-primary">Create meetup</Link>
        </div>
      </div>

      {loading ? (
        <p>Loading meetups…</p>
      ) : posts.length === 0 ? (
        <div className="card">
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>No meetups yet. Be the first to <Link to="/meetups/new">create one</Link>.</p>
        </div>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {posts.map((p) => (
            <li key={p.id}>
              <Link to={`/meetups/${p.id}`} className="card" style={{ display: 'block', color: 'inherit' }}>
                <h3 style={{ margin: '0 0 0.5rem' }}>{p.title}</h3>
                <p style={{ margin: '0 0 0.5rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                  {p.body.slice(0, 160)}{p.body.length > 160 ? '…' : ''}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  {p.location && <span>{p.location}</span>}
                  {p.meetupAt && <span>{new Date(p.meetupAt).toLocaleDateString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>}
                  <span>{p.author?.name || 'Buddy'}</span>
                  {p.rsvpCount > 0 && <span className="badge">{p.rsvpCount} RSVP{p.rsvpCount !== 1 ? 's' : ''}</span>}
                  {p.userRsvped && <span className="badge">You RSVP’d</span>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
