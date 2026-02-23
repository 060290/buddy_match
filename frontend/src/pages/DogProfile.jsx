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

const API_FIELDS = ['name', 'breed', 'age', 'size', 'reactivityTags', 'triggers'];

export default function DogProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const inlineInputRef = useRef(null);
  const [dog, setDog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeField, setActiveField] = useState(null);
  const [editValue, setEditValue] = useState('');
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
        setTraining(getStoredTraining(d.id));
      })
      .catch(() => setDog(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDog();
  }, [id]);

  useEffect(() => {
    if (activeField && inlineInputRef.current) {
      inlineInputRef.current.focus();
      if (activeField === 'name' || activeField === 'trainingNotes' || activeField === 'detailsNotes') inlineInputRef.current.select();
    }
  }, [activeField]);

  const startEdit = (field, currentValue) => {
    setError('');
    setActiveField(field);
    setEditValue(currentValue ?? '');
  };

  const saveField = async (field, value) => {
    if (API_FIELDS.includes(field)) {
      const trimmed = typeof value === 'string' ? value.trim() : value;
      if (field === 'name' && !trimmed) {
        setError('Name is required.');
        return;
      }
      if (field === 'size' && !trimmed) {
        setActiveField(null);
        return;
      }
      setSaving(true);
      setError('');
      try {
        const payload = { [field]: trimmed || null };
        if (field === 'name') payload.name = trimmed || dog.name;
        if (field === 'size') payload.size = trimmed || dog.size;
        const updated = await api.patch(`/dogs/${id}`, payload).then((r) => r.data);
        setDog(updated);
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Could not save');
      } finally {
        setSaving(false);
      }
    } else if (field === 'trainingNotes' || field === 'detailsNotes') {
      setTraining((t) => ({ ...t, notes: value }));
      if (dog?.id) setStoredTraining(dog.id, training.progress, value);
    } else if (field === 'trainingProgress') {
      const num = Math.min(100, Math.max(0, Number(value) || 0));
      setTraining((t) => ({ ...t, progress: num }));
      if (dog?.id) setStoredTraining(dog.id, num, training.notes);
    }
    setActiveField(null);
  };

  const handleInlineKeyDown = (e, field) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveField(field, editValue);
    }
    if (e.key === 'Escape') {
      setActiveField(null);
      setError('');
    }
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
      setSaving(true);
      const updated = await api.patch(`/dogs/${id}`, { avatarUrl: dataUrl }).then((r) => r.data);
      setDog(updated);
    } catch (err) {
      setUploadError(err.response?.data?.error || err.message || 'Could not save photo');
    } finally {
      setSaving(false);
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

  const value = (field) => dog[field] ?? '';

  return (
    <div className="app-page app-page--dog-profile">
      <div className="dog-profile-content">
        <Link to="/dogs" className="dog-profile-back">← Back to dogs</Link>

        <section className="dog-hero">
          <div className="dog-hero-photo-wrap">
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
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}
              aria-label="Change photo: click or drag image"
            >
              {dog.avatarUrl ? (
                <img src={dog.avatarUrl} alt="" />
              ) : (
                <span className="dog-hero-placeholder" aria-hidden>🐕</span>
              )}
              <span className="dog-hero-photo-hint">Click to change photo</span>
            </div>
            {(uploadError || error) && <p className="dog-profile-error">{uploadError || error}</p>}
            {saving && <p className="dog-profile-saving">Saving…</p>}
          </div>
          <div className="dog-hero-info">
            {/* Name */}
            {activeField === 'name' ? (
              <input
                ref={inlineInputRef}
                type="text"
                className="dog-inline-input dog-inline-input--name"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => saveField('name', editValue)}
                onKeyDown={(e) => handleInlineKeyDown(e, 'name')}
                placeholder="Dog’s name"
              />
            ) : (
              <h1 className="dog-hero-name dog-field-clickable" onClick={() => startEdit('name', value('name'))} title="Click to edit">
                {value('name') || 'Add name'}
              </h1>
            )}

            {/* Breed */}
            {activeField === 'breed' ? (
              <input
                ref={inlineInputRef}
                type="text"
                className="dog-inline-input"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => saveField('breed', editValue)}
                onKeyDown={(e) => handleInlineKeyDown(e, 'breed')}
                placeholder="Breed"
              />
            ) : (
              <p className="dog-hero-breed dog-field-clickable" onClick={() => startEdit('breed', value('breed'))} title="Click to edit">
                {value('breed') || 'Add breed'}
              </p>
            )}

            <p className="dog-hero-meta">
              Age: {activeField === 'age' ? (
                <input
                  ref={inlineInputRef}
                  type="text"
                  className="dog-inline-input"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={() => saveField('age', editValue)}
                  onKeyDown={(e) => handleInlineKeyDown(e, 'age')}
                  placeholder="e.g. 2 years"
                />
              ) : (
                <span className="dog-field-clickable" onClick={() => startEdit('age', value('age'))} title="Click to edit">{value('age') || '—'}</span>
              )}
              {' · '}
              Size: {activeField === 'size' ? (
                <select
                  ref={inlineInputRef}
                  className="dog-inline-select"
                  value={editValue}
                  onChange={(e) => { setEditValue(e.target.value); saveField('size', e.target.value); }}
                  onBlur={() => setActiveField(null)}
                >
                  <option value="">—</option>
                  <option value="Small">Small</option>
                  <option value="Medium">Medium</option>
                  <option value="Large">Large</option>
                </select>
              ) : (
                <span className="dog-field-clickable" onClick={() => startEdit('size', value('size'))} title="Click to edit">{value('size') || '—'}</span>
              )}
            </p>

            {/* Reactivity summary */}
            <div className="dog-hero-reactivity">
              <span className="dog-hero-reactivity-label">Reactivity summary</span>
              {activeField === 'reactivityTags' ? (
                <input
                  ref={inlineInputRef}
                  type="text"
                  className="dog-inline-input"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={() => saveField('reactivityTags', editValue)}
                  onKeyDown={(e) => handleInlineKeyDown(e, 'reactivityTags')}
                  placeholder="e.g. Dog-friendly, leash-reactive"
                />
              ) : (
                <span className="dog-hero-reactivity-value dog-field-clickable" onClick={() => startEdit('reactivityTags', value('reactivityTags'))} title="Click to edit">
                  {value('reactivityTags') || 'Add reactivity notes'}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Training focus */}
        <section className="dog-panel dog-panel--training">
          <h2 className="dog-panel-title">Training focus</h2>
          <div className="dog-training-progress-wrap">
            <input
              type="range"
              min="0"
              max="100"
              value={training.progress}
              onChange={(e) => handleTrainingChange('progress', Number(e.target.value))}
              className="dog-training-progress-input"
              aria-label="Training progress"
            />
          </div>
          <p className="dog-training-notes">Working on: {value('reactivityTags') || '—'}</p>
          {activeField === 'trainingNotes' ? (
            <textarea
              ref={inlineInputRef}
              className="dog-training-notes-input"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => { saveField('trainingNotes', editValue); }}
              onKeyDown={(e) => { if (e.key === 'Escape') setActiveField(null); }}
              placeholder="Goals, what’s working, etc. (saved locally)"
              rows={3}
            />
          ) : (
            <p className="dog-panel-note dog-field-clickable dog-field-notes" onClick={() => startEdit('trainingNotes', training.notes)} title="Click to edit">
              {training.notes || 'Add training notes…'}
            </p>
          )}
        </section>

        <section className="dog-panel dog-panel--meetups">
          <h2 className="dog-panel-title">Meetups</h2>
          <div className="dog-meetups-tabs">
            <span className="dog-meetups-tab dog-meetups-tab--active">Upcoming</span>
            <span className="dog-meetups-tab">Past</span>
          </div>
          <p className="dog-panel-empty">No meetups for this dog yet.</p>
        </section>

        <section className="dog-panel dog-panel--matches">
          <h2 className="dog-panel-title">Compatible dogs & matches</h2>
          <p className="dog-panel-empty">Matches will appear here.</p>
        </section>

        <section className="dog-panel dog-panel--details">
          <h2 className="dog-panel-title">Detailed info</h2>
          <dl className="dog-details-list">
            <div className="dog-details-row">
              <dt>Triggers</dt>
              <dd>
                {activeField === 'triggers' ? (
                  <input
                    ref={inlineInputRef}
                    type="text"
                    className="dog-inline-input dog-inline-input--full"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => saveField('triggers', editValue)}
                    onKeyDown={(e) => handleInlineKeyDown(e, 'triggers')}
                    placeholder="e.g. Bikes, loud noises"
                  />
                ) : (
                  <span className="dog-field-clickable" onClick={() => startEdit('triggers', value('triggers'))} title="Click to edit">{value('triggers') || '—'}</span>
                )}
              </dd>
            </div>
            <div className="dog-details-row">
              <dt>Preferences</dt>
              <dd>—</dd>
            </div>
            <div className="dog-details-row">
              <dt>Notes</dt>
              <dd>
                {activeField === 'detailsNotes' ? (
                  <textarea
                    ref={inlineInputRef}
                    className="dog-inline-input dog-details-notes-input"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => saveField('detailsNotes', editValue)}
                    onKeyDown={(e) => { if (e.key === 'Escape') setActiveField(null); }}
                    placeholder="Add notes…"
                    rows={3}
                  />
                ) : (
                  <span className="dog-field-clickable" onClick={() => startEdit('detailsNotes', training.notes)} title="Click to edit">{training.notes || '—'}</span>
                )}
              </dd>
            </div>
          </dl>
        </section>

        <section className="dog-panel dog-panel--danger">
          <p className="dog-panel-note">Remove this dog from your profile. This can’t be undone.</p>
          <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Removing…' : 'Delete dog'}
          </button>
        </section>
      </div>
    </div>
  );
}
