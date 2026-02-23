import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { Link, useLocation } from 'react-router-dom';
import { resizeImageForAvatar } from '../utils/avatar';
import { searchPlaces } from '../utils/geocode';

export default function Profile() {
  const { user, refreshMe, updateUser } = useAuth();
  const location = useLocation();
  const pledgeRef = useRef(null);
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState(null);
  const [dogs, setDogs] = useState([]);
  const [form, setForm] = useState({
    name: '', avatarUrl: '', bio: '', city: '', lat: '', lng: '', experience: '', availability: '',
    distanceComfortKm: '', meetupStyle: '', dogSizeComfort: '', boundariesNote: '',
  });
  const [notifications, setNotifications] = useState({ emailReminders: true, newMessageAlerts: true, meetupReminders: true });
  const [privacy, setPrivacy] = useState({ profileVisible: true, showOnMap: true });
  const [saving, setSaving] = useState(false);
  const [photoSaving, setPhotoSaving] = useState(false);
  const [photoMessage, setPhotoMessage] = useState('');
  const [pledging, setPledging] = useState(false);
  const [message, setMessage] = useState('');
  const [loadError, setLoadError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [showPasteLink, setShowPasteLink] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [showPledgeModal, setShowPledgeModal] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [locationFocused, setLocationFocused] = useState(false);
  const [locationSearching, setLocationSearching] = useState(false);
  const locationDebounceRef = useRef(null);
  const locationWrapRef = useRef(null);

  useEffect(() => {
    if (location.hash === '#safety-pledge' && profile && !profile.safetyPledgedAt) {
      setShowPledgeModal(true);
    }
  }, [location.hash, profile]);

  useEffect(() => {
    if (showPledgeModal && pledgeRef.current) {
      pledgeRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showPledgeModal]);

  useEffect(() => {
    setLoadError(null);
    api.get('/users/me')
      .then((r) => {
        const data = r.data || {};
        setProfile(data);
        setDogs(data.dogs || []);
        setForm({
          name: data.name || '',
          avatarUrl: data.avatarUrl || '',
          bio: data.bio || '',
          city: data.city || '',
          lat: data.lat ?? '',
          lng: data.lng ?? '',
          experience: data.experience || '',
          availability: data.availability || '',
          distanceComfortKm: data.distanceComfortKm ?? '',
          meetupStyle: data.meetupStyle || '',
          dogSizeComfort: data.dogSizeComfort || '',
          boundariesNote: data.boundariesNote || '',
        });
        try {
          const n = localStorage.getItem('profile-notifications');
          if (n) setNotifications(JSON.parse(n));
          const p = localStorage.getItem('profile-privacy');
          if (p) setPrivacy(JSON.parse(p));
        } catch (_) {}
      })
      .catch((err) => {
        setProfile(null);
        setLoadError(err.message || 'Could not load profile');
      });
  }, [user?.id]);

  const handleChange = (e) => {
    setUploadError('');
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  async function handleFile(files) {
    setUploadError('');
    const file = files && files[0];
    if (!file) return;
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setUploadError('Please choose an image (JPG, PNG, etc.) or a PDF.');
      return;
    }
    try {
      const dataUrl = await resizeImageForAvatar(file);
      setForm((f) => ({ ...f, avatarUrl: dataUrl }));
    } catch (err) {
      setUploadError(err.message || 'Could not process image');
    }
  }

  function onFileInputChange(e) {
    handleFile(e.target.files);
    e.target.value = '';
  }

  function onDrop(e) {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files);
  }

  function onDragOver(e) {
    e.preventDefault();
    setDragOver(true);
  }

  function onDragLeave() {
    setDragOver(false);
  }

  function removePhoto() {
    setForm((f) => ({ ...f, avatarUrl: '' }));
    setUploadError('');
    setPhotoMessage('');
  }

  const savePhoto = async () => {
    setPhotoSaving(true);
    setPhotoMessage('');
    setUploadError('');
    try {
      await api.patch('/users/me', { avatarUrl: form.avatarUrl || null });
      await refreshMe();
      updateUser({ avatarUrl: form.avatarUrl || null });
      setPhotoMessage('Photo saved.');
    } catch (err) {
      setPhotoMessage(err.message || 'Could not save photo');
    } finally {
      setPhotoSaving(false);
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await api.patch('/users/me', {
        name: form.name, avatarUrl: form.avatarUrl, bio: form.bio, city: form.city,
        lat: form.lat || null, lng: form.lng || null, experience: form.experience, availability: form.availability,
        distanceComfortKm: form.distanceComfortKm || null, meetupStyle: form.meetupStyle || null,
        dogSizeComfort: form.dogSizeComfort || null, boundariesNote: form.boundariesNote || null,
      });
      await refreshMe();
      updateUser({ avatarUrl: form.avatarUrl || null });
      setMessage('Profile updated.');
    } catch (err) {
      setMessage(err.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const setNotification = (key, value) => {
    const next = { ...notifications, [key]: value };
    setNotifications(next);
    try { localStorage.setItem('profile-notifications', JSON.stringify(next)); } catch (_) {}
  };
  const setPrivacyOption = (key, value) => {
    const next = { ...privacy, [key]: value };
    setPrivacy(next);
    try { localStorage.setItem('profile-privacy', JSON.stringify(next)); } catch (_) {}
  };

  // Location search: debounced suggestions
  useEffect(() => {
    const raw = (form.city || '').trim();
    if (raw.length < 2) {
      setLocationSuggestions([]);
      return;
    }
    if (locationDebounceRef.current) clearTimeout(locationDebounceRef.current);
    locationDebounceRef.current = setTimeout(() => {
      locationDebounceRef.current = null;
      setLocationSearching(true);
      searchPlaces(raw)
        .then((list) => setLocationSuggestions(list))
        .catch(() => setLocationSuggestions([]))
        .finally(() => setLocationSearching(false));
    }, 400);
    return () => { if (locationDebounceRef.current) clearTimeout(locationDebounceRef.current); };
  }, [form.city]);

  const pickLocation = (place) => {
    setForm((f) => ({
      ...f,
      city: place.display_name,
      lat: place.lat,
      lng: place.lon,
    }));
    setLocationSuggestions([]);
    setLocationFocused(false);
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setMessage('Location is not supported in this browser');
      return;
    }
    setMessage('');
    navigator.geolocation.getCurrentPosition(
      (pos) => setForm((f) => ({
        ...f,
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        city: f.city || 'Current location',
      })),
      () => setMessage('Could not get your location. Try searching for your city instead.')
    );
  };

  const takePledge = async () => {
    setPledging(true);
    setMessage('');
    try {
      await api.post('/users/me/safety-pledge');
      await refreshMe();
      const { data } = await api.get('/users/me');
      setProfile(data);
      setShowPledgeModal(false);
      setMessage('Thanks for taking the Safety Pledge!');
    } catch (err) {
      setMessage(err.message || 'Could not save pledge');
    } finally {
      setPledging(false);
    }
  };

  function getInitials(name, email) {
    if (name?.trim()) return name.trim().split(/\s+/).map((n) => n[0]).slice(0, 2).join('').toUpperCase();
    if (email?.[0]) return email[0].toUpperCase();
    return '?';
  }

  if (!profile && !loadError) return <div className="app-page"><div className="app-page-content">Loading profile…</div></div>;

  if (loadError) {
    return (
      <div className="app-page">
        <div className="app-page-content app-page-content--narrow">
          <h1>Profile</h1>
          <p className="error-msg">{loadError}</p>
          <p style={{ color: 'var(--text-muted)' }}>Try refreshing the page, or log out and log back in.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-page app-page--profile">
      <div className="profile-page-content profile-page-content--sections">
        <section className="profile-section profile-section-identity">
          <div className="profile-section-identity-top">
            <div className="profile-section-avatar-wrap">
              <div className="profile-picture-wrap profile-section-avatar">
                {form.avatarUrl ? (
                  <img src={form.avatarUrl} alt="" className="profile-picture-img" onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling?.classList.add('profile-picture-fallback--show'); }} />
                ) : null}
                <span className={`profile-picture-fallback ${form.avatarUrl ? '' : 'profile-picture-fallback--show'}`} aria-hidden>
                  {getInitials(form.name, profile.email)}
                </span>
              </div>
            <button type="button" className="profile-section-avatar-change" onClick={() => setShowPhotoOptions(true)} aria-label="Change photo">Change photo</button>
            </div>
            <div className="profile-section-identity-info">
              <h1 className="profile-section-title profile-identity-name">{form.name || 'Your name'}</h1>
              <p className="profile-identity-email">{profile.email}</p>
              <p className="profile-identity-meta">
                {form.experience && <span>{form.experience}</span>}
                {form.city && <span>{form.city}</span>}
                <span><Link to="/dogs">{profile.dogsCount ?? dogs.length} dog{(profile.dogsCount ?? dogs.length) !== 1 ? 's' : ''}</Link></span>
              </p>
            </div>
          </div>
          {showPhotoOptions && (
            <div className="profile-section-photo-edit">
              <input type="file" ref={fileInputRef} accept="image/*" className="profile-photo-input" aria-label="Upload photo" onChange={onFileInputChange} />
              <div className={`profile-photo-zone ${dragOver ? 'profile-photo-zone--drag' : ''}`} onClick={() => fileInputRef.current?.click()} onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave} role="button" tabIndex={0}>
                <div className="profile-picture-wrap">
                  {form.avatarUrl ? <img src={form.avatarUrl} alt="" className="profile-picture-img" onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling?.classList.add('profile-picture-fallback--show'); }} /> : null}
                  <span className={`profile-picture-fallback ${form.avatarUrl ? '' : 'profile-picture-fallback--show'}`} aria-hidden>{getInitials(form.name, profile.email)}</span>
                </div>
                <span className="profile-photo-zone-label">{form.avatarUrl ? 'Change' : 'Upload'}</span>
              </div>
              <div className="profile-photo-edit-actions">
                <button type="button" className="btn btn-primary btn-sm" onClick={savePhoto} disabled={photoSaving}>{photoSaving ? 'Saving…' : 'Save photo'}</button>
                {form.avatarUrl && <button type="button" className="btn btn-ghost btn-sm" onClick={removePhoto}>Remove</button>}
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowPhotoOptions(false)}>Done</button>
              </div>
              {photoMessage && <p className={photoMessage.startsWith('Photo saved') ? 'profile-photo-success' : 'error-msg'}>{photoMessage}</p>}
              {uploadError && <p className="error-msg">{uploadError}</p>}
            </div>
          )}
        </section>

        <form onSubmit={saveProfile} className="profile-form-sections">
          <section className="profile-section-card">
            <h2 className="profile-section-card-title">Identity</h2>
            <div className="form-group">
              <label>Display name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="How other buddies see you" />
            </div>
            <div className="form-group">
              <label>Bio</label>
              <textarea name="bio" value={form.bio} onChange={handleChange} placeholder="A bit about you and your dogs…" rows={3} />
            </div>
            <div className="form-group">
              <label>Experience with reactive dogs</label>
              <select name="experience" value={form.experience} onChange={handleChange}>
                <option value="">Select…</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Experienced">Experienced</option>
              </select>
            </div>
            <div className="form-group">
              <label>When you're usually free</label>
              <input type="text" name="availability" value={form.availability} onChange={handleChange} placeholder="e.g. Weekend mornings, weekday evenings" />
            </div>
            <div className="form-group">
              <label>Location</label>
              <p className="profile-field-hint">Used for nearby meetups. Search city or area.</p>
              <div className="profile-location-wrap" ref={locationWrapRef}>
                <input id="profile-location" type="text" name="city" value={form.city} onChange={handleChange} onFocus={() => setLocationFocused(true)} onBlur={() => setTimeout(() => setLocationFocused(false), 200)} placeholder="Search for your city or area…" autoComplete="off" />
                {locationSearching && <span className="profile-location-search-hint">Searching…</span>}
                {locationFocused && locationSuggestions.length > 0 && (
                  <ul className="location-suggestions" aria-label="Location suggestions">
                    {locationSuggestions.map((place, i) => (
                      <li key={i}><button type="button" className="location-suggestion-btn" onClick={() => pickLocation(place)}>{place.display_name}</button></li>
                    ))}
                  </ul>
                )}
              </div>
              <button type="button" className="btn btn-ghost btn-sm" onClick={useMyLocation}>Use my current location</button>
            </div>
            <p className="profile-dogs-count">You have <Link to="/dogs">{profile.dogsCount ?? dogs.length} dog{(profile.dogsCount ?? dogs.length) !== 1 ? 's' : ''}</Link> on your profile.</p>
          </section>

          <section className="profile-section-card">
            <h2 className="profile-section-card-title">Handler preferences</h2>
            <p className="profile-field-hint">These help with matching you to compatible buddies and meetups.</p>
            <div className="form-group">
              <label>Distance comfort (km)</label>
              <input type="number" name="distanceComfortKm" value={form.distanceComfortKm} onChange={handleChange} placeholder="e.g. 10" min={1} max={200} />
            </div>
            <div className="form-group">
              <label>Meetup style</label>
              <select name="meetupStyle" value={form.meetupStyle} onChange={handleChange}>
                <option value="">Select…</option>
                <option value="Parallel walks">Parallel walks</option>
                <option value="Structured training">Structured training</option>
                <option value="Low-key hangouts">Low-key hangouts</option>
                <option value="Mix of all">Mix of all</option>
              </select>
            </div>
            <div className="form-group">
              <label>Dog size comfort</label>
              <select name="dogSizeComfort" value={form.dogSizeComfort} onChange={handleChange}>
                <option value="">Select…</option>
                <option value="Small only">Small only</option>
                <option value="Medium only">Medium only</option>
                <option value="Large only">Large only</option>
                <option value="Any size">Any size</option>
              </select>
            </div>
          </section>

          <section className="profile-section-card" ref={pledgeRef} id="safety-pledge">
            <h2 className="profile-section-card-title">Safety & boundaries</h2>
            {profile.safetyPledgedAt ? (
              <p className="profile-pledge-badge">✓ Safety pledge taken</p>
            ) : (
              <div className="profile-pledge-cta">
                <p>Commit to safe, force-free meetups.</p>
                <button type="button" className="btn btn-primary" onClick={() => setShowPledgeModal(true)}>Take the pledge</button>
              </div>
            )}
            <div className="form-group">
              <label>Boundaries note (optional)</label>
              <textarea name="boundariesNote" value={form.boundariesNote} onChange={handleChange} placeholder="e.g. Need advance notice, prefer quiet spots…" rows={2} />
            </div>
          </section>

          <section className="profile-section-card profile-section-activity">
            <h2 className="profile-section-card-title">Activity summary</h2>
            <div className="profile-activity-grid">
              <div className="profile-activity-item">
                <span className="profile-activity-value">{profile.meetupsAttended ?? 0}</span>
                <span className="profile-activity-label">Meetups attended</span>
              </div>
              <div className="profile-activity-item">
                <span className="profile-activity-value">{profile.dogsCount ?? dogs.length}</span>
                <span className="profile-activity-label">Dogs added</span>
              </div>
              <div className="profile-activity-item">
                <span className="profile-activity-value">{profile.matchesCount ?? 0}</span>
                <span className="profile-activity-label">Matches</span>
              </div>
            </div>
          </section>

          <section className="profile-section-card">
            <h2 className="profile-section-card-title">Notifications</h2>
            <div className="profile-toggles">
              <label className="profile-toggle-row">
                <input type="checkbox" checked={notifications.emailReminders} onChange={(e) => setNotification('emailReminders', e.target.checked)} />
                <span>Email reminders for upcoming meetups</span>
              </label>
              <label className="profile-toggle-row">
                <input type="checkbox" checked={notifications.newMessageAlerts} onChange={(e) => setNotification('newMessageAlerts', e.target.checked)} />
                <span>New message alerts</span>
              </label>
              <label className="profile-toggle-row">
                <input type="checkbox" checked={notifications.meetupReminders} onChange={(e) => setNotification('meetupReminders', e.target.checked)} />
                <span>Meetup reminders</span>
              </label>
            </div>
          </section>

          <section className="profile-section-card">
            <h2 className="profile-section-card-title">Privacy & visibility</h2>
            <div className="profile-toggles">
              <label className="profile-toggle-row">
                <input type="checkbox" checked={privacy.profileVisible} onChange={(e) => setPrivacyOption('profileVisible', e.target.checked)} />
                <span>Profile visible to other members</span>
              </label>
              <label className="profile-toggle-row">
                <input type="checkbox" checked={privacy.showOnMap} onChange={(e) => setPrivacyOption('showOnMap', e.target.checked)} />
                <span>Show on nearby map</span>
              </label>
            </div>
          </section>

          <section className="profile-section-card">
            <h2 className="profile-section-card-title">Account settings</h2>
            <div className="profile-account-row">
              <span className="profile-account-label">Email</span>
              <span className="profile-account-value">{profile.email}</span>
            </div>
            <p className="profile-field-hint">Contact support to change your email or password.</p>
            <Link to="/settings" className="btn btn-secondary btn-sm">Open Settings</Link>
          </section>

          {message && <p className={message.startsWith('Thanks') || message === 'Profile updated.' ? 'profile-save-success' : 'error-msg'}>{message}</p>}
          <button type="submit" className="btn btn-primary profile-save-btn" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
        </form>

        {showPledgeModal && (
            <div className="pledge-modal-overlay" onClick={() => !pledging && setShowPledgeModal(false)} role="dialog" aria-modal="true" aria-labelledby="pledge-title">
              <div className="pledge-modal" onClick={(e) => e.stopPropagation()}>
                <h2 id="pledge-title" className="pledge-modal-title">BuddyMatch Safety Pledge</h2>
                <div className="pledge-modal-text">
                  <p>By signing below, I pledge to:</p>
                  <ul>
                    <li>Prioritize the safety and well-being of all dogs and people at meetups</li>
                    <li>Use force-free, positive methods only — no aversive tools or techniques</li>
                    <li>Communicate openly with other members and respect each dog’s boundaries</li>
                    <li>Create a welcoming, low-stress environment for every buddy</li>
                  </ul>
                  <p><strong>I understand that this pledge reflects my commitment to the BuddyMatch community.</strong></p>
                </div>
                <div className="pledge-modal-actions">
                  <button type="button" className="btn btn-primary" onClick={takePledge} disabled={pledging}>
                    {pledging ? 'Signing…' : 'Sign the pledge'}
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowPledgeModal(false)} disabled={pledging}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

        <aside className="profile-sidebar profile-sidebar--dogs">
          <section className="profile-section-card profile-dogs-card">
            <h2 className="profile-section-card-title">Your dogs</h2>
            {dogs.length === 0 ? (
              <p className="profile-dogs-empty">No dogs yet. <Link to="/dogs">Add a dog</Link></p>
            ) : (
              <>
                <div className="profile-dog-cards">
                  {dogs.map((d) => (
                    <Link key={d.id} to={`/dogs/${d.id}`} className="profile-dog-card">
                      <div className="profile-dog-card-avatar">
                        {d.avatarUrl ? (
                          <img src={d.avatarUrl} alt="" onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling?.classList.add('profile-dog-card-initials--show'); }} />
                        ) : null}
                        <span className={`profile-dog-card-initials ${d.avatarUrl ? '' : 'profile-dog-card-initials--show'}`} aria-hidden>
                          {d.name ? d.name.trim().slice(0, 2).toUpperCase() : '?'}
                        </span>
                      </div>
                      <div className="profile-dog-card-body">
                        <span className="profile-dog-card-name">{d.name}</span>
                        <span className="profile-dog-card-meta">{[d.size, d.age, d.breed].filter(Boolean).join(' · ')}</span>
                      </div>
                      <span className="profile-dog-card-chevron" aria-hidden>›</span>
                    </Link>
                  ))}
                </div>
                <Link to="/dogs" className="btn btn-secondary btn-sm profile-dog-add-another">Add another dog</Link>
              </>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
