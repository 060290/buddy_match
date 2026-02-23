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
              Safe, structured meetups for shy & reactive dogs
            </h1>
            <p className="landing-hero-subtitle">
              Size-matched, training-friendly meetups so you and your dog can practice with people who get it — parallel walks, calm greetings, no pressure.
            </p>
            <div className="landing-hero-ctas">
              <Link to="/register" className="btn btn-primary btn-lg">
                Find a buddy
              </Link>
              <Link to="#how-it-works" className="btn btn-secondary btn-lg">
                How it works
              </Link>
            </div>
            <div className="landing-hero-badges">
              <span className="landing-badge"><span aria-hidden>🐾</span> Safety first</span>
              <span className="landing-badge"><span aria-hidden>🐕</span> Size-matched</span>
              <span className="landing-badge"><span aria-hidden>❤️</span> Training support</span>
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
            <p className="landing-for-you-text">Your dog is shy, reactive, or needs slow intros — and you want meetups that respect that.</p>
          </div>
          <div className="landing-for-you-card">
            <span className="landing-for-you-icon" aria-hidden>🚶</span>
            <p className="landing-for-you-text">You’re into parallel walks, structured setups, and force-free training — not chaotic dog parks.</p>
          </div>
          <div className="landing-for-you-card">
            <span className="landing-for-you-icon" aria-hidden>🤝</span>
            <p className="landing-for-you-text">You want to find local owners who get it and coordinate meetups in one place.</p>
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
            <p className="landing-how-step-text">Add your dog’s size, reactivity notes, and what you’re working on. So others can match with you.</p>
          </div>
          <div className="landing-how-step">
            <span className="landing-how-num">2</span>
            <h3 className="landing-how-step-title">Find buddies & meetups</h3>
            <p className="landing-how-step-text">Browse or create meetups — parallel walks, low-key hangouts. See who’s going and message to coordinate.</p>
          </div>
          <div className="landing-how-step">
            <span className="landing-how-num">3</span>
            <h3 className="landing-how-step-title">Meet up safely</h3>
            <p className="landing-how-step-text">Show up with a plan: distance first, calm greetings, and tips right in the app when you need them.</p>
          </div>
        </div>
      </section>

      {/* Why BuddyMatch is different */}
      <section className="landing-section landing-different">
        <h2 className="landing-section-title">Why BuddyMatch is different</h2>
        <div className="landing-different-grid">
          <div className="landing-different-card">
            <h3 className="landing-different-card-title">Structured, not random</h3>
            <p>Meetups are designed for reactive dogs: size-matched, intent clear, and easy to plan (parallel walks, quiet spots).</p>
          </div>
          <div className="landing-different-card">
            <h3 className="landing-different-card-title">Compatibility in mind</h3>
            <p>Profiles and filters help you find people and dogs that fit — same goals, similar needs, less guesswork.</p>
          </div>
          <div className="landing-different-card">
            <h3 className="landing-different-card-title">Training support built in</h3>
            <p>Tips, checklists, and “what to try next” so you’re not on your own. Encouraging, force-free guidance when you need it.</p>
          </div>
        </div>
      </section>

      {/* Emotional reassurance */}
      <section className="landing-section landing-reassurance">
        <div className="landing-reassurance-card">
          <h2 className="landing-reassurance-title">You’re not alone</h2>
          <p className="landing-reassurance-lead">
            Lots of us have dogs who need a little more space, slower intros, or a plan before saying hello. That’s okay.
          </p>
          <p className="landing-reassurance-text">
            BuddyMatch is here so you can find people who get it — and meet up in ways that feel safe and doable for your dog. Small steps, no pressure, and a community that’s on your side.
          </p>
          <Link to="/register" className="btn btn-primary">
            Find a buddy
          </Link>
        </div>
      </section>
    </div>
  );
}
