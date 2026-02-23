import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { TIP_SECTIONS, getTipsForSection } from '../data/tipsData';

const STORAGE_KEY = (id) => `dog-profile-${id}`;

function getStoredTraining(id) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY(id));
    if (!raw) return { progress: 50, notes: '' };
    const data = JSON.parse(raw);
    if (data.milestones && Array.isArray(data.milestones)) {
      const total = data.milestones.length;
      const withWins = data.milestones.filter((m) => m.wins && m.wins.length > 0).length;
      const progress = total ? Math.round((withWins / total) * 100) : 50;
      return { progress, notes: data.notes || '' };
    }
    return { progress: Math.min(100, Math.max(0, Number(data.progress) || 50)), notes: data.notes || '' };
  } catch {
    return { progress: 50, notes: '' };
  }
}

const SECTION_ORDER = ['workingOn', 'readYourDog', 'situation', 'quickAction', 'progressAware'];

const SUPPORT_CATEGORY_ORDER = ['Basics', 'Dog behavior', 'Meetups', 'Training', 'Support'];

function groupSupportByCategory(articles) {
  if (!Array.isArray(articles)) return {};
  return articles.reduce((acc, a) => {
    const cat = a.category || 'Support';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(a);
    return acc;
  }, {});
}

export default function Tips() {
  const { user } = useAuth();
  const [dogs, setDogs] = useState([]);
  const [selectedDogId, setSelectedDogId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [supportByCategory, setSupportByCategory] = useState({});
  const [supportLoading, setSupportLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    api.get('/users/me')
      .then((r) => {
        const list = r.data?.dogs || [];
        setDogs(list);
        if (list.length > 0 && !selectedDogId) setSelectedDogId(list[0].id);
      })
      .catch(() => setDogs([]))
      .finally(() => setLoading(false));
  }, [user?.id]);

  useEffect(() => {
    api.get('/support')
      .then((r) => {
        const data = r.data;
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          setSupportByCategory(data);
        } else if (Array.isArray(data)) {
          setSupportByCategory(groupSupportByCategory(data));
        } else {
          setSupportByCategory({});
        }
      })
      .catch(() => setSupportByCategory({}))
      .finally(() => setSupportLoading(false));
  }, []);

  const selectedDog = dogs.find((d) => d.id === selectedDogId);
  const trainingProgress = selectedDogId ? getStoredTraining(selectedDogId).progress : 50;
  const showProgressAwareEarly = trainingProgress < 40;
  const showProgressAwareMild = trainingProgress >= 40 && trainingProgress < 70;

  return (
    <div className="app-page app-page--tips">
      <div className="tips-content">
        <header className="tips-header">
          <h1 className="tips-title">Tips for your dog</h1>
          <p className="tips-subtitle">Personalized, force-free guidance for reactivity and meetups.</p>

          {loading ? (
            <p className="tips-loading">Loading…</p>
          ) : dogs.length === 0 ? (
            <div className="tips-no-dogs card tips-card">
              <p>Add a dog to get personalized tips.</p>
              <Link to="/dogs" className="btn btn-primary">Go to Dogs</Link>
            </div>
          ) : (
            <div className="tips-dog-selector">
              <span className="tips-dog-selector-label">Showing tips for</span>
              <div className="tips-dog-selector-buttons">
                {dogs.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    className={`tips-dog-chip ${selectedDogId === d.id ? 'tips-dog-chip--active' : ''}`}
                    onClick={() => setSelectedDogId(d.id)}
                  >
                    {d.avatarUrl ? (
                      <img src={d.avatarUrl} alt="" className="tips-dog-chip-avatar" />
                    ) : (
                      <span className="tips-dog-chip-initials">{d.name ? d.name.trim().slice(0, 2).toUpperCase() : '?'}</span>
                    )}
                    <span>{d.name}</span>
                  </button>
                ))}
              </div>
              {selectedDog && (
                <Link to={`/dogs/${selectedDog.id}`} className="tips-dog-profile-link">View {selectedDog.name}'s profile →</Link>
              )}
            </div>
          )}
        </header>

        {selectedDogId && (
          <div className="tips-sections">
            {SECTION_ORDER.map((sectionKey) => {
              if (sectionKey === 'progressAware' && !showProgressAwareEarly && !showProgressAwareMild) return null;
              const tips = getTipsForSection(sectionKey);
              if (sectionKey === 'progressAware') {
                const filtered = showProgressAwareEarly
                  ? tips.filter((t) => t.slug === 'focus-on-basics')
                  : tips.filter((t) => t.slug === 'add-mild-distraction');
                if (filtered.length === 0) return null;
                return (
                  <section key={sectionKey} className="tips-section">
                    <h2 className="tips-section-title">{TIP_SECTIONS[sectionKey]}</h2>
                    <p className="tips-section-hint">Based on {selectedDog?.name}'s training progress.</p>
                    <div className="tips-card-grid">
                      {filtered.map((tip) => (
                        <Link key={tip.slug} to={`/tips/${tip.slug}`} className="tips-card tips-card--link">
                          <h3 className="tips-card-title">{tip.title}</h3>
                          <p className="tips-card-desc">{tip.shortDescription}</p>
                          <span className="tips-card-cta">Read tip →</span>
                        </Link>
                      ))}
                    </div>
                  </section>
                );
              }
              if (tips.length === 0) return null;
              return (
                <section key={sectionKey} className="tips-section">
                  <h2 className="tips-section-title">{TIP_SECTIONS[sectionKey]}</h2>
                  <div className="tips-card-grid">
                    {tips.map((tip) => (
                      <Link key={tip.slug} to={`/tips/${tip.slug}`} className="tips-card tips-card--link">
                        <h3 className="tips-card-title">{tip.title}</h3>
                        <p className="tips-card-desc">{tip.shortDescription}</p>
                        <span className="tips-card-cta">Read tip →</span>
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        <section className="tips-section tips-section--safety">
          <h2 className="tips-section-title">Safety & boundaries</h2>
          <p className="tips-section-hint">Credible guidance on dog behavior, safety, meetups, and when to seek professional help.</p>
          {supportLoading ? (
            <p className="tips-loading">Loading…</p>
          ) : (() => {
            const categories = SUPPORT_CATEGORY_ORDER.filter((c) => supportByCategory[c]?.length);
            if (categories.length === 0) return <p className="tips-section-empty">No articles yet.</p>;
            return (
              <div className="tips-safety-grid">
                {categories.map((cat) => (
                  <div key={cat} className="tips-safety-category">
                    <h3 className="tips-safety-category-title">{cat}</h3>
                    <ul className="tips-safety-list">
                      {supportByCategory[cat].map((a) => (
                        <li key={a.id}>
                          <Link to={`/support/${a.slug}`} className="tips-safety-link">{a.title}</Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            );
          })()}
        </section>
      </div>
    </div>
  );
}
