import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

const SAVED_KEY = 'meetups-saved';

function getSavedIds() {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function setSavedIds(ids) {
  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify(ids));
  } catch (_) {}
}

function getInitials(name) {
  if (!name || !String(name).trim()) return '?';
  return String(name).trim().split(/\s+/).map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

export default function MeetupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rsvping, setRsvping] = useState(false);
  const [message, setMessage] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(getSavedIds().includes(id));
  }, [id]);

  useEffect(() => {
    api.get(`/posts/${id}`)
      .then((r) => setPost(r.data))
      .catch(() => setPost(null))
      .finally(() => setLoading(false));
  }, [id]);

  const userRsvped = post?.rsvps?.some((r) => r.userId === user?.id);
  const isAuthor = post?.authorId === user?.id;

  const toggleRsvp = async () => {
    if (rsvping) return;
    setRsvping(true);
    try {
      if (userRsvped) {
        await api.delete(`/posts/${id}/rsvp`);
        setPost((p) => ({ ...p, rsvps: p.rsvps.filter((r) => r.userId !== user.id) }));
      } else {
        const r = await api.post(`/posts/${id}/rsvp`);
        setPost(r.data);
      }
    } catch (e) {
      setMessage(e.response?.data?.error || e.message || 'Could not update RSVP');
    } finally {
      setRsvping(false);
    }
  };

  const toggleSave = () => {
    const ids = getSavedIds();
    const next = saved ? ids.filter((x) => x !== id) : [...ids, id];
    setSavedIds(next);
    setSaved(!saved);
  };

  const deleteMeetup = async () => {
    if (!window.confirm('Delete this meetup?')) return;
    try {
      await api.delete(`/posts/${id}`);
      navigate('/meetups');
    } catch (e) {
      setMessage(e.response?.data?.error || e.message || 'Could not delete');
    }
  };

  if (loading) return <div className="app-page"><div className="meetup-detail-content"><p>Loading…</p></div></div>;
  if (!post) return <div className="app-page"><div className="meetup-detail-content"><p>Meetup not found.</p><Link to="/meetups">Back to meetups</Link></div></div>;

  return (
    <div className="app-page app-page--meetup-detail">
      <div className="meetup-detail-content">
        <Link to="/meetups" className="meetup-detail-back">← Back to meetups</Link>

        {/* Hero */}
        <section className="meetup-detail-hero">
          <div className="meetup-detail-hero-tags">
            <span className="meetup-detail-tag">Walk</span>
            {post.author?.safetyPledgedAt && <span className="meetup-detail-tag meetup-detail-tag--safety">Safety pledged</span>}
          </div>
          <h1 className="meetup-detail-hero-title">{post.title}</h1>
          <div className="meetup-detail-hero-meta">
            {post.meetupAt && (
              <span className="meetup-detail-hero-datetime">
                {new Date(post.meetupAt).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })}
              </span>
            )}
            {post.location && <span className="meetup-detail-hero-location">{post.location}</span>}
          </div>
          <div className="meetup-detail-hero-host">
            <span className="meetup-detail-host-avatar" aria-hidden>{getInitials(post.author?.name)}</span>
            <span>
              Hosted by{' '}
              {post.author?.id ? (
                <Link to={`/user/${post.author.id}`} className="meetup-detail-host-link">{post.author.name || 'Buddy'}</Link>
              ) : (
                (post.author?.name || 'Buddy')
              )}
              {post.author?.city && ` · ${post.author.city}`}
            </span>
          </div>
        </section>

        {/* Description */}
        <section className="meetup-detail-panel meetup-detail-description">
          <h2 className="meetup-detail-panel-title">Description</h2>
          <div className="meetup-detail-body">{post.body}</div>
          {post.lat != null && post.lng != null && (
            <p className="meetup-detail-map-link">
              <a href={`https://www.openstreetmap.org/?mlat=${post.lat}&mlon=${post.lng}&zoom=15`} target="_blank" rel="noopener noreferrer">
                View on map
              </a>
            </p>
          )}
        </section>

        {/* Compatibility hint */}
        <section className="meetup-detail-panel meetup-detail-compat">
          <h2 className="meetup-detail-panel-title">Compatibility</h2>
          <p className="meetup-detail-compat-text">Reactive-dog friendly · Good fit for parallel walks and gradual intros.</p>
        </section>

        {/* Actions */}
        <section className="meetup-detail-actions">
          {message && <p className="error-msg">{message}</p>}
          <div className="meetup-detail-actions-row">
            {!isAuthor && (
              <button type="button" className="btn btn-primary" onClick={toggleRsvp} disabled={rsvping}>
                {userRsvped ? 'Cancel RSVP' : 'RSVP'}
              </button>
            )}
            {!isAuthor && post.author?.id && (
              <Link to={`/messages?with=${post.author.id}`} className="btn btn-secondary">Message host</Link>
            )}
            <button type="button" className={`btn ${saved ? 'btn-primary' : 'btn-ghost'}`} onClick={toggleSave}>
              {saved ? 'Saved' : 'Save'}
            </button>
            {isAuthor && (
              <>
                <Link to={`/meetups/${id}/edit`} className="btn btn-secondary">Edit</Link>
                <button type="button" className="btn btn-ghost" onClick={deleteMeetup}>Delete</button>
              </>
            )}
          </div>
        </section>

        {/* Attendees */}
        <section className="meetup-detail-panel meetup-detail-attendees">
          <h2 className="meetup-detail-panel-title">Attendees ({post.rsvps?.length ?? 0})</h2>
          {!post.rsvps?.length ? (
            <p className="meetup-detail-empty">No one has RSVP’d yet.</p>
          ) : (
            <ul className="meetup-detail-attendee-list">
              {post.rsvps.map((r) => (
                <li key={r.userId} className="meetup-detail-attendee">
                  <span className="meetup-detail-attendee-avatar" aria-hidden>{getInitials(r.user?.name)}</span>
                  <div className="meetup-detail-attendee-info">
                    {r.user?.id ? (
                      <Link to={`/user/${r.user.id}`} className="meetup-detail-attendee-name">{r.user?.name || 'Buddy'}</Link>
                    ) : (
                      <span>{r.user?.name || 'Buddy'}</span>
                    )}
                    {r.user?.city && <span className="meetup-detail-attendee-meta">{r.user.city}</span>}
                  </div>
                  {r.userId !== user?.id && r.user?.id && (
                    <Link to={`/messages?with=${r.userId}`} className="btn btn-ghost btn-sm">Message</Link>
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
