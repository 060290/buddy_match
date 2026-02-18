import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DogDoodleMain, DogDoodlePeek, DogDoodleBuddies } from '../components/DogDoodles';

export default function Home() {
  const { user } = useAuth();

  return (
    <section className="hero-section">
      <div className="hero-wrap">
        <div className="hero-content">
          <h1 className="hero-title">
            Connect with local dog owners for playdates & training
          </h1>
          <p className="hero-subtitle">
            Meet up with nearby reactive-dog owners for safe, friendly, and size-matched meetups. Make new friends for you and calm buddies for your pup.
          </p>
          {user ? (
            <div className="hero-ctas">
              <Link to="/meetups" className="btn btn-primary">Find a buddy</Link>
              <Link to="/meetups/new" className="btn btn-secondary">Create a meetup</Link>
              <Link to="/nearby" className="btn btn-ghost">Nearby</Link>
            </div>
          ) : (
            <div className="hero-ctas">
              <Link to="/register" className="btn btn-primary">Join now</Link>
              <Link to="/login" className="btn btn-secondary">Log in</Link>
              <Link to="/support" className="btn btn-ghost">How it works</Link>
            </div>
          )}
          <div className="hero-badges">
            <span className="hero-badge purple"><span aria-hidden>🐾</span> Safety first</span>
            <span className="hero-badge pink"><span aria-hidden>🐕</span> Size-matched</span>
            <span className="hero-badge yellow"><span aria-hidden>❤️</span> Trusted community</span>
          </div>
        </div>

        <div className="hero-doodle-card" aria-hidden>
          <div className="hero-doodle-card-inner">
            <div className="hero-doodle-main-wrap">
              <DogDoodleMain className="hero-doodle-main" />
            </div>
            <p className="hero-doodle-label">Training buddy nearby</p>
            <p className="hero-doodle-meta">Size-matched · Safe meetups</p>
            <Link to={user ? '/meetups' : '/register'} className="btn btn-secondary hero-doodle-cta">Find a buddy</Link>
            <div className="hero-doodle-peek">
              <DogDoodlePeek />
            </div>
          </div>
        </div>
      </div>

      <div className="card why-card">
        <div className="why-card-doodle" aria-hidden>
          <DogDoodleBuddies className="why-buddies-doodle" />
        </div>
        <h2>Why BuddyMatch?</h2>
        <ul>
          <li>Find people nearby who get it</li>
          <li>Plan safe meetups (e.g. parallel walks)</li>
          <li>Message and coordinate in one place</li>
          <li>Tips and support when you need them</li>
        </ul>
        <div className="why-card-peek" aria-hidden>
          <DogDoodlePeek />
        </div>
      </div>
    </section>
  );
}
