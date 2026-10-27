import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import PersonalInfoHero from './components/PersonalInfoHero';
import CenterPortrait from './components/CenterPortrait';
import RightHeroExpertise from './components/RightHeroExpertise';
import EducationalBackground from './components/EducationalBackground';
import ExperiencesSkills from './components/ExperiencesSkills';
import PowerBIActivitiesSection from './components/PowerBIActivitiesSection';
import Footer from './components/Footer';
import PrintableCV from './components/PrintableCV';

// React Activity Components (converted from HTML files)
import SchemaExplorer from './activities/SchemaExplorer';
import Lab7Dashboard from './activities/Lab7Dashboard';
import EducationEmployment from './activities/EducationEmployment';
import MarketingDashboard from './activities/MarketingDashboard';
import ElectionDashboard from './activities/ElectionDashboard';
import TbDengueSurveillance from './activities/TbDengueSurveillance';

const ACTIVITY_COMPONENTS = {
  'schema-explorer': SchemaExplorer,
  'lab7-modeling': Lab7Dashboard,
  'education-employment': EducationEmployment,
  marketing: MarketingDashboard,
  election: ElectionDashboard,
  'tb-dengue': TbDengueSurveillance
};

function hexToRgb(hex) {
  let c = hex.replace('#', '').trim();
  if (c.length === 3) {
    c = c
      .split('')
      .map((x) => x + x)
      .join('');
  }
  if (c.length !== 6) return null;
  return {
    r: parseInt(c.substring(0, 2), 16),
    g: parseInt(c.substring(2, 4), 16),
    b: parseInt(c.substring(4, 6), 16)
  };
}

function getLuminance(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return 128;
  return 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;
}

