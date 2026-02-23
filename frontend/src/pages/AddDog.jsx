import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';

const INITIAL_FORM = { name: '', size: '', age: '', breed: '', reactivityTags: '', triggers: '' };

export default function AddDog() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setError('');
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name?.trim() || !form.size?.trim()) {
      setError('Name and size are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api.post('/dogs', form);
      navigate('/profile');
    } catch (err) {
      setError(err.message || 'Could not add dog');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="app-page">
      <div className="app-page-content app-page-content--narrow">
        <h1>Add a dog</h1>
        <p className="app-page-lead">Add your dog so other buddies know who they might meet at meetups.</p>

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
              {saving ? 'Adding…' : 'Add dog'}
            </button>
            <Link to="/profile" className="btn btn-ghost">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
