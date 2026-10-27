import React, { useState, useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { EDUCATION_EMPLOYMENT_DATA as D } from "../data/educationEmploymentData";
import { GOOGLE_DRIVE_REPO_URL } from "../data/portfolioData";

const DEFAULT_YEARS = [2021, 2025];
const passSet = (set, v, allLen) => set.size === 0 || set.size === allLen || set.has(v);
const pct = (v) => (v == null ? "–" : (v * 100).toFixed(2) + "%");
const fmtLF = (v) =>
  v >= 1e9
    ? (v / 1e9).toFixed(1) + "B"
    : v >= 1e8
    ? Math.round(v / 1e6) + "M"
    : v >= 1e6
    ? (v / 1e6).toFixed(1) + "M"
    : v >= 1e3
    ? Math.round(v / 1e3) + "K"
    : String(v);

const shortLabel = (s) =>
  s.length > 14
    ? s.split(/[\/ ]/).reduce((a, w) => {
        const l = a[a.length - 1];
        l && (l + " " + w).length <= 12 ? (a[a.length - 1] = l + " " + w) : a.push(w);
        return a;
      }, [])
    : s;

function computeRate(predicate) {
  let l = 0;
  let e = 0;
  for (const r of D.rows) {
    if (predicate(r)) {
      l += r[5];
      e += r[6];
    }
  }
  return { l, e, r: l ? e / l : null };
}

export default function EducationEmployment({ embedded = false, onBack }) {
  const [selectedYears, setSelectedYears] = useState(() => new Set(DEFAULT_YEARS));
  const [selectedSex, setSelectedSex] = useState(() => new Set(D.S));
  const [selectedRegions, setSelectedRegions] = useState(() => new Set(D.R));
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);
  const gapCanvasRef = useRef(null);
  const lineCanvasRef = useRef(null);
  const qCanvasRef = useRef(null);
  const colCanvasRef = useRef(null);
  const barCanvasRef = useRef(null);
  const chartInstancesRef = useRef({});

  useEffect(() => {
    const onDocClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const fy = (r) => passSet(selectedYears, D.Y[r[0]], D.Y.length);
  const fs = (r) => passSet(selectedSex, D.S[r[3]], D.S.length);
  const fr = (r) => passSet(selectedRegions, D.R[r[2]], D.R.length);

  const base = computeRate((r) => fy(r) && fs(r) && fr(r));
  const maxYear =
    selectedYears.size && selectedYears.size < D.Y.length
      ? Math.max(...selectedYears)
      : Math.max(...D.Y);
  const pyRate = computeRate((r) => D.Y[r[0]] === maxYear - 1 && fs(r) && fr(r)).r;
  const changeVsPy =
    base.r == null || pyRate == null ? "–" : ((base.r - pyRate) * 100).toFixed(2);

  const activeYears =
    selectedYears.size && selectedYears.size < D.Y.length
      ? D.Y.filter((y) => selectedYears.has(y))
      : D.Y;

  const matrixCells = D.E.map((e) =>
    activeYears.map((y) => computeRate((r) => D.Y[r[0]] === y && D.E[r[4]] === e && fs(r) && fr(r)).r)
  );
  const flatMatrix = matrixCells.flat().filter((v) => v != null);
  const mnMat = flatMatrix.length ? Math.min(...flatMatrix) : 0;
  const mxMat = flatMatrix.length ? Math.max(...flatMatrix) : 1;

  const cellStyle = (v) => {
    if (v == null) return {};
    const t = mxMat > mnMat ? (v - mnMat) / (mxMat - mnMat) : 0.5;
    return {
      background: `hsl(${Math.round(130 * t)}, 70%, ${84 - 6 * t}%)`,
      color: "#1d2433",
      borderRadius: "8px"
    };
  };

  useEffect(() => {
    const SLATE = "#8b5cf6";
    const PINK = "#f59e0b";
    const INK = "#f8fafc";
    const GRID = "rgba(168, 115, 255, 0.15)";

    const tick = { color: INK, font: { size: 11 } };
    const gridc = { color: GRID };
    const grad = (c, col) => {
      const a = c.chart.chartArea;
      if (!a) return col + "33";
      const g = c.chart.ctx.createLinearGradient(0, a.top, 0, a.bottom);
      g.addColorStop(0, col + "73");
      g.addColorStop(1, col + "05");
      return g;
    };

    const mk = (key, ref, cfg) => {
      if (chartInstancesRef.current[key]) {
        chartInstancesRef.current[key].destroy();
      }
      if (ref.current) {
        chartInstancesRef.current[key] = new Chart(ref.current, {
          ...cfg,
          options: {
            ...cfg.options,
            animation: false,
            maintainAspectRatio: false
          }
        });
      }
    };

    // 1. Gap vs National
    const nat = computeRate((r) => fy(r) && fs(r)).r;
    const gaps = D.R.filter((r) => passSet(selectedRegions, r, D.R.length))
      .map((r) => ({
        r,
        g: (computeRate((x) => D.R[x[2]] === r && fy(x) && fs(x)).r - nat) * 100
      }))
      .filter((o) => !isNaN(o.g))
      .sort((a, b) => b.g - a.g);

    mk("gap", gapCanvasRef, {
      type: "bar",
      data: {
        labels: gaps.map((o) => o.r),
        datasets: [
          {
            data: gaps.map((o) => o.g),
            backgroundColor: gaps.map((o) => (o.g >= 0 ? SLATE : PINK)),
            borderRadius: 6,
            borderSkipped: false
          }
        ]
      },
      options: {
        indexAxis: "y",
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (c) => c.parsed.x.toFixed(3) + " pts" } }
        },
        scales: {
          x: {
            ticks: tick,
            grid: gridc,
            title: { display: true, text: "Gap vs National (pts)", color: INK }
          },
          y: { ticks: { ...tick, autoSkip: false }, grid: { display: false } }
        }
      }
    });

    // 2. Employment rate by education (Line & Bar)
    const eduRate = (e) => computeRate((r) => D.E[r[4]] === e && fy(r) && fs(r) && fr(r)).r;
    const ev = D.E.map(eduRate);
    const L = D.E.map(shortLabel);

    mk("line", lineCanvasRef, {
      type: "line",
      data: {
        labels: L,
        datasets: [
          {
            data: ev.map((v) => (v != null ? v * 100 : 0)),
            borderColor: SLATE,
            backgroundColor: (c) => grad(c, SLATE),
            fill: true,
            tension: 0.3,
            borderWidth: 3,
            pointRadius: 5,
            pointBackgroundColor: "#fff",
            pointBorderColor: SLATE,
            pointBorderWidth: 2
          }
        ]
      },
      options: {
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (c) => c.parsed.y.toFixed(2) + "%" } }
        },
        scales: {
          x: {
            ticks: tick,
            grid: { display: false },
            title: { display: true, text: "EducationLevel", color: INK }
          },
          y: {
            ticks: { ...tick, callback: (v) => v + "%" },
            grid: gridc,
            title: { display: true, text: "Employment Rate %", color: INK }
          }
        }
      }
    });

    mk("bar", barCanvasRef, {
      type: "bar",
      data: {
        labels: D.E,
        datasets: [
          {
            data: ev.map((v) => (v != null ? v * 100 : 0)),
            backgroundColor: SLATE,
            borderRadius: 8,
            borderSkipped: false
          }
        ]
      },
      options: {
        indexAxis: "y",
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (c) => c.parsed.x.toFixed(2) + "%" } }
        },
        scales: {
          x: {
            min: 0,
            max: 100,
            ticks: { ...tick, callback: (v) => v + "%" },
            grid: gridc,
            title: { display: true, text: "Employment Rate %", color: INK }
          },
          y: { reverse: true, ticks: tick, grid: { display: false } }
        }
      }
    });

    // 3. Education and sex
    const sx = ["Female", "Male"];
    const sc = [SLATE, PINK];
    mk("col", colCanvasRef, {
      type: "bar",
      data: {
        labels: L,
        datasets: sx.map((s, i) => ({
          label: s,
          backgroundColor: sc[i],
          borderRadius: 6,
          borderSkipped: false,
          data: D.E.map((e) => {
            const v = computeRate(
              (r) => D.E[r[4]] === e && D.S[r[3]] === s && fy(r) && fs(r) && fr(r)
            ).r;
            return v == null ? null : v * 100;
          })
        }))
      },
      options: {
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (c) => c.dataset.label + ": " + c.parsed.y.toFixed(2) + "%" } }
        },
        scales: {
          x: {
            ticks: tick,
            grid: { display: false },
            title: { display: true, text: "EducationLevel", color: INK }
          },
          y: {
            min: 0,
            max: 100,
            ticks: { ...tick, callback: (v) => v + "%" },
            grid: gridc,
            title: { display: true, text: "Employment Rate %", color: INK }
          }
        }
      }
    });

    // 4. Quarter trend
    const yq = [
      ...new Set(
        D.rows.filter((r) => fy(r) && fs(r) && fr(r)).map((r) => D.Y[r[0]] + "-Q" + r[1])
      )
    ].sort();
    const qv = yq.map((k) => {
      const [y, q] = k.split("-Q");
      const r = computeRate((row) => D.Y[row[0]] === Number(y) && row[1] === Number(q) && fs(row) && fr(row)).r;
      return r != null ? r * 100 : 0;
    });

    mk("q", qCanvasRef, {
      type: "line",
      data: {
        labels: yq,
        datasets: [
          {
            data: qv,
            borderColor: PINK,
            backgroundColor: (c) => grad(c, PINK),
            fill: true,
            tension: 0.35,
            borderWidth: 3,
            pointRadius: yq.length > 12 ? 0 : 3,
            pointBackgroundColor: PINK
          }
        ]
      },
      options: {
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (c) => c.parsed.y.toFixed(2) + "%" } }
        },
        scales: {
          x: {
            ticks: { ...tick, maxRotation: 60, autoSkip: true },
            grid: { display: false },
            title: { display: true, text: "YearQtr", color: INK }
          },
          y: {
            ticks: { ...tick, callback: (v) => Number(v).toFixed(0) + "%" },
            grid: gridc,
            title: { display: true, text: "Employment Rate %", color: INK }
          }
        }
      }
    });

    return () => {
      Object.values(chartInstancesRef.current).forEach((inst) => inst && inst.destroy());
    };
  }, [selectedYears, selectedSex, selectedRegions]);

  const toggleYear = (y) => {
    setSelectedYears((prev) => {
      const next = new Set(prev);
      next.has(y) ? next.delete(y) : next.add(y);
      return next;
    });
  };

  const toggleSex = (s) => {
    setSelectedSex((prev) => {
      const next = new Set(prev);
      next.has(s) ? next.delete(s) : next.add(s);
      return next;
    });
  };

  const toggleRegion = (r) => {
    setSelectedRegions((prev) => {
      const next = new Set(prev);
      next.has(r) ? next.delete(r) : next.add(r);
      return next;
    });
  };

  const resetFilters = () => {
    setSelectedYears(new Set(DEFAULT_YEARS));
    setSelectedSex(new Set(D.S));
    setSelectedRegions(new Set(D.R));
  };

  const regionLabel =
    selectedRegions.size === 0 || selectedRegions.size === D.R.length
      ? "All"
      : selectedRegions.size === 1
      ? [...selectedRegions][0]
      : `${selectedRegions.size} selected`;

  return (
    <div className="ee-root">
      <style>{`
        .ee-root {
          --page1: #08070d;
          --page2: #100e1b;
          --shell: rgba(18, 14, 34, 0.85);
          --bx: #151124;
          --ink: #f8fafc;
          --muted: #94a3b8;
          --slate: #8b5cf6;
          --onslate: #fff;
          --pink: #f59e0b;
          --chip: rgba(255, 255, 255, 0.05);
          --chipink: #cbd5e1;
          --grid: rgba(168, 115, 255, 0.15);
          --shadow: 0 12px 36px rgba(0,0,0,0.55);
          min-height: 100vh;
          background: linear-gradient(160deg, var(--page1), var(--page2));
          color: var(--ink);
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          padding: 12px;
          box-sizing: border-box;
        }
        .ee-root * { box-sizing: border-box; }
        .ee-shell { max-width: 1560px; margin: 0 auto; padding: 18px; border-radius: 24px; background: var(--shell); border: 1px solid rgba(168, 115, 255, 0.2); }
        .ee-top { display: flex; align-items: center; gap: 14px; background: var(--bx); border-radius: 18px; padding: 12px 18px; box-shadow: var(--shadow); margin-bottom: 16px; border: 1px solid rgba(168, 115, 255, 0.2); flex-wrap: wrap; }
        .ee-logo { flex: none; width: 38px; height: 38px; border-radius: 12px; background: linear-gradient(135deg, #8b5cf6, #4f46e5); color: #fff; display: grid; place-items: center; font-weight: 800; box-shadow: 0 0 16px rgba(139, 92, 246, 0.4); }
        .ee-top h1 { margin: 0; font-size: clamp(15px, 1.6vw, 19px); font-weight: 800; font-family: 'Space Grotesk', sans-serif; color: #fff; line-height: 1.2; }
        .ee-top p { margin: 2px 0 0; font-size: 11px; color: var(--muted); }
        .ee-back-btn { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 10px; background: rgba(139, 92, 246, 0.12); border: 1px solid rgba(139, 92, 246, 0.35); color: #c4b5fd; text-decoration: none; font-size: 11.5px; font-weight: 700; cursor: pointer; }
        .ee-drive-btn { display: inline-flex; align-items: center; gap: 6px; padding: 7px 16px; border-radius: 10px; background: linear-gradient(135deg, #7c3aed, #4f46e5); border: 1px solid rgba(196, 181, 253, 0.3); color: #fff; text-decoration: none; font-size: 12px; font-weight: 700; box-shadow: 0 4px 14px rgba(124, 58, 237, 0.4); margin-left: auto; }
        .ee-pill { flex: none; border: 1px solid rgba(168, 115, 255, 0.25); background: var(--chip); color: var(--chipink); font: 600 12px 'Plus Jakarta Sans', sans-serif; padding: 8px 16px; border-radius: 999px; cursor: pointer; }
        .ee-pill:hover { background: var(--slate); color: var(--onslate); }
        .ee-main { display: grid; grid-template-columns: 300px minmax(0,1fr) 330px; gap: 16px; align-items: start; }
        .ee-col { display: flex; flex-direction: column; gap: 16px; min-width: 0; }
        .ee-center { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; min-width: 0; }
        .ee-center .wide { grid-column: 1 / 3; }
        .ee-bx { background: var(--bx); border-radius: 20px; padding: 16px 18px; box-shadow: var(--shadow); min-width: 0; border: 1px solid rgba(168, 115, 255, 0.15); }
        .ee-hd h3 { margin: 0; font-size: 15px; font-weight: 600; color: #fff; }
        .ee-hd p { margin: 2px 0 10px; font-size: 12px; color: var(--muted); }
        .ee-lbl { font-size: 12px; font-weight: 500; color: var(--muted); margin: 14px 0 6px; }
        .ee-tiles { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
        .ee-tile, .ee-seg button, .ee-head { border: 0; border-radius: 12px; background: var(--chip); color: var(--chipink); font: 600 13px 'Plus Jakarta Sans', system-ui, sans-serif; padding: 10px 0; cursor: pointer; }
        .ee-tile.on, .ee-seg button.on { background: var(--slate); color: var(--onslate); box-shadow: 0 4px 12px rgba(67, 97, 238, 0.3); }
        .ee-seg { display: flex; gap: 6px; }
        .ee-seg button { flex: 1; }
        .ee-seg button.act { background: transparent; color: var(--slate); box-shadow: inset 0 0 0 1.5px var(--slate); }
        .ee-dd { position: relative; }
        .ee-head { width: 100%; display: flex; justify-content: space-between; padding: 10px 14px; }
        .ee-dpanel { position: absolute; z-index: 20; left: 0; right: 0; top: calc(100% + 6px); background: var(--bx); border: 1px solid rgba(168, 115, 255, 0.25); border-radius: 14px; box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5); max-height: 260px; overflow: auto; padding: 6px 12px; }
        .ee-dpanel label { display: flex; gap: 8px; font-size: 13px; padding: 5px 0; cursor: pointer; }
        .ee-dpanel input { accent-color: var(--slate); }
        .ee-root table { border-collapse: separate; border-spacing: 0 3px; width: 100%; font-size: 12px; }
        .ee-root th { font-weight: 500; color: var(--muted); text-align: right; padding: 2px 6px; }
        .ee-root td { padding: 6px 8px; text-align: right; }
        .ee-root th:first-child, .ee-root td:first-child { text-align: left; padding-left: 0; }
        .ee-root tfoot td, .ee-root td.t { font-weight: 700; }
        .ee-kpis { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .ee-kpi { position: relative; border-radius: 18px; padding: 14px; color: #fff; min-height: 98px; box-shadow: 0 8px 18px rgba(30, 40, 80, 0.14); }
        .ee-kpi b { display: block; font-size: clamp(20px, 2vw, 26px); font-weight: 700; line-height: 1.25; padding-right: 26px; }
        .ee-kpi span { font-size: 12px; opacity: 0.95; }
        .ee-kpi i { position: absolute; top: 10px; right: 10px; width: 28px; height: 28px; border-radius: 50%; background: rgba(255, 255, 255, 0.28); display: grid; place-items: center; font-style: normal; font-size: 14px; }
        .ee-k1 { background: linear-gradient(135deg, #ff9a76, #ee5a30); }
        .ee-k2 { background: linear-gradient(135deg, #4cc6f2, #2a8fe0); }
        .ee-k3 { background: linear-gradient(135deg, #ffa94d, #ee7a10); }
        .ee-k4 { background: linear-gradient(135deg, #2fc9a8, #0e9a80); }
        .ee-ch { position: relative; height: 250px; }
        .ee-tall .ee-ch { height: 340px; }
        .ee-wide .ee-ch { height: 300px; }
        .ee-legend { font-size: 12px; display: flex; gap: 12px; color: var(--muted); margin: 2px 0 8px; }
        .ee-legend i { display: inline-block; width: 9px; height: 9px; border-radius: 50%; margin-right: 5px; }
        @media (max-width: 1200px) {
          .ee-main { grid-template-columns: 1fr 1fr; }
          .ee-col:first-child { grid-column: 1 / 3; }
          .ee-center { grid-column: 1 / 3; grid-row: 3; }
        }
        @media (max-width: 720px) {
          .ee-main, .ee-center { grid-template-columns: 1fr; }
          .ee-col:first-child, .ee-center, .ee-center .wide { grid-column: 1; }
        }
      `}</style>

      <div className="ee-shell">
        <header className="ee-top">
          {!embedded && (
            <button
              type="button"
              className="ee-back-btn"
              onClick={() => (onBack ? onBack() : (window.location.href = "/#powerbi-activities"))}
            >
              ← Portfolio
            </button>
          )}
          <div className="ee-logo" aria-hidden="true">
            EE
          </div>
          <div>
            <h1>Education &amp; Employment Rate (2019–2025)</h1>
            <p>Denmark N. Catolico · Survey results by region, sex and education level</p>
          </div>
          <a
            href={GOOGLE_DRIVE_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="ee-drive-btn"
          >
            Download .PBIX ↗
          </a>
          <button type="button" className="ee-pill" onClick={resetFilters}>
            Reset filters
          </button>
        </header>

        <div className="ee-main">
          <aside className="ee-col">
            <section className="ee-bx">
              <div className="ee-hd">
                <h3>Filters</h3>
                <p>Applies to every chart</p>
              </div>
              <div className="ee-lbl" style={{ marginTop: 0 }}>
                Year
              </div>
              <div className="ee-tiles">
                {D.Y.map((y) => (
                  <button
                    type="button"
                    key={y}
                    className={`ee-tile ${selectedYears.has(y) ? "on" : ""}`}
                    onClick={() => toggleYear(y)}
                  >
                    {y}
                  </button>
                ))}
              </div>

              <div className="ee-lbl">Sex</div>
              <div className="ee-seg">
                <button
                  type="button"
                  className="act"
                  onClick={() =>
                    setSelectedSex((prev) => (prev.size ? new Set() : new Set(D.S)))
                  }
                >
                  {selectedSex.size ? "Deselect all" : "Select all"}
                </button>
                {["Female", "Male"].map((s) => (
                  <button
                    type="button"
                    key={s}
                    className={selectedSex.has(s) ? "on" : ""}
                    onClick={() => toggleSex(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="ee-lbl">Region</div>
              <div className="ee-dd" ref={dropdownRef}>
                <button
                  type="button"
                  className="ee-head"
                  onClick={() => setDropdownOpen((o) => !o)}
                >
                  <span>{regionLabel}</span>
                  <span>⌄</span>
                </button>
                {dropdownOpen && (
                  <div className="ee-dpanel">
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedRegions.size === D.R.length}
                        onChange={(e) =>
                          setSelectedRegions(e.target.checked ? new Set(D.R) : new Set())
                        }
                      />{" "}
                      Select all
                    </label>
                    {D.R.map((r) => (
                      <label key={r}>
                        <input
                          type="checkbox"
                          checked={selectedRegions.has(r)}
                          onChange={() => toggleRegion(r)}
                        />{" "}
                        {r}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section className="ee-bx">
              <div className="ee-hd">
                <h3>Employment rate by year</h3>
                <p>Education level, selected years</p>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table>
                  <thead>
                    <tr>
                      <th>Education level</th>
                      {activeYears.map((y) => (
                        <th key={y}>{y}</th>
                      ))}
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {D.E.map((e, i) => (
                      <tr key={e}>
                        <td>{e}</td>
                        {matrixCells[i].map((v, j) => (
                          <td key={activeYears[j]} style={cellStyle(v)}>
                            {pct(v)}
                          </td>
                        ))}
                        <td className="t">
                          {pct(computeRate((r) => D.E[r[4]] === e && fy(r) && fs(r) && fr(r)).r)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td>Total</td>
                      {activeYears.map((y) => (
                        <td key={y}>
                          {pct(computeRate((r) => D.Y[r[0]] === y && fs(r) && fr(r)).r)}
                        </td>
                      ))}
                      <td>{pct(base.r)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </section>
          </aside>

          <main className="ee-center">
            <section className="ee-bx ee-tall">
              <div className="ee-hd">
                <h3>Region gap vs national</h3>
                <p>Percentage points</p>
              </div>
              <div className="ee-ch">
                <canvas ref={gapCanvasRef} />
              </div>
            </section>

            <section className="ee-bx ee-tall">
              <div className="ee-hd">
                <h3>Employment rate by education</h3>
                <p>Across education levels</p>
              </div>
              <div className="ee-ch">
                <canvas ref={lineCanvasRef} />
              </div>
            </section>

            <section className="ee-bx ee-wide wide">
              <div className="ee-hd">
                <h3>Employment rate by quarter</h3>
                <p>Trend over the selected years</p>
              </div>
              <div className="ee-ch">
                <canvas ref={qCanvasRef} />
              </div>
            </section>
          </main>

          <aside className="ee-col">
            <div className="ee-kpis">
              <div className="ee-kpi ee-k1">
                <i aria-hidden="true">↘</i>
                <b>{pct(base.r == null ? null : 1 - base.r)}</b>
                <span>Unemployment Rate %</span>
              </div>
              <div className="ee-kpi ee-k2">
                <i aria-hidden="true">∑</i>
                <b>{fmtLF(base.l)}</b>
                <span>Labor Force</span>
              </div>
              <div className="ee-kpi ee-k3">
                <i aria-hidden="true">±</i>
                <b>{changeVsPy}</b>
                <span>Change vs PY (pts)</span>
              </div>
              <div className="ee-kpi ee-k4">
                <i aria-hidden="true">↗</i>
                <b>{pct(base.r)}</b>
                <span>Employment Rate %</span>
              </div>
            </div>

            <section className="ee-bx">
              <div className="ee-hd">
                <h3>Education and sex</h3>
                <p>Employment rate by group</p>
              </div>
              <div className="ee-legend">
                Sex{" "}
                <span>
                  <i style={{ background: "#8b5cf6" }} />
                  Female
                </span>
                <span>
                  <i style={{ background: "#f59e0b" }} />
                  Male
                </span>
              </div>
              <div className="ee-ch">
                <canvas ref={colCanvasRef} />
              </div>
            </section>

            <section className="ee-bx">
              <div className="ee-hd">
                <h3>Employment rate by education level</h3>
                <p>Share of the labor force employed</p>
              </div>
              <div className="ee-ch">
                <canvas ref={barCanvasRef} />
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

