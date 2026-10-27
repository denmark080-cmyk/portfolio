import React, { useState, useEffect, useRef, useMemo } from "react";
import Chart from "chart.js/auto";
import { MARKETING_DATA as D } from "../data/marketingData";
import { GOOGLE_DRIVE_REPO_URL } from "../data/portfolioData";

const Q_MAP = [0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3];
const PAL = ["#4a63e7", "#f2a33a", "#1fb5a3", "#f0644d", "#8e6bf0", "#33b5e8", "#e8588f"];
const TILE_BG = [
  "linear-gradient(135deg,#1fb5a3,#4ad6c0)",
  "linear-gradient(135deg,#f59a23,#f7b84b)",
  "linear-gradient(135deg,#33b5e8,#5fd0f2)",
  "linear-gradient(135deg,#f0644d,#f58a63)",
  "linear-gradient(135deg,#5b6cf0,#8392f8)"
];

const dv = (a, b) => (b ? a / b : 0);
const fm = (n) => {
  const x = Math.abs(n);
  return x >= 1e9
    ? (n / 1e9).toFixed(2) + "B"
    : x >= 1e6
    ? (n / 1e6).toFixed(2) + "M"
    : x >= 1e3
    ? (n / 1e3).toFixed(1) + "K"
    : n.toFixed(0);
};

const sumRows = (rs) => {
  const a = { imp: 0, clk: 0, cv: 0, sp: 0, rv: 0 };
  for (const r of rs) {
    a.imp += r[5];
    a.clk += r[6];
    a.cv += r[7];
    a.sp += r[8];
    a.rv += r[9];
  }
  return a;
};

