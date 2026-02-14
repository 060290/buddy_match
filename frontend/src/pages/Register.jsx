import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ email: '', password: '', name: '', city: '', experience: '', availability: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 400, margin: '2rem auto', padding: '0 1rem' }}>
      <h1>Sign up</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Join the BuddyMatch community.</p>
      <form onSubmit={handleSubmit} className="card">
        <div className="form-group">
          <label>Email *</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} required autoComplete="email" />
        </div>
        <div className="form-group">
          <label>Password *</label>
          <input type="password" name="password" value={form.password} onChange={handleChange} required autoComplete="new-password" minLength={6} />
        </div>
        <div className="form-group">
          <label>Name</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} autoComplete="name" />
        </div>
        <div className="form-group">
          <label>City / area</label>
          <input type="text" name="city" value={form.city} onChange={handleChange} placeholder="e.g. Portland" />
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
        {error && <p className="error-msg">{error}</p>}
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p style={{ marginTop: '1rem', textAlign: 'center' }}>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}
