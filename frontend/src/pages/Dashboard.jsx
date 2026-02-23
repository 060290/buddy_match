import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { DogDoodleMain, DogDoodlePeek } from '../components/DogDoodles';
import DashboardMap from '../components/DashboardMap';

export default function Dashboard() {
  const { user } = useAuth();
  const [meetups, setMeetups] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/posts').then((r) => r.data),
      api.get('/messages/conversations').then((r) => r.data),
    ])
      .then(([posts, convos]) => {
        setMeetups(Array.isArray(posts) ? posts : []);
        setConversations(Array.isArray(convos) ? convos.slice(0, 5) : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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

        <section className="card dashboard-map-card">
          <h2 className="dashboard-section-title">Meetups on the map</h2>
          <p className="dashboard-section-lead">Pins show where other users are offering meetups. Click a pin for details.</p>
          <DashboardMap
            meetups={meetups}
            userLat={user?.lat ?? undefined}
            userLng={user?.lng ?? undefined}
          />
        </section>

        <section className="card dashboard-reminders-card">
          <div className="dashboard-section-header">
            <h2 className="dashboard-section-title">Upcoming reminders</h2>
            <Link to="/meetups" className="btn btn-secondary">View all</Link>
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

        <section className="card">
          <div className="dashboard-section-header">
            <h2 className="dashboard-section-title">Recent messages</h2>
            <Link to="/messages" className="btn btn-secondary">Inbox</Link>
          </div>
          {loading ? (
            <p className="dashboard-muted">Loading…</p>
          ) : conversations.length === 0 ? (
            <p className="dashboard-muted">No conversations yet. Find <Link to="/nearby">buddies nearby</Link> or message from a meetup.</p>
          ) : (
            <ul className="dashboard-list">
              {conversations.map((c) => (
                <li key={c.user.id} className="dashboard-list-item">
                  <Link to={`/messages?with=${c.user.id}`} className="dashboard-list-link">{c.user.name || 'Buddy'}</Link>
                  {c.lastMessage && (
                    <p className="dashboard-list-meta">
                      {c.lastMessage.fromMe && 'You: '}{c.lastMessage.content?.slice(0, 60)}{c.lastMessage.content?.length > 60 ? '…' : ''}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
