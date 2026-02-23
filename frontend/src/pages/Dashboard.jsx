import React, { useEffect, useState, useMemo, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

const DashboardMap = lazy(() => import('../components/DashboardMap'));

class MapErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="dashboard-map-wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-muted)', minHeight: '200px' }}>
          <span aria-hidden>🗺️</span>
          <span>Map couldn’t load.</span>
          <Link to="/meetups" className="btn btn-secondary btn-sm">Browse meetups</Link>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function Dashboard() {
  const { user } = useAuth();
  const [meetups, setMeetups] = useState([]);
  const [myMeetups, setMyMeetups] = useState([]);
  const [dogs, setDogs] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myMeetupsLoading, setMyMeetupsLoading] = useState(true);
  const [dogsLoading, setDogsLoading] = useState(true);
  const [friendsLoading, setFriendsLoading] = useState(true);

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
    api.get('/posts/mine')
      .then((r) => setMyMeetups(Array.isArray(r?.data) ? r.data : []))
      .catch(() => setMyMeetups([]))
      .finally(() => setMyMeetupsLoading(false));
  }, [user?.id]);

  useEffect(() => {
    api.get('/dogs')
      .then((r) => setDogs(Array.isArray(r?.data) ? r.data : []))
      .catch(() => setDogs([]))
      .finally(() => setDogsLoading(false));
  }, [user?.id]);

  useEffect(() => {
    api.get('/users/me/friends')
      .then((r) => setFriends(Array.isArray(r?.data) ? r.data : []))
      .catch(() => setFriends([]))
      .finally(() => setFriendsLoading(false));
  }, [user?.id]);

  const upcomingFromOthers = useMemo(() => {
    if (!Array.isArray(meetups)) return [];
    const now = new Date();
    return meetups
      .filter((m) => m && m.meetupAt && new Date(m.meetupAt) >= now)
      .slice(0, 5);
  }, [meetups]);

  const myUpcoming = useMemo(() => {
    if (!Array.isArray(myMeetups)) return [];
    const now = new Date();
    return myMeetups.filter((m) => m && m.meetupAt && new Date(m.meetupAt) >= now);
  }, [myMeetups]);

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
                ? `Showing meetups within ${radiusMiles} miles of you. Zoom and pan are limited to this area.`
                : 'Set your location in Profile to see meetups within 50 miles of you.'}
            </p>
            <MapErrorBoundary>
              <Suspense fallback={<div className="dashboard-map-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', minHeight: '200px' }}>Loading map…</div>}>
                <DashboardMap
                  meetups={meetups}
                  userLat={user?.lat ?? undefined}
                  userLng={user?.lng ?? undefined}
                  radiusMiles={radiusMiles}
                />
              </Suspense>
            </MapErrorBoundary>
          </section>
          <div className="dashboard-side-col">
            <section className="dashboard-panel dashboard-panel--mine">
              <div className="dashboard-panel-head">
                <h2 className="dashboard-panel-title">Your meetups</h2>
                <Link to="/meetups/new" className="dashboard-panel-action">Create</Link>
              </div>
              {myMeetupsLoading ? (
                <p className="dashboard-empty">Loading…</p>
              ) : myUpcoming.length === 0 && (!Array.isArray(myMeetups) || myMeetups.length === 0) ? (
                <p className="dashboard-empty">No meetups yet. <Link to="/meetups/new">Create one</Link> to invite others.</p>
              ) : myUpcoming.length === 0 ? (
                <p className="dashboard-empty">No upcoming. <Link to="/meetups/new">Create one</Link>.</p>
              ) : (
                <div className="dashboard-cards">
                  {myUpcoming.map((m, i) => (
                    <Link key={m?.id ?? i} to={`/meetups/${m?.id ?? ''}`} className="dashboard-card dashboard-card--mine">
                      <span className="dashboard-card-title">{m?.title ?? 'Meetup'}</span>
                      {(m?.location || m?.meetupAt) && (
                        <span className="dashboard-card-meta">
                          {m?.location && <span>{m.location}</span>}
                          {m?.meetupAt && <span>{new Date(m.meetupAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}</span>}
                        </span>
                      )}
                      <span className="dashboard-card-badge dashboard-card-badge--going">
                        {m?.rsvpCount ? `${m.rsvpCount} going` : '0 going'}
                      </span>
                      {m?.rsvpNames?.length > 0 && (
                        <span className="dashboard-card-names">{m.rsvpNames.slice(0, 3).join(', ')}{m.rsvpNames.length > 3 ? ` +${m.rsvpNames.length - 3}` : ''}</span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <section className="dashboard-panel">
              <div className="dashboard-panel-head">
                <h2 className="dashboard-panel-title">Join a meetup</h2>
                <Link to="/meetups" className="dashboard-panel-action">Browse</Link>
              </div>
              {loading ? (
                <p className="dashboard-empty">Loading…</p>
              ) : upcomingFromOthers.length === 0 ? (
                <p className="dashboard-empty">None nearby right now. <Link to="/meetups">Browse all</Link> or create your own.</p>
              ) : (
                <div className="dashboard-cards">
                  {upcomingFromOthers.map((m, i) => (
                    <Link key={m?.id ?? i} to={`/meetups/${m?.id ?? ''}`} className="dashboard-card">
                      <span className="dashboard-card-title">{m?.title ?? 'Meetup'}</span>
                      <span className="dashboard-card-meta">
                        {m?.location && <span>{m.location}</span>}
                        {m?.meetupAt && <span>{new Date(m.meetupAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}</span>}
                        {m?.rsvpCount > 0 && <span>{m.rsvpCount} going</span>}
                      </span>
                      {m?.userRsvped && <span className="dashboard-card-badge">You’re in</span>}
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <section className="dashboard-panel">
              <div className="dashboard-panel-head">
                <h2 className="dashboard-panel-title">Your friends</h2>
              </div>
              {friendsLoading ? (
                <p className="dashboard-empty">Loading…</p>
              ) : friends.length === 0 ? (
                <p className="dashboard-empty">Add friends from meetups — click a name on any meetup to view their profile and add them.</p>
              ) : (
                <div className="dashboard-friends">
                  {friends.map((f) => (
                    <Link key={f?.id} to={`/user/${f?.id}`} className="dashboard-friend">
                      <span className="dashboard-friend-avatar">
                        {f?.avatarUrl ? <img src={f.avatarUrl} alt="" /> : <span aria-hidden>👤</span>}
                      </span>
                      <span className="dashboard-friend-name">{f?.name || 'Buddy'}</span>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <section className="dashboard-panel">
              <div className="dashboard-panel-head">
                <h2 className="dashboard-panel-title">Your dogs</h2>
                <Link to="/profile" className="dashboard-panel-action">Edit</Link>
              </div>
              {dogsLoading ? (
                <p className="dashboard-empty">Loading…</p>
              ) : dogs.length === 0 ? (
                <p className="dashboard-empty"><Link to="/profile">Add a dog</Link> so buddies know who they might meet.</p>
              ) : (
                <div className="dashboard-dog-list">
                  {dogs.map((dog, i) => (
                    <Link key={dog?.id ?? i} to={`/profile/dogs/${dog?.id ?? ''}`} className="dashboard-dog-pill">
                      <span className="dashboard-dog-pill-name">{dog?.name ?? 'Dog'}</span>
                      <span className="dashboard-dog-pill-size">{dog?.size ?? '—'}</span>
                    </Link>
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
