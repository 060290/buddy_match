import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

const categoryOrder = ['Basics', 'Dog behavior', 'Meetups', 'Training', 'Support'];

function groupByCategory(articles) {
  if (!Array.isArray(articles)) return articles || {};
  return articles.reduce((acc, a) => {
    const cat = a.category || 'Support';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(a);
    return acc;
  }, {});
}

export default function Support() {
  const [byCategory, setByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setError(null);
    api.get('/support')
      .then((r) => {
        const data = r.data;
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          setByCategory(data);
        } else if (Array.isArray(data)) {
          setByCategory(groupByCategory(data));
        } else {
          setByCategory({});
        }
      })
      .catch((err) => {
        setError(err.message || 'Could not load articles');
        setByCategory({});
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = categoryOrder.filter((c) => byCategory[c]?.length);

  return (
    <div className="container" style={{ paddingTop: '1.5rem' }}>
      <h1>Support & resources</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Credible guidance on dog behavior, safety, meetups, and when to seek professional help.
      </p>
      {loading ? (
        <p>Loading…</p>
      ) : error ? (
        <div className="card" style={{ borderColor: 'var(--warm)' }}>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>{error}. Make sure the backend is running at <code>http://localhost:3001</code> and the database is seeded (<code>node prisma/seed.js</code> in the backend folder).</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="card">
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>No articles yet. Run <code>node prisma/seed.js</code> in the backend folder to add support articles.</p>
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
