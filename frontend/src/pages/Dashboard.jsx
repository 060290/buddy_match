import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

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
        setMeetups(posts.slice(0, 5));
        setConversations(convos.slice(0, 5));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container" style={{ paddingTop: '1.5rem' }}>
      <h1>Hi{user?.name ? `, ${user.name}` : ''}</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        Here’s a quick overview of your community activity.
      </p>

      {!user?.safetyPledgedAt && (
        <div className="card" style={{ marginBottom: '1.5rem', background: 'var(--warm-soft)', borderColor: 'var(--warm)' }}>
          <strong>Take the Safety Pledge</strong>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.95rem' }}>
            Show others you’re committed to safe, force-free meetups. <Link to="/profile">Go to Profile</Link> to pledge.
          </p>
        </div>
      )}

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        <section className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0 }}>Upcoming meetups</h2>
            <Link to="/meetups" className="btn btn-secondary">View all</Link>
          </div>
          {loading ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading…</p>
          ) : meetups.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No meetups yet. <Link to="/meetups/new">Create one</Link> or <Link to="/meetups">browse</Link>.</p>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {meetups.map((m) => (
                <li key={m.id} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
                  <Link to={`/meetups/${m.id}`} style={{ fontWeight: 500 }}>{m.title}</Link>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0 }}>Recent messages</h2>
            <Link to="/messages" className="btn btn-secondary">Inbox</Link>
          </div>
          {loading ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading…</p>
          ) : conversations.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No conversations yet. Find <Link to="/nearby">buddies nearby</Link> or message from a meetup.</p>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {conversations.map((c) => (
                <li key={c.user.id} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
                  <Link to={`/messages?with=${c.user.id}`} style={{ fontWeight: 500 }}>{c.user.name || c.user.id}</Link>
                  {c.lastMessage && (
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
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
