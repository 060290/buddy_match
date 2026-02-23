import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { DogDoodleMain, DogDoodlePeek } from '../components/DogDoodles';
import DashboardMap from '../components/DashboardMap';

export default function Dashboard() {
  const { user } = useAuth();
  const [meetups, setMeetups] = useState([]);
  const [loading, setLoading] = useState(true);

  const radiusMiles = 50;
  const radiusKm = radiusMiles * 1.60934;

  useEffect(() => {
    const hasLocation = user?.lat != null && user?.lng != null;
    const postsUrl = hasLocation
      ? `/posts?lat=${user.lat}&lng=${user.lng}&radiusKm=${radiusKm}`
      : '/posts';
    api.get(postsUrl)
      .then((r) => setMeetups(Array.isArray(r.data) ? r.data : []))
      .catch(() => setMeetups([]))
      .finally(() => setLoading(false));
  }, [user?.lat, user?.lng, radiusKm]);

  const upcomingReminders = useMemo(() => {
    const now = new Date();
    return meetups
      .filter((m) => m.meetupAt && new Date(m.meetupAt) >= now)
      .slice(0, 5);
  }, [meetups]);

  return (
    <div className="app-page">
      <div className="app-page-content app-page-content--dashboard">
        <div className="dashboard-hero">
          <div className="dashboard-welcome">
            <h1>Hi{user?.name ? `, ${user.name}` : ''}</h1>
            <p className="dashboard-tagline">
              Here’s a quick overview of your community activity.
            </p>
          </div>
          <div className="dashboard-doodle" aria-hidden>
            <DogDoodleMain className="dashboard-doodle-main" />
            <div className="dashboard-doodle-peek">
              <DogDoodlePeek />
            </div>
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
                ? `Showing meetups within ${radiusMiles} miles of you. Zoom and pan are limited to this area.`
                : 'Set your location in Profile to see meetups within 50 miles of you.'}
            </p>
            <DashboardMap
              meetups={meetups}
              userLat={user?.lat ?? undefined}
              userLng={user?.lng ?? undefined}
              radiusMiles={radiusMiles}
            />
          </section>
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
                {upcomingReminders.map((m) => (
                  <li key={m.id} className="dashboard-reminder-item">
                    <Link to={`/meetups/${m.id}`} className="dashboard-reminder-title">{m.title}</Link>
                    <div className="dashboard-reminder-meta">
                      {m.location && `${m.location} · `}
                      {m.meetupAt ? new Date(m.meetupAt).toLocaleDateString(undefined, { dateStyle: 'short', timeStyle: 'short' }) : 'No date set'}
                      {m.rsvpCount > 0 && ` · ${m.rsvpCount} RSVP${m.rsvpCount !== 1 ? 's' : ''}`}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
