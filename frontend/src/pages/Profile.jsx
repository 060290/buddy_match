import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { useLocation } from 'react-router-dom';

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

  const MAX_AVATAR_SIZE = 400;
  const AVATAR_QUALITY = 0.88;

  function resizeImage(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        const scale = Math.min(1, MAX_AVATAR_SIZE / Math.max(w, h));
        const cw = Math.round(w * scale);
        const ch = Math.round(h * scale);
        const canvas = document.createElement('canvas');
        canvas.width = cw;
        canvas.height = ch;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, cw, ch);
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('Could not process image'));
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('Could not read image'));
            reader.readAsDataURL(blob);
          },
          'image/jpeg',
          AVATAR_QUALITY
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Invalid image file'));
      };
      img.src = url;
    });
  }

  async function handleFile(files) {
    setUploadError('');
    const file = files && files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('Please choose an image file (e.g. JPG or PNG).');
      return;
    }
    try {
      const dataUrl = await resizeImage(file);
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

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setForm((f) => ({ ...f, lat: pos.coords.latitude, lng: pos.coords.longitude })),
      () => setMessage('Could not get location')
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
          <h1>Profile</h1>
          <p className="app-page-lead">Manage your account and location so buddies can find you.</p>

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

          <form onSubmit={saveProfile} className="card" style={{ marginBottom: 0 }}>
            <h2 style={{ marginTop: 0 }}>Your details</h2>
            <div className="form-group">
              <label>Email</label>
              <input type="text" value={profile.email} readOnly disabled style={{ background: 'var(--bg)', color: 'var(--text-muted)' }} />
            </div>
            <div className="form-group">
              <label>Name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>City / area</label>
              <input type="text" name="city" value={form.city} onChange={handleChange} />
            </div>
            <button type="button" className="btn btn-secondary" onClick={useMyLocation} style={{ marginBottom: '1rem' }}>Use my location (lat/lng)</button>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Latitude</label>
                <input type="number" step="any" name="lat" value={form.lat} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Longitude</label>
                <input type="number" step="any" name="lng" value={form.lng} onChange={handleChange} />
              </div>
            </div>
            <div className="form-group">
              <label>Experience level</label>
              <select name="experience" value={form.experience} onChange={handleChange}>
                <option value="">Select…</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Experienced">Experienced</option>
              </select>
            </div>
            <div className="form-group">
              <label>Availability</label>
              <input type="text" name="availability" value={form.availability} onChange={handleChange} placeholder="e.g. Weekend mornings" />
            </div>
            {message && !message.startsWith('Thanks') && <p className="error-msg">{message}</p>}
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save profile'}</button>
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
                  accept="image/*"
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
            <h2 style={{ marginTop: 0 }}>Your dogs</h2>
            {dogs.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>No dogs added yet. Add your dog so others know who they might meet.</p>
            ) : (
              <ul className="profile-dogs-list">
                {dogs.map((d) => (
                  <li key={d.id} className="profile-dog-item">
                    <strong>{d.name}</strong>
                    <span className="profile-dog-meta">{d.size}{d.age && ` · ${d.age}`}{d.breed && ` · ${d.breed}`}{d.reactivityTags && ` · ${d.reactivityTags}`}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
