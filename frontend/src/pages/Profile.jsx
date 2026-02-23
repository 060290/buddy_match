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
  const [form, setForm] = useState({ name: '', avatarUrl: '', city: '', lat: '', lng: '', experience: '', availability: '' });
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
          city: data.city || '',
          lat: data.lat ?? '',
          lng: data.lng ?? '',
          experience: data.experience || '',
          availability: data.availability || '',
        });
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
      await api.patch('/users/me', form);
      await refreshMe();
      updateUser({ avatarUrl: form.avatarUrl || null });
      setMessage('Profile updated.');
    } catch (err) {
      setMessage(err.message || 'Update failed');
    } finally {
      setSaving(false);
    }
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
    <div className="app-page">
      <div className="app-page-content profile-page-content">
        <div className="profile-main">
          {/* Profile header: like common profile pages */}
          <header className="profile-header">
            <div className="profile-header-avatar-wrap">
              <div className="profile-picture-wrap profile-header-avatar">
                {form.avatarUrl ? (
                  <img src={form.avatarUrl} alt="" className="profile-picture-img" onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling?.classList.add('profile-picture-fallback--show'); }} />
                ) : null}
                <span className={`profile-picture-fallback ${form.avatarUrl ? '' : 'profile-picture-fallback--show'}`} aria-hidden>
                  {getInitials(form.name, profile.email)}
                </span>
              </div>
            </div>
            <div className="profile-header-info">
              <h1 className="profile-header-name">{form.name || 'Your name'}</h1>
              <p className="profile-header-email">{profile.email}</p>
            </div>
          </header>

          <div ref={pledgeRef} id="safety-pledge">
            {profile.safetyPledgedAt ? (
              <p className="badge" style={{ marginBottom: '1rem' }}>✓ Safety pledge taken</p>
            ) : (
              <div className="card" style={{ marginBottom: '1.5rem', background: 'var(--accent-soft)' }}>
                <strong>Take the Safety Pledge</strong>
                <p style={{ margin: '0.5rem 0', fontSize: '0.95rem' }}>Commit to safe, force-free meetups and show others you’re on the same page.</p>
                <button type="button" className="btn btn-primary" onClick={() => setShowPledgeModal(true)}>
                  Take the pledge
                </button>
                {message && (
                  <p style={{ margin: '0.75rem 0 0', fontSize: '0.9rem', color: message.startsWith('Thanks') ? 'var(--accent)' : '#b54a4a' }}>
                    {message}
                  </p>
                )}
              </div>
            )}
          </div>

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

          <form onSubmit={saveProfile} className="card profile-form-card">
            <h2 className="profile-section-title">About you</h2>
            <div className="form-group">
              <label>Display name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="How other buddies see you" />
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
              <label>When you’re usually free</label>
              <input type="text" name="availability" value={form.availability} onChange={handleChange} placeholder="e.g. Weekend mornings, weekday evenings" />
            </div>
            <h2 className="profile-section-title" style={{ marginTop: '1.5rem' }}>Location</h2>
            <p className="profile-field-hint">Used to show you nearby meetups. Search for your city or area.</p>
            <div className="form-group profile-location-wrap" ref={locationWrapRef} style={{ position: 'relative' }}>
              <label htmlFor="profile-location">City or area</label>
              <input
                id="profile-location"
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                onFocus={() => setLocationFocused(true)}
                onBlur={() => setTimeout(() => setLocationFocused(false), 200)}
                placeholder="Search for your city or area…"
                autoComplete="off"
              />
              {locationSearching && <span className="profile-location-search-hint">Searching…</span>}
              {locationFocused && locationSuggestions.length > 0 && (
                <ul className="location-suggestions" aria-label="Location suggestions">
                  {locationSuggestions.map((place, i) => (
                    <li key={i}>
                      <button type="button" className="location-suggestion-btn" onClick={() => pickLocation(place)}>
                        {place.display_name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button type="button" className="btn btn-ghost btn-sm" onClick={useMyLocation} style={{ marginBottom: '1rem' }}>
              Use my current location
            </button>
            {message && !message.startsWith('Thanks') && <p className="error-msg">{message}</p>}
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
          </form>
        </div>

        <aside className="profile-sidebar">
          <section className="card profile-picture-card profile-picture-card--sidebar">
            <h2 style={{ marginTop: 0, marginBottom: '0.75rem' }}>Profile photo</h2>
            {!showPhotoOptions ? (
              <div
                className="profile-photo-preview"
                onClick={() => setShowPhotoOptions(true)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowPhotoOptions(true); } }}
                aria-label="Change profile photo"
              >
                <div className="profile-picture-wrap">
                  {form.avatarUrl ? (
                    <img src={form.avatarUrl} alt="" className="profile-picture-img" onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling?.classList.add('profile-picture-fallback--show'); }} />
                  ) : null}
                  <span className={`profile-picture-fallback ${form.avatarUrl ? '' : 'profile-picture-fallback--show'}`} aria-hidden>
                    {getInitials(form.name, profile.email)}
                  </span>
                </div>
                <span className="profile-photo-preview-overlay">
                  <span className="profile-photo-camera-icon" aria-hidden>📷</span>
                  <span>Change photo</span>
                </span>
              </div>
            ) : (
              <div className="profile-picture-row profile-picture-row--sidebar">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*,application/pdf"
                  className="profile-photo-input"
                  aria-label="Upload profile photo"
                  onChange={onFileInputChange}
                />
                <div
                  className={`profile-photo-zone ${dragOver ? 'profile-photo-zone--drag' : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}
                  aria-label="Upload or change profile photo"
                >
                  <div className="profile-picture-wrap">
                    {form.avatarUrl ? (
                      <img src={form.avatarUrl} alt="" className="profile-picture-img" onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling?.classList.add('profile-picture-fallback--show'); }} />
                    ) : null}
                    <span className={`profile-picture-fallback ${form.avatarUrl ? '' : 'profile-picture-fallback--show'}`} aria-hidden>
                      {getInitials(form.name, profile.email)}
                    </span>
                  </div>
                  <span className="profile-photo-zone-label">
                    {form.avatarUrl ? 'Change photo' : 'Upload photo'}
                  </span>
                </div>
                <div className="profile-picture-form">
                  <button type="button" className="link-button profile-photo-done" onClick={() => setShowPhotoOptions(false)}>
                    Done
                  </button>
                  <p className="profile-photo-hint">Saved separately from the rest of your profile.</p>
                  <button type="button" className="btn btn-primary btn-sm" onClick={savePhoto} disabled={photoSaving}>
                    {photoSaving ? 'Saving…' : 'Save photo'}
                  </button>
                  {form.avatarUrl && (
                    <button type="button" className="btn btn-ghost btn-sm profile-remove-photo" onClick={removePhoto}>
                      Remove photo
                    </button>
                  )}
                  {photoMessage && <p className={photoMessage.startsWith('Photo saved') ? 'profile-photo-success' : 'error-msg'} style={{ marginTop: '0.5rem' }}>{photoMessage}</p>}
                  {uploadError && <p className="error-msg" style={{ marginTop: '0.5rem' }}>{uploadError}</p>}
                  <button type="button" className="link-button" onClick={() => setShowPasteLink(!showPasteLink)} style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                    {showPasteLink ? 'Hide link' : 'Or paste link'}
                  </button>
                  {showPasteLink && (
                    <div className="form-group" style={{ marginTop: '0.75rem' }}>
                      <label>Image URL</label>
                      <input type="url" name="avatarUrl" value={form.avatarUrl} onChange={handleChange} placeholder="https://…" />
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          <section className="card profile-dogs-card">
            <h2 style={{ margin: 0, marginBottom: '0.75rem' }}>Your dogs</h2>
            {dogs.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>No dogs added yet. <Link to="/profile/dogs/new" className="btn btn-primary btn-sm" style={{ marginTop: '0.5rem', display: 'inline-block' }}>Add dog</Link></p>
            ) : (
              <>
                <div className="profile-dog-cards">
                  {dogs.map((d) => (
                    <Link key={d.id} to={`/profile/dogs/${d.id}`} className="profile-dog-card">
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
                        <span className="profile-dog-card-meta">
                          {[d.size, d.age, d.breed].filter(Boolean).join(' · ')}
                          {d.reactivityTags && ` · ${d.reactivityTags}`}
                        </span>
                      </div>
                      <span className="profile-dog-card-chevron" aria-hidden>›</span>
                    </Link>
                  ))}
                </div>
                <Link to="/profile/dogs/new" className="btn btn-secondary btn-sm profile-dog-add-another">Add another dog</Link>
              </>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
