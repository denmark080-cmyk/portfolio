import React, { useState, useEffect, useRef } from 'react';

const PRESET_COLORS = [
  { hex: '#8b5cf6', name: 'Royal Violet' },
  { hex: '#8b3dff', name: 'Royal Purple' },
  { hex: '#3b82f6', name: 'Electric Blue' },
  { hex: '#10b981', name: 'Emerald Green' },
  { hex: '#f59e0b', name: 'Amber Gold' },
  { hex: '#ec4899', name: 'Vivid Pink' },
  { hex: '#06b6d4', name: 'Cyan Ocean' },
  { hex: '#6366f1', name: 'Indigo' }
];

export default function Navbar({
  activeSection,
  theme,
  onToggleTheme,
  accentColor,
  onApplyAccentColor,
  onResetColor,
  onPrintCV
}) {
  const [popupOpen, setPopupOpen] = useState(false);
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setPopupOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const navItems = [
    { href: '#personal-info', id: 'personal-info', label: 'Personal Info' },
    { href: '#education', id: 'education', label: 'Educational Background' },
    { href: '#experiences-skills', id: 'experiences-skills', label: 'Experiences & Skills' },
    { href: '#powerbi-activities', id: 'powerbi-activities', label: 'Sample Works (Activities)' }
  ];

  return (
    <header>
      {/* Brand on Left */}
      <a href="#personal-info" className="header-brand" aria-label="My Portfolio">
        <span className="brand-name">
          My portfolio<span className="brand-dot">.</span>
        </span>
      </a>

      {/* Centered Floating Navigation Pill with Frosted Blur */}
      <nav aria-label="Main Navigation" className="header-nav-pill">
        {navItems.map((item) => (
          <a
            key={item.id}
            href={item.href}
            className={activeSection === item.id ? 'active' : ''}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div className="header-actions">
        {/* Dynamic Color Picker Tool */}
        <div className="color-picker-container" ref={pickerRef}>
          <button
            className="color-picker-btn"
            onClick={(e) => {
              e.stopPropagation();
              setPopupOpen((prev) => !prev);
            }}
            aria-label="Color Palette Tool"
            title="Customize Accent Color"
          >
            <span
              className="color-swatch-dot"
              style={{
                background: accentColor,
                boxShadow: `0 0 8px ${accentColor}`
              }}
            />
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C22 6.5 17.5 2 12 2z" />
              <circle cx="12" cy="7" r="1.5" fill="currentColor" />
              <circle cx="7" cy="11" r="1.5" fill="currentColor" />
              <circle cx="9" cy="16" r="1.5" fill="currentColor" />
              <circle cx="15.5" cy="15.5" r="1.5" fill="currentColor" />
            </svg>
            <span className="color-picker-text">Color</span>
          </button>

          <div className={`color-popup ${popupOpen ? 'active' : ''}`}>
            <div className="color-popup-header">
              <span>Accent Color</span>
              <button className="color-reset-btn" onClick={onResetColor} title="Reset to default violet">
                Reset
              </button>
            </div>
            <div className="preset-colors-grid">
              {PRESET_COLORS.map((preset) => (
                <button
                  key={preset.hex}
                  className="color-preset-circle"
                  style={{ background: preset.hex }}
                  onClick={() => onApplyAccentColor(preset.hex)}
                  title={preset.name}
                />
              ))}
            </div>
            <div className="custom-color-row">
              <label className="custom-color-label">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => onApplyAccentColor(e.target.value)}
                />
                <span>Custom Color...</span>
              </label>
            </div>
          </div>
        </div>

        {/* Theme Switcher: Classic White vs Dark Mode */}
        <button className="theme-toggle-btn" onClick={onToggleTheme} aria-label="Toggle Theme">
          <svg className="moon-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
          <svg className="sun-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
          <span>{theme === 'dark' ? 'Classic' : 'Dark'}</span>
        </button>

        {/* Official CV Button */}
        <button className="header-btn" onClick={onPrintCV} title="Print / Download Official CV Sheet">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
          CV
        </button>
      </div>
    </header>
  );
}

