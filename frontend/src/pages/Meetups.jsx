import React, { useEffect, useState, useRef, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

const MeetupsMap = lazy(() => import('../components/DashboardMap'));

class MapErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="meetups-map-fallback" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-muted)', minHeight: '200px' }}>
          <span aria-hidden>🗺️</span>
          <span>Map couldn’t load.</span>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function Meetups() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState(''); // user types here; we debounce into searchQuery
  const [userLoc, setUserLoc] = useState({ lat: null, lng: null });
  const debounceRef = useRef(null);
  const radiusMiles = 50;

  // Debounce search input (300ms) into searchQuery
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchQuery(searchInput.trim());
      debounceRef.current = null;
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchInput]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (userLoc.lat != null && userLoc.lng != null) {
      params.set('lat', userLoc.lat);
      params.set('lng', userLoc.lng);
      params.set('radiusKm', '50');
    }
    api.get(`/posts?${params}`)
      .then((r) => setPosts(Array.isArray(r?.data) ? r.data : []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [searchQuery, userLoc.lat, userLoc.lng]);

  const requestLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {}
    );
  };

  const clearLocation = () => setUserLoc({ lat: null, lng: null });

  return (
    <div className="container meetups-page" style={{ paddingTop: '1.5rem' }}>
      <section className="card meetups-map-card" style={{ marginBottom: '1.5rem' }}>
        <h2 className="meetups-map-title">Meetups on the map</h2>
        <p className="meetups-map-lead">
          {user?.lat != null && user?.lng != null
            ? `Showing meetups within ${radiusMiles} miles of you. Set your location in Profile to change.`
            : 'Set your location in Profile to see meetups on the map.'}
        </p>
        <MapErrorBoundary>
          <Suspense fallback={<div className="meetups-map-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', minHeight: '200px' }}>Loading map…</div>}>
            <MeetupsMap
              meetups={posts}
              userLat={user?.lat ?? undefined}
              userLng={user?.lng ?? undefined}
              radiusMiles={radiusMiles}
            />
          </Suspense>
        </MapErrorBoundary>
      </section>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: '0 0 1rem' }}>Meetups</h1>
        <div className="meetups-toolbar" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          <div className="meetups-search-wrap" style={{ flex: '1 1 260px', minWidth: 0 }}>
            <input
              id="meetups-search"
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by title, location, or description…"
              className="meetups-search-input"
              style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: 'var(--radius-chunky)', border: '1px solid var(--border)', fontSize: '1rem' }}
              aria-label="Search meetups by title, location, or description"
            />
          </div>
          {userLoc.lat != null && userLoc.lng != null ? (
            <button type="button" className="btn btn-ghost btn-sm" onClick={clearLocation} title="Show all meetups">
              Showing nearby · Clear
            </button>
          ) : (
            <button type="button" className="btn btn-secondary" onClick={requestLocation}>
              Use my location
            </button>
          )}
          <Link to="/meetups/new" className="btn btn-primary">Create meetup</Link>
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading meetups…</p>
      ) : posts.length === 0 ? (
        <div className="card">
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>
            {searchQuery || userLoc.lat != null
              ? 'No meetups match your search or location. Try different keywords or clear filters.'
              : 'No meetups yet. Be the first to create one.'}
            {' '}
            {!searchQuery && userLoc.lat == null && <Link to="/meetups/new">Create a meetup</Link>}
          </p>
        </div>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {posts.map((p) => (
            <li key={p.id}>
              <Link to={`/meetups/${p.id}`} className="card" style={{ display: 'block', color: 'inherit', textDecoration: 'none' }}>
                <h3 style={{ margin: '0 0 0.5rem' }}>{p.title}</h3>
                <p style={{ margin: '0 0 0.5rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                  {p.body.slice(0, 160)}{p.body.length > 160 ? '…' : ''}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  {p.location && <span>{p.location}</span>}
                  {p.meetupAt && <span>{new Date(p.meetupAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>}
                  <span>{p.author?.name || 'Buddy'}</span>
                  {p.rsvpCount > 0 && <span className="badge">{p.rsvpCount} RSVP{p.rsvpCount !== 1 ? 's' : ''}</span>}
                  {p.userRsvped && <span className="badge">You RSVP'd</span>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
