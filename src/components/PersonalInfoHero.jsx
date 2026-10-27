import React from 'react';
import { PERSONAL_DETAILS } from '../data/portfolioData';

export default function PersonalInfoHero() {
  return (
    <section className="hero-block-left" id="personal-info">
      <p className="eyebrow-ref">Hello, I'm</p>
      <h1 className="name-ref">
        Denmark
        <br />
        Catolico
      </h1>

      <div className="motto-pill">
        <span>&bull;</span> &ldquo;Time is Gold&rdquo; &bull; Focus &bull; Imaginative &bull; Creative
      </div>

      <div className="program-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
        <img
          src="/photo/seait_logo.png"
          alt="SEAIT Logo"
          style={{
            width: 26,
            height: 26,
            objectFit: 'contain',
            borderRadius: 6,
            background: '#ffffff',
            padding: 2,
            flexShrink: 0
          }}
        />
        <span>BSIT-BA &mdash; Major in Business Analytics &bull; 3rd Year (SEAIT)</span>
      </div>

      {/* Direct Identity & Personal Details (All Official Records) */}
      <div className="personal-direct-grid">
        {PERSONAL_DETAILS.map((item) => (
          <div
            key={item.label}
            className="personal-direct-item"
            style={item.fullWidth ? { gridColumn: '1 / -1' } : undefined}
          >
            <div className="label">{item.label}</div>
            <div className="value">{item.value}</div>
          </div>
        ))}
      </div>

      {/* Vertical Social / Channel Action Icons */}
      <div className="social-icons-vertical">
        <a
          className="social-icon-btn"
          href="https://linkedin.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
          title="Connect on LinkedIn"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
            <rect x="2" y="9" width="4" height="12" />
            <circle cx="4" cy="4" r="2" />
          </svg>
        </a>
        <a
          className="social-icon-btn"
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          title="Inspect Code on GitHub"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
          </svg>
        </a>
        <a
          className="social-icon-btn"
          href="mailto:dailyaiuseacc08@gmail.com"
          aria-label="Email"
          title="Send Direct Email"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <path d="M22 6l-10 7L2 6" />
          </svg>
        </a>
      </div>
    </section>
  );
}