export default function App() {
  // Check URL for standalone or iframe-embedded activity view
  const [routeState, setRouteState] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const activitySlug =
      params.get('activity') ||
      (window.location.pathname.startsWith('/activities/')
        ? window.location.pathname.replace('/activities/', '').replace(/\/$/, '')
        : null);
    const embedded = params.get('embed') === 'true' || window.self !== window.top;
    return { activitySlug, embedded };
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('denmark-portfolio-theme') || 'light';
  });

  const [accentColor, setAccentColor] = useState(() => {
    const saved = localStorage.getItem('denmark-accent-color');
    return saved && saved !== '#ef4444' ? saved : '#8b5cf6';
  });

  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('personal-info');
  const [cvModalOpen, setCvModalOpen] = useState(false);

  // Apply theme attribute to <html>
  const applyTheme = useCallback((nextTheme) => {
    setTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('denmark-portfolio-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('denmark-portfolio-theme', 'light');
    }
  }, []);

  // Apply dynamic accent color CSS variables
  const applyAccentColor = useCallback(
    (hex, checkContrast = true) => {
      const rgb = hexToRgb(hex);
      if (!rgb) return;

      const hoverR = Math.max(0, Math.floor(rgb.r * 0.82));
      const hoverG = Math.max(0, Math.floor(rgb.g * 0.82));
      const hoverB = Math.max(0, Math.floor(rgb.b * 0.82));
      const hoverHex =
        '#' + [hoverR, hoverG, hoverB].map((x) => x.toString(16).padStart(2, '0')).join('');

      document.documentElement.style.setProperty('--accent', hex);
      document.documentElement.style.setProperty('--purple', hex);
      document.documentElement.style.setProperty('--accent-hover', hoverHex);
      document.documentElement.style.setProperty('--accent-glow', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.38)`);
      document.documentElement.style.setProperty('--accent-tint', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.14)`);
      document.documentElement.style.setProperty('--accent-border', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.38)`);

      const haloGlow = `radial-gradient(circle at 50% 50%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8) 0%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.32) 42%, transparent 74%)`;
      document.documentElement.style.setProperty('--circle-glow', haloGlow);

      if (checkContrast) {
        const lum = getLuminance(hex);
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        if (currentTheme === 'light' && lum > 175) {
          applyTheme('dark');
        } else if (currentTheme === 'dark' && lum < 70) {
          applyTheme('light');
        }
      }

      setAccentColor(hex);
      localStorage.setItem('denmark-accent-color', hex);
    },
    [applyTheme]
  );

  useEffect(() => {
    if (!routeState.activitySlug) {
      applyTheme(theme);
      applyAccentColor(accentColor, false);
    }
  }, [routeState.activitySlug]);

  useEffect(() => {
    if (routeState.activitySlug) return;

    const handleScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = h > 0 ? (window.scrollY / h) * 100 : 0;
      setScrollProgress(scrolled);

      const sections = document.querySelectorAll("section[id], div[id='experiences-skills']");
      let current = 'personal-info';
      sections.forEach((sec) => {
        const top = sec.offsetTop - 140;
        if (window.scrollY >= top) {
          current = sec.getAttribute('id');
        }
      });
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [routeState.activitySlug]);

  const handleToggleTheme = () => {
    applyTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleResetColor = () => {
    applyAccentColor('#8b5cf6', false);
  };

  const handlePrintCV = () => {
    setCvModalOpen(true);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const handleOpenActivityFull = (slug) => {
    const nextUrl = `/?activity=${slug}`;
    window.history.pushState({}, '', nextUrl);
    setRouteState({ activitySlug: slug, embedded: false });
    window.scrollTo(0, 0);
  };

  const handleBackToPortfolio = () => {
    window.history.pushState({}, '', '/#powerbi-activities');
    setRouteState({ activitySlug: null, embedded: false });
  };

  useEffect(() => {
    const onPopState = () => {
      const params = new URLSearchParams(window.location.search);
      const activitySlug = params.get('activity');
      const embedded = params.get('embed') === 'true' || window.self !== window.top;
      setRouteState({ activitySlug, embedded });
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Render standalone or iframe-embedded React Activity Component when ?activity=<slug> is active
  if (routeState.activitySlug && ACTIVITY_COMPONENTS[routeState.activitySlug]) {
    const ActivityComponent = ACTIVITY_COMPONENTS[routeState.activitySlug];
    return (
      <ActivityComponent
        embedded={routeState.embedded}
        onBackToPortfolio={handleBackToPortfolio}
      />
    );
  }

  return (
    <>
      <div className="screen-portfolio-shell">
        <div id="progressBar" style={{ width: `${scrollProgress}%` }} />
        <div className="ambient-glow-tl" />
        <div className="ambient-glow-br" />

        <Navbar
          activeSection={activeSection}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          accentColor={accentColor}
          onApplyAccentColor={applyAccentColor}
          onResetColor={handleResetColor}
          onPrintCV={handlePrintCV}
        />

        <main>
          <div className="stage-grid">
            {/* LEFT STREAM COLUMN */}
            <div className="stream-column left-stream">
              <PersonalInfoHero />
              <EducationalBackground onPrintCV={handlePrintCV} />
            </div>

            {/* CENTER STICKY PROFILE COLUMN */}
            <CenterPortrait />

            {/* RIGHT STREAM COLUMN: EXPERIENCES & SKILLS */}
            <div className="stream-column right-stream" id="experiences-skills">
              <RightHeroExpertise onPrintCV={handlePrintCV} />
              <ExperiencesSkills />
            </div>
          </div>

          {/* POWER BI ACTIVITIES & APPLIED ANALYTICS (100% EMBEDDED IN PORTFOLIO) */}
          <PowerBIActivitiesSection onOpenActivityFull={handleOpenActivityFull} />
        </main>

        <Footer />
      </div>

      {/* FORMATTED CURRICULUM VITAE (PRINT & PREVIEW SHEET) */}
      <PrintableCV isOpen={cvModalOpen} onClose={() => setCvModalOpen(false)} />
    </>
  );
}

