import React, { useEffect, useState, useMemo, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

const HomeMap = lazy(() => import('../components/DashboardMap'));

function getGoalPathProgress(dogId) {
  try {
    const raw = dogId ? localStorage.getItem(`dog-profile-${dogId}`) : null;
    if (!raw) return { completed: 0, total: 5 };
    const data = JSON.parse(raw);
    if (data.milestones && Array.isArray(data.milestones)) {
      const total = data.milestones.length;
      const completed = data.milestones.filter((m) => m.wins && m.wins.length > 0).length;
      return { completed, total };
    }
    return { completed: 0, total: 5 };
  } catch {
    return { completed: 0, total: 5 };
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
      .slice(0, 20);
  }, [meetups]);

  const mySizes = useMemo(() => {
    if (!Array.isArray(dogs)) return [];
    return [...new Set(dogs.map((d) => d?.size).filter(Boolean))];
  }, [dogs]);

  const getMeetupPreferredSize = (m) => {
    if (m?.preferredDogSize && m.preferredDogSize !== 'Any') return m.preferredDogSize;
    const text = `${m?.title ?? ''} ${m?.body ?? ''}`.toLowerCase();
    if (/\bmedium\b.*\b(dog|only)\b|\b(dog|only).*medium\b/.test(text) || /medium\s*dog/.test(text)) return 'Medium';
    if (/\bsmall\b.*\b(dog|only)\b|\b(dog|only).*small\b/.test(text) || /small\s*dog/.test(text)) return 'Small';
    if (/\blarge\b.*\b(dog|only)\b|\b(dog|only).*large\b/.test(text) || /large\s*dog/.test(text)) return 'Large';
    return null;
  };

  const upcomingFromOthersSizeMatched = useMemo(() => {
    return upcomingFromOthers.filter((m) => {
      const preferred = getMeetupPreferredSize(m);
      if (!preferred) return true;
      if (mySizes.length === 0) return true;
      return mySizes.includes(preferred);
    });
  }, [upcomingFromOthers, mySizes]);

  const myUpcoming = useMemo(() => {
    if (!Array.isArray(myMeetups)) return [];
    const now = new Date();
    return myMeetups.filter((m) => m && m.meetupAt && new Date(m.meetupAt) >= now);
  }, [myMeetups]);

  const recommendedMeetups = useMemo(() => {
    const mine = myUpcoming.slice(0, 3);
    const others = upcomingFromOthersSizeMatched.filter((m) => !mine.some((x) => x?.id === m?.id)).slice(0, 5 - mine.length);
    return [...mine, ...others];
  }, [myUpcoming, upcomingFromOthersSizeMatched]);

  const userName = user?.name != null && typeof user.name === 'string' ? user.name : '';

  const heroMeetup = recommendedMeetups[0];

  return (
    <div className="app-page app-page--dashboard app-page--home">
      <div className="home-dashboard">
        <header className="home-header">
          <h1 className="home-title">Hi{userName ? `, ${userName}` : ''} 🐾</h1>
          <p className="home-tagline">Your dog meetup dashboard — what’s up and who’s around.</p>
        </header>

        {!user?.safetyPledgedAt && (
          <Link to="/profile#safety-pledge" className="home-pledge-link">
            <div className="card home-pledge-card">
              <strong>Take the Safety Pledge</strong>
              <p>Show others you’re committed to safe, force-free meetups. Click to go to Profile and take the pledge.</p>
            </div>
          </Link>
        )}

        <div className="home-grid">
          {/* Left column: hero, map, recommended */}
          <div className="home-col home-col--main">
            {/* Upcoming meetup hero card */}
            <section className="home-panel home-panel--hero">
              <div className="home-section-header">
                <h2 className="home-section-title">Next up</h2>
                <Link to="/meetups" className="home-section-action">See all</Link>
              </div>
              {loading || myMeetupsLoading ? (
                <p className="home-empty">Loading…</p>
              ) : !heroMeetup ? (
                <p className="home-empty">No upcoming meetups. <Link to="/meetups/new">Create one</Link> or <Link to="/meetups">browse</Link>.</p>
              ) : (
                <Link to={`/meetups/${heroMeetup?.id ?? ''}`} className="home-hero-card">
                  <span className="home-hero-card-title">{heroMeetup?.title ?? 'Meetup'}</span>
                  <span className="home-hero-card-meta">
                    {heroMeetup?.location && <span>{heroMeetup.location}</span>}
                    {heroMeetup?.meetupAt && <span>{new Date(heroMeetup.meetupAt).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })}</span>}
                  </span>
                  <span className="home-hero-card-badge">{heroMeetup?.rsvpCount ?? 0} going</span>
                  {heroMeetup?.userRsvped && <span className="home-meetup-badge">You’re in</span>}
                </Link>
              )}
            </section>

            {/* Map preview panel */}
            <section className="home-panel home-panel--map">
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
              {user?.lat == null && <p className="home-map-hint">Set your location in Profile to see meetups near you.</p>}
            </section>

            {/* Recommended meetups list */}
            <section className="home-panel home-panel--recommended">
              <div className="home-section-header">
                <h2 className="home-section-title">Recommended</h2>
                <Link to="/meetups" className="home-section-action">Browse</Link>
              </div>
              {loading || myMeetupsLoading ? (
                <p className="home-empty">Loading…</p>
              ) : recommendedMeetups.length <= 1 ? (
                <p className="home-empty">No other meetups to show. <Link to="/meetups">Browse all</Link>.</p>
              ) : (
                <ul className="home-meetup-cards">
                  {recommendedMeetups.slice(1, 5).map((m, i) => (
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
          </div>

          {/* Right column: training, dogs, friends, quick actions */}
          <div className="home-col home-col--side">
            {/* Training focus */}
            <section className="home-panel home-panel--training">
              <div className="home-section-header">
                <h2 className="home-section-title">Training focus</h2>
                <Link to="/profile#dogs" className="home-section-action">Edit</Link>
              </div>
              {dogsLoading ? (
                <p className="home-empty">Loading…</p>
              ) : dogs.length === 0 ? (
                <p className="home-empty"><Link to="/profile/dogs/new">Add a dog</Link> to track focus.</p>
              ) : (
                <div className="home-training-cards">
                  {dogs.map((dog, i) => {
                    const { completed, total } = getGoalPathProgress(dog?.id);
                    return (
                      <Link key={dog?.id ?? i} to={`/dogs/${dog?.id ?? ''}`} className="home-training-card home-training-card--link">
                        <div className="home-training-card-header">
                          <span className="home-training-dog-avatar" aria-hidden>🐕</span>
                          <span className="home-training-dog-name">{dog?.name ?? 'Dog'}</span>
                        </div>
                        <p className="home-training-focus">Working on: {dog?.reactivityTags || '—'}</p>
                        <div className="home-training-steps">
                          <span className="home-training-paws" aria-hidden>
                            {Array.from({ length: total }, (_, j) => (
                              <span key={j} className={`home-training-paw ${j < completed ? 'home-training-paw--done' : ''}`}>🐾</span>
                            ))}
                          </span>
                          <span className="home-training-steps-label">{completed} of {total} steps</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>

            {/* My dogs snapshot */}
            <section className="home-panel home-panel--dogs">
              <div className="home-section-header">
                <h2 className="home-section-title">My dogs</h2>
                <Link to="/profile#dogs" className="home-section-action">Profile</Link>
              </div>
              {dogsLoading ? (
                <p className="home-empty">Loading…</p>
              ) : dogs.length === 0 ? (
                <p className="home-empty"><Link to="/profile/dogs/new">Add your first dog</Link>.</p>
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

            {/* Matches & friends */}
            <section className="home-panel home-panel--friends">
              <div className="home-section-header">
                <h2 className="home-section-title">Matches & friends</h2>
                <Link to="/messages" className="home-section-action">Messages</Link>
              </div>
              {friendsLoading ? (
                <p className="home-empty">Loading…</p>
              ) : friends.length === 0 ? (
                <p className="home-empty">Add friends from meetups.</p>
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

            {/* Quick actions */}
            <section className="home-panel home-panel--actions">
              <h2 className="home-section-title">Quick actions</h2>
              <div className="home-quick-actions">
                <Link to="/meetups/new" className="home-quick-action home-quick-action--primary">Create meetup</Link>
                <Link to="/meetups" className="home-quick-action">Browse meetups</Link>
                <Link to="/messages" className="home-quick-action">Messages</Link>
                <Link to="/profile" className="home-quick-action">Profile</Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
