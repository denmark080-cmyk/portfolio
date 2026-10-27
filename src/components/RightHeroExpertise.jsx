import React from 'react';

export default function RightHeroExpertise({ onPrintCV }) {
  return (
    <section className="hero-block-right">
      <p className="role-eyebrow-ref">Business Intelligence &bull; Analytics &bull; Software</p>
      <h2 className="role-ref">
        <span className="purple-gradient-text">Power BI</span>
        <span className="white-text">&amp; Technical Expertise</span>
      </h2>
      <p className="hero-subtitle">
        Specializing in enterprise data modeling, star &amp; snowflake schema engineering, interactive business intelligence dashboards, and modern AI-accelerated workflows.
      </p>

      {/* Flagship Quick Jump Box */}
      <div className="flagship-quick-links">
        <a
          className="quick-link-item"
          href="#powerbi-activities"
          style={{
            background: 'rgba(168,85,247,0.15)',
            borderColor: 'rgba(168,85,247,0.4)'
          }}
        >
          <span
            className="quick-link-badge"
            style={{ background: 'rgba(168,85,247,0.4)', color: '#ffffff' }}
          >
            SAMPLE WORKS
          </span>
          <span>
            <strong>Power BI Applied Labs (1&ndash;6)</strong> &mdash; Interactive Workbench &bull; Models
          </span>
        </a>
      </div>

      <button className="resume-corner-btn" onClick={onPrintCV}>
        <span>Print Credentials</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M7 17l10-10M17 17V7H7" />
        </svg>
      </button>
    </section>
  );
}

