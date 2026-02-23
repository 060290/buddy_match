import React, { useEffect, useState, useMemo, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

const HomeMap = lazy(() => import('../components/DashboardMap'));

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

  const radiusKm = 50 * 1.60934;
  const radiusMiles = 50;

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

  const recommendedMeetups = useMemo(() => {
    const mine = myUpcoming.slice(0, 3);
    const others = upcomingFromOthers.filter((m) => !mine.some((x) => x?.id === m?.id)).slice(0, 5 - mine.length);
    return [...mine, ...others];
  }, [myUpcoming, upcomingFromOthers]);

  const userName = user?.name != null && typeof user.name === 'string' ? user.name : '';

  return (
    <div className="app-page app-page--dashboard app-page--home">
      <div className="home-dashboard">
        <header className="home-header">
          <h1 className="home-title">Hi{userName ? `, ${userName}` : ''} 🐾</h1>
          <p className="home-tagline">Your dog meetup feed — see what’s coming up and who’s around.</p>
        </header>

        {!user?.safetyPledgedAt && (
          <Link to="/profile#safety-pledge" className="home-pledge-link">
            <div className="card home-pledge-card">
              <strong>Take the Safety Pledge</strong>
              <p>Show others you’re committed to safe, force-free meetups. Click to go to Profile and take the pledge.</p>
            </div>
          </Link>
        )}

        {/* 1. Upcoming or recommended meetups (card list) */}
        <section className="home-section home-section--meetups">
          <div className="home-section-header">
            <h2 className="home-section-title">Upcoming & recommended</h2>
            <Link to="/meetups" className="home-section-action">See all</Link>
          </div>
          {loading || myMeetupsLoading ? (
            <p className="home-empty">Loading meetups…</p>
          ) : recommendedMeetups.length === 0 ? (
            <p className="home-empty">No upcoming meetups yet. <Link to="/meetups/new">Create one</Link> or <Link to="/meetups">browse</Link>.</p>
          ) : (
            <ul className="home-meetup-cards">
              {recommendedMeetups.map((m, i) => (
                <li key={m?.id ?? i}>
                  <Link to={`/meetups/${m?.id ?? ''}`} className="home-meetup-card">
                    <span className="home-meetup-card-title">{m?.title ?? 'Meetup'}</span>
                    <span className="home-meetup-card-meta">
                      {m?.location && <span>{m.location}</span>}
                      {m?.meetupAt && <span>{new Date(m.meetupAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}</span>}
                      {m?.rsvpCount > 0 && <span>{m.rsvpCount} going</span>}
                    </span>
                    {m?.userRsvped && <span className="home-meetup-badge">You’re in</span>}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* 2. Playful map preview */}
        <section className="home-section home-section--map">
          <div className="home-section-header">
            <h2 className="home-section-title">Nearby on the map</h2>
            <Link to="/meetups" className="home-section-action">Open map</Link>
          </div>
          <div className="home-map-wrap">
            <Suspense fallback={<div className="home-map-placeholder">Loading map…</div>}>
              <HomeMap
                meetups={meetups}
                userLat={user?.lat ?? undefined}
                userLng={user?.lng ?? undefined}
                radiusMiles={radiusMiles}
              />
            </Suspense>
          </div>
          {user?.lat == null && (
            <p className="home-map-hint">Set your location in Profile to see meetups near you.</p>
          )}
        </section>

        {/* 3. Dog training focus cards (layout: what each dog is working on + progress) */}
        <section className="home-section home-section--training">
          <div className="home-section-header">
            <h2 className="home-section-title">Training focus</h2>
            <Link to="/profile#dogs" className="home-section-action">Edit</Link>
          </div>
          {dogsLoading ? (
            <p className="home-empty">Loading…</p>
          ) : dogs.length === 0 ? (
            <p className="home-empty"><Link to="/profile/dogs/new">Add a dog</Link> to track what they’re working on.</p>
          ) : (
            <div className="home-training-cards">
              {dogs.map((dog, i) => (
                <div key={dog?.id ?? i} className="home-training-card">
                  <div className="home-training-card-header">
                    <span className="home-training-dog-avatar" aria-hidden>🐕</span>
                    <span className="home-training-dog-name">{dog?.name ?? 'Dog'}</span>
                  </div>
                  <p className="home-training-focus">Working on: {dog?.reactivityTags || '—'}</p>
                  <div className="home-training-progress-wrap">
                    <div className="home-training-progress-bar" style={{ width: '50%' }} aria-hidden />
                  </div>
                  <span className="home-training-progress-label">Progress</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 4. My dogs snapshot cards */}
        <section className="home-section home-section--dogs">
          <div className="home-section-header">
            <h2 className="home-section-title">My dogs</h2>
            <Link to="/profile#dogs" className="home-section-action">Profile</Link>
          </div>
          {dogsLoading ? (
            <p className="home-empty">Loading…</p>
          ) : dogs.length === 0 ? (
            <p className="home-empty"><Link to="/profile/dogs/new">Add your first dog</Link> so buddies know who they might meet.</p>
          ) : (
            <div className="home-dog-snapshots">
              {dogs.map((dog, i) => (
                <Link key={dog?.id ?? i} to={`/profile/dogs/${dog?.id ?? ''}`} className="home-dog-snapshot">
                  <span className="home-dog-snapshot-avatar">
                    {dog?.avatarUrl ? <img src={dog.avatarUrl} alt="" /> : <span aria-hidden>🐕</span>}
                  </span>
                  <span className="home-dog-snapshot-name">{dog?.name ?? 'Dog'}</span>
                  <span className="home-dog-snapshot-meta">{dog?.size ?? '—'}{dog?.breed ? ` · ${dog.breed}` : ''}</span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* 5. Matches / friends activity preview */}
        <section className="home-section home-section--friends">
          <div className="home-section-header">
            <h2 className="home-section-title">Matches & friends</h2>
            <Link to="/messages" className="home-section-action">Messages</Link>
          </div>
          {friendsLoading ? (
            <p className="home-empty">Loading…</p>
          ) : friends.length === 0 ? (
            <p className="home-empty">Add friends from meetups — tap a name to view their profile and add them.</p>
          ) : (
            <div className="home-friends-preview">
              {friends.slice(0, 6).map((f) => (
                <Link key={f?.id} to={`/user/${f?.id}`} className="home-friend-preview">
                  <span className="home-friend-preview-avatar">
                    {f?.avatarUrl ? <img src={f.avatarUrl} alt="" /> : <span aria-hidden>👤</span>}
                  </span>
                  <span className="home-friend-preview-name">{f?.name || 'Buddy'}</span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