export default function MarketingDashboard({ embedded = false, onBack }) {
  const [selectedQuarters, setSelectedQuarters] = useState(() => new Set());
  const [segment, setSegment] = useState("All");
  const [product, setProduct] = useState("Premium Plan");

  const lineCanvasRef = useRef(null);
  const scatterCanvasRef = useRef(null);
  const chartsRef = useRef({});

  const inQ = (mi) => !selectedQuarters.size || selectedQuarters.has(Q_MAP[mi]);

  const filteredRows = useMemo(
    () =>
      D.rows.filter(
        (r) =>
          inQ(r[0]) &&
          (segment === "All" || D.sg[r[3]] === segment) &&
          (product === "All" || D.pr[r[4]] === product)
      ),
    [selectedQuarters, segment, product]
  );

  const totals = useMemo(() => sumRows(filteredRows), [filteredRows]);

  const channelsData = useMemo(
    () => D.ch.map((n, i) => ({ n, i, ...sumRows(filteredRows.filter((r) => r[1] === i)) })),
    [filteredRows]
  );

  const sortedChannels = useMemo(
    () => [...channelsData].sort((a, b) => b.rv - a.rv),
    [channelsData]
  );

  // ROAS Heatmap computation
  const heatmapData = useMemo(() => {
    const cell = (rr) => {
      const s = sumRows(rr);
      return s.sp ? dv(s.rv, s.sp) : null;
    };
    const grid = D.rg.map((n, ri) => ({
      n,
      vals: [0, 1, 2, 3].map((q) =>
        inQ(q * 3) ? cell(filteredRows.filter((r) => r[2] === ri && Q_MAP[r[0]] === q)) : null
      ),
      tot: cell(filteredRows.filter((r) => r[2] === ri))
    }));
    const all = grid.flatMap((g) => g.vals).filter((x) => x !== null);
    const lo = all.length ? Math.min(...all) : 0;
    const hi = all.length ? Math.max(...all) : 1;
    const A = [226, 85, 96];
    const B = [24, 160, 90];
    const col = (x) => {
      const p = hi === lo ? 0.5 : (x - lo) / (hi - lo);
      return `rgb(${A.map((a, i) => Math.round(a + (B[i] - a) * p)).join(",")})`;
    };
    const qTotals = [0, 1, 2, 3].map((q) =>
      inQ(q * 3) ? cell(filteredRows.filter((r) => Q_MAP[r[0]] === q)) : null
    );
    const grandTotal = cell(filteredRows);
    return { grid, col, qTotals, grandTotal };
  }, [filteredRows, selectedQuarters]);

  useEffect(() => {
    const BL = "#7b8cff";
    const OR = "#f5b455";
    const MUTE = "#8e97b3";
    const LINE = "#2b3248";

    const ax = (title, pos, grid) => ({
      position: pos,
      title: { display: !!title, text: title, color: MUTE },
      ticks: { callback: fm, color: MUTE },
      beginAtZero: true,
      border: { display: false },
      grid: { drawOnChartArea: grid, borderDash: [3, 4], color: LINE }
    });

    const fill = (c) => (ctx) => {
      const a = ctx.chart.chartArea;
      if (!a) return "transparent";
      const g = ctx.chart.ctx.createLinearGradient(0, a.top, 0, a.bottom);
      g.addColorStop(0, c + "55");
      g.addColorStop(1, c + "00");
      return g;
    };

    const months = D.m.map((_, i) => i).filter(inQ);
    const byMonth = (mi) => sumRows(filteredRows.filter((r) => r[0] === mi));
    const ds = (l, k, c, y) => ({
      label: l,
      data: months.map((i) => byMonth(i)[k]),
      borderColor: c,
      backgroundColor: fill(c),
      fill: true,
      yAxisID: y,
      tension: 0.45,
      borderWidth: 2.5,
      pointRadius: 0,
      pointHoverRadius: 6,
      pointBackgroundColor: c
    });

    if (chartsRef.current.line) chartsRef.current.line.destroy();
    if (lineCanvasRef.current) {
      chartsRef.current.line = new Chart(lineCanvasRef.current, {
        type: "line",
        data: {
          labels: months.map((i) => D.m[i]),
          datasets: [ds("Total revenue", "rv", BL, "y"), ds("Total spend", "sp", OR, "y1")]
        },
        options: {
          animation: false,
          maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          scales: {
            x: { grid: { display: false }, border: { display: false }, ticks: { color: MUTE } },
            y: ax("", "left", true),
            y1: ax("", "right", false)
          },
          plugins: {
            legend: {
              position: "top",
              align: "end",
              labels: { usePointStyle: true, boxWidth: 8, color: MUTE }
            },
            tooltip: { callbacks: { label: (c) => `${c.dataset.label}: ${fm(c.parsed.y)}` } }
          }
        }
      });
    }

    if (chartsRef.current.scatter) chartsRef.current.scatter.destroy();
    if (scatterCanvasRef.current) {
      chartsRef.current.scatter = new Chart(scatterCanvasRef.current, {
        type: "scatter",
        data: {
          datasets: channelsData.map((c) => ({
            label: c.n,
            data: [{ x: c.sp, y: c.rv }],
            backgroundColor: PAL[c.i % 7],
            pointRadius: 7,
            pointHoverRadius: 9
          }))
        },
        options: {
          animation: false,
          maintainAspectRatio: false,
          scales: {
            x: ax("Total spend", "bottom", true),
            y: ax("Total revenue", "left", true)
          },
          plugins: {
            legend: {
              position: "bottom",
              labels: { usePointStyle: true, boxWidth: 8, color: MUTE }
            },
            tooltip: {
              callbacks: {
                label: (c) =>
                  `${c.dataset.label}: spend ${fm(c.parsed.x)}, revenue ${fm(c.parsed.y)}`
              }
            }
          }
        }
      });
    }

    return () => {
      if (chartsRef.current.line) chartsRef.current.line.destroy();
      if (chartsRef.current.scatter) chartsRef.current.scatter.destroy();
    };
  }, [filteredRows, channelsData, selectedQuarters]);

  const toggleQuarter = (q) => {
    setSelectedQuarters((prev) => {
      const next = new Set(prev);
      next.has(q) ? next.delete(q) : next.add(q);
      return next;
    });
  };

  const subtitleText =
    (selectedQuarters.size
      ? [...selectedQuarters]
          .sort()
          .map((q) => "Q" + (q + 1))
          .join(", ")
      : "All quarters") +
    " · " +
    (segment === "All" ? "All segments" : segment) +
    " · " +
    (product === "All" ? "All products" : product);

  const kpis = [
    [fm(totals.rv), "Total revenue"],
    [fm(totals.sp), "Total spend"],
    [dv(totals.rv, totals.sp).toFixed(2), "ROAS"],
    [(dv(totals.cv, totals.clk) * 100).toFixed(1) + "%", "Conversion rate"],
    [dv(totals.sp, totals.cv).toFixed(2), "CPA (cost per acquisition)"]
  ];

  const funnelSteps = [
    ["Impressions", totals.imp, null],
    ["Clicks", totals.clk, totals.imp],
    ["Conversions", totals.cv, totals.clk]
  ];

  return (
    <div className="mk-root">
      <style>{`
        .mk-root {
          --bg1: #0e111a;
          --bg2: #161a26;
          --shell: rgba(30, 36, 52, 0.5);
          --card: #1f2434;
          --ink: #eaeefc;
          --mute: #8e97b3;
          --line: #2b3248;
          --blue: #7b8cff;
          --org: #f5b455;
          --pill: #2a3150;
          --sh: 0 10px 28px rgba(0, 0, 0, 0.35);
          min-height: 100vh;
          background: linear-gradient(160deg, var(--bg1), var(--bg2));
          color: var(--ink);
          font: 13px/1.4 'Plus Jakarta Sans', system-ui, sans-serif;
          padding: 18px;
          box-sizing: border-box;
        }
        .mk-root * { box-sizing: border-box; }
        .mk-shell { max-width: 1480px; margin: 0 auto; background: var(--shell); border-radius: 28px; padding: 18px; box-shadow: var(--sh); }
        .mk-card { background: var(--card); border-radius: 18px; padding: 16px; box-shadow: var(--sh); min-width: 0; }
        .mk-top { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; padding: 14px 20px; border: 1px solid rgba(168, 115, 255, 0.25); }
        .mk-back-btn { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 10px; background: rgba(139, 92, 246, 0.12); border: 1px solid rgba(139, 92, 246, 0.35); color: #c4b5fd; text-decoration: none; font-size: 11.5px; font-weight: 700; cursor: pointer; }
        .mk-drive-btn { display: inline-flex; align-items: center; gap: 6px; padding: 7px 16px; border-radius: 10px; background: linear-gradient(135deg, #7c3aed, #4f46e5); border: 1px solid rgba(196, 181, 253, 0.3); color: #fff; text-decoration: none; font-size: 12px; font-weight: 700; box-shadow: 0 4px 14px rgba(124, 58, 237, 0.4); }
        .mk-root h2 { margin: 0 0 2px; font-size: 15px; font-weight: 600; color: #fff; }
        .mk-cap { color: var(--mute); font-size: 12px; margin: 0 0 10px; }
        .mk-layout { display: grid; gap: 16px; grid-template-columns: 250px minmax(0,1fr) 300px; grid-template-areas: "filters center tiles" "channels center funnel"; grid-template-rows: auto 1fr; }
        .mk-filters { grid-area: filters; }
        .mk-channels { grid-area: channels; }
        .mk-center { grid-area: center; display: flex; flex-direction: column; gap: 16px; min-width: 0; }
        .mk-tiles { grid-area: tiles; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .mk-funnel { grid-area: funnel; }
        .mk-lbl { display: block; margin: 12px 0 6px; color: var(--mute); font-size: 12px; }
        .mk-qs { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
        .mk-q { padding: 8px 0; border: 0; background: var(--line); color: var(--mute); border-radius: 10px; font: inherit; font-weight: 600; cursor: pointer; }
        .mk-q.active { background: var(--pill); color: var(--blue); }
        .mk-root select { width: 100%; padding: 9px 10px; border: 1px solid var(--line); border-radius: 10px; background: var(--card); color: var(--ink); font: inherit; }
        .mk-t { border-radius: 16px; padding: 16px 14px; color: #fff; box-shadow: var(--sh); }
        .mk-t b { display: block; font-size: 26px; font-weight: 700; line-height: 1.1; }
        .mk-t span { font-size: 12px; opacity: 0.95; }
        .mk-t.w { grid-column: 1 / -1; }
        .mk-box { position: relative; height: 300px; }
        .mk-box.s { height: 250px; }
        .mk-duo { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 16px; }
        .mk-row { display: grid; grid-template-columns: 30px 1fr auto; gap: 2px 10px; align-items: center; margin-bottom: 14px; }
        .mk-ic { grid-row: span 2; width: 30px; height: 30px; border-radius: 9px; color: #fff; font-weight: 700; display: grid; place-items: center; }
        .mk-row small { color: var(--mute); }
        .mk-row b { font-weight: 600; }
        .mk-bar { grid-column: 2 / 4; height: 5px; border-radius: 5px; background: var(--line); overflow: hidden; }
        .mk-bar i { display: block; height: 100%; border-radius: 5px; }
        .mk-root table { border-collapse: collapse; width: 100%; font-variant-numeric: tabular-nums; font-size: 12px; }
        .mk-root th, .mk-root td { padding: 7px 4px; text-align: center; }
        .mk-root th:first-child, .mk-root td:first-child { text-align: left; }
        .mk-root thead th { color: var(--mute); font-weight: 500; border-bottom: 1px solid var(--line); }
        .mk-root td.h { color: #fff; font-weight: 600; border: 2px solid var(--card); border-radius: 8px; }
        .mk-tot { font-weight: 700; }
        .mk-f { display: grid; grid-template-columns: 78px 1fr; gap: 12px 8px; align-items: center; margin-top: 8px; }
        .mk-f em { font-style: normal; color: var(--mute); }
        .mk-f i { display: block; height: 20px; min-width: 4px; border-radius: 10px; }
        .mk-f small { display: block; color: var(--mute); margin-top: 2px; }
        @media (max-width: 1150px) {
          .mk-layout { grid-template-columns: 1fr; grid-template-areas: "tiles" "filters" "center" "channels" "funnel"; }
          .mk-tiles { grid-template-columns: repeat(3, minmax(0,1fr)); }
          .mk-t.w { grid-column: auto; }
        }
        @media (max-width: 760px) {
          .mk-duo { grid-template-columns: 1fr; }
          .mk-tiles { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <div className="mk-shell">
        <header className="mk-card mk-top">
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            {!embedded && (
              <button
                type="button"
                className="mk-back-btn"
                onClick={() => (onBack ? onBack() : (window.location.href = "/#powerbi-activities"))}
              >
                ← Portfolio
              </button>
            )}
            <div>
              <h1
                style={{
                  fontSize: "18px",
                  margin: 0,
                  fontFamily: "'Space Grotesk', sans-serif",
                  color: "#fff"
                }}
              >
                2025 Marketing Performance Dashboard
              </h1>
              <p style={{ margin: "2px 0 0", fontSize: "11px", color: "var(--mute)" }}>
                Denmark N. Catolico · Commercial Intelligence &amp; Multi-Channel Funnel Analytics
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "11.5px", color: "var(--mute)" }}>{subtitleText}</span>
            <a
              href={GOOGLE_DRIVE_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mk-drive-btn"
            >
              Download .PBIX ↗
            </a>
          </div>
        </header>

        <div className="mk-layout">
          <section className="mk-card mk-filters">
            <h2>Filters</h2>
            <p className="mk-cap">Narrow every chart</p>
            <span className="mk-lbl">Quarter</span>
            <div className="mk-qs">
              {[0, 1, 2, 3].map((q) => (
                <button
                  type="button"
                  key={q}
                  className={`mk-q ${selectedQuarters.has(q) ? "active" : ""}`}
                  onClick={() => toggleQuarter(q)}
                >
                  Q{q + 1}
                </button>
              ))}
            </div>

            <label className="mk-lbl">Customer segment</label>
            <select value={segment} onChange={(e) => setSegment(e.target.value)}>
              {["All", ...D.sg].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <label className="mk-lbl">Product</label>
            <select value={product} onChange={(e) => setProduct(e.target.value)}>
              {["All", ...D.pr].map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </section>

          <section className="mk-card mk-channels">
            <h2>Revenue by channel</h2>
            <p className="mk-cap">Share of total revenue</p>
            <div>
              {sortedChannels.map((c) => {
                const p = dv(c.rv, totals.rv) * 100;
                return (
                  <div className="mk-row" key={c.n}>
                    <div className="mk-ic" style={{ background: PAL[c.i % 7] }}>
                      {c.n[0]}
                    </div>
                    <b>{c.n}</b>
                    <b>{p.toFixed(0)}%</b>
                    <small>{fm(c.rv)}</small>
                    <small style={{ textAlign: "right" }}>ROAS {dv(c.rv, c.sp).toFixed(1)}</small>
                    <div className="mk-bar">
                      <i style={{ width: `${p}%`, background: PAL[c.i % 7] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <div className="mk-center">
            <section className="mk-card">
              <h2>Revenue vs spend by month</h2>
              <p className="mk-cap">Revenue on the left axis, spend on the right</p>
              <div className="mk-box">
                <canvas ref={lineCanvasRef} />
              </div>
            </section>

            <div className="mk-duo">
              <section className="mk-card">
                <h2>Channel efficiency</h2>
                <p className="mk-cap">Spend vs revenue</p>
                <div className="mk-box s">
                  <canvas ref={scatterCanvasRef} />
                </div>
              </section>

              <section className="mk-card">
                <h2>ROAS heatmap</h2>
                <p className="mk-cap">By region and quarter</p>
                <div style={{ overflowX: "auto" }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Region</th>
                        {[1, 2, 3, 4].map((q) => (
                          <th key={q}>Q{q}</th>
                        ))}
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {heatmapData.grid.map((g) => (
                        <tr key={g.n}>
                          <th scope="row" style={{ fontWeight: 400 }}>
                            {g.n}
                          </th>
                          {g.vals.map((x, idx) =>
                            x === null ? (
                              <td key={idx} />
                            ) : (
                              <td
                                key={idx}
                                className="h"
                                style={{ background: heatmapData.col(x) }}
                              >
                                {x.toFixed(2)}
                              </td>
                            )
                          )}
                          <td className="mk-tot">
                            {g.tot === null ? "" : g.tot.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      <tr className="mk-tot">
                        <th scope="row">Total</th>
                        {heatmapData.qTotals.map((val, idx) => (
                          <td key={idx}>{val === null ? "" : val.toFixed(2)}</td>
                        ))}
                        <td>
                          {heatmapData.grandTotal === null
                            ? ""
                            : heatmapData.grandTotal.toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </div>

          <div className="mk-tiles">
            {kpis.map((k, i) => (
              <div
                key={k[1]}
                className={`mk-t ${i === 4 ? "w" : ""}`}
                style={{ background: TILE_BG[i] }}
              >
                <b>{k[0]}</b>
                <span>{k[1]}</span>
              </div>
            ))}
          </div>

          <section className="mk-card mk-funnel">
            <h2>Marketing funnel</h2>
            <p className="mk-cap">Impressions to conversions</p>
            <div className="mk-f">
              {funnelSteps.map((s, idx) => {
                const bg =
                  idx === 0
                    ? "linear-gradient(90deg,#4a63e7,#33b5e8)"
                    : idx === 1
                    ? "linear-gradient(90deg,#f2a33a,#f7c25d)"
                    : "linear-gradient(90deg,#1fb5a3,#4ad6c0)";
                return (
                  <React.Fragment key={s[0]}>
                    <em>{s[0]}</em>
                    <div>
                      <i
                        style={{
                          width: `${Math.max(1, totals.imp ? (s[1] / totals.imp) * 100 : 0)}%`,
                          background: bg
                        }}
                      />
                      <small>
                        {fm(s[1])}
                        {s[2] !== null
                          ? ` · ${(dv(s[1], s[2]) * 100).toFixed(1)}% of previous`
                          : ""}
                      </small>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

