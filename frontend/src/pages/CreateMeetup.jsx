import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function CreateMeetup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    body: '',
    location: '',
    lat: '',
    lng: '',
    meetupAt: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setForm((f) => ({ ...f, lat: pos.coords.latitude, lng: pos.coords.longitude })),
      () => setError('Could not get location')
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) {
      setError('Title and description are required');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/posts', {
        ...form,
        lat: form.lat ? Number(form.lat) : undefined,
        lng: form.lng ? Number(form.lng) : undefined,
        meetupAt: form.meetupAt || undefined,
      });
      navigate(`/meetups/${data.id}`);
    } catch (err) {
      setError(err.message || 'Could not create meetup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 560, margin: '2rem auto', padding: '0 1rem' }}>
      <h1>Create a meetup</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        Suggest a time and place for a safe, structured get-together with other reactive-dog owners.
      </p>
      <form onSubmit={handleSubmit} className="card">
        <div className="form-group">
          <label>Title *</label>
          <input type="text" name="title" value={form.title} onChange={handleChange} required placeholder="e.g. Weekend parallel walk at Riverside Park" />
        </div>
        <div className="form-group">
          <label>Description *</label>
          <textarea name="body" value={form.body} onChange={handleChange} required placeholder="Describe the plan, what to bring, and any rules (distance, one dog per person, etc.)." />
        </div>
        <div className="form-group">
          <label>Location (address or place name)</label>
          <input type="text" name="location" value={form.location} onChange={handleChange} placeholder="e.g. Riverside Park, north entrance" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <button type="button" className="btn btn-secondary" onClick={useMyLocation}>Use my location</button>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Stores lat/lng for map</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label>Latitude</label>
            <input type="number" step="any" name="lat" value={form.lat} onChange={handleChange} placeholder="e.g. 45.52" />
          </div>
          <div className="form-group">
            <label>Longitude</label>
            <input type="number" step="any" name="lng" value={form.lng} onChange={handleChange} placeholder="e.g. -122.68" />
          </div>
        </div>
        <div className="form-group">
          <label>Date & time</label>
          <input type="datetime-local" name="meetupAt" value={form.meetupAt} onChange={handleChange} />
        </div>
        {error && <p className="error-msg">{error}</p>}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating…' : 'Create meetup'}</button>
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/meetups')}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
