import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';

export default function Article() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/support/${slug}`)
      .then((r) => setArticle(r.data))
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
      </article>
    </div>
  );
}
