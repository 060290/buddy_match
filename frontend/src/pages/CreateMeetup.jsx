import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { searchPlaces } from '../utils/geocode';

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
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [locationFocused, setLocationFocused] = useState(false);
  const [geocodeLoading, setGeocodeLoading] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // Location autocomplete: debounced search, show suggestions
  useEffect(() => {
    const raw = (form.location || '').trim();
    if (raw.length < 2) {
      setLocationSuggestions([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      setGeocodeLoading(true);
      searchPlaces(raw)
        .then((list) => setLocationSuggestions(list))
        .catch(() => setLocationSuggestions([]))
        .finally(() => setGeocodeLoading(false));
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [form.location]);

  const pickPlace = (place) => {
    setForm((f) => ({
      ...f,
      location: place.display_name,
      lat: place.lat,
      lng: place.lon,
    }));
    setLocationSuggestions([]);
    setLocationFocused(false);
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported');
      return;
    }
    setError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => setForm((f) => ({
        ...f,
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        location: f.location || 'Current location',
      })),
      () => setError('Could not get your location')
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
        <div className="form-group" ref={wrapperRef} style={{ position: 'relative' }}>
          <label>Location</label>
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            onFocus={() => setLocationFocused(true)}
            onBlur={() => setTimeout(() => setLocationFocused(false), 200)}
            placeholder="Search for a place or address (e.g. Riverside Park, Portland)"
            autoComplete="off"
          />
          {geocodeLoading && (
            <span className="location-search-hint" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>Searching…</span>
          )}
          {locationFocused && locationSuggestions.length > 0 && (
            <ul className="location-suggestions" aria-label="Location suggestions">
              {locationSuggestions.map((place, i) => (
                <li key={i}>
                  <button type="button" className="location-suggestion-btn" onClick={() => pickPlace(place)}>
                    {place.display_name}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="form-hint" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: 0 }}>
            Type to search for a place; pick a suggestion to set the map pin. Or use the button below for your current location.
          </p>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <button type="button" className="btn btn-secondary" onClick={useMyLocation}>
            Use my current location
          </button>
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
