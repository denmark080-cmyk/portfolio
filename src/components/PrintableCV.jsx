import React from 'react';
import {
  PERSONAL_DETAILS,
  EDUCATION_TIMELINE,
  SKILLS_LIST,
  PBI_ACTIVITIES,
  GOOGLE_DRIVE_REPO_URL
} from '../data/portfolioData';

export default function PrintableCV({ isOpen, onClose }) {
  return (
    <div
      className={`cv-print-wrapper ${isOpen ? 'cv-modal-open' : ''}`}
      aria-hidden={!isOpen}
      onClick={(e) => {
        if (e.target.classList.contains('cv-print-wrapper')) {
          onClose && onClose();
        }
      }}
    >
      {/* Screen-only Modal Action Bar (hidden when printing) */}
      {isOpen && (
        <div className="cv-modal-toolbar no-print">
          <div className="cv-toolbar-left">
            <span className="cv-toolbar-badge">OFFICIAL CURRICULUM VITAE</span>
            <span className="cv-toolbar-title">Denmark Catolico — Formatted Portfolio CV</span>
          </div>
          <div className="cv-toolbar-actions">
            <button
              className="cv-action-print-btn"
              onClick={() => window.print()}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              Print / Save as PDF
            </button>
            <button className="cv-action-close-btn" onClick={onClose}>
              ✕ Close Preview
            </button>
          </div>
        </div>
      )}

      {/* Printable A4/Letter CV Sheet */}
      <div className="cv-print-sheet">
        {/* 1. CV HEADER */}
        <div className="cv-header">
          <div className="cv-header-left">
            <div className="cv-portrait-frame">
              <img
                src="/photo/profile1.png"
                alt="Denmark Catolico"
                className="cv-portrait-img"
              />
            </div>
            <div className="cv-title-block">
              <div className="cv-kicker">CURRICULUM VITAE &bull; PORTFOLIO RECORD</div>
              <h1 className="cv-name">DENMARK CATOLICO</h1>
              <p className="cv-degree">
                BSIT-BA &mdash; Bachelor of Science in Information Technology (Major in Business Analytics) &bull; 3rd Year
              </p>
              <p className="cv-institution">
                South East Asian Institute of Technology (SEAIT) &bull; City of Koronadal, Philippines
              </p>
              <div className="cv-motto">
                &ldquo;Time is Gold&rdquo; &bull; Focus &bull; Imaginative &bull; Creative
              </div>
            </div>
          </div>

          <div className="cv-header-right">
            <img
              src="/photo/seait_logo.png"
              alt="SEAIT Logo"
              className="cv-seait-seal"
            />
          </div>
        </div>

        {/* PROFESSIONAL PROFILE SUMMARY */}
        <div className="cv-summary-box">
          <strong>Professional Focus:</strong> Specializing in enterprise data modeling, star &amp; snowflake schema engineering, interactive business intelligence dashboards in Microsoft Power BI, and modern AI-accelerated software workflows.
        </div>

        {/* 2. PERSONAL INFORMATION */}
        <section className="cv-section">
          <h2 className="cv-section-title">01 / Personal Information</h2>
          <div className="cv-personal-grid">
            {PERSONAL_DETAILS.map((item) => (
              <div
                key={item.label}
                className={`cv-personal-cell ${item.fullWidth ? 'cv-cell-full' : ''}`}
              >
                <span className="cv-cell-label">{item.label}</span>
                <span className="cv-cell-value">{item.value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 3. EDUCATIONAL BACKGROUND */}
        <section className="cv-section">
          <h2 className="cv-section-title">02 / Educational Background</h2>
          <div className="cv-edu-list">
            {EDUCATION_TIMELINE.map((edu) => (
              <div key={edu.id} className="cv-edu-item">
                <div className="cv-edu-logo-wrap">
                  <img src={edu.logo} alt={edu.school} className="cv-edu-logo" />
                </div>
                <div className="cv-edu-content">
                  <div className="cv-edu-row-top">
                    <h3 className="cv-edu-school">{edu.school}</h3>
                    <span className="cv-edu-badge">{edu.badge}</span>
                  </div>
                  <div className="cv-edu-program">{edu.program}</div>
                  <div className="cv-edu-meta">{edu.meta}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. EXPERIENCES & SKILLS */}
        <section className="cv-section">
          <h2 className="cv-section-title">03 / Experiences &amp; Skills</h2>
          <div className="cv-skills-grid">
            {SKILLS_LIST.map((skill) => (
              <div key={skill.id} className="cv-skill-item">
                <div className="cv-skill-head">
                  <span className="cv-skill-name">{skill.title}</span>
                  <span className="cv-skill-tag">{skill.badge}</span>
                </div>
                <p className="cv-skill-desc">{skill.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. SAMPLE WORKS (POWER BI ACTIVITIES & APPLIED ANALYTICS) */}
        <section className="cv-section">
          <h2 className="cv-section-title">04 / Sample Works — Power BI Activities &amp; Applied Analytics</h2>
          <div className="cv-works-grid">
            {PBI_ACTIVITIES.map((act) => (
              <div key={act.id} className="cv-work-card">
                <div className="cv-work-top">
                  <span className="cv-work-num">{act.tabNum}</span>
                  <h3 className="cv-work-title">{act.title}</h3>
                </div>
                <p className="cv-work-lead">{act.lead}</p>
                <div className="cv-work-tech">
                  {act.tech.join(' • ')}
                </div>
              </div>
            ))}
          </div>
          <div className="cv-repo-footer">
            <strong>Power BI Project &amp; Dataset Repository:</strong>{' '}
            <span>{GOOGLE_DRIVE_REPO_URL}</span>
          </div>
        </section>

        {/* CV FOOTER */}
        <div className="cv-footer-sign">
          <span>I hereby certify that the above information is true and correct to the best of my knowledge.</span>
          <strong>Denmark Catolico &bull; BSIT-BA (SEAIT ID: 2024-0917)</strong>
        </div>
      </div>
    </div>
  );
}

