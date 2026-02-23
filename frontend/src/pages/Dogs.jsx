import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function Dogs() {
  const [dogs, setDogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dogs')
      .then((r) => setDogs(Array.isArray(r?.data) ? r.data : []))
      .catch(() => setDogs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="app-page app-page--dogs">
      <div className="dogs-page-content">
        <header className="dogs-page-header">
          <h1 className="dogs-page-title">My dogs</h1>
          <p className="dogs-page-tagline">Your pack — add and manage your dogs, see training focus and matches.</p>
        </header>

        {loading ? (
          <p className="dogs-empty">Loading…</p>
        ) : (
          <div className="dogs-grid">
            {dogs.map((dog, i) => (
              <Link key={dog?.id ?? i} to={`/dogs/${dog?.id ?? ''}`} className="dog-card">
                <div className="dog-card-photo">
                  {dog?.avatarUrl ? (
                    <img src={dog.avatarUrl} alt="" />
                  ) : (
                    <span className="dog-card-placeholder" aria-hidden>🐕</span>
                  )}
                </div>
                <div className="dog-card-body">
                  <h2 className="dog-card-name">{dog?.name ?? 'Dog'}</h2>
                  <p className="dog-card-breed">{dog?.breed || '—'}</p>
                  <span className="dog-card-status">{dog?.size ?? '—'}</span>
                  <div className="dog-card-focus">
                    <span className="dog-card-focus-label">Focus</span>
                    <span className="dog-card-focus-value">{dog?.reactivityTags || '—'}</span>
                  </div>
                </div>
              </Link>
            ))}
            <Link to="/profile/dogs/new" className="dog-card dog-card--add">
              <div className="dog-card-add-inner">
                <span className="dog-card-add-icon" aria-hidden>+</span>
                <span className="dog-card-add-text">Add dog</span>
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
