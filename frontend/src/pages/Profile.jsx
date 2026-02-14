import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export default function Profile() {
  const { user, refreshMe } = useAuth();
  const [profile, setProfile] = useState(null);
  const [dogs, setDogs] = useState([]);
  const [form, setForm] = useState({ name: '', city: '', lat: '', lng: '', experience: '', availability: '' });
  const [saving, setSaving] = useState(false);
  const [pledging, setPledging] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/users/me')
      .then((r) => {
        setProfile(r.data);
        setDogs(r.data.dogs || []);
        setForm({
          name: r.data.name || '',
          city: r.data.city || '',
          lat: r.data.lat ?? '',
          lng: r.data.lng ?? '',
          experience: r.data.experience || '',
          availability: r.data.availability || '',
        });
      })
      .catch(() => setProfile(null));
  }, [user?.id]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await api.patch('/users/me', form);
      await refreshMe();
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
    try {
      await api.post('/users/me/safety-pledge');
      await refreshMe();
      setMessage('Thanks for taking the Safety Pledge!');
    } catch (err) {
      setMessage(err.message || 'Could not save pledge');
    } finally {
      setPledging(false);
    }
  };

  if (!profile) return <div className="container" style={{ padding: '2rem' }}>Loading profile…</div>;

  return (
    <div className="container" style={{ paddingTop: '1.5rem', maxWidth: 600 }}>
      <h1>Profile</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Manage your account and location so buddies can find you.</p>

      {profile.safetyPledgedAt ? (
        <p className="badge" style={{ marginBottom: '1rem' }}>✓ Safety pledge taken</p>
      ) : (
        <div className="card" style={{ marginBottom: '1.5rem', background: 'var(--accent-soft)' }}>
          <strong>Take the Safety Pledge</strong>
          <p style={{ margin: '0.5rem 0', fontSize: '0.95rem' }}>Commit to safe, force-free meetups and show others you’re on the same page.</p>
          <button type="button" className="btn btn-primary" onClick={takePledge} disabled={pledging}>{pledging ? 'Saving…' : 'Take the pledge'}</button>
        </div>
      )}

      <form onSubmit={saveProfile} className="card" style={{ marginBottom: '1.5rem' }}>
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
        {message && <p className="error-msg">{message}</p>}
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save profile'}</button>
      </form>

      <section className="card">
        <h2 style={{ marginTop: 0 }}>Your dogs</h2>
        {dogs.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No dogs added yet. Add your dog so others know who they might meet.</p>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {dogs.map((d) => (
              <li key={d.id} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
                <strong>{d.name}</strong> · {d.size}{d.age && ` · ${d.age}`}{d.reactivityTags && ` · ${d.reactivityTags}`}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
