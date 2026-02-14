import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

const categoryOrder = ['Basics', 'Meetups', 'Training', 'Support'];

export default function Support() {
  const [byCategory, setByCategory] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/support')
      .then((r) => setByCategory(r.data))
      .catch(() => setByCategory({}))
      .finally(() => setLoading(false));
  }, []);

  const categories = categoryOrder.filter((c) => byCategory[c]?.length);

  return (
    <div className="container" style={{ paddingTop: '1.5rem' }}>
      <h1>Support & resources</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Structured guidance for reactive dog owners: safety, meetups, and when to seek professional help.
      </p>
      {loading ? (
        <p>Loading…</p>
      ) : categories.length === 0 ? (
        <div className="card">
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>No articles yet. Check back later.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {categories.map((cat) => (
            <section key={cat} className="card">
              <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>{cat}</h2>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {byCategory[cat].map((a) => (
                  <li key={a.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                    <Link to={`/support/${a.slug}`} style={{ fontWeight: 500 }}>{a.title}</Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
