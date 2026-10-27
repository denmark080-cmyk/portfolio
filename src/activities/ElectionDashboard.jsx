import React, { useState, useMemo } from 'react';
import { ELECTION_RAW_DATA } from '../data/electionData';
import { GOOGLE_DRIVE_REPO_URL } from '../data/portfolioData';

const DATA = ELECTION_RAW_DATA.map((r) => ({
  y: r[0],
  region: r[1],
  prov: r[2],
  party: r[3],
  v: r[4]
}));

const YEARS = [...new Set(DATA.map((r) => r.y))].sort((a, b) => a - b);
const REGIONS = ['North', 'Central', 'South', 'East'].filter((r) => DATA.some((d) => d.region === r));
const PARTIES = [...new Set(DATA.map((r) => r.party))];
const REPORT_PARTIES = ['Amber Coalition', 'Azure Alliance', 'Crimson Union', 'Independent', 'Verdant Movement'];
const PCOL = {
  'Azure Alliance': '#4f6bed',
  'Crimson Union': '#f0745a',
  'Amber Coalition': '#f5a623',
  Independent: '#8a93ab',
  'Verdant Movement': '#2fbf9b'
};
const SERIES_COL = ['#4f6bed', '#f59e42', '#2fbf9b', '#e8588d', '#8b6cf0'];
const PROVINCES = [...new Map(DATA.map((r) => [r.prov, r.region])).entries()].map(([name, region]) => ({
  name,
  region
}));

const fmt = (v) => Math.round(v).toLocaleString('en-US');
const compact = (v) =>
  v >= 1e6 ? (v / 1e6).toFixed(2) + 'M' : v >= 1e3 ? Math.round(v / 1e3) + 'k' : String(Math.round(v));
const pctFmt = (v) => (v > 0 ? '+' : '') + v.toFixed(1) + '%';
const col = (p) => PCOL[p] || '#8a93ab';
const partiesIn = (y) => new Set(DATA.filter((r) => r.y === y).map((r) => r.party));

const rows = (o) =>
  DATA.filter(
    (r) =>
      (o.y == null || r.y === o.y) &&
      (o.region == null || o.region === 'All' || r.region === o.region) &&
      (o.party == null || o.party === 'All' || r.party === o.party) &&
      (o.prov == null || r.prov === o.prov) &&
      (o.parties == null || o.parties.has(r.party))
  );
const sum = (rs) => rs.reduce((a, r) => a + r.v, 0);
const prevYear = (y) => {
  const i = YEARS.indexOf(y);
  return i > 0 ? YEARS[i - 1] : null;
};

function smooth(pts) {
  if (pts.length < 2) return '';
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const t = 0.18;
    d += ` C${p1[0] + (p2[0] - p0[0]) * t},${p1[1] + (p2[1] - p0[1]) * t} ${p2[0] - (p3[0] - p1[0]) * t},${p2[1] - (p3[1] - p1[1]) * t} ${p2[0]},${p2[1]}`;
  }
  return d;
}

function niceTop(m) {
  if (m <= 0) return 1;
  const s = Math.pow(10, Math.floor(Math.log10(m))) / 2;
  return Math.ceil(m / s) * s;
}

