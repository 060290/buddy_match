import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [friendLoading, setFriendLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setLoading(true);
    setMessage('');
    api.get(`/users/${id}`)
      .then((r) => setProfile(r.data))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [id]);

  const toggleFriend = async () => {
    if (friendLoading || !profile || profile.isSelf) return;
    setFriendLoading(true);
    setMessage('');
    try {
      if (profile.isFriend) {
        await api.delete(`/users/${id}/friend`);
        setProfile((p) => ({ ...p, isFriend: false }));
      } else {
        await api.post(`/users/${id}/friend`);
        setProfile((p) => ({ ...p, isFriend: true }));
      }
    } catch (e) {
      setMessage(e.response?.data?.error || e.message || 'Could not update');
    } finally {
      setFriendLoading(false);
    }
  };

  if (loading) return <div className="app-page"><div className="app-page-content"><p>Loading…</p></div></div>;
  if (!profile) return <div className="app-page"><div className="app-page-content"><p>User not found.</p><Link to="/meetups">Back to meetups</Link></div></div>;

  if (profile.isSelf) {
    navigate('/profile', { replace: true });
    return null;
  }

  const displayName = profile.name || 'Buddy';

  return (
    <div className="app-page">
      <div className="app-page-content" style={{ maxWidth: 560 }}>
        <Link to="/meetups" style={{ display: 'inline-block', marginBottom: '1rem' }}>← Back</Link>
        <div className="card user-profile-card">
          <div className="user-profile-header">
            <div className="user-profile-avatar-wrap">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="" className="user-profile-avatar" />
              ) : (
                <div className="user-profile-avatar user-profile-avatar--placeholder" aria-hidden>👤</div>
              )}
            </div>
            <div className="user-profile-info">
              <h1 className="user-profile-name">{displayName}</h1>
              {profile.city && <p className="user-profile-meta">{profile.city}</p>}
              {profile.safetyPledgedAt && <span className="badge user-profile-badge">Safety pledged</span>}
            </div>
          </div>
          {(profile.experience || profile.availability) && (
            <div className="user-profile-bio">
              {profile.experience && <p><strong>Experience</strong> {profile.experience}</p>}
              {profile.availability && <p><strong>Availability</strong> {profile.availability}</p>}
            </div>
          )}
          {message && <p className="error-msg">{message}</p>}
          <div className="user-profile-actions">
            <button
              type="button"
              className={`btn ${profile.isFriend ? 'btn-ghost' : 'btn-primary'}`}
              onClick={toggleFriend}
              disabled={friendLoading}
            >
              {friendLoading ? '…' : profile.isFriend ? 'Friends' : 'Add friend'}
            </button>
            <Link to={`/messages?with=${profile.id}`} className="btn btn-secondary">Message</Link>
          </div>
        </div>
        {profile.dogs?.length > 0 && (
          <section className="card" style={{ marginTop: '1.5rem' }}>
            <h2 style={{ marginTop: 0 }}>Dogs</h2>
            <ul className="user-profile-dogs">
              {profile.dogs.map((d) => (
                <li key={d.id}>
                  <strong>{d.name}</strong>
                  {d.size && ` · ${d.size}`}
                  {d.breed && ` · ${d.breed}`}
                  {d.reactivityTags && ` · ${d.reactivityTags}`}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
