import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { getTipBySlug } from '../data/tipsData';

export default function TipDetail() {
  const { slug } = useParams();
  const tip = slug ? getTipBySlug(slug) : null;

  if (!tip) {
    return (
      <div className="app-page app-page--tip-detail">
        <div className="tip-detail-content">
          <Link to="/tips" className="tip-detail-back">← Back to tips</Link>
          <p>Tip not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-page app-page--tip-detail">
      <div className="tip-detail-content">
        <Link to="/tips" className="tip-detail-back">← Back to tips</Link>

        <article className="tip-detail-article">
          <header className="tip-detail-header">
            <h1 className="tip-detail-title">{tip.title}</h1>
            {tip.shortDescription && (
              <p className="tip-detail-lead">{tip.shortDescription}</p>
            )}
          </header>

          <div className="tip-detail-blocks">
            <section className="tip-detail-block">
              <h2 className="tip-detail-block-title">What it looks like</h2>
              <p className="tip-detail-block-body">{tip.whatItLooksLike}</p>
            </section>

            <section className="tip-detail-block">
              <h2 className="tip-detail-block-title">Why it happens</h2>
              <p className="tip-detail-block-body">{tip.whyItHappens}</p>
            </section>

            {tip.steps && tip.steps.length > 0 && (
              <section className="tip-detail-block">
                <h2 className="tip-detail-block-title">Steps</h2>
                <ol className="tip-detail-list tip-detail-list--steps">
                  {tip.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </section>
            )}

            {tip.whatNotToDo && tip.whatNotToDo.length > 0 && (
              <section className="tip-detail-block tip-detail-block--avoid">
                <h2 className="tip-detail-block-title">What not to do</h2>
                <ul className="tip-detail-list tip-detail-list--avoid">
                  {tip.whatNotToDo.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </section>
            )}

            <section className="tip-detail-block tip-detail-block--improvement">
              <h2 className="tip-detail-block-title">Signs of improvement</h2>
              <p className="tip-detail-block-body">{tip.signsOfImprovement}</p>
            </section>
          </div>
        </article>
      </div>
    </div>
  );
}
