import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export default function Dashboard() {
  const { user } = useAuth();
  const [meetups, setMeetups] = useState([]);
  const [dogs, setDogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dogsLoading, setDogsLoading] = useState(true);

  const radiusMiles = 50;
  const radiusKm = radiusMiles * 1.60934;

  useEffect(() => {
    const hasLocation = user?.lat != null && user?.lng != null;
    const postsUrl = hasLocation
      ? `/posts?lat=${user.lat}&lng=${user.lng}&radiusKm=${radiusKm}`
      : '/posts';
    api.get(postsUrl)
      .then((r) => setMeetups(Array.isArray(r?.data) ? r.data : []))
      .catch(() => setMeetups([]))
      .finally(() => setLoading(false));
  }, [user?.lat, user?.lng, radiusKm]);

  useEffect(() => {
    api.get('/dogs')
      .then((r) => setDogs(Array.isArray(r?.data) ? r.data : []))
      .catch(() => setDogs([]))
      .finally(() => setDogsLoading(false));
  }, [user?.id]);

  const upcomingReminders = useMemo(() => {
    if (!Array.isArray(meetups)) return [];
    const now = new Date();
    return meetups
      .filter((m) => m && m.meetupAt && new Date(m.meetupAt) >= now)
      .slice(0, 5);
  }, [meetups]);

  const userName = user?.name != null && typeof user.name === 'string' ? user.name : '';

  return (
    <div className="app-page">
      <div className="app-page-content app-page-content--dashboard">
        <div className="dashboard-hero">
          <div className="dashboard-welcome">
            <h1>Hi{userName ? `, ${userName}` : ''}</h1>
            <p className="dashboard-tagline">
              Here’s a quick overview of your community activity.
            </p>
          </div>
        </div>

        {!user?.safetyPledgedAt && (
          <Link to="/profile#safety-pledge" className="dashboard-pledge-link">
            <div className="card dashboard-pledge-card">
              <strong>Take the Safety Pledge</strong>
              <p>Show others you’re committed to safe, force-free meetups. Click to go to Profile and take the pledge.</p>
            </div>
          </Link>
        )}

        <div className="dashboard-map-row">
          <section className="card dashboard-map-card">
            <h2 className="dashboard-section-title">Meetups on the map</h2>
            <p className="dashboard-section-lead">
              {user?.lat != null && user?.lng != null
                ? `Meetups within ${radiusMiles} miles of you.`
                : 'Set your location in Profile to see meetups near you.'}
            </p>
            <div className="dashboard-map-wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-muted)', minHeight: '200px' }}>
              <span aria-hidden>🗺️</span>
              <Link to="/meetups" className="btn btn-secondary btn-sm">Browse meetups</Link>
            </div>
          </section>
          <div className="dashboard-side-col">
            <section className="card dashboard-reminders-card dashboard-reminders-card--side">
              <div className="dashboard-section-header">
                <h2 className="dashboard-section-title">Upcoming reminders</h2>
                <Link to="/meetups" className="btn btn-secondary btn-sm">View all</Link>
              </div>
              {loading ? (
                <p className="dashboard-muted">Loading…</p>
              ) : upcomingReminders.length === 0 ? (
                <p className="dashboard-muted">No upcoming meetups. <Link to="/meetups">Browse meetups</Link> or create one with the + button.</p>
              ) : (
                <ul className="dashboard-reminders-list">
                  {upcomingReminders.map((m, i) => (
                    <li key={m?.id ?? i} className="dashboard-reminder-item">
                      <Link to={`/meetups/${m?.id ?? ''}`} className="dashboard-reminder-title">{m?.title ?? 'Meetup'}</Link>
                      <div className="dashboard-reminder-meta">
                        {m.location && `${m.location} · `}
                        {m.meetupAt ? new Date(m.meetupAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) : 'No date set'}
                        {m.rsvpCount > 0 && ` · ${m.rsvpCount} RSVP${m.rsvpCount !== 1 ? 's' : ''}`}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="card dashboard-dogs-card">
              <div className="dashboard-section-header">
                <h2 className="dashboard-section-title">Your dogs</h2>
                <Link to="/profile" className="btn btn-secondary btn-sm">Edit</Link>
              </div>
              {dogsLoading ? (
                <p className="dashboard-muted">Loading…</p>
              ) : dogs.length === 0 ? (
                <p className="dashboard-muted">No dogs yet. <Link to="/profile">Add a dog</Link> on your profile so buddies know who they might meet.</p>
              ) : (
                <div className="dashboard-dog-cards">
                  {dogs.map((dog, i) => (
                    <div key={dog?.id ?? i} className="dashboard-dog-card">
                      <div className="dashboard-dog-card-header">
                        <span className="dashboard-dog-card-icon" aria-hidden>🐕</span>
                        <strong className="dashboard-dog-card-name">{dog?.name ?? 'Dog'}</strong>
                      </div>
                      <dl className="dashboard-dog-card-details">
                        <div className="dashboard-dog-card-row">
                          <dt>Size</dt>
                          <dd>{dog?.size ?? '—'}</dd>
                        </div>
                        {dog?.age && (
                          <div className="dashboard-dog-card-row">
                            <dt>Age</dt>
                            <dd>{dog.age}</dd>
                          </div>
                        )}
                        {dog?.breed && (
                          <div className="dashboard-dog-card-row">
                            <dt>Breed</dt>
                            <dd>{dog.breed}</dd>
                          </div>
                        )}
                        {dog?.reactivityTags && (
                          <div className="dashboard-dog-card-row">
                            <dt>Reactivity</dt>
                            <dd>{dog.reactivityTags}</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
