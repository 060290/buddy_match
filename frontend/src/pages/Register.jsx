import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
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
      // Defer navigation so Layout can commit the logged-in structure first (avoids React removeChild error)
      setTimeout(() => navigate('/dashboard'), 0);
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
          <label>Name *</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} required autoComplete="name" />
        </div>
        <div className="form-group">
          <label>Email *</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} required autoComplete="email" />
        </div>
        <div className="form-group">
          <label>Password *</label>
          <input type="password" name="password" value={form.password} onChange={handleChange} required autoComplete="new-password" minLength={6} />
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
