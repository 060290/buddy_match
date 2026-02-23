import React, { useEffect, useState, useRef, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

const MeetupsMap = lazy(() => import('../components/DashboardMap'));

const TABS = ['Discover', 'Hosting', 'Joined', 'Past'];
const radiusMiles = 50;
const radiusKm = radiusMiles * 1.60934;

function getInitials(name) {
  if (!name || !String(name).trim()) return '?';
  return String(name).trim().split(/\s+/).map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

export default function Meetups() {
  const { user } = useAuth();
  const [discoverPosts, setDiscoverPosts] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myLoading, setMyLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [userLoc, setUserLoc] = useState({ lat: null, lng: null });
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'list'
  const [activeTab, setActiveTab] = useState('Discover');
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchQuery(searchInput.trim());
      debounceRef.current = null;
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchInput]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    const lat = userLoc.lat ?? user?.lat;
    const lng = userLoc.lng ?? user?.lng;
    if (lat != null && lng != null) {
      params.set('lat', lat);
      params.set('lng', lng);
      params.set('radiusKm', String(radiusKm));
    }
    api.get(`/posts?${params}`)
      .then((r) => setDiscoverPosts(Array.isArray(r?.data) ? r.data : []))
      .catch(() => setDiscoverPosts([]))
      .finally(() => setLoading(false));
  }, [searchQuery, userLoc.lat, userLoc.lng, user?.lat, user?.lng]);

  useEffect(() => {
    if (!user?.id) {
      setMyLoading(false);
      return;
    }
    setMyLoading(true);
    api.get('/posts/mine')
      .then((r) => setMyPosts(Array.isArray(r?.data) ? r.data : []))
      .catch(() => setMyPosts([]))
      .finally(() => setMyLoading(false));
  }, [user?.id]);

  const now = Date.now();
  const discoverUpcoming = discoverPosts.filter((p) => !p.meetupAt || new Date(p.meetupAt).getTime() >= now);
  const discoverPast = discoverPosts.filter((p) => p.meetupAt && new Date(p.meetupAt).getTime() < now);
  const joined = discoverPosts.filter((p) => p.userRsvped);
  const joinedUpcoming = joined.filter((p) => !p.meetupAt || new Date(p.meetupAt).getTime() >= now);
  const joinedPast = joined.filter((p) => p.meetupAt && new Date(p.meetupAt).getTime() < now);
  const myUpcoming = myPosts.filter((p) => !p.meetupAt || new Date(p.meetupAt).getTime() >= now);
  const myPast = myPosts.filter((p) => p.meetupAt && new Date(p.meetupAt).getTime() < now);

  let list = [];
  let listLoading = loading;
  if (activeTab === 'Discover') {
    list = discoverUpcoming;
    listLoading = loading;
  } else if (activeTab === 'Hosting') {
    list = myUpcoming;
    listLoading = myLoading;
  } else if (activeTab === 'Joined') {
    list = joinedUpcoming;
    listLoading = loading;
  } else {
    list = [...myPast, ...joinedPast];
    listLoading = activeTab === 'Past' ? (loading || myLoading) : false;
  }

  const requestLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {}
    );
  };

  const mapPosts = activeTab === 'Discover' ? discoverUpcoming : activeTab === 'Hosting' ? myUpcoming : activeTab === 'Joined' ? joinedUpcoming : list;

  return (
    <div className="app-page app-page--meetups">
      <div className="meetups-layout">
        {/* Top controls */}
        <header className="meetups-header">
          <div className="meetups-controls-row">
            <div className="meetups-search-wrap">
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search meetups…"
                className="meetups-search-input"
                aria-label="Search meetups"
              />
            </div>
            <div className="meetups-filters">
              {user?.lat != null && user?.lng != null ? (
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setUserLoc({ lat: null, lng: null })} title="Clear location filter">
                  Nearby · Clear
                </button>
              ) : (
                <button type="button" className="btn btn-secondary btn-sm" onClick={requestLocation}>
                  Use my location
                </button>
              )}
              <button
                type="button"
                className={`btn btn-ghost btn-sm meetups-view-toggle ${viewMode === 'split' ? 'is-active' : ''}`}
                onClick={() => setViewMode('split')}
                aria-pressed={viewMode === 'split'}
              >
                Map
              </button>
              <button
                type="button"
                className={`btn btn-ghost btn-sm meetups-view-toggle ${viewMode === 'list' ? 'is-active' : ''}`}
                onClick={() => setViewMode('list')}
                aria-pressed={viewMode === 'list'}
              >
                List
              </button>
            </div>
            <Link to="/meetups/new" className="btn btn-primary">Create meetup</Link>
          </div>
          {/* Tabs: Discover + My meetups (Hosting, Joined, Past) */}
          <nav className="meetups-tabs" aria-label="Meetup tabs">
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                className={`meetups-tab ${activeTab === tab ? 'meetups-tab--active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </nav>
        </header>

        {/* Split: list left, map right */}
        <div className={`meetups-split ${viewMode === 'list' ? 'meetups-split--list-only' : ''}`}>
          <aside className="meetups-list-col">
            {listLoading ? (
              <p className="meetups-empty">Loading…</p>
            ) : list.length === 0 ? (
              <p className="meetups-empty">
                {activeTab === 'Discover' && 'No meetups match. Try different search or location.'}
                {activeTab === 'Hosting' && 'You haven’t created any meetups yet.'}
                {activeTab === 'Joined' && 'You haven’t joined any meetups yet.'}
                {activeTab === 'Past' && 'No past meetups.'}
                {' '}
                {(activeTab === 'Discover' || activeTab === 'Hosting') && <Link to="/meetups/new">Create one</Link>}
              </p>
            ) : (
              <ul className="meetups-card-list">
                {list.map((p) => (
                  <li key={p.id}>
                    <Link to={`/meetups/${p.id}`} className="meetup-discovery-card">
                      <div className="meetup-discovery-card-top">
                        <span className="meetup-discovery-card-tag">Walk</span>
                        {p.userRsvped && <span className="meetup-discovery-card-badge">Joined</span>}
                      </div>
                      <h3 className="meetup-discovery-card-title">{p.title}</h3>
                      {p.meetupAt && (
                        <p className="meetup-discovery-card-datetime">
                          {new Date(p.meetupAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                        </p>
                      )}
                      {p.location && <p className="meetup-discovery-card-location">{p.location}</p>}
                      <div className="meetup-discovery-card-meta">
                        <span className="meetup-discovery-card-host">
                          Host: {p.author?.name || 'Buddy'}
                        </span>
                        <div className="meetup-discovery-card-attending">
                          {(p.rsvpCount > 0 || p.rsvpNames?.length) ? (
                            <>
                              <span className="meetup-discovery-avatars" aria-hidden>
                                {[1, 2, 3].slice(0, Math.min(3, p.rsvpCount || p.rsvpNames?.length || 0)).map((i) => (
                                  <span key={i} className="meetup-discovery-avatar" title={(p.rsvpNames && p.rsvpNames[i - 1]) || 'Attendee'}>
                                    {(p.rsvpNames && p.rsvpNames[i - 1]) ? getInitials(p.rsvpNames[i - 1]) : '?'}
                                  </span>
                                ))}
                              </span>
                              <span>{p.rsvpCount ?? p.rsvpNames?.length ?? 0} attending</span>
                            </>
                          ) : (
                            <span>0 attending</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </aside>
          {viewMode === 'split' && (
            <div className="meetups-map-col">
              <div className="meetups-map-sticky">
                <Suspense fallback={<div className="meetups-map-fallback">Loading map…</div>}>
                  <MeetupsMap
                    meetups={mapPosts}
                    userLat={user?.lat ?? undefined}
                    userLng={user?.lng ?? undefined}
                    radiusMiles={radiusMiles}
                  />
                </Suspense>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
