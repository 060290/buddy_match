import React, { useEffect, useState, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { resizeImageForAvatar } from '../utils/avatar';

const STORAGE_KEY = (id) => `dog-profile-${id}`;

function getStoredTraining(id) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY(id));
    if (!raw) return { progress: 50, notes: '' };
    const data = JSON.parse(raw);
    return { progress: Math.min(100, Math.max(0, Number(data.progress) || 50)), notes: data.notes || '' };
  } catch {
    return { progress: 50, notes: '' };
  }
}

function setStoredTraining(id, progress, notes) {
  try {
    localStorage.setItem(STORAGE_KEY(id), JSON.stringify({ progress, notes }));
  } catch (_) {}
}

const INITIAL_FORM = { name: '', avatarUrl: '', size: '', age: '', breed: '', reactivityTags: '', triggers: '' };

export default function DogProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [dog, setDog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [training, setTraining] = useState({ progress: 50, notes: '' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const loadDog = () => {
    if (!id) return;
    setLoading(true);
    api.get(`/dogs/${id}`)
      .then((r) => {
        const d = r.data;
        setDog(d);
        setForm({
          name: d.name || '',
          avatarUrl: d.avatarUrl || '',
          size: d.size || '',
          age: d.age || '',
          breed: d.breed || '',
          reactivityTags: d.reactivityTags || '',
          triggers: d.triggers || '',
        });
        setTraining(getStoredTraining(d.id));
      })
      .catch(() => setDog(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDog();
  }, [id]);

  const handleChange = (e) => {
    setError('');
    setUploadError('');
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleTrainingChange = (field, value) => {
    setTraining((t) => ({ ...t, [field]: value }));
    if (dog?.id) {
      const next = { ...training, [field]: value };
      setStoredTraining(dog.id, next.progress, next.notes);
    }
  };

  async function handleFile(files) {
    setUploadError('');
    const file = files && files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('Please choose an image (JPG, PNG, etc.).');
      return;
    }
    try {
      const dataUrl = await resizeImageForAvatar(file);
      setForm((f) => ({ ...f, avatarUrl: dataUrl }));
    } catch (err) {
      setUploadError(err.message || 'Could not process image');
    }
  }

  const onFileInputChange = (e) => {
    handleFile(e.target.files);
    e.target.value = '';
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = () => setDragOver(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name?.trim() || !form.size?.trim()) {
      setError('Name and size are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const updated = await api.patch(`/dogs/${id}`, form).then((r) => r.data);
      setDog(updated);
      setEditing(false);
      setStoredTraining(updated.id, training.progress, training.notes);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      name: dog?.name || '',
      avatarUrl: dog?.avatarUrl || '',
      size: dog?.size || '',
      age: dog?.age || '',
      breed: dog?.breed || '',
      reactivityTags: dog?.reactivityTags || '',
      triggers: dog?.triggers || '',
    });
    setError('');
    setUploadError('');
    setEditing(false);
  };

  const handleDelete = async () => {
    if (!window.confirm(`Remove ${dog?.name} from your profile? This can’t be undone.`)) return;
    setDeleting(true);
    setError('');
    try {
      await api.delete(`/dogs/${id}`);
      navigate('/dogs');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Could not remove dog');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="app-page"><div className="dog-profile-content"><p>Loading…</p></div></div>;
  if (!dog) return <div className="app-page"><div className="dog-profile-content"><p>Dog not found.</p><Link to="/dogs">Back to dogs</Link></div></div>;

  const displayDog = editing ? { ...dog, ...form } : dog;

  return (
    <div className="app-page app-page--dog-profile">
      <div className="dog-profile-content">
        <Link to="/dogs" className="dog-profile-back">← Back to dogs</Link>

        {/* Identity hero – view or edit */}
        <section className="dog-hero">
          <div className="dog-hero-photo-wrap">
            {editing ? (
              <>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="dog-photo-input-hidden"
                  aria-label="Upload dog photo"
                  onChange={onFileInputChange}
                />
                <div
                  className={`dog-hero-photo dog-hero-photo--editable ${dragOver ? 'dog-hero-photo--drag' : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}
                  aria-label="Change photo: click or drag image"
                >
                  {form.avatarUrl ? (
                    <img src={form.avatarUrl} alt="" />
                  ) : (
                    <span className="dog-hero-placeholder" aria-hidden>🐕</span>
                  )}
                  <span className="dog-hero-photo-hint">Change photo</span>
                </div>
                {uploadError && <p className="dog-profile-error">{uploadError}</p>}
              </>
            ) : (
              <div className="dog-hero-photo">
                {displayDog.avatarUrl ? (
                  <img src={displayDog.avatarUrl} alt="" />
                ) : (
                  <span className="dog-hero-placeholder" aria-hidden>🐕</span>
                )}
              </div>
            )}
          </div>
          <div className="dog-hero-info">
            {editing ? (
              <form onSubmit={handleSave} className="dog-hero-form">
                <div className="form-group">
                  <label>Name *</label>
                  <input type="text" name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Luna" />
                </div>
                <div className="form-group">
                  <label>Breed</label>
                  <input type="text" name="breed" value={form.breed} onChange={handleChange} placeholder="e.g. Golden Retriever" />
                </div>
                <div className="form-group">
                  <label>Age</label>
                  <input type="text" name="age" value={form.age} onChange={handleChange} placeholder="e.g. 2 years" />
                </div>
                <div className="form-group">
                  <label>Size *</label>
                  <select name="size" value={form.size} onChange={handleChange} required>
                    <option value="">Select size…</option>
                    <option value="Small">Small</option>
                    <option value="Medium">Medium</option>
                    <option value="Large">Large</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Reactivity summary</label>
                  <input type="text" name="reactivityTags" value={form.reactivityTags} onChange={handleChange} placeholder="e.g. Dog-friendly, leash-reactive" />
                </div>
                {error && <p className="dog-profile-error">{error}</p>}
                <div className="dog-hero-actions">
                  <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
                  <button type="button" className="btn btn-ghost" onClick={handleCancel}>Cancel</button>
                </div>
              </form>
            ) : (
              <>
                <h1 className="dog-hero-name">{displayDog.name ?? 'Dog'}</h1>
                <p className="dog-hero-breed">{displayDog.breed || '—'}</p>
                <p className="dog-hero-meta">Age: {displayDog.age || '—'} · Size: {displayDog.size ?? '—'}</p>
                <div className="dog-hero-reactivity">
                  <span className="dog-hero-reactivity-label">Reactivity summary</span>
                  <span className="dog-hero-reactivity-value">{displayDog.reactivityTags || '—'}</span>
                </div>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>Edit profile</button>
              </>
            )}
          </div>
        </section>

        {/* Training focus – editable progress and notes (notes stored in localStorage) */}
        <section className="dog-panel dog-panel--training">
          <h2 className="dog-panel-title">Training focus</h2>
          <div className="dog-training-progress-wrap">
            {editing ? (
              <input
                type="range"
                min="0"
                max="100"
                value={training.progress}
                onChange={(e) => handleTrainingChange('progress', Number(e.target.value))}
                className="dog-training-progress-input"
                aria-label="Training progress"
              />
            ) : (
              <div className="dog-training-progress-bar" style={{ width: `${training.progress}%` }} aria-hidden />
            )}
          </div>
          <p className="dog-training-notes">
            Working on: {editing ? form.reactivityTags || '—' : displayDog.reactivityTags || '—'}
          </p>
          {editing ? (
            <div className="form-group">
              <label>Notes (saved locally)</label>
              <textarea
                name="trainingNotes"
                value={training.notes}
                onChange={(e) => handleTrainingChange('notes', e.target.value)}
                placeholder="Goals, what’s working, etc."
                rows={3}
                className="dog-training-notes-input"
              />
            </div>
          ) : (
            training.notes ? <p className="dog-panel-note">{training.notes}</p> : null
          )}
        </section>

        {/* Meetups – placeholder */}
        <section className="dog-panel dog-panel--meetups">
          <h2 className="dog-panel-title">Meetups</h2>
          <div className="dog-meetups-tabs">
            <span className="dog-meetups-tab dog-meetups-tab--active">Upcoming</span>
            <span className="dog-meetups-tab">Past</span>
          </div>
          <p className="dog-panel-empty">No meetups for this dog yet.</p>
        </section>

        {/* Compatible dogs – placeholder */}
        <section className="dog-panel dog-panel--matches">
          <h2 className="dog-panel-title">Compatible dogs & matches</h2>
          <p className="dog-panel-empty">Matches will appear here.</p>
        </section>

        {/* Detailed info – view or edit triggers */}
        <section className="dog-panel dog-panel--details">
          <h2 className="dog-panel-title">Detailed info</h2>
          {editing ? (
            <div className="form-group">
              <label>Triggers</label>
              <input type="text" name="triggers" value={form.triggers} onChange={handleChange} placeholder="e.g. Bikes, loud noises" />
            </div>
          ) : (
            <dl className="dog-details-list">
              <div className="dog-details-row">
                <dt>Triggers</dt>
                <dd>{displayDog.triggers || '—'}</dd>
              </div>
              <div className="dog-details-row">
                <dt>Preferences</dt>
                <dd>—</dd>
              </div>
              <div className="dog-details-row">
                <dt>Notes</dt>
                <dd>{training.notes || '—'}</dd>
              </div>
            </dl>
          )}
        </section>

        {/* Delete – only when not editing */}
        {!editing && (
          <section className="dog-panel dog-panel--danger">
            <p className="dog-panel-note">Remove this dog from your profile. This can’t be undone.</p>
            <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Removing…' : 'Delete dog'}
            </button>
          </section>
        )}
      </div>
    </div>
  );
}
