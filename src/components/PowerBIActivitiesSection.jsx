import React, { useState, useRef } from 'react';
import { PBI_ACTIVITIES, GOOGLE_DRIVE_REPO_URL } from '../data/portfolioData';

export default function PowerBIActivitiesSection({ onOpenActivityFull }) {
  const [activeStudioIndex, setActiveStudioIndex] = useState(0);
  const [studioExpanded, setStudioExpanded] = useState(false);
  const [studioReloadKey, setStudioReloadKey] = useState(0);
  const [activeCategory, setActiveCategory] = useState('all');
  const [detailsOpenState, setDetailsOpenState] = useState({});
  const workbenchRef = useRef(null);

  const activeStudioActivity = PBI_ACTIVITIES[activeStudioIndex] || PBI_ACTIVITIES[0];

  const handleLoadInStudio = (index) => {
    setActiveStudioIndex(index);
    if (workbenchRef.current) {
      workbenchRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleToggleAllDetails = (open) => {
    const nextState = {};
    PBI_ACTIVITIES.forEach((act) => {
      nextState[act.id] = open;
    });
    setDetailsOpenState(nextState);
  };

  const filteredActivities = PBI_ACTIVITIES.filter(
    (act) => activeCategory === 'all' || act.category === activeCategory
  );

  return (
    <section className="fullwidth-activities-section" id="powerbi-activities">
      <p className="section-marker">03 / Applied Portfolio &amp; Projects</p>
      <h2 className="section-title">Sample Works: Power BI Activities &amp; Applied Analytics</h2>
      <p className="section-desc">
        Six rigorous laboratory activities and executive dashboards executed in Microsoft Power BI &mdash; embedded directly into this portfolio so you can interact with every model, filter real-time metrics, inspect dimensional schemas, and download raw project files without leaving the page.
      </p>

      {/* UNIFIED INTERACTIVE POWER BI WORKBENCH STUDIO (EMBEDDED IN PORTFOLIO) */}
      <div className="pbi-studio-workbench" ref={workbenchRef}>
        <div className="pbi-workbench-header">
          <div className="workbench-title-area">
            <span className="workbench-status-pill">
              <span className="status-pulse-dot" />
              LIVE INTERACTIVE STUDIO
            </span>
            <h3 className="workbench-title">Power BI Unified Analytics Workbench</h3>
          </div>
          <div className="workbench-hint">
            Select any activity tab below to interact live with the dashboard directly inside the portfolio:
          </div>

          {/* Activity Switcher Tabs */}
          <div className="pbi-tab-nav" role="tablist">
            {PBI_ACTIVITIES.map((act, idx) => (
              <button
                key={act.id}
                className={`pbi-tab-btn ${activeStudioIndex === idx ? 'active' : ''}`}
                onClick={() => setActiveStudioIndex(idx)}
              >
                <span className="tab-num">{act.tabNum}</span>
                <span>{act.tabLabel}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Live Embedded Viewport Frame */}
        <div className={`pbi-frame-container ${studioExpanded ? 'expanded' : ''}`} id="pbiStudioFrameContainer">
          <div className="frame-bar">
            <div className="frame-indicators">
              <span className="dot red" />
              <span className="dot yellow" />
              <span className="dot green" />
            </div>
            <span className="frame-url-display">
              {activeStudioActivity.slug} &bull; {activeStudioActivity.studioTitle}
            </span>
            <div className="frame-controls">
              <button
                className="frame-action-btn"
                onClick={() => setStudioReloadKey((prev) => prev + 1)}
                title="Reset / Reload Dashboard"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M23 4v6h-6" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
                <span>Reset</span>
              </button>
              <button
                className="frame-action-btn"
                onClick={() => setStudioExpanded((prev) => !prev)}
                title="Toggle Height Expansion"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                </svg>
                <span>{studioExpanded ? 'Compact View' : 'Expand View'}</span>
              </button>
              {onOpenActivityFull && (
                <button
                  className="frame-action-btn"
                  onClick={() => onOpenActivityFull(activeStudioActivity.slug)}
                  title="Open Activity in Full Screen React View"
                >
                  <span>Full Screen &nearr;</span>
                </button>
              )}
            </div>
          </div>
          <iframe
            key={`${activeStudioActivity.slug}-${studioReloadKey}`}
            id="pbiStudioIframe"
            src={`/?activity=${activeStudioActivity.slug}&embed=true`}
            title="Power BI Unified Activity Studio"
            loading="lazy"
          />
        </div>
      </div>

      {/* Category Filters */}
      <div className="filter-bar" id="pbiFilters" style={{ marginBottom: 24 }}>
        {[
          { key: 'all', label: 'All Activities (6)' },
          { key: 'modeling', label: 'Data Warehouse & Modeling (2)' },
          { key: 'enterprise', label: 'Socio-Economic & Marketing (2)' },
          { key: 'public', label: 'Public Health & Civic (2)' }
        ].map((btn) => (
          <button
            key={btn.key}
            className={`filter-btn ${activeCategory === btn.key ? 'active' : ''}`}
            onClick={() => setActiveCategory(btn.key)}
          >
            {btn.label}
          </button>
        ))}
      </div>

      <div className="stream-ctrls">
        <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>
          6 Live Embedded Dashboards &bull; PBIX &amp; Dataset Repositories
        </span>
        <div>
          <button className="text-ctrl-btn" onClick={() => handleToggleAllDetails(true)}>
            Expand Details
          </button>
          <button className="text-ctrl-btn" onClick={() => handleToggleAllDetails(false)}>
            Collapse Details
          </button>
        </div>
      </div>

      <div className="pbi-fullwidth-grid" id="powerbi-cards-stream">
        {filteredActivities.map((act) => (
          <article
            key={act.id}
            className="featured-project-card reveal visible"
            id={act.id}
            data-category={act.category}
          >
            <div className="card-meta-bar">
              <span className="card-category-kicker">{act.kicker}</span>
              <span className="card-status-pill">
                <span className={act.statusDotClass} />
                {act.statusLabel}
              </span>
            </div>

            <h3 className="project-card-title">{act.title}</h3>
            <p className="project-card-lead">{act.lead}</p>
            <p className="project-card-desc">{act.description}</p>

            {/* Embedded Live Activity Frame */}
            <div className="card-inline-embed">
              <div className="card-embed-header">
                <span>&bull; {act.embedTitle}</span>
                <button className="frame-action-btn" onClick={() => handleLoadInStudio(act.index)}>
                  Open in Master Studio &uarr;
                </button>
              </div>
              <iframe
                src={`/?activity=${act.slug}&embed=true`}
                title={act.title}
                loading="lazy"
              />
            </div>

            <div className="project-specs-grid" style={{ marginTop: 16 }}>
              {act.specs.map((spec) => (
                <div key={spec.tag} className="spec-box">
                  <span className="spec-tag">{spec.tag}</span>
                  <span className="spec-value">{spec.value}</span>
                </div>
              ))}
            </div>

            <div className="project-tech-row">
              {act.tech.map((t) => (
                <span key={t} className="tech-pill">
                  {t}
                </span>
              ))}
            </div>

            <div className="project-action-bar">
              <button
                className="card-action-btn"
                onClick={() => handleLoadInStudio(act.index)}
                style={{ cursor: 'pointer', border: 'none' }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
                <span>Interactive Studio View</span>
              </button>
              <a
                className="card-action-btn"
                href={GOOGLE_DRIVE_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: 'rgba(139,92,246,0.15)',
                  border: '1px solid rgba(139,92,246,0.35)',
                  color: '#c4b5fd'
                }}
              >
                <span>Download .PBIX &amp; Dataset</span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </a>
            </div>

            <details
              className="detail-toggle"
              open={!!detailsOpenState[act.id]}
              onToggle={(e) => {
                const isOpen = e.currentTarget.open;
                setDetailsOpenState((prev) => ({ ...prev, [act.id]: isOpen }));
              }}
            >
              <summary>
                <span>{act.detailSummary}</span>
                <svg className="chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </summary>
              <div className="detail-content">{act.detailContent}</div>
            </details>
          </article>
        ))}

        {/* CENTRAL GOOGLE DRIVE DOWNLOAD REPOSITORY CARD */}
        <article
          className="featured-project-card reveal visible"
          id="pbi-drive-repository"
          style={{
            border: '2px solid rgba(168, 85, 247, 0.45)',
            background: 'linear-gradient(135deg, rgba(21, 17, 36, 0.95), rgba(30, 24, 51, 0.95))',
            boxShadow: '0 18px 45px rgba(124, 58, 237, 0.25)'
          }}
        >
          <div className="card-meta-bar">
            <span className="card-category-kicker" style={{ color: '#c084fc' }}>
              Central Artifact Repository &bull; Cloud Storage
            </span>
            <span
              className="card-status-pill"
              style={{
                background: 'rgba(168, 85, 247, 0.25)',
                color: '#e9d5ff',
                border: '1px solid rgba(168, 85, 247, 0.5)'
              }}
            >
              <span className="status-dot-live" />
              Google Drive &bull; Publicly Downloadable
            </span>
          </div>

          <h3 className="project-card-title" style={{ color: '#ffffff' }}>
            Power BI Raw Projects &amp; Datasets Drive
          </h3>
          <p className="project-card-lead" style={{ color: '#e2e8f0' }}>
            Direct cloud download access for all raw Power BI (.pbix) activity files, relational data schemas, and source spreadsheets.
          </p>
          <p className="project-card-desc">
            All 6 completed laboratory activities and applied business intelligence dashboards have their original compiled Power BI Desktop workbook files (<code>.pbix</code>), star/snowflake data model diagrams, transformation queries, and raw datasets (Excel, CSV) stored and organized in a shared Google Drive repository.
          </p>

          <div className="project-specs-grid">
            <div className="spec-box">
              <span className="spec-tag">Downloadable Formats</span>
              <span className="spec-value">.PBIX &bull; .XLSX &bull; .CSV &bull; SQL Schemas</span>
            </div>
            <div className="spec-box">
              <span className="spec-tag">Activities Included</span>
              <span className="spec-value">All 6 Completed Labs &amp; Dashboards</span>
            </div>
            <div className="spec-box">
              <span className="spec-tag">Cloud Provider</span>
              <span className="spec-value">Google Drive (Shared Public Folder)</span>
            </div>
            <div className="spec-box">
              <span className="spec-tag">Access Level</span>
              <span className="spec-value">Direct Download &bull; Read-Only Mirror</span>
            </div>
          </div>

          <div className="project-tech-row">
            {['Google Drive', '.PBIX Project Files', 'ETL Datasets', 'Star & Snowflake Models', 'DAX Libraries'].map(
              (pill) => (
                <span
                  key={pill}
                  className="tech-pill"
                  style={{
                    background: 'rgba(168,85,247,0.2)',
                    borderColor: 'rgba(168,85,247,0.4)',
                    color: '#e9d5ff'
                  }}
                >
                  {pill}
                </span>
              )
            )}
          </div>

          <div className="project-action-bar" style={{ marginTop: 18 }}>
            <a
              className="card-action-btn"
              href={GOOGLE_DRIVE_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
                color: '#ffffff',
                padding: '12px 24px',
                fontSize: 13,
                fontWeight: 700,
                border: 'none',
                boxShadow: '0 6px 20px rgba(124, 58, 237, 0.45)'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Open Google Drive Repository &bull; Download All Files</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          </div>
        </article>
      </div>
    </section>
  );
}

