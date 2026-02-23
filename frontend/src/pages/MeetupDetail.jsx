import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export default function MeetupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rsvping, setRsvping] = useState(false);
  const [message, setMessage] = useState('');

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
      setMessage(e.message || 'Could not update RSVP');
    } finally {
      setRsvping(false);
    }
  };

  const deleteMeetup = async () => {
    if (!confirm('Delete this meetup?')) return;
    try {
      await api.delete(`/posts/${id}`);
      navigate('/meetups');
    } catch (e) {
      setMessage(e.message || 'Could not delete');
    }
  };

  if (loading) return <div className="container" style={{ padding: '2rem' }}>Loading…</div>;
  if (!post) return <div className="container" style={{ padding: '2rem' }}>Meetup not found.</div>;

  return (
    <div className="container" style={{ paddingTop: '1.5rem', maxWidth: 700 }}>
      <Link to="/meetups" style={{ display: 'inline-block', marginBottom: '1rem' }}>← Back to meetups</Link>
      <article className="card">
        <h1 style={{ marginTop: 0 }}>{post.title}</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
          by{' '}
          {post.author?.id ? (
            <Link to={`/user/${post.author.id}`} className="meetup-detail-author-link">{post.author.name || 'Buddy'}</Link>
          ) : (
            (post.author?.name || 'Buddy')
          )}
          {post.author?.city && ` · ${post.author.city}`}
          {post.author?.safetyPledgedAt && <span className="badge" style={{ marginLeft: '0.5rem' }}>Safety pledged</span>}
        </p>
        <div style={{ whiteSpace: 'pre-wrap', marginBottom: '1rem' }}>{post.body}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem', fontSize: '0.95rem' }}>
          {post.location && <span><strong>Location:</strong> {post.location}</span>}
          {post.meetupAt && <span><strong>When:</strong> {new Date(post.meetupAt).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })}</span>}
        </div>
        {post.lat != null && post.lng != null && (
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            📍{' '}
            <a href={`https://www.openstreetmap.org/?mlat=${post.lat}&mlon=${post.lng}&zoom=15`} target="_blank" rel="noopener noreferrer">
              View on map
            </a>
            {' '}({post.lat.toFixed(4)}, {post.lng.toFixed(4)})
          </p>
        )}
        {message && <p className="error-msg">{message}</p>}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          {!isAuthor && (
            <button type="button" className="btn btn-primary" onClick={toggleRsvp} disabled={rsvping}>
              {userRsvped ? 'Cancel RSVP' : 'RSVP'}
            </button>
          )}
          {isAuthor && (
            <>
              <Link to={`/meetups/${id}/edit`} className="btn btn-secondary">Edit</Link>
              <button type="button" className="btn btn-ghost" onClick={deleteMeetup}>Delete</button>
            </>
          )}
          {!isAuthor && post.author?.id && (
            <Link to={`/messages?with=${post.author.id}`} className="btn btn-secondary">Message organizer</Link>
          )}
        </div>
      </article>
      {post.rsvps?.length > 0 && (
        <section className="card" style={{ marginTop: '1.5rem' }}>
          <h2 style={{ marginTop: 0 }}>Who’s coming ({post.rsvps.length})</h2>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {post.rsvps.map((r) => (
              <li key={r.userId} className="meetup-detail-rsvp-row">
                <span>
                  {r.user?.id ? (
                    <Link to={`/user/${r.user.id}`} className="meetup-detail-user-link">{r.user?.name || 'Buddy'}</Link>
                  ) : (
                    (r.user?.name || 'Buddy')
                  )}
                  {r.user?.city && ` · ${r.user.city}`}
                </span>
                {r.userId !== user?.id && (
                  <span className="meetup-detail-rsvp-actions">
                    <Link to={`/user/${r.userId}`} className="btn btn-ghost btn-sm">Profile</Link>
                    <Link to={`/messages?with=${r.userId}`} className="btn btn-ghost btn-sm">Message</Link>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