function SvgLineChart({ idPrefix, series, height, activeYear, onHover, onLeave }) {
  const w = 520;
  const h = height;
  const pl = 42;
  const pr = 14;
  const pt = 12;
  const pb = 26;
  const iw = w - pl - pr;
  const ih = h - pt - pb;
  const n = YEARS.length;
  const all = series.flatMap((s) => s.vals.filter((v) => v != null));

  if (!all.length) {
    return <div className="el-empty">No data for this selection</div>;
  }

  const top = niceTop(Math.max(...all));
  const X = (i) => pl + iw * (n > 1 ? i / (n - 1) : 0.5);
  const Y = (v) => pt + ih * (1 - v / top);

  return (
    <svg
      width="100%"
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const relX = ((e.clientX - r.left) / r.width) * w;
        const idx = Math.max(0, Math.min(n - 1, Math.round(((relX - pl) / iw) * (n - 1))));
        onHover && onHover(idx, series, e);
      }}
      onMouseLeave={onLeave}
    >
      <defs>
        {series.map((se, k) => (
          <linearGradient key={k} id={`g_${idPrefix}_${k}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={se.color} stopOpacity="0.28" />
            <stop offset="1" stopColor={se.color} stopOpacity="0" />
          </linearGradient>
        ))}
      </defs>
      {[0, 1, 2, 3, 4].map((t) => {
        const v = (top * t) / 4;
        const y = Y(v);
        return (
          <g key={t}>
            <line
              x1={pl}
              x2={w - pr}
              y1={y}
              y2={y}
              stroke="var(--el-grid)"
              strokeDasharray={t ? '3 4' : undefined}
            />
            <text x={pl - 8} y={y + 4} textAnchor="end" fontSize="10" fill="var(--el-axis)">
              {compact(v)}
            </text>
          </g>
        );
      })}
      {YEARS.map((yr, i) => (
        <text
          key={yr}
          x={X(i)}
          y={h - 7}
          textAnchor="middle"
          fontSize="10.5"
          fill={yr === activeYear ? 'var(--el-ink)' : 'var(--el-axis)'}
          fontWeight={yr === activeYear ? 800 : 500}
        >
          {yr}
        </text>
      ))}
      {series.map((se, k) => {
        const pts = se.vals.map((v, i) => (v == null ? null : [X(i), Y(v)])).filter(Boolean);
        const d = pts.length > 1 ? smooth(pts) : '';
        return (
          <g key={k}>
            {pts.length > 1 && (
              <>
                <path
                  d={`${d} L${pts[pts.length - 1][0]},${Y(0)} L${pts[0][0]},${Y(0)} Z`}
                  fill={`url(#g_${idPrefix}_${k})`}
                />
                <path d={d} fill="none" stroke={se.color} strokeWidth="2.6" strokeLinecap="round" />
              </>
            )}
            {pts.map((p, idx) => (
              <circle
                key={idx}
                cx={p[0]}
                cy={p[1]}
                r="4"
                fill="var(--el-card)"
                stroke={se.color}
                strokeWidth="2.4"
              />
            ))}
          </g>
        );
      })}
    </svg>
  );
}

