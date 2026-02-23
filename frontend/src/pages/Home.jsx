import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="landing-page">
      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-hero-inner">
          <div className="landing-hero-content">
            <h1 className="landing-hero-title">
              Find buddies, join meetups, practice at your pace
            </h1>
            <p className="landing-hero-subtitle">
              Add your dog → discover meetups → practice safely.
            </p>
            <div className="landing-hero-ctas">
              <Link to="/register" className="btn btn-primary btn-lg">
                Find a buddy
              </Link>
              <a href="#how-it-works" className="btn btn-secondary btn-lg">
                How it works
              </a>
            </div>
            <div className="landing-hero-badges">
              <span className="landing-badge"><span aria-hidden>🐕</span> Add dog profile</span>
              <span className="landing-badge"><span aria-hidden>📍</span> Discover meetups</span>
              <span className="landing-badge"><span aria-hidden>🐾</span> Practice safely</span>
            </div>
          </div>

          {/* Product preview: dog card, meetup card, checklist */}
          <div className="landing-product-preview">
            <div className="landing-preview-card landing-preview-dog">
              <div className="landing-preview-dog-avatar">🐕</div>
              <p className="landing-preview-dog-name">Luna</p>
              <p className="landing-preview-dog-meta">Medium · Golden Retriever</p>
              <span className="landing-preview-tag">Leash-reactive, dog-friendly</span>
            </div>
            <div className="landing-preview-card landing-preview-meetup">
              <span className="landing-preview-meetup-tag">Walk</span>
              <p className="landing-preview-meetup-title">Quiet park parallel walk</p>
              <p className="landing-preview-meetup-meta">Sat 10am · Riverside Park</p>
              <p className="landing-preview-meetup-host">Alex & Buddy</p>
            </div>
            <div className="landing-preview-card landing-preview-checklist">
              <p className="landing-preview-checklist-title">Training focus</p>
              <div className="landing-preview-paws">
                <span className="landing-preview-paw landing-preview-paw--done">🐾</span>
                <span className="landing-preview-paw landing-preview-paw--done">🐾</span>
                <span className="landing-preview-paw">🐾</span>
                <span className="landing-preview-paw">🐾</span>
                <span className="landing-preview-paw">🐾</span>
              </div>
              <p className="landing-preview-checklist-label">2 of 5 steps</p>
            </div>
          </div>
        </div>
      </section>

      {/* This is for you if… */}
      <section className="landing-section landing-for-you">
        <h2 className="landing-section-title">This is for you if…</h2>
        <div className="landing-for-you-grid">
          <div className="landing-for-you-card">
            <span className="landing-for-you-icon" aria-hidden>🐶</span>
            <p className="landing-for-you-text">Shy or reactive dog</p>
          </div>
          <div className="landing-for-you-card">
            <span className="landing-for-you-icon" aria-hidden>🚶</span>
            <p className="landing-for-you-text">Parallel walks, not parks</p>
          </div>
          <div className="landing-for-you-card">
            <span className="landing-for-you-icon" aria-hidden>🤝</span>
            <p className="landing-for-you-text">People who get it</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="landing-section landing-how">
        <h2 className="landing-section-title">How it works</h2>
        <div className="landing-how-steps">
          <div className="landing-how-step">
            <span className="landing-how-num">1</span>
            <h3 className="landing-how-step-title">Create your & your dog’s profile</h3>
            <p className="landing-how-step-text">Size, reactivity, and goals so others can match.</p>
          </div>
          <div className="landing-how-step">
            <span className="landing-how-num">2</span>
            <h3 className="landing-how-step-title">Find buddies & meetups</h3>
            <p className="landing-how-step-text">Browse or create. See who’s going, message to coordinate.</p>
          </div>
          <div className="landing-how-step">
            <span className="landing-how-num">3</span>
            <h3 className="landing-how-step-title">Show up with a plan</h3>
            <p className="landing-how-step-text">Show up with a plan. Tips in the app when you need them.</p>
          </div>
        </div>
      </section>

      {/* Why BuddyMatch is different */}
      <section className="landing-section landing-different">
        <h2 className="landing-section-title">Why BuddyMatch is different</h2>
        <div className="landing-different-grid">
          <div className="landing-different-card">
            <h3 className="landing-different-card-title">Intentional, not random</h3>
            <p>Size-matched, intent clear. Plan meetups that work for reactive dogs.</p>
          </div>
          <div className="landing-different-card">
            <h3 className="landing-different-card-title">Compatibility in mind</h3>
            <p>Profiles and filters so you find people and dogs that fit.</p>
          </div>
          <div className="landing-different-card">
            <h3 className="landing-different-card-title">Guidance built in</h3>
            <p>Checklists and “what to try next” when you need it.</p>
          </div>
        </div>
      </section>

      {/* Emotional reassurance */}
      <section className="landing-section landing-reassurance">
        <div className="landing-reassurance-card">
          <h2 className="landing-reassurance-title">You’re not alone</h2>
          <p className="landing-reassurance-lead">
            Dogs who need more space or a plan — that’s okay.
          </p>
          <p className="landing-reassurance-text">
            Find people who get it. Small steps, no pressure.
          </p>
          <Link to="/register" className="btn btn-primary">
            Find a buddy
          </Link>
        </div>
      </section>
    </div>
  );
}
