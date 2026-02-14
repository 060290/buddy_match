import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export default function Nearby() {
  const { user } = useAuth();
  const [nearby, setNearby] = useState([]);
  const [loading, setLoading] = useState(false);
  const [usedLocation, setUsedLocation] = useState(false);

  const fetchNearby = (lat, lng) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (lat != null && lng != null) {
      params.set('lat', lat);
      params.set('lng', lng);
      params.set('radiusKm', '50');
    }
    api.get(`/users/nearby?${params}`)
      .then((r) => setNearby(r.data))
      .catch(() => setNearby([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user?.lat != null && user?.lng != null) {
      fetchNearby(user.lat, user.lng);
      setUsedLocation(true);
    }
  }, [user?.lat, user?.lng]);

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetchNearby(pos.coords.latitude, pos.coords.longitude);
        setUsedLocation(true);
      },
      () => setNearby([])
    );
  };

  return (
    <div className="container" style={{ paddingTop: '1.5rem' }}>
      <h1>Buddies nearby</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
        Find other reactive-dog owners in your area. Location is used only to show distance; we don’t share exact addresses.
      </p>
      <button type="button" className="btn btn-primary" onClick={useMyLocation} disabled={loading} style={{ marginBottom: '1.5rem' }}>
        {loading ? 'Searching…' : 'Find nearby (use my location)'}
      </button>
      {!user?.lat && !user?.lng && !usedLocation && (
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Set your location in <Link to="/profile">Profile</Link> or click the button above to use your current location.
        </p>
      )}
      {nearby.length === 0 && !loading && (user?.lat != null || usedLocation) && (
        <div className="card">
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>No other users found in this area yet. Try a larger radius or create a meetup to attract locals.</p>
        </div>
      )}
      {nearby.length > 0 && (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {nearby.map((u) => (
            <li key={u.id}>
              <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <strong>{u.name || 'Buddy'}</strong>
                  {u.city && <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>· {u.city}</span>}
                  {u.experience && <span className="badge" style={{ marginLeft: '0.5rem' }}>{u.experience}</span>}
                  {u.safetyPledgedAt && <span className="badge" style={{ marginLeft: '0.25rem' }}>Safety pledged</span>}
                  {u.availability && <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{u.availability}</div>}
                </div>
                <Link to={`/messages?with=${u.id}`} className="btn btn-primary">Message</Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