export default function ElectionDashboard({ embedded = false, onBackToPortfolio }) {
  const [year, setYear] = useState(YEARS[0]);
  const [region, setRegion] = useState('All');
  const [party, setParty] = useState('All');
  const [query, setQuery] = useState('');
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, title: '', items: [] });

  const changeForProv = (prov) => {
    const py = prevYear(year);
    if (py == null) return null;
    const a = partiesIn(year);
    const b = partiesIn(py);
    const common = new Set([...a].filter((p) => b.has(p)));
    if (!common.size) return null;
    const cur = sum(rows({ y: year, prov, party, parties: common }));
    const prev = sum(rows({ y: py, prov, party, parties: common }));
    if (!prev) return null;
    return ((cur - prev) / prev) * 100;
  };

  const leaderForProv = (prov) => {
    const rs = rows({ y: year, prov });
    const ps = new Set(rs.map((r) => r.party));
    if (ps.size < 2) return null;
    return rs.slice().sort((a, b) => b.v - a.v)[0].party;
  };

  const provinceList = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PROVINCES.filter(
      (p) =>
        (region === 'All' || p.region === region) &&
        (!q || p.name.toLowerCase().includes(q) || p.region.toLowerCase().includes(q))
    )
      .map((p) => ({
        ...p,
        votes: sum(rows({ y: year, prov: p.name, party })),
        ch: changeForProv(p.name),
        lead: leaderForProv(p.name)
      }))
      .sort((a, b) => b.votes - a.votes);
  }, [year, region, party, query]);

  const barsByParty = useMemo(() => {
    const rs = rows({ y: year, region });
    const by = PARTIES.map((p) => ({ p, v: sum(rs.filter((r) => r.party === p)) }))
      .filter((o) => rs.some((r) => r.party === o.p))
      .sort((a, b) => b.v - a.v);
    const max = Math.max(1, ...by.map((o) => o.v));
    return { by, max };
  }, [year, region]);

  const trendSeries = useMemo(() => {
    const ps = party === 'All' ? PARTIES : [party];
    return ps.map((p) => ({
      name: p,
      color: col(p),
      vals: YEARS.map((y) => {
        const r = rows({ y, region, party: p });
        return r.length ? sum(r) : null;
      })
    }));
  }, [region, party]);

  const bigChartData = useMemo(() => {
    let groups;
    let title;
    if (region === 'All') {
      groups = REGIONS.map((r) => ({ name: r, f: (y) => rows({ y, region: r, party }) }));
      title = 'Votes over time by region';
    } else {
      groups = PROVINCES.filter((p) => p.region === region).map((p) => ({
        name: p.name,
        f: (y) => rows({ y, prov: p.name, party })
      }));
      title = `Votes over time by province · ${region}`;
    }
    const series = groups.map((g, i) => ({
      name: g.name,
      color: SERIES_COL[i % SERIES_COL.length],
      vals: YEARS.map((y) => {
        const r = g.f(y);
        return r.length ? sum(r) : null;
      })
    }));

    const ch = PROVINCES.filter((p) => region === 'All' || p.region === region)
      .map((p) => ({ n: p.name, c: changeForProv(p.name) }))
      .filter((o) => o.c != null);
    const py = prevYear(year);
    const gain = ch.length ? ch.slice().sort((a, b) => b.c - a.c)[0] : null;
    const drop = ch.length ? ch.slice().sort((a, b) => a.c - b.c)[0] : null;

    return { title, series, py, gain, drop, hasChanges: ch.length > 0 };
  }, [year, region, party]);

  const matrixData = useMemo(() => {
    const rs = rows({ y: year });
    const ps = PARTIES.filter((p) => rs.some((r) => r.party === p));
    const cells = REGIONS.map((r) => ps.map((p) => sum(rs.filter((x) => x.region === r && x.party === p))));
    const max = Math.max(1, ...cells.flat());
    return { ps, cells, max };
  }, [year]);

  const changeList = useMemo(() => {
    const py = prevYear(year);
    const list = PROVINCES.filter((p) => region === 'All' || p.region === region)
      .map((p) => ({ n: p.name, c: changeForProv(p.name) }))
      .filter((o) => o.c != null)
      .sort((a, b) => Math.abs(b.c) - Math.abs(a.c))
      .slice(0, 8);
    const max = list.length ? Math.max(...list.map((o) => Math.abs(o.c))) : 1;
    return { py, list, max };
  }, [year, region, party]);

  const snapshotTiles = useMemo(() => {
    const rs = rows({ y: year, region, party });
    const total = sum(rs);
    const provs = PROVINCES.filter((p) => region === 'All' || p.region === region);
    const vals = provs
      .map((p) => ({ n: p.name, v: sum(rs.filter((r) => r.prov === p.name)) }))
      .sort((a, b) => b.v - a.v);
    const reporting = vals.filter((o) => o.v > 0).length;
    const byParty = PARTIES.map((p) => ({ p, v: sum(rs.filter((r) => r.party === p)) }))
      .filter((o) => rs.some((r) => r.party === o.p))
      .sort((a, b) => b.v - a.v);
    const lead = byParty.length > 1 ? byParty[0].p : null;
    return { total, reporting, totalProvs: provs.length, lead, topProv: vals[0] };
  }, [year, region, party]);

  const vbeData = useMemo(() => {
    const vals = YEARS.map((y) => sum(rows({ y, region, party })));
    const top = niceTop(Math.max(...vals, 1));
    return { vals, top };
  }, [region, party]);

  const handleChartHover = (idx, series, e) => {
    const items = series
      .filter((se) => se.vals[idx] != null)
      .map((se) => ({ color: se.color, label: `${se.name}: ${fmt(se.vals[idx])}` }));
    setTooltip({
      visible: true,
      x: Math.min(e.clientX + 14, window.innerWidth - 250),
      y: e.clientY + 14,
      title: String(YEARS[idx]),
      items
    });
  };

  const hideTooltip = () => setTooltip((prev) => ({ ...prev, visible: false }));

  const missingParties = REPORT_PARTIES.filter((p) => !PARTIES.includes(p));

  return (
    <div className="el-root">
      <style>{`
        .el-root {
          --el-bg: #08070d; --el-bg2: #100e1b; --el-frame: rgba(18, 14, 34, 0.88);
          --el-card: #151124; --el-ink: #f8fafc; --el-muted: #94a3b8;
          --el-line: rgba(168, 115, 255, 0.22); --el-shadow: 0 12px 36px rgba(0,0,0,0.55);
          --el-accent: #8b5cf6; --el-accent-soft: rgba(139, 92, 246, 0.2);
          --el-pos: #34d399; --el-neg: #ef4444; --el-grid: rgba(168, 115, 255, 0.15);
          --el-axis: #94a3b8; --el-chip: rgba(255, 255, 255, 0.05);
          font-family: "Plus Jakarta Sans", system-ui, -apple-system, sans-serif;
          color: var(--el-ink);
          background: linear-gradient(135deg, var(--el-bg), var(--el-bg2));
          min-height: 100vh; padding: 20px; font-size: 13px; box-sizing: border-box;
        }
        .el-root * { box-sizing: border-box; }
        .el-frame { max-width: 1480px; margin: 0 auto; background: var(--el-frame); border-radius: 28px; padding: 18px; box-shadow: var(--el-shadow); }
        .el-topbar { display: flex; align-items: center; gap: 18px; background: var(--el-card); border-radius: 18px; padding: 10px 18px; box-shadow: var(--el-shadow); margin-bottom: 14px; flex-wrap: wrap; }
        .el-brand { display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 15px; white-space: nowrap; }
        .el-logo { width: 34px; height: 34px; border-radius: 11px; background: linear-gradient(135deg,#4f6bed,#8b6cf0); display: grid; place-items: center; color: #fff; }
        .el-search { flex: 1; max-width: 560px; margin: 0 auto; position: relative; min-width: 200px; }
        .el-search input { width: 100%; border: 1px solid var(--el-line); background: var(--el-chip); color: var(--el-ink); border-radius: 999px; padding: 10px 40px 10px 18px; font: inherit; outline: none; }
        .el-search input:focus { border-color: var(--el-accent); }
        .el-search svg { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); color: var(--el-muted); }
        .el-chip { background: var(--el-accent-soft); color: var(--el-accent); border-radius: 999px; padding: 7px 14px; font-weight: 700; font-size: 12px; white-space: nowrap; }
        .el-notice { background: var(--el-card); border-left: 4px solid #f59e42; border-radius: 12px; padding: 10px 16px; margin-bottom: 14px; color: var(--el-muted); font-size: 12px; line-height: 1.5; box-shadow: var(--el-shadow); }
        .el-notice b { color: var(--el-ink); }
        .el-layout { display: grid; grid-template-columns: 290px minmax(0,1fr) 320px; gap: 14px; align-items: start; }
        .el-col { display: flex; flex-direction: column; gap: 14px; min-width: 0; }
        .el-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .el-card { background: var(--el-card); border-radius: 18px; padding: 16px 18px; box-shadow: var(--el-shadow); min-width: 0; }
        .el-card h3 { margin: 0; font-size: 14px; font-weight: 800; }
        .el-sub { color: var(--el-muted); font-size: 11px; margin-top: 2px; }
        .el-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 12px; }
        .el-tag { background: var(--el-chip); color: var(--el-muted); border-radius: 8px; padding: 4px 9px; font-size: 11px; white-space: nowrap; }
        .el-label { font-size: 11px; font-weight: 700; color: var(--el-muted); text-transform: uppercase; letter-spacing: .06em; margin: 12px 0 6px; }
        .el-pills { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
        .el-pill, .el-seg button { border: 1px solid var(--el-line); background: var(--el-chip); color: var(--el-ink); border-radius: 10px; padding: 8px 0; font: inherit; font-weight: 700; cursor: pointer; transition: .15s; }
        .el-pill:hover, .el-seg button:hover { border-color: var(--el-accent); }
        .el-pill.on, .el-seg button.on { background: linear-gradient(135deg,#4f6bed,#7a5cf0); color: #fff; border-color: transparent; box-shadow: 0 6px 14px rgba(79,107,237,.35); }
        .el-select { width: 100%; border: 1px solid var(--el-line); background: var(--el-chip); color: var(--el-ink); border-radius: 10px; padding: 9px 10px; font: inherit; font-weight: 600; }
        .el-select option { background: #151124; color: #f8fafc; }
        .el-seg { display: grid; grid-template-columns: 1fr; gap: 6px; }
        .el-plist { display: flex; flex-direction: column; gap: 2px; max-height: 430px; overflow: auto; margin: 0 -8px; padding: 0 8px; }
        .el-prow { display: flex; align-items: center; gap: 10px; padding: 8px; border-radius: 12px; }
        .el-prow:hover { background: var(--el-chip); }
        .el-av { width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center; color: #fff; font-weight: 800; font-size: 12px; flex: none; }
        .el-pmeta { flex: 1; min-width: 0; }
        .el-pname { font-weight: 700; font-size: 12.5px; }
        .el-psub { color: var(--el-muted); font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .el-pval { text-align: right; font-weight: 800; font-size: 12px; }
        .el-delta { font-size: 10.5px; font-weight: 700; }
        .el-delta.up { color: var(--el-pos); }
        .el-delta.down { color: var(--el-neg); }
        .el-delta.na { color: var(--el-muted); font-weight: 500; }
        .el-bars { display: flex; flex-direction: column; gap: 14px; }
        .el-bar-top { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
        .el-ico { width: 30px; height: 30px; border-radius: 9px; display: grid; place-items: center; color: #fff; font-weight: 800; font-size: 11px; flex: none; }
        .el-bar-top .n { flex: 1; font-weight: 700; }
        .el-bar-top .v { font-weight: 800; }
        .el-track { height: 7px; border-radius: 99px; background: var(--el-chip); overflow: hidden; }
        .el-fill { height: 100%; border-radius: 99px; transition: width .5s; }
        .el-empty { color: var(--el-muted); text-align: center; padding: 34px 10px; font-size: 12px; }
        .el-legend { display: flex; gap: 14px; flex-wrap: wrap; font-size: 11px; color: var(--el-muted); margin-top: 8px; }
        .el-legend i { display: inline-block; width: 9px; height: 9px; border-radius: 50%; margin-right: 5px; }
        .el-tiles { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .el-tile { border-radius: 16px; padding: 14px; color: #fff; min-height: 92px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 10px 22px rgba(0,0,0,.10); }
        .el-tile .big { font-size: 20px; font-weight: 800; line-height: 1.1; word-break: break-word; }
        .el-tile .cap { font-size: 11px; opacity: .92; }
        .el-t1 { background: linear-gradient(135deg,#3fd9b0,#17a2a0); }
        .el-t2 { background: linear-gradient(135deg,#ffbe55,#ff8a3d); }
        .el-t3 { background: linear-gradient(135deg,#55cdf3,#4a86f0); }
        .el-t4 { background: linear-gradient(135deg,#ff9a7a,#f0546a); }
        .el-chg { display: flex; flex-direction: column; gap: 10px; }
        .el-crow { display: grid; grid-template-columns: 62px 1fr 54px; align-items: center; gap: 8px; font-size: 11.5px; }
        .el-ctrack { position: relative; height: 12px; }
        .el-ctrack:before { content: ""; position: absolute; left: 50%; top: -3px; bottom: -3px; width: 1px; background: var(--el-line); }
        .el-cbar { position: absolute; top: 1px; height: 10px; border-radius: 99px; }
        .el-insight { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 6px 12px; padding: 12px 0; border-top: 1px solid var(--el-line); }
        .el-insight .t { font-weight: 700; }
        .el-insight .t small { color: var(--el-muted); font-weight: 500; margin-left: 6px; }
        .el-badge { border-radius: 8px; color: #fff; font-weight: 700; font-size: 11px; padding: 6px 14px; }
        .el-insight .el-track { grid-column: 1/2; }
        .el-insight .pct { grid-column: 2/3; text-align: right; font-weight: 800; font-size: 11.5px; }
        table.el-m { width: 100%; border-collapse: separate; border-spacing: 4px; font-size: 12px; }
        table.el-m th { color: var(--el-muted); font-weight: 700; text-align: right; padding: 4px 8px; font-size: 11px; }
        table.el-m th:first-child, table.el-m td:first-child { text-align: left; }
        table.el-m td { padding: 11px 10px; border-radius: 9px; text-align: right; font-weight: 700; background: var(--el-chip); }
        table.el-m td:first-child { background: none; color: var(--el-ink); }
        .el-tip { position: fixed; pointer-events: none; background: var(--el-ink); color: var(--el-card); padding: 8px 11px; border-radius: 10px; font-size: 11.5px; line-height: 1.55; z-index: 50; box-shadow: 0 8px 20px rgba(0,0,0,.25); max-width: 240px; }
        .el-back-btn { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 10px; background: rgba(139, 92, 246, 0.12); border: 1px solid rgba(139, 92, 246, 0.35); color: #c4b5fd; text-decoration: none; font-size: 11.5px; font-weight: 700; cursor: pointer; }
        .el-drive-btn { display: inline-flex; align-items: center; gap: 6px; padding: 7px 16px; border-radius: 10px; background: linear-gradient(135deg, #7c3aed, #4f46e5); border: 1px solid rgba(196, 181, 253, 0.3); color: #fff; text-decoration: none; font-size: 12px; font-weight: 700; }
        @media (max-width: 1180px) { .el-layout { grid-template-columns: 1fr; } .el-row2 { grid-template-columns: 1fr; } .el-plist { max-height: 300px; } }
      `}</style>

      <div className="el-frame">
        <header className="el-topbar">
          {!embedded && (
            <a
              href="/#powerbi-activities"
              onClick={(e) => {
                if (onBackToPortfolio) {
                  e.preventDefault();
                  onBackToPortfolio();
                }
              }}
              className="el-back-btn"
            >
              ← Portfolio
            </a>
          )}
          <div className="el-brand">
            <div className="el-logo">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
              </svg>
            </div>
            Election Results
          </div>
          <div className="el-search">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search province or region..."
              autoComplete="off"
            />
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
          </div>
          <div className="el-chip">Fictional · 2016–2025</div>
          <a href={GOOGLE_DRIVE_REPO_URL} target="_blank" rel="noopener noreferrer" className="el-drive-btn">
            Drive Files
          </a>
        </header>

        <div className="el-notice">
          <b>Data coverage:</b> the exported file contains <b>Azure Alliance</b> (2016–2025) and <b>Crimson Union</b> (2016 only).{' '}
          {missingParties.join(', ')} are not in the file, so vote share %, turnout % and overall winners are not calculated; charts show raw votes and compare only parties reported in both elections.
        </div>

        <div className="el-layout">
          <aside className="el-col">
            <section className="el-card">
              <div className="el-head">
                <div>
                  <h3>Filters</h3>
                  <div className="el-sub">Pick an election, region and party</div>
                </div>
              </div>
              <div className="el-label" style={{ marginTop: 0 }}>
                Election year
              </div>
              <div className="el-pills">
                {YEARS.map((y) => (
                  <button key={y} className={`el-pill ${y === year ? 'on' : ''}`} onClick={() => setYear(y)}>
                    {y}
                  </button>
                ))}
              </div>
              <div className="el-label">Region</div>
              <select className="el-select" value={region} onChange={(e) => setRegion(e.target.value)}>
                {['All', ...REGIONS].map((r) => (
                  <option key={r} value={r}>
                    {r === 'All' ? 'All regions' : r}
                  </option>
                ))}
              </select>
              <div className="el-label">Party</div>
              <div className="el-seg">
                {['All', ...PARTIES].map((p) => (
                  <button key={p} className={p === party ? 'on' : ''} onClick={() => setParty(p)}>
                    {p === 'All' ? 'All parties' : p}
                  </button>
                ))}
              </div>
            </section>

            <section className="el-card">
              <div className="el-head">
                <div>
                  <h3>Provinces</h3>
                  <div className="el-sub">
                    {year} · {provinceList.length} provinces
                  </div>
                </div>
              </div>
              <div className="el-plist">
                {provinceList.length ? (
                  provinceList.map((p) => {
                    const color = p.lead ? col(p.lead) : party !== 'All' ? col(party) : '#8b95b3';
                    return (
                      <div key={p.name} className="el-prow">
                        <div className="el-av" style={{ background: color }}>
                          {p.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="el-pmeta">
                          <div className="el-pname">{p.name}</div>
                          <div className="el-psub">
                            {p.region}
                            {p.lead ? ` · leads: ${p.lead}` : ''}
                          </div>
                        </div>
                        <div className="el-pval">
                          {fmt(p.votes)}
                          <br />
                          {p.ch == null ? (
                            <span className="el-delta na">n/a</span>
                          ) : (
                            <span className={`el-delta ${p.ch >= 0 ? 'up' : 'down'}`}>
                              {p.ch >= 0 ? '▲' : '▼'} {Math.abs(p.ch).toFixed(1)}%
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="el-empty">No provinces match</div>
                )}
              </div>
            </section>
          </aside>

          <main className="el-col">
            <div className="el-row2">
              <section className="el-card">
                <div className="el-head">
                  <div>
                    <h3>Votes by party</h3>
                    <div className="el-sub">
                      {year} · {region === 'All' ? 'All regions' : region}
                    </div>
                  </div>
                  <span className="el-tag">
                    {barsByParty.by.length} {barsByParty.by.length === 1 ? 'party' : 'parties'}
                  </span>
                </div>
                <div className="el-bars">
                  {barsByParty.by.map((o) => (
                    <div key={o.p}>
                      <div className="el-bar-top">
                        <div className="el-ico" style={{ background: col(o.p) }}>
                          {o.p
                            .split(' ')
                            .map((w) => w[0])
                            .join('')
                            .slice(0, 2)}
                        </div>
                        <div className="n">{o.p}</div>
                        <div className="v">{fmt(o.v)}</div>
                      </div>
                      <div className="el-track">
                        <div className="el-fill" style={{ width: `${(o.v / barsByParty.max) * 100}%`, background: col(o.p) }} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="el-card">
                <div className="el-head">
                  <div>
                    <h3>Vote trend</h3>
                    <div className="el-sub">Total votes per election</div>
                  </div>
                  <span className="el-tag">{region === 'All' ? 'All regions' : region}</span>
                </div>
                <SvgLineChart
                  idPrefix="trend"
                  series={trendSeries}
                  height={200}
                  activeYear={year}
                  onHover={handleChartHover}
                  onLeave={hideTooltip}
                />
                <div className="el-legend">
                  {trendSeries.map((s) => (
                    <span key={s.name}>
                      <i style={{ background: s.color }} />
                      {s.name}
                    </span>
                  ))}
                </div>
              </section>
            </div>

            <section className="el-card">
              <div className="el-head">
                <div>
                  <h3>{bigChartData.title}</h3>
                  <div className="el-sub">
                    {party === 'All' ? 'All parties in the file combined (2016 includes Crimson Union)' : party}
                  </div>
                </div>
                <span className="el-tag">
                  {YEARS[0]} – {YEARS[YEARS.length - 1]}
                </span>
              </div>
              <SvgLineChart
                idPrefix="big"
                series={bigChartData.series}
                height={270}
                activeYear={year}
                onHover={handleChartHover}
                onLeave={hideTooltip}
              />
              <div className="el-legend">
                {bigChartData.series.map((s) => (
                  <span key={s.name}>
                    <i style={{ background: s.color }} />
                    {s.name}
                  </span>
                ))}
              </div>
              <div style={{ marginTop: 8 }}>
                {!bigChartData.hasChanges ? (
                  <div className="el-insight">
                    <div className="t">
                      Biggest gain / drop
                      <small>
                        {bigChartData.py == null
                          ? '2016 is the first election in the file, so there is no earlier result to compare with'
                          : 'no comparable result'}
                      </small>
                    </div>
                  </div>
                ) : (
                  <>
                    {[
                      { label: 'Biggest gain', o: bigChartData.gain, color: '#2fbf9b' },
                      { label: 'Biggest drop', o: bigChartData.drop, color: '#ef5b6b' }
                    ].map(
                      ({ label, o, color }) =>
                        o && (
                          <div key={label} className="el-insight">
                            <div className="t">
                              {label}: {o.n}
                              <small>vs {bigChartData.py}</small>
                            </div>
                            <span className="el-badge" style={{ background: color }}>
                              {o.c >= 0 ? 'Gain' : 'Drop'}
                            </span>
                            <div className="el-track">
                              <div
                                className="el-fill"
                                style={{ width: `${Math.min(Math.abs(o.c), 100)}%`, background: color }}
                              />
                            </div>
                            <div className="pct">{pctFmt(o.c)}</div>
                          </div>
                        )
                    )}
                  </>
                )}
              </div>
            </section>

            <section className="el-card">
              <div className="el-head">
                <div>
                  <h3>Region by party</h3>
                  <div className="el-sub">Votes in {year}</div>
                </div>
              </div>
              <table className="el-m">
                <thead>
                  <tr>
                    <th>Region</th>
                    {matrixData.ps.map((p) => (
                      <th key={p}>{p}</th>
                    ))}
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {REGIONS.map((r, i) => (
                    <tr key={r}>
                      <td>{r}</td>
                      {matrixData.cells[i].map((v, j) => {
                        const a = (v / matrixData.max) * 0.75 + 0.06;
                        const c = col(matrixData.ps[j]);
                        return (
                          <td
                            key={j}
                            style={{
                              background: `color-mix(in srgb, ${c} ${Math.round(a * 100)}%, var(--el-chip))`,
                              color: a > 0.5 ? '#fff' : 'var(--el-ink)'
                            }}
                          >
                            {fmt(v)}
                          </td>
                        );
                      })}
                      <td>{fmt(matrixData.cells[i].reduce((a, b) => a + b, 0))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </main>

          <aside className="el-col">
            <section className="el-card">
              <div className="el-head">
                <div>
                  <h3>Change vs previous election</h3>
                  <div className="el-sub">
                    {changeList.py == null ? `${year} (first election)` : `${year} vs ${changeList.py} · largest moves`}
                  </div>
                </div>
                <span className="el-tag">%</span>
              </div>
              <div className="el-chg">
                {!changeList.list.length ? (
                  <div className="el-empty">
                    {changeList.py == null ? 'No earlier election to compare with. Pick 2019 or later.' : 'No comparable data'}
                  </div>
                ) : (
                  changeList.list.map((o) => {
                    const wd = (Math.abs(o.c) / changeList.max) * 50;
                    const pos = o.c >= 0;
                    return (
                      <div key={o.n} className="el-crow">
                        <span>{o.n}</span>
                        <div className="el-ctrack">
                          <div
                            className="el-cbar"
                            style={{
                              [pos ? 'left' : 'right']: '50%',
                              width: `${wd}%`,
                              background: pos
                                ? 'linear-gradient(90deg,#2fbf9b,#4fd8c0)'
                                : 'linear-gradient(270deg,#ef5b6b,#ff8f70)'
                            }}
                          />
                        </div>
                        <b className={`el-delta ${pos ? 'up' : 'down'}`} style={{ textAlign: 'right' }}>
                          {pctFmt(o.c)}
                        </b>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            <section className="el-card">
              <div className="el-head">
                <div>
                  <h3>Snapshot</h3>
                  <div className="el-sub">
                    {year} · {region === 'All' ? 'All regions' : region} · {party === 'All' ? 'all parties' : party}
                  </div>
                </div>
              </div>
              <div className="el-tiles">
                <div className="el-tile el-t1">
                  <div className="cap">Total votes</div>
                  <div className="big">{fmt(snapshotTiles.total)}</div>
                </div>
                <div className="el-tile el-t2">
                  <div className="cap">Provinces reporting</div>
                  <div className="big">
                    {snapshotTiles.reporting} / {snapshotTiles.totalProvs}
                  </div>
                </div>
                <div className="el-tile el-t3">
                  <div className="cap">Leading party</div>
                  <div className="big">{snapshotTiles.lead || '—'}</div>
                  <div className="cap">{snapshotTiles.lead ? 'by total votes' : 'needs 2+ parties in file'}</div>
                </div>
                <div className="el-tile el-t4">
                  <div className="cap">Top province</div>
                  <div className="big">{snapshotTiles.topProv && snapshotTiles.topProv.v ? snapshotTiles.topProv.n : '—'}</div>
                  <div className="cap">{snapshotTiles.topProv ? `${fmt(snapshotTiles.topProv.v)} votes` : ''}</div>
                </div>
              </div>
            </section>

            <section className="el-card">
              <div className="el-head">
                <div>
                  <h3>Votes by election</h3>
                  <div className="el-sub">Click a bar to switch year</div>
                </div>
                <span className="el-tag">{party === 'All' ? 'All parties' : party.split(' ')[0]}</span>
              </div>
              <div>
                <svg width="100%" height={210} viewBox="0 0 280 210">
                  <defs>
                    <linearGradient id="el_og" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#ffb347" />
                      <stop offset="1" stopColor="#ff8a3d" />
                    </linearGradient>
                    <linearGradient id="el_og2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#ffd9ae" />
                      <stop offset="1" stopColor="#ffe9d3" />
                    </linearGradient>
                  </defs>
                  {[0, 1, 2, 3].map((t) => {
                    const v = (vbeData.top * t) / 3;
                    const yPos = 26 + 160 * (1 - t / 3);
                    return (
                      <g key={t}>
                        <line
                          x1={44}
                          x2={274}
                          y1={yPos}
                          y2={yPos}
                          stroke="var(--el-grid)"
                          strokeDasharray={t ? '3 4' : undefined}
                        />
                        <text x={38} y={yPos + 4} textAnchor="end" fontSize="10" fill="var(--el-axis)">
                          {compact(v)}
                        </text>
                      </g>
                    );
                  })}
                  {YEARS.map((y, i) => {
                    const iw = 230;
                    const ih = 160;
                    const cx = 44 + (iw * (i + 0.5)) / YEARS.length;
                    const bh = (ih * vbeData.vals[i]) / vbeData.top;
                    const on = y === year;
                    const bw = 28;
                    return (
                      <g
                        key={y}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setYear(y)}
                      >
                        <rect
                          x={cx - bw / 2}
                          y={26 + ih - bh}
                          width={bw}
                          height={Math.max(bh, 0)}
                          rx="8"
                          fill={`url(#${on ? 'el_og' : 'el_og2'})`}
                        />
                        <text
                          x={cx}
                          y={203}
                          textAnchor="middle"
                          fontSize="10.5"
                          fontWeight={on ? 800 : 500}
                          fill={on ? 'var(--el-ink)' : 'var(--el-axis)'}
                        >
                          {y}
                        </text>
                        {on && (
                          <text
                            x={cx}
                            y={26 + ih - bh - 7}
                            textAnchor="middle"
                            fontSize="10.5"
                            fontWeight="800"
                            fill="var(--el-ink)"
                          >
                            {compact(vbeData.vals[i])}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>
            </section>
          </aside>
        </div>
      </div>

      {tooltip.visible && (
        <div className="el-tip" style={{ left: tooltip.x, top: tooltip.y }}>
          <b>{tooltip.title}</b>
          {tooltip.items.map((item, i) => (
            <div key={i}>
              <i
                style={{
                  display: 'inline-block',
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  marginRight: 6,
                  background: item.color
                }}
              />
              {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

