import React from 'react';
import { SKILLS_LIST } from '../data/portfolioData';

export default function ExperiencesSkills() {
  return (
    <section className="content-block" style={{ marginTop: 10 }}>
      <p className="section-marker">02 / Core Competencies</p>
      <h2 className="section-title">Experiences &amp; Skills</h2>
      <p className="section-desc">
        Core technical capabilities, modern development paradigms, and organizational leadership driving end-to-end analytics and team success.
      </p>

      <div className="skills-showcase-grid">
        {SKILLS_LIST.map((skill) => (
          <div
            key={skill.id}
            className={`skill-modern-card ${skill.highlight ? 'highlight-card' : ''}`}
          >
            <div className="skill-card-top">
              <span className="skill-icon-pill">{skill.code}</span>
              <span className="skill-category-badge">{skill.badge}</span>
            </div>
            <h3 className="skill-card-title">{skill.title}</h3>
            <p className="skill-card-desc">{skill.description}</p>
          </div>
        ))}
      </div>

      {/* Sample Works Callout Banner */}
      <div className="sample-works-cta-box">
        <div className="sample-works-cta-text">
          <h4>Sample Works &amp; Power BI Activities</h4>
          <p>Six interactive dashboards &amp; star schema models embedded directly below.</p>
        </div>
        <a className="sample-works-btn" href="#powerbi-activities">
          <span>Explore Activities &darr;</span>
        </a>
      </div>
    </section>
  );
}

