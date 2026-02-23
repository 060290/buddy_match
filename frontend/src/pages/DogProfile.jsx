import React, { useEffect, useState, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { resizeImageForAvatar } from '../utils/avatar';
import { DEFAULT_MILESTONES, NEXT_STEP_SUGGESTIONS, ALL_STEPS_STARTED } from '../data/trainingMilestones';

const STORAGE_KEY = (id) => `dog-profile-${id}`;

function getStoredGoalPath(id) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY(id));
    if (!raw) return { notes: '', milestones: DEFAULT_MILESTONES.map((m) => ({ ...m, wins: [] })) };
    const data = JSON.parse(raw);
    if (data.milestones && Array.isArray(data.milestones)) {
      return {
        notes: data.notes || '',
        milestones: data.milestones.map((stored) => {
          const def = DEFAULT_MILESTONES.find((d) => d.id === stored.id) || { id: stored.id, label: stored.label || stored.id };
          return { id: def.id, label: def.label, wins: Array.isArray(stored.wins) ? stored.wins : [] };
        }),
      };
    }
    const migrated = DEFAULT_MILESTONES.map((m) => ({ ...m, wins: [] }));
    return { notes: data.notes || '', milestones: migrated };
  } catch {
    return { notes: '', milestones: DEFAULT_MILESTONES.map((m) => ({ ...m, wins: [] })) };
  }
}

function setStoredGoalPath(id, data) {
  try {
    localStorage.setItem(STORAGE_KEY(id), JSON.stringify(data));
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
  const [training, setTraining] = useState({ notes: '', milestones: [] });
  const [logWinFor, setLogWinFor] = useState(null);
  const [logWinNote, setLogWinNote] = useState('');
  const logWinInputRef = useRef(null);
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
        setTraining(getStoredGoalPath(d.id));
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
      if (dog?.id) setStoredGoalPath(dog.id, { ...training, notes: value });
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

  const logWin = (milestoneId, note = '') => {
    const win = { at: new Date().toISOString(), note: note.trim() || undefined };
    const nextMilestones = training.milestones.map((m) =>
      m.id === milestoneId ? { ...m, wins: [...(m.wins || []), win] } : m
    );
    const next = { ...training, milestones: nextMilestones };
    setTraining(next);
    if (dog?.id) setStoredGoalPath(dog.id, next);
    setLogWinFor(null);
    setLogWinNote('');
  };

  const milestonesList = training.milestones.length ? training.milestones : DEFAULT_MILESTONES.map((m) => ({ ...m, wins: [] }));
  const nextStepIndex = milestonesList.findIndex((m) => !m.wins || m.wins.length === 0);
  const suggestion = nextStepIndex >= 0
    ? NEXT_STEP_SUGGESTIONS[nextStepIndex]
    : ALL_STEPS_STARTED;

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
          <p className="dog-training-focus-label">Working on: {value('reactivityTags') || '—'}</p>

          <div className="dog-goal-path" role="list">
            {(training.milestones.length ? training.milestones : DEFAULT_MILESTONES.map((m) => ({ ...m, wins: [] }))).map((milestone, index) => (
              <div key={milestone.id} className="dog-goal-step" role="listitem">
                <div className="dog-goal-step-paw-wrap">
                  <span className={`dog-goal-paw ${(milestone.wins && milestone.wins.length > 0) ? 'dog-goal-paw--done' : ''}`} aria-hidden>🐾</span>
                  {index < (training.milestones.length || DEFAULT_MILESTONES.length) - 1 && <span className="dog-goal-path-connector" aria-hidden />}
                </div>
                <div className="dog-goal-step-body">
                  <p className="dog-goal-step-label">{milestone.label}</p>
                  {(milestone.wins && milestone.wins.length > 0) && (
                    <p className="dog-goal-step-count">{milestone.wins.length} {milestone.wins.length === 1 ? 'win' : 'wins'} logged</p>
                  )}
                  {logWinFor === milestone.id ? (
                    <div className="dog-log-win-form">
                      <input
                        ref={logWinInputRef}
                        type="text"
                        className="dog-log-win-input"
                        placeholder="Optional note…"
                        value={logWinNote}
                        onChange={(e) => setLogWinNote(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') { e.preventDefault(); logWin(milestone.id, logWinNote); }
                          if (e.key === 'Escape') { setLogWinFor(null); setLogWinNote(''); }
                        }}
                        aria-label="Note for this win"
                      />
                      <div className="dog-log-win-actions">
                        <button type="button" className="btn btn-primary btn-sm" onClick={() => logWin(milestone.id, logWinNote)}>Log win</button>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setLogWinFor(null); setLogWinNote(''); }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button type="button" className="dog-log-win-btn" onClick={() => { setLogWinFor(milestone.id); setLogWinNote(''); setTimeout(() => logWinInputRef.current?.focus(), 50); }}>
                      + Log a win
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="dog-what-to-try-next">
            <h3 className="dog-what-to-try-next-title">What to try next</h3>
            <p className="dog-what-to-try-next-text">{suggestion}</p>
          </div>
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
