import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { resizeImageForAvatar } from '../utils/avatar';

const INITIAL_FORM = { name: '', avatarUrl: '', size: '', age: '', breed: '', reactivityTags: '', triggers: '' };

function getInitials(name) {
  if (!name?.trim()) return '?';
  return name.trim().slice(0, 2).toUpperCase();
}

export default function EditDog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [dog, setDog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [showPasteLink, setShowPasteLink] = useState(false);

  useEffect(() => {
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
      })
      .catch(() => setDog(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    setError('');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name?.trim() || !form.size?.trim()) {
      setError('Name and size are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api.patch(`/dogs/${id}`, form);
      navigate('/profile');
    } catch (err) {
      setError(err.message || 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Remove ${dog.name} from your profile? This can’t be undone.`)) return;
    setDeleting(true);
    setError('');
    try {
      await api.delete(`/dogs/${id}`);
      navigate('/profile');
    } catch (err) {
      setError(err.message || 'Could not remove dog');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="app-page"><div className="app-page-content">Loading…</div></div>;
  if (!dog) return <div className="app-page"><div className="app-page-content"><p className="error-msg">Dog not found.</p><Link to="/profile">Back to profile</Link></div></div>;

  return (
    <div className="app-page">
      <div className="app-page-content app-page-content--narrow">
        <h1>Edit {dog.name}</h1>
        <p className="app-page-lead">Update your dog’s profile so buddies know who they might meet.</p>

        <div className="dog-edit-avatar-card card">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*,application/pdf"
            className="dog-photo-input"
            aria-label="Upload dog photo"
            onChange={onFileInputChange}
          />
          <div
            className={`dog-edit-avatar-zone ${dragOver ? 'dog-edit-avatar-zone--drag' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}
            aria-label="Upload dog photo: click or drag and drop"
          >
            <div className="dog-edit-avatar-wrap">
              {form.avatarUrl ? (
                <img src={form.avatarUrl} alt="" className="dog-edit-avatar-img" onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling?.classList.add('dog-edit-avatar-initials--show'); }} />
              ) : null}
              <span className={`dog-edit-avatar-initials ${form.avatarUrl ? '' : 'dog-edit-avatar-initials--show'}`} aria-hidden>
                {getInitials(form.name)}
              </span>
            </div>
            <span className="dog-edit-avatar-zone-label">
              {form.avatarUrl ? 'Change photo' : 'Click or drag photo (image or PDF)'}
            </span>
          </div>
          {uploadError && <p className="error-msg" style={{ marginTop: '0.5rem' }}>{uploadError}</p>}
          <button type="button" className="link-button dog-paste-link-btn" onClick={() => setShowPasteLink(!showPasteLink)}>
            {showPasteLink ? 'Hide link' : 'Or paste image URL'}
          </button>
          {showPasteLink && (
            <div className="form-group dog-paste-link-field">
              <label>Image URL</label>
              <input type="url" name="avatarUrl" value={form.avatarUrl} onChange={handleChange} placeholder="https://…" />
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="card">
          <div className="form-group">
            <label>Name *</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Luna" />
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
            <label>Age</label>
            <input type="text" name="age" value={form.age} onChange={handleChange} placeholder="e.g. 2 years" />
          </div>
          <div className="form-group">
            <label>Breed</label>
            <input type="text" name="breed" value={form.breed} onChange={handleChange} placeholder="e.g. Golden Retriever" />
          </div>
          <div className="form-group">
            <label>Reactivity / notes</label>
            <input type="text" name="reactivityTags" value={form.reactivityTags} onChange={handleChange} placeholder="e.g. Dog-friendly, leash-reactive" />
          </div>
          <div className="form-group">
            <label>Triggers</label>
            <input type="text" name="triggers" value={form.triggers} onChange={handleChange} placeholder="e.g. Bikes, loud noises" />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            <Link to="/profile" className="btn btn-ghost">Cancel</Link>
          </div>
        </form>

        <div className="card" style={{ marginTop: '1.5rem', borderColor: 'var(--danger-muted, #e57373)' }}>
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', color: 'var(--text-muted)' }}>Remove this dog from your profile.</p>
          <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Removing…' : 'Delete dog'}
          </button>
        </div>
      </div>
    </div>
  );
}
