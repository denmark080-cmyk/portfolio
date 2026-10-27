import React, { useState, useMemo } from 'react';
import { GOOGLE_DRIVE_REPO_URL } from '../data/portfolioData';

const REG = [
  ['NCR', 13.48],
  ['CAR', 1.8],
  ['Region I', 5.3],
  ['Region II', 3.64],
  ['Region III', 12.42],
  ['Region IV-A', 16.2],
  ['MIMAROPA', 3.23],
  ['Region V', 6.08],
  ['Region VI', 7.95],
  ['Region VII', 8.08],
  ['Region VIII', 4.55],
  ['Region IX', 3.88],
  ['Region X', 5.06],
  ['Region XI', 5.24],
  ['Region XII', 4.9],
  ['Caraga', 2.8],
  ['BARMM', 4.4]
];
const POP = Object.fromEntries(REG.map((r) => [r[0], r[1] * 1e6]));
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const AGES = ['0–14', '15–24', '25–59', '60+'];
const ACOL = ['#8b5cf6', '#f59e0b', '#10b981', '#c084fc'];
const DIS = ['TB', 'Dengue'];
const DCOL = { TB: '#8b5cf6', Dengue: '#f59e0b' };
const YEARS = [2022, 2023, 2024, 2025];

function rng(s) {
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Generate deterministic seeded dataset once
const ROWS = (() => {
  const rnd = rng(20260);
  const rows = [];
  const rf = {};
  const cfr = {};
  REG.forEach(([r]) => {
    rf[r] = { TB: 0.6 + rnd() * 0.9, Dengue: 0.5 + rnd() * 1.2 };
    cfr[r] = { TB: 0.026 + rnd() * 0.017, Dengue: 0.003 + rnd() * 0.005 };
  });
  const yF = { 2022: 1.3, 2023: 0.7, 2024: 1.4, 2025: 0.95 };
  const W = { TB: [0.1, 0.15, 0.6, 0.15], Dengue: [0.3, 0.3, 0.32, 0.08] };

  REG.forEach(([r, p]) =>
    YEARS.forEach((y) => {
      for (let m = 1; m <= 12; m++) {
        DIS.forEach((d) => {
          let base;
          if (d === 'TB') {
            base = p * 10 * 4.2 * rf[r].TB * (1 - 0.04 * (y - 2022)) * (1 + 0.08 * Math.sin((m / 12) * 6.283));
          } else {
            base =
              p *
              10 *
              0.9 *
              rf[r].Dengue *
              (Math.exp(-Math.pow(m - 8.2, 2) / (2 * 1.6 * 1.6)) * 3 + 0.25) *
              yF[y];
          }
          const a = W[d].map((w) => Math.round(base * w * (0.9 + 0.2 * rnd())));
          const c = a.reduce((s, v) => s + v, 0);
          rows.push({
            r,
            y,
            m,
            d,
            c,
            dt: Math.round(c * cfr[r][d] * (0.8 + 0.4 * rnd())),
            a
          });
        });
      }
    })
  );
  return rows;
})();

const fmt = (n) =>
  n >= 1e6 ? (n / 1e6).toFixed(2) + 'M' : n >= 1e4 ? (n / 1e3).toFixed(1) + 'K' : Math.round(n).toLocaleString('en-US');
const num = (n) => Math.round(n).toLocaleString('en-US');
const qOf = (m) => Math.ceil(m / 3);
const sum = (a, k) => a.reduce((s, x) => s + x[k], 0);

function niceMax(v) {
  if (v <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const f = v / p;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : f <= 6 ? 6 : f <= 8 ? 8 : 10) * p;
}

function smooth(p) {
  if (p.length < 2) return '';
  let d = `M${p[0][0]},${p[0][1]}`;
  for (let i = 0; i < p.length - 1; i++) {
    const a = p[i - 1] || p[i];
    const b = p[i];
    const c = p[i + 1];
    const e = p[i + 2] || c;
    const t = 0.17;
    d += `C${b[0] + (c[0] - a[0]) * t},${b[1] + (c[1] - a[1]) * t} ${c[0] - (e[0] - b[0]) * t},${c[1] - (e[1] - b[1]) * t} ${c[0]},${c[1]}`;
  }
  return d;
}

export default function TbDengueSurveillance({ embedded = false, onBackToPortfolio }) {
  const [selectedDis, setSelectedDis] = useState(['TB', 'Dengue']);
  const [selectedQ, setSelectedQ] = useState([]);
  const [selectedReg, setSelectedReg] = useState([]);
  const [y0, setY0] = useState(2022);
  const [y1, setY1] = useState(2025);

  const toggleDisease = (d) => {
    if (selectedDis.includes(d)) {
      if (selectedDis.length > 1) {
        setSelectedDis(selectedDis.filter((item) => item !== d));
      }
    } else {
      setSelectedDis([...selectedDis, d]);
    }
  };

  const toggleQuarter = (q) => {
    setSelectedQ((prev) => (prev.includes(q) ? prev.filter((item) => item !== q) : [...prev, q]));
  };

  const toggleRegion = (r) => {
    setSelectedReg((prev) => (prev.includes(r) ? prev.filter((item) => item !== r) : [...prev, r]));
  };

  const resetAll = () => {
    setSelectedDis(['TB', 'Dengue']);
    setSelectedQ([]);
    setSelectedReg([]);
    setY0(2022);
    setY1(2025);
  };

  const pass = (x, anyYear = false) => {
    if (!selectedDis.includes(x.d)) return false;
    if (selectedReg.length && !selectedReg.includes(x.r)) return false;
    if (selectedQ.length && !selectedQ.includes(qOf(x.m))) return false;
    if (!anyYear && (x.y < y0 || x.y > y1)) return false;
    return true;
  };

  const filteredData = useMemo(() => ROWS.filter((x) => pass(x, false)), [selectedDis, selectedQ, selectedReg, y0, y1]);

  const activeDiseases = DIS.filter((d) => selectedDis.includes(d));

  // KPIs
  const kpiStats = useMemo(() => {
    const c = sum(filteredData, 'c');
    const dt = sum(filteredData, 'dt');
    const cfr = c ? ((dt / c) * 100).toFixed(2) + '%' : '–';
    const cur = sum(
      ROWS.filter((x) => x.y === y1 && pass(x, true)),
      'c'
    );
    const prev = y1 > 2022 ? sum(ROWS.filter((x) => x.y === y1 - 1 && pass(x, true)), 'c') : 0;
    let yoy = '–';
    let yoySub = 'Needs a prior year';
    if (y1 > 2022 && prev) {
      const g = ((cur - prev) / prev) * 100;
      yoy = (g >= 0 ? '+' : '') + g.toFixed(1) + '%';
      yoySub = `${y1} vs ${y1 - 1} cases`;
    }
    return { c, dt, cfr, yoy, yoySub };
  }, [filteredData, y0, y1, selectedDis, selectedQ, selectedReg]);

  // Monthly SVG Data
  const monthSvg = useMemo(() => {
    const W = 640,
      H = 270,
      L = 46,
      R = 14,
      T = 14,
      B = 28,
      iw = W - L - R,
      ih = H - T - B;
    const ser = activeDiseases.map((k) => ({
      k,
      v: MON.map((_, i) => sum(filteredData.filter((x) => x.d === k && x.m === i + 1), 'c'))
    }));
    const mx = niceMax(Math.max(1, ...ser.flatMap((s) => s.v)));
    const x = (i) => L + (iw * i) / 11;
    const y = (v) => T + ih * (1 - v / mx);
    return { W, H, L, R, T, B, iw, ih, ser, mx, x, y };
  }, [filteredData, activeDiseases]);

  // Annual SVG Data
  const yearSvg = useMemo(() => {
    const ys = YEARS.filter((yr) => yr >= y0 && yr <= y1);
    const W = 380,
      H = 270,
      L = 40,
      R = 8,
      T = 14,
      B = 28,
      iw = W - L - R,
      ih = H - T - B;
    const val = ys.map((yr) =>
      activeDiseases.map((k) => sum(ROWS.filter((x) => x.y === yr && x.d === k && pass(x, true)), 'c'))
    );
    const mx = niceMax(Math.max(1, ...val.flat()));
    const y = (v) => T + ih * (1 - v / mx);
    const gw = iw / ys.length;
    const bw = Math.min(26, gw / (activeDiseases.length + 1));
    return { ys, W, H, L, R, T, B, iw, ih, val, mx, y, gw, bw };
  }, [y0, y1, activeDiseases, selectedQ, selectedReg]);

  // Heatmap Data
  const heatData = useMemo(() => {
    const regs = REG.map((r) => r[0]).filter((r) => !selectedReg.length || selectedReg.includes(r));
    const g = {};
    regs.forEach((r) => (g[r] = [0, 0, 0, 0]));
    filteredData.forEach((x) => {
      if (g[x.r]) g[x.r][qOf(x.m) - 1] += x.c;
    });
    const mx = Math.max(1, ...regs.flatMap((r) => g[r]));
    const tq = [0, 1, 2, 3].map((i) => regs.reduce((a, r) => a + g[r][i], 0));
    return { regs, g, mx, tq };
  }, [filteredData, selectedReg]);

  // Incidence Data
  const incidenceData = useMemo(() => {
    const regs = REG.map((r) => r[0]).filter((r) => !selectedReg.length || selectedReg.includes(r));
    const v = regs
      .map((r) => [r, (sum(filteredData.filter((x) => x.r === r), 'c') / POP[r]) * 1e5])
      .sort((a, b) => b[1] - a[1]);
    const mx = Math.max(1, ...v.map((a) => a[1]));
    return { v, mx };
  }, [filteredData, selectedReg]);

  // Age Mix Data
  const ageMixData = useMemo(() => {
    return activeDiseases.map((k) => {
      const t = [0, 1, 2, 3].map((i) => filteredData.filter((x) => x.d === k).reduce((s, x) => s + x.a[i], 0));
      const T = t.reduce((a, b) => a + b, 0) || 1;
      return { k, t, T };
    });
  }, [filteredData, activeDiseases]);

  // Scatter Data
  const scatterSvg = useMemo(() => {
    const W = 640,
      H = 300,
      L = 50,
      R = 16,
      T = 14,
      B = 38,
      iw = W - L - R,
      ih = H - T - B;
    const regs = REG.map((r) => r[0]).filter((r) => !selectedReg.length || selectedReg.includes(r));
    const p = regs.map((r) => {
      const z = filteredData.filter((x) => x.r === r);
      const c = sum(z, 'c');
      return { r, c, f: c ? (sum(z, 'dt') / c) * 100 : 0 };
    });
    const xm = niceMax(Math.max(1, ...p.map((a) => a.c)));
    const fm = Math.max(...p.map((a) => a.f), 0.5);
    const ym = Math.ceil(fm * 1.15 * 2) / 2 || 1;
    const x = (v) => L + (iw * v) / xm;
    const y = (v) => T + ih * (1 - v / ym);
    return { W, H, L, R, T, B, iw, ih, p, xm, ym, x, y };
  }, [filteredData, selectedReg]);

  return (
    <div className="tbd-root">
      <style>{`
        .tbd-root {
          --bg1: #07060c; --bg2: #0f0d19; --card: #151124; --card-border: rgba(168,115,255,0.22);
          --ink: #f3f0fb; --muted: #9e95b8; --line: rgba(168,115,255,0.16);
          --tb: #8b5cf6; --dg: #f59e0b; --teal: #10b981; --coral: #ef4444; --violet: #c084fc;
          --shadow: 0 14px 34px rgba(0,0,0,0.5); --chip: #1d1833; --chipOn: #8b5cf6; --chipOnInk: #ffffff;
          background: linear-gradient(160deg, var(--bg1), var(--bg2));
          color: var(--ink);
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
          font-size: 13px;
          padding: 20px 18px 28px;
          min-height: 100vh;
          box-sizing: border-box;
        }
        .tbd-root * { box-sizing: border-box; }
        .tbd-wrap { max-width: 1360px; margin: 0 auto; display: flex; flex-direction: column; gap: 16px; }
        .tbd-card { background: var(--card); border: 1px solid var(--card-border); border-radius: 20px; box-shadow: var(--shadow); padding: 18px 20px; min-width: 0; }
        .tbd-topbar { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; padding: 12px 22px; border-radius: 999px; }
        .tbd-brand { display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 16px; letter-spacing: -.01em; }
        .tbd-logo { width: 34px; height: 34px; border-radius: 12px; background: linear-gradient(135deg, var(--tb), var(--dg)); display: grid; place-items: center; }
        .tbd-logo svg { width: 18px; height: 18px; }
        .tbd-sp { flex: 1; }
        .tbd-pill { background: var(--chip); border-radius: 999px; padding: 8px 14px; color: var(--muted); font-weight: 600; font-size: 12px; }
        .tbd-pill b { color: var(--ink); }
        .tbd-sample { background: rgba(245, 158, 11, 0.16); color: var(--ink); border-radius: 14px; padding: 10px 14px; font-size: 12px; line-height: 1.5; }
        .tbd-layout { display: grid; grid-template-columns: 260px minmax(0,1fr); gap: 16px; align-items: start; }
        .tbd-side { display: flex; flex-direction: column; gap: 18px; position: sticky; top: 12px; }
        .tbd-lbl { font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); margin-bottom: 8px; }
        .tbd-chips { display: flex; flex-wrap: wrap; gap: 6px; }
        .tbd-chip { border: 0; font: inherit; font-weight: 600; background: var(--chip); color: var(--ink); border-radius: 999px; padding: 7px 13px; cursor: pointer; }
        .tbd-chip.active { background: var(--chipOn); color: var(--chipOnInk); }
        .tbd-yrs { display: flex; gap: 8px; align-items: center; color: var(--muted); }
        .tbd-select { font: inherit; font-weight: 600; background: var(--chip); color: var(--ink); border: 0; border-radius: 12px; padding: 8px 10px; flex: 1; }
        .tbd-regs { max-height: 300px; overflow: auto; display: flex; flex-direction: column; gap: 2px; margin: 0 -6px; padding: 0 6px; }
        .tbd-reg { display: flex; align-items: center; gap: 9px; padding: 5px 6px; border-radius: 8px; cursor: pointer; font-weight: 500; }
        .tbd-reg:hover { background: var(--chip); }
        .tbd-reg input { accent-color: var(--tb); margin: 0; }
        .tbd-reset { border: 0; font: inherit; font-weight: 700; background: transparent; color: var(--tb); cursor: pointer; padding: 0; text-align: left; }
        .tbd-main { display: grid; grid-template-columns: repeat(12, minmax(0,1fr)); gap: 16px; }
        .tbd-s3 { grid-column: span 3; } .tbd-s4 { grid-column: span 4; } .tbd-s5 { grid-column: span 5; }
        .tbd-s7 { grid-column: span 7; } .tbd-s8 { grid-column: span 8; }
        .tbd-kpi { border-radius: 18px; padding: 16px 18px; color: #fff; display: flex; flex-direction: column; gap: 2px; box-shadow: var(--shadow); }
        .tbd-kpi .v { font-size: 28px; font-weight: 800; letter-spacing: -.02em; font-variant-numeric: tabular-nums; }
        .tbd-kpi .n { font-weight: 600; opacity: .95; }
        .tbd-kpi .s { font-size: 11.5px; opacity: .85; }
        .tbd-k1 { background: linear-gradient(135deg,#27b59c,#4fd6b8); }
        .tbd-k2 { background: linear-gradient(135deg,#ee5f66,#f79a6c); }
        .tbd-k3 { background: linear-gradient(135deg,#3d7fe0,#55b7ee); }
        .tbd-k4 { background: linear-gradient(135deg,#f08a3c,#f6b55a); }
        .tbd-hd { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; margin-bottom: 10px; flex-wrap: wrap; }
        .tbd-hd h2 { font-size: 15px; font-weight: 700; margin: 0; }
        .tbd-hd p { color: var(--muted); font-size: 11.5px; margin: 2px 0 0; }
        .tbd-legend { display: flex; gap: 14px; color: var(--muted); font-weight: 600; font-size: 12px; flex-wrap: wrap; }
        .tbd-legend i { display: inline-block; width: 9px; height: 9px; border-radius: 50%; margin-right: 6px; }
        .tbd-root svg { display: block; width: 100%; height: auto; overflow: visible; }
        .tbd-root svg text { font-family: inherit; fill: var(--muted); font-size: 10.5px; }
        .tbd-grid line { stroke: var(--line); stroke-width: 1; }
        .tbd-table { font-size: 12.5px; border-collapse: separate; border-spacing: 3px; width: 100%; font-variant-numeric: tabular-nums; }
        .tbd-table th { font-size: 11px; color: var(--muted); font-weight: 700; text-align: right; padding: 4px 6px; }
        .tbd-table th:first-child, .tbd-table td:first-child { text-align: left; }
        .tbd-table td { padding: 5px 8px; text-align: right; border-radius: 8px; font-weight: 600; }
        .tbd-table td:first-child { padding-left: 0; }
        .tbd-table td.tot, .tbd-table th.tot { font-weight: 800; }
        .tbd-bars { display: flex; flex-direction: column; gap: 7px; }
        .tbd-br { display: grid; grid-template-columns: 92px 1fr 52px; align-items: center; gap: 10px; font-weight: 600; }
        .tbd-br .t { height: 9px; border-radius: 9px; background: var(--chip); overflow: hidden; }
        .tbd-br .t i { display: block; height: 100%; border-radius: 9px; background: linear-gradient(90deg, var(--tb), var(--violet)); }
        .tbd-br .x { text-align: right; font-variant-numeric: tabular-nums; }
        .tbd-age { display: flex; flex-direction: column; gap: 18px; }
        .tbd-age .row b { display: flex; justify-content: space-between; margin-bottom: 6px; }
        .tbd-age .stack { display: flex; height: 22px; border-radius: 12px; overflow: hidden; gap: 2px; }
        .tbd-age .stack i { display: block; height: 100%; }
        .tbd-foot { color: var(--muted); font-size: 11.5px; line-height: 1.6; padding: 0 6px; margin: 0; }
        @media (max-width: 1100px) { .tbd-layout { grid-template-columns: 1fr; } .tbd-side { position: static; flex-direction: row; flex-wrap: wrap; } .tbd-side > div { flex: 1 1 220px; } .tbd-regs { max-height: 180px; } }
        @media (max-width: 900px) { .tbd-s3, .tbd-s4, .tbd-s5, .tbd-s7, .tbd-s8 { grid-column: span 12; } .tbd-topbar { border-radius: 24px; } }
      `}</style>

      <div className="tbd-wrap">
        <header className="tbd-card tbd-topbar">
          {!embedded && (
            <a
              href="/#powerbi-activities"
              onClick={(e) => {
                if (onBackToPortfolio) {
                  e.preventDefault();
                  onBackToPortfolio();
                }
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 14px',
                borderRadius: 999,
                background: 'rgba(139,92,246,0.18)',
                border: '1px solid rgba(139,92,246,0.4)',
                color: '#c4b5fd',
                fontSize: 12,
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              ← Portfolio
            </a>
          )}
          <div className="tbd-brand">
            <span className="tbd-logo">
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12h4l3-7 4 14 3-7h4" />
              </svg>
            </span>
            TB & Dengue Surveillance
          </div>
          <span className="tbd-sp" />
          <span className="tbd-pill">
            Period <b>{y0 === y1 ? y0 : `${y0} – ${y1}`}</b>
            {selectedQ.length > 0 && (
              <>
                {' '}
                · <b>{[...selectedQ].sort().map((q) => `Q${q}`).join(' ')}</b>
              </>
            )}
          </span>
          <span className="tbd-pill">
            <b>17</b> regions
          </span>
          <a
            href={GOOGLE_DRIVE_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              padding: '7px 15px',
              borderRadius: 999,
              background: 'linear-gradient(135deg,#7c3aed,#9333ea)',
              color: '#ffffff',
              fontSize: 12,
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(124,58,237,0.35)'
            }}
          >
            Drive Files
          </a>
        </header>

        <div className="tbd-sample">
          <b>Sample data.</b> The attached file only contained the calendar table (1,461 days, 2022–2025), so the case counts, deaths and populations here are generated placeholders.
        </div>

        <div className="tbd-layout">
          <aside className="tbd-card tbd-side" aria-label="Filters">
            <div>
              <div className="tbd-lbl">Disease</div>
              <div className="tbd-chips">
                {DIS.map((d) => (
                  <button
                    key={d}
                    className={`tbd-chip ${selectedDis.includes(d) ? 'active' : ''}`}
                    onClick={() => toggleDisease(d)}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="tbd-lbl">Quarter</div>
              <div className="tbd-chips">
                {[1, 2, 3, 4].map((q) => (
                  <button
                    key={q}
                    className={`tbd-chip ${selectedQ.includes(q) ? 'active' : ''}`}
                    onClick={() => toggleQuarter(q)}
                  >
                    Q{q}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="tbd-lbl">Year</div>
              <div className="tbd-yrs">
                <select
                  className="tbd-select"
                  value={y0}
                  onChange={(e) => {
                    const val = +e.target.value;
                    setY0(val);
                    if (val > y1) setY1(val);
                  }}
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                to
                <select
                  className="tbd-select"
                  value={y1}
                  onChange={(e) => {
                    const val = +e.target.value;
                    setY1(val);
                    if (val < y0) setY0(val);
                  }}
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <div className="tbd-lbl">Region</div>
              <div className="tbd-regs">
                {REG.map(([r]) => (
                  <label key={r} className="tbd-reg">
                    <input type="checkbox" checked={selectedReg.includes(r)} onChange={() => toggleRegion(r)} />
                    {r}
                  </label>
                ))}
              </div>
            </div>
            <button className="tbd-reset" onClick={resetAll}>
              Reset all filters
            </button>
          </aside>

          <main className="tbd-main">
            <div className="tbd-kpi tbd-k1 tbd-s3">
              <span className="n">Total cases</span>
              <span className="v">{fmt(kpiStats.c)}</span>
              <span className="s">{y0 === y1 ? String(y0) : `${y0} to ${y1}`}</span>
            </div>
            <div className="tbd-kpi tbd-k2 tbd-s3">
              <span className="n">Total deaths</span>
              <span className="v">{num(kpiStats.dt)}</span>
              <span className="s">{activeDiseases.join(' + ')}</span>
            </div>
            <div className="tbd-kpi tbd-k3 tbd-s3">
              <span className="n">Case fatality rate</span>
              <span className="v">{kpiStats.cfr}</span>
              <span className="s">Deaths per 100 cases</span>
            </div>
            <div className="tbd-kpi tbd-k4 tbd-s3">
              <span className="n">Year on year</span>
              <span className="v">{kpiStats.yoy}</span>
              <span className="s">{kpiStats.yoySub}</span>
            </div>

            <section className="tbd-card tbd-s8">
              <div className="tbd-hd">
                <div>
                  <h2>Dengue vs TB by month</h2>
                  <p>Cases per calendar month, summed over {y0 === y1 ? y0 : `${y0} to ${y1}`}</p>
                </div>
                <div className="tbd-legend">
                  {monthSvg.ser.map((q) => (
                    <span key={q.k}>
                      <i style={{ background: DCOL[q.k] }} />
                      {q.k}
                    </span>
                  ))}
                </div>
              </div>
              <svg viewBox={`0 0 ${monthSvg.W} ${monthSvg.H}`} role="img" aria-label="Monthly cases by disease">
                <defs>
                  {monthSvg.ser.map((q) => (
                    <linearGradient key={q.k} id={`tbd_g_${q.k}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor={DCOL[q.k]} stopOpacity="0.30" />
                      <stop offset="1" stopColor={DCOL[q.k]} stopOpacity="0" />
                    </linearGradient>
                  ))}
                </defs>
                <g className="tbd-grid">
                  {[0, 1, 2, 3, 4].map((i) => {
                    const v = (monthSvg.mx * i) / 4;
                    const yy = monthSvg.y(v);
                    return (
                      <g key={i}>
                        <line x1={monthSvg.L} x2={monthSvg.W - monthSvg.R} y1={yy} y2={yy} />
                        <text x={monthSvg.L - 8} y={yy + 3.5} textAnchor="end">
                          {fmt(v)}
                        </text>
                      </g>
                    );
                  })}
                </g>
                {MON.map((m, i) => (
                  <text key={m} x={monthSvg.x(i)} y={monthSvg.H - 8} textAnchor="middle">
                    {m}
                  </text>
                ))}
                {monthSvg.ser.map((q) => {
                  const pts = q.v.map((v, i) => [monthSvg.x(i), monthSvg.y(v)]);
                  const ln = smooth(pts);
                  return (
                    <g key={q.k}>
                      <path
                        d={`${ln}L${monthSvg.x(11)},${monthSvg.y(0)}L${monthSvg.x(0)},${monthSvg.y(0)}Z`}
                        fill={`url(#tbd_g_${q.k})`}
                      />
                      <path d={ln} fill="none" stroke={DCOL[q.k]} strokeWidth="2.6" strokeLinecap="round" />
                      {q.v.map((v, i) => (
                        <circle
                          key={i}
                          cx={monthSvg.x(i)}
                          cy={monthSvg.y(v)}
                          r="3.6"
                          fill="var(--card)"
                          stroke={DCOL[q.k]}
                          strokeWidth="2"
                        >
                          <title>{`${MON[i]} - ${q.k}: ${num(v)}`}</title>
                        </circle>
                      ))}
                    </g>
                  );
                })}
              </svg>
            </section>

            <section className="tbd-card tbd-s4">
              <div className="tbd-hd">
                <div>
                  <h2>Annual cases</h2>
                  <p>By disease and year</p>
                </div>
              </div>
              <svg viewBox={`0 0 ${yearSvg.W} ${yearSvg.H}`} role="img" aria-label="Annual cases">
                <g className="tbd-grid">
                  {[0, 1, 2, 3, 4].map((i) => {
                    const v = (yearSvg.mx * i) / 4;
                    return (
                      <g key={i}>
                        <line x1={yearSvg.L} x2={yearSvg.W - yearSvg.R} y1={yearSvg.y(v)} y2={yearSvg.y(v)} />
                        <text x={yearSvg.L - 6} y={yearSvg.y(v) + 3.5} textAnchor="end">
                          {fmt(v)}
                        </text>
                      </g>
                    );
                  })}
                </g>
                {yearSvg.ys.map((yr, i) => {
                  const gx = yearSvg.L + yearSvg.gw * i + yearSvg.gw / 2;
                  const tot = activeDiseases.length * yearSvg.bw + (activeDiseases.length - 1) * 4;
                  return (
                    <g key={yr}>
                      {activeDiseases.map((k, j) => {
                        const v = yearSvg.val[i][j];
                        const bx = gx - tot / 2 + j * (yearSvg.bw + 4);
                        const h = (yearSvg.ih * v) / yearSvg.mx;
                        return (
                          <rect
                            key={k}
                            x={bx}
                            y={yearSvg.y(v)}
                            width={yearSvg.bw}
                            height={Math.max(0, h)}
                            rx={Math.min(7, yearSvg.bw / 2)}
                            fill={DCOL[k]}
                          >
                            <title>{`${yr} ${k}: ${num(v)}`}</title>
                          </rect>
                        );
                      })}
                      <text x={gx} y={yearSvg.H - 8} textAnchor="middle">
                        {yr}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </section>

            <section className="tbd-card tbd-s7">
              <div className="tbd-hd">
                <div>
                  <h2>Cases by region and quarter</h2>
                  <p>Darker cells have more cases</p>
                </div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="tbd-table">
                  <thead>
                    <tr>
                      <th>Region</th>
                      {[1, 2, 3, 4].map((q) => (
                        <th key={q}>Q{q}</th>
                      ))}
                      <th className="tot">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {heatData.regs.map((r) => (
                      <tr key={r}>
                        <td>{r}</td>
                        {heatData.g[r].map((v, i) => {
                          const off = selectedQ.length > 0 && !selectedQ.includes(i + 1);
                          return off ? (
                            <td key={i} style={{ color: 'var(--muted)' }}>
                              –
                            </td>
                          ) : (
                            <td
                              key={i}
                              style={{
                                background: `color-mix(in srgb, var(--tb) ${Math.round(8 + (v / heatData.mx) * 62)}%, var(--card))`
                              }}
                            >
                              {num(v)}
                            </td>
                          );
                        })}
                        <td className="tot">{num(heatData.g[r].reduce((a, b) => a + b, 0))}</td>
                      </tr>
                    ))}
                    <tr>
                      <td className="tot">Total</td>
                      {heatData.tq.map((v, i) => (
                        <td key={i} className="tot">
                          {selectedQ.length > 0 && !selectedQ.includes(i + 1) ? '–' : num(v)}
                        </td>
                      ))}
                      <td className="tot">{num(heatData.tq.reduce((a, b) => a + b, 0))}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="tbd-card tbd-s5">
              <div className="tbd-hd">
                <div>
                  <h2>Incidence per 100,000</h2>
                  <p>Cases in the selected period</p>
                </div>
              </div>
              <div className="tbd-bars">
                {incidenceData.v.map(([r, x]) => (
                  <div key={r} className="tbd-br" title={`${r}: ${x.toFixed(1)} per 100,000`}>
                    <span>{r}</span>
                    <span className="t">
                      <i style={{ width: `${(x / incidenceData.mx) * 100}%` }} />
                    </span>
                    <span className="x">{x.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="tbd-card tbd-s5">
              <div className="tbd-hd">
                <div>
                  <h2>Age mix by disease</h2>
                  <p>Share of cases</p>
                </div>
                <div className="tbd-legend">
                  {AGES.map((a, i) => (
                    <span key={a}>
                      <i style={{ background: ACOL[i] }} />
                      {a}
                    </span>
                  ))}
                </div>
              </div>
              <div className="tbd-age">
                {ageMixData.map(({ k, t, T }) => (
                  <div key={k} className="row">
                    <b>
                      <span>{k}</span>
                      <span style={{ color: 'var(--muted)', fontWeight: 600 }}>{num(T)} cases</span>
                    </b>
                    <div className="stack">
                      {t.map((v, i) => (
                        <i
                          key={i}
                          title={`${k}, ages ${AGES[i]}: ${((v / T) * 100).toFixed(1)}% (${num(v)})`}
                          style={{ width: `${(v / T) * 100}%`, background: ACOL[i] }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="tbd-card tbd-s7">
              <div className="tbd-hd">
                <div>
                  <h2>Total cases and CFR by region</h2>
                  <p>Each dot is a region</p>
                </div>
              </div>
              <svg viewBox={`0 0 ${scatterSvg.W} ${scatterSvg.H}`} role="img" aria-label="Cases versus CFR by region">
                <g className="tbd-grid">
                  {[0, 1, 2, 3, 4].map((i) => {
                    const v = (scatterSvg.ym * i) / 4;
                    return (
                      <g key={i}>
                        <line x1={scatterSvg.L} x2={scatterSvg.W - scatterSvg.R} y1={scatterSvg.y(v)} y2={scatterSvg.y(v)} />
                        <text x={scatterSvg.L - 8} y={scatterSvg.y(v) + 3.5} textAnchor="end">
                          {v.toFixed(1)}%
                        </text>
                      </g>
                    );
                  })}
                  {[0, 1, 2, 3, 4].map((i) => {
                    const v = (scatterSvg.xm * i) / 4;
                    return (
                      <text key={i} x={scatterSvg.x(v)} y={scatterSvg.H - 20} textAnchor="middle">
                        {fmt(v)}
                      </text>
                    );
                  })}
                </g>
                <text x={scatterSvg.L + scatterSvg.iw / 2} y={scatterSvg.H - 3} textAnchor="middle">
                  Total cases
                </text>
                <text
                  transform={`translate(12 ${scatterSvg.T + scatterSvg.ih / 2}) rotate(-90)`}
                  textAnchor="middle"
                >
                  CFR %
                </text>
                {scatterSvg.p.map((a) => (
                  <circle
                    key={a.r}
                    cx={scatterSvg.x(a.c)}
                    cy={scatterSvg.y(a.f)}
                    r="7"
                    fill="var(--tb)"
                    fillOpacity="0.75"
                    stroke="var(--card)"
                    strokeWidth="2"
                  >
                    <title>{`${a.r}: ${num(a.c)} cases, CFR ${a.f.toFixed(2)}%`}</title>
                  </circle>
                ))}
              </svg>
            </section>
          </main>
        </div>

        <p className="tbd-foot">
          Calendar: DateTable_New, 1 Jan 2022 to 31 Dec 2025. Populations are rounded 2020 census figures used for the per-100,000 rates.
        </p>
      </div>
    </div>
  );
}

