import React from 'react';
import { EDUCATION_TIMELINE } from '../data/portfolioData';

export default function EducationalBackground({ onPrintCV }) {
  return (
    <section className="content-block" id="education">
      <p className="section-marker">01 / Academic Foundation</p>
      <h2 className="section-title">Educational Background</h2>
      <p className="section-desc">
        Official academic milestones, institutional progression, and verified educational credentials.
      </p>

      <div className="edu-progression-timeline">
        {EDUCATION_TIMELINE.map((edu) => (
          <article
            key={edu.id}
            className={`edu-progression-card ${edu.isCurrent ? 'current-school' : ''} reveal visible`}
          >
            <div className="edu-logo-box">
              <img
                className="edu-logo-img"
                src={edu.logo}
                alt={`${edu.school} Logo`}
                width="46"
                height="46"
              />
            </div>
            <div className="edu-card-body">
              <div className="edu-card-top">
                <h3 className="edu-school-name">{edu.school}</h3>
                <span className="edu-level-badge">{edu.badge}</span>
              </div>
              <div className="edu-program-title">{edu.program}</div>
              <div className="edu-meta-desc">{edu.meta}</div>
            </div>
          </article>
        ))}
      </div>

      <div className="doc-actions-row" style={{ marginTop: 14 }}>
        <button className="doc-btn doc-btn-primary" onClick={onPrintCV}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
          Print / Save Credentials
        </button>
        <a
          className="doc-btn doc-btn-outline"
          href="mailto:dailyaiuseacc08@gmail.com?subject=Inquiry%20-%20Denmark%20Catolico"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <path d="M22 6l-10 7L2 6" />
          </svg>
          Contact Denmark
        </a>
      </div>
    </section>
  );
}

