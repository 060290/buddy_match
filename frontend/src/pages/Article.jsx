import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';

export default function Article() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/support/${slug}`)
      .then((r) => {
        setArticle(r.data);
        if (r.data?.category) {
          return api.get('/support/resources').then((res) => {
            const byCat = res.data && typeof res.data === 'object' ? res.data : {};
            setResources(byCat[r.data.category] || []);
          });
        }
      })
      .catch(() => setArticle(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="container" style={{ padding: '2rem' }}>Loading…</div>;
  if (!article) return <div className="container" style={{ padding: '2rem' }}>Article not found. <Link to="/support">Back to Support</Link></div>;

  return (
    <div className="container" style={{ maxWidth: 680, paddingTop: '1.5rem' }}>
      <Link to="/support" style={{ display: 'inline-block', marginBottom: '1rem' }}>← Support & resources</Link>
      <article className="card">
        <span className="badge" style={{ marginBottom: '0.75rem' }}>{article.category}</span>
        <h1 style={{ marginTop: 0 }}>{article.title}</h1>
        <div style={{ whiteSpace: 'pre-wrap' }}>{article.body}</div>
        {resources.length > 0 && (
          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Further reading & videos</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Visit these credible sources to learn more about this topic.</p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {resources.map((r) => (
                <li key={r.id}>
                  <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 500 }}>
                    {r.title}
                    {r.type === 'video' && <span style={{ marginLeft: '0.35rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>(video)</span>}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </article>
    </div>
  );
}
