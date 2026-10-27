import React, { useState, useMemo } from "react";
import { GOOGLE_DRIVE_REPO_URL } from "../data/portfolioData";

const ORDERS_RAW = [
  [90002, 76.04, 2],
  [90003, 107.61, 1],
  [90004, 182.55, 3],
  [90005, 444.54, 3],
  [90006, 330.78, 3],
  [90007, 243.48, 4],
  [90008, 206.26, 2],
  [90009, 301.2, 2],
  [90010, 643.88, 4],
  [90011, 298.92, 4],
  [90012, 453.64, 4],
  [90013, 425.46, 3],
  [90014, 197.54, 2],
  [90015, 286.86, 3],
  [90016, 135.76, 1],
  [90017, 696.48, 4],
  [90018, 55.9, 1],
  [90019, 131.79, 1],
  [90020, 201.4, 4],
  [90021, 293.84, 4],
  [90022, 56.03, 1],
  [90023, 593.28, 4],
  [90024, 315.34, 2],
  [90025, 519.76, 4],
  [90026, 138.42, 1],
  [90027, 52.62, 2],
  [90028, 84.17, 1],
  [90029, 251.66, 2],
  [90030, 27.09, 1],
  [90031, 610.28, 4],
  [90032, 119.88, 2],
  [90034, 424.12, 4],
  [90037, 589.48, 4]
];

const AVATAR_COLS = ["#3d5af1", "#ef476f", "#27b27b", "#f5a54c", "#27a9e8", "#8e6bf0"];
const GANTT_MONTHS = [
  ["Jan", 0, 31, "#f5a54c"],
  ["Feb", 31, 29, "#3d5af1"],
  ["Mar", 60, 31, "#27b27b"],
  ["Apr", 91, 9, "#ef476f"]
];

function fmtCurrency(n) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function smoothPath(p) {
  if (!p.length) return "";
  let d = `M${p[0][0]},${p[0][1]}`;
  for (let i = 0; i < p.length - 1; i++) {
    const a = p[i - 1] || p[i];
    const b = p[i];
    const c = p[i + 1];
    const e = p[i + 2] || c;
    d += ` C${b[0] + (c[0] - a[0]) / 7},${b[1] + (c[1] - a[1]) / 7} ${
      c[0] - (e[0] - b[0]) / 7
    },${c[1] - (e[1] - b[1]) / 7} ${c[0]},${c[1]}`;
  }
  return d;
}

export default function Lab7Dashboard({ embedded = false, onBack }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(15);
  const [chartMode, setChartMode] = useState("all"); // 'all' | 's' | 'u'
  const [sortBy, setSortBy] = useState("n"); // 'n' | 's'
  const [currentPage, setCurrentPage] = useState(1);

  const N = ORDERS_RAW.length;

  // Running total calculations
  const runningTotals = useMemo(() => {
    const W = 300;
    const H = 150;
    let cs = 0;
    let c4 = 0;
    const A = [];
    const B = [];
    ORDERS_RAW.forEach((r) => {
      cs += r[1];
      if (r[2] === 4) c4 += r[1];
      A.push(cs);
      B.push(c4);
    });
    const mx = 10000;
    const toPts = (arr) => arr.map((y, i) => [(i / (N - 1)) * W, H - (y / mx) * (H - 10) - 5]);
    const pa = toPts(A);
    const pb = toPts(B);
    const markIdx = Math.round(0.62 * (N - 1));
    return {
      W,
      H,
      dAll: smoothPath(pa),
      dFour: smoothPath(pb),
      markTopPct: (pb[markIdx][1] / H) * 100,
      markVal: fmtCurrency(B[markIdx])
    };
  }, [N]);

  // Big chart points
  const bigChartData = useMemo(() => {
    const W = 600;
    const H = 200;
    const PS = ORDERS_RAW.map((r, i) => [(i / (N - 1)) * W, H - (r[1] / 700) * (H - 10) - 5]);
    const PU = ORDERS_RAW.map((r, i) => [(i / (N - 1)) * W, H - (r[2] / 4) * (H - 10) * 0.8 - 5]);
    return {
      W,
      H,
      PS,
      PU,
      dSales: smoothPath(PS),
      dUnits: smoothPath(PU)
    };
  }, [N]);

  // Units per order bars
  const unitBars = useMemo(() => {
    const cnt = { 1: 0, 2: 0, 3: 0, 4: 0 };
    const sal = { 1: 0, 2: 0, 3: 0, 4: 0 };
    ORDERS_RAW.forEach((r) => {
      cnt[r[2]]++;
      sal[r[2]] += r[1];
    });
    const isSales = sortBy === "s";
    const vals = [1, 2, 3, 4].map((k) => (isSales ? sal[k] : cnt[k]));
    const mx = Math.max(...vals);
    const hi = vals.indexOf(mx);
    return { vals, mx, hi, isSales };
  }, [sortBy]);

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim();
    return ORDERS_RAW.map((r, i) => ({ orderId: r[0], sales: r[1], units: r[2], index: i })).filter(
      (item) => String(item.orderId).includes(q)
    );
  }, [searchQuery]);

  const handleBigChartPointerMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    const idx = Math.round(x * (N - 1));
    if (idx !== selectedIdx) setSelectedIdx(idx);
  };

  const selOrder = ORDERS_RAW[selectedIdx];
  const selLeftCalc = `calc(26px + (100% - 26px) * ${bigChartData.PS[selectedIdx][0] / bigChartData.W})`;

  return (
    <div className="l7-root">
      <style>{`
        .l7-root {
          --bg: #08070d;
          --bg2: #100e1b;
          --card: #151124;
          --ink: #f8fafc;
          --mute: #94a3b8;
          --line: rgba(168, 115, 255, 0.22);
          --blue: #8b5cf6;
          --org: #f59e0b;
          --soft: rgba(255, 255, 255, 0.05);
          --shadow: 0 12px 36px rgba(0,0,0,0.55);
          background: var(--bg);
          color: var(--ink);
          font: 400 12px/1.45 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
          padding: 18px;
          min-height: 100vh;
          box-sizing: border-box;
        }
        .l7-root * { box-sizing: border-box; }
        .l7-shell { max-width: 1320px; margin: 0 auto; background: var(--bg2); border: 1px solid var(--line); border-radius: 24px; padding: 20px; box-shadow: var(--shadow); }
        .l7-card { background: var(--card); border: 1px solid var(--line); border-radius: 16px; padding: 16px; box-shadow: var(--shadow); min-width: 0; }
        .l7-root h3 { margin: 0; font-size: 13px; font-weight: 700; font-family: 'Space Grotesk', sans-serif; color: #fff; }
        .l7-sub { color: var(--mute); font-size: 9.5px; }
        .l7-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 12px; }
        .l7-pill { font-size: 9.5px; border: 1px solid var(--line); border-radius: 10px; padding: 2px 8px; color: var(--mute); white-space: nowrap; background: rgba(255,255,255,0.04); }
        .l7-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; background: rgba(21, 17, 36, 0.95); border: 1px solid var(--line); border-radius: 18px; padding: 12px 20px; box-shadow: var(--shadow); margin-bottom: 18px; flex-wrap: wrap; }
        .l7-brand-group { display: flex; align-items: center; gap: 12px; }
        .l7-back-btn { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 10px; background: rgba(139, 92, 246, 0.12); border: 1px solid rgba(139, 92, 246, 0.35); color: #c4b5fd; text-decoration: none; font-size: 11px; font-weight: 700; cursor: pointer; }
        .l7-back-btn:hover { background: var(--blue); color: #fff; }
        .l7-drive-btn { display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 10px; background: linear-gradient(135deg, #7c3aed, #4f46e5); border: 1px solid rgba(196, 181, 253, 0.3); color: #fff; text-decoration: none; font-size: 11.5px; font-weight: 700; box-shadow: 0 4px 14px rgba(124, 58, 237, 0.4); }
        .l7-title-box h1 { margin: 0; font-size: 14px; font-weight: 800; font-family: 'Space Grotesk', sans-serif; color: #fff; display: flex; align-items: center; gap: 8px; }
        .l7-header-badge { font-size: 9.5px; font-weight: 700; padding: 2px 8px; border-radius: 999px; background: rgba(139, 92, 246, 0.18); border: 1px solid rgba(139, 92, 246, 0.4); color: #c4b5fd; }
        .l7-title-box p { margin: 2px 0 0; font-size: 10px; color: var(--mute); }
        .l7-searchbar { flex: 1; max-width: 380px; margin: 0 10px; display: flex; align-items: center; gap: 8px; background: rgba(255, 255, 255, 0.05); border: 1px solid var(--line); border-radius: 20px; padding: 6px 16px; color: var(--mute); min-width: 0; }
        .l7-searchbar input { flex: 1; border: 0; background: none; color: var(--ink); font: inherit; outline: none; min-width: 0; font-size: 11px; }
        .l7-av { border-radius: 50%; display: grid; place-items: center; color: #fff; font-weight: 600; flex: 0 0 auto; }
        .l7-layout { display: grid; grid-template-columns: 245px minmax(0,1fr) 255px; gap: 16px; align-items: start; }
        .l7-col { display: flex; flex-direction: column; gap: 16px; min-width: 0; }
        .l7-mid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .l7-mid .wide { grid-column: 1 / -1; }
        .l7-contact { display: flex; gap: 10px; align-items: flex-start; padding: 9px 0; border-top: 1px solid var(--line); font-size: 10px; }
        .l7-contact i { width: 20px; height: 20px; border-radius: 50%; background: var(--blue); flex: 0 0 auto; display: inline-block; }
        .l7-contact span { color: var(--mute); display: block; font-size: 9px; }
        .l7-msg-row { display: flex; gap: 8px; margin: 10px 0; }
        .l7-msg-row input { flex: 1; min-width: 0; background: var(--soft); border: 0; border-radius: 10px; padding: 7px 12px; color: var(--ink); font: inherit; font-size: 10px; }
        .l7-plus { width: 30px; height: 30px; border-radius: 50%; border: 0; background: var(--blue); color: #fff; font-size: 17px; cursor: pointer; }
        .l7-newm { width: 100%; border: 0; background: var(--blue); color: #fff; border-radius: 6px; padding: 7px; font-size: 10px; margin-bottom: 8px; cursor: pointer; }
        .l7-orders { max-height: 320px; overflow: auto; }
        .l7-person { display: flex; gap: 9px; align-items: center; padding: 8px 6px; border-radius: 10px; cursor: pointer; border: 0; background: none; width: 100%; text-align: left; color: inherit; }
        .l7-person.on { box-shadow: 0 0 0 1px var(--line), var(--shadow); background: rgba(139, 92, 246, 0.12); }
        .l7-person b { font-size: 10px; display: block; font-weight: 600; }
        .l7-person time { margin-left: auto; font-size: 9px; color: var(--mute); white-space: nowrap; }
        .l7-course { margin: 12px 0; }
        .l7-course .r { display: flex; align-items: center; gap: 8px; font-size: 10px; }
        .l7-course .r i { width: 20px; height: 20px; border-radius: 6px; flex: 0 0 auto; display: inline-block; }
        .l7-course .r em { margin-left: auto; font-style: normal; font-size: 9px; color: var(--mute); }
        .l7-bar { height: 4px; border-radius: 4px; background: var(--soft); margin: 6px 0 0 28px; overflow: hidden; }
        .l7-bar b { display: block; height: 100%; border-radius: 4px; }
        .l7-chart { position: relative; padding-left: 26px; }
        .l7-chart svg { display: block; width: 100%; }
        .l7-yl { position: absolute; left: 0; top: 0; bottom: 0; display: flex; flex-direction: column; justify-content: space-between; font-size: 8px; color: var(--mute); }
        .l7-xl { display: flex; justify-content: space-between; color: var(--mute); font-size: 8px; margin: 5px 0 0 26px; }
        .l7-dot { position: absolute; width: 12px; height: 12px; border-radius: 50%; background: var(--card); border: 3px solid var(--blue); transform: translate(-50%,-50%); pointer-events: none; }
        .l7-dot.o { border-color: var(--org); }
        .l7-tip { position: absolute; transform: translate(-50%,-145%); background: var(--card); box-shadow: var(--shadow); border: 1px solid var(--line); border-radius: 8px; padding: 3px 9px; font-size: 9px; white-space: nowrap; font-weight: 600; pointer-events: none; }
        .l7-vline { position: absolute; top: 0; bottom: 0; border-left: 1px dashed var(--mute); opacity: 0.5; pointer-events: none; }
        .l7-legend { display: flex; gap: 14px; font-size: 8px; color: var(--mute); margin-top: 8px; }
        .l7-legend i { display: inline-block; width: 6px; height: 6px; border-radius: 50%; margin-right: 4px; }
        .l7-tabs { display: flex; gap: 6px; }
        .l7-tabs button { border: 0; border-radius: 8px; background: var(--soft); color: var(--mute); font-size: 9px; padding: 5px 13px; cursor: pointer; }
        .l7-tabs button.on { background: #e3e7ff; color: var(--blue); font-weight: 700; }
        .l7-gather { display: grid; grid-template-columns: auto 1fr auto auto; gap: 12px; align-items: center; padding: 11px 0; border-top: 1px solid var(--line); }
        .l7-gather .t { font-weight: 500; font-size: 11px; }
        .l7-gather .meta { grid-column: 1 / -1; display: flex; gap: 18px; color: var(--mute); font-size: 9px; flex-wrap: wrap; }
        .l7-track { height: 3px; background: var(--soft); border-radius: 3px; position: relative; }
        .l7-track b { position: absolute; inset: 0 auto 0 0; background: var(--blue); border-radius: 3px; }
        .l7-go { border: 0; background: var(--blue); color: #fff; border-radius: 4px; padding: 3px 13px; font-size: 9px; }
        .l7-pager { display: flex; justify-content: center; align-items: center; gap: 6px; margin-top: 8px; }
        .l7-pager button { width: 22px; height: 22px; border: 0; border-radius: 6px; background: none; color: var(--mute); font-size: 9px; cursor: pointer; }
        .l7-pager button.on { background: var(--blue); color: #fff; }
        .l7-pager .w { width: auto; padding: 0 10px; border: 1px solid var(--line); }
        .l7-gr { display: grid; grid-template-columns: 26px 1fr; align-items: center; height: 24px; font-size: 8px; color: var(--mute); border-top: 1px dashed var(--line); }
        .l7-gr div { position: relative; height: 100%; }
        .l7-gr span.b { position: absolute; top: 8px; height: 8px; border-radius: 5px; }
        .l7-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; }
        .l7-stat { border-radius: 12px; padding: 11px; color: #fff; }
        .l7-stat i { display: block; width: 22px; height: 22px; border-radius: 50%; background: rgba(255,255,255,0.3); margin-bottom: 8px; }
        .l7-stat b { display: block; font-size: 21px; line-height: 1.15; }
        .l7-stat small { font-size: 8px; opacity: 0.95; }
        .l7-vis { display: flex; justify-content: space-between; align-items: center; }
        .l7-vis select { border: 0; background: var(--bg2); color: var(--ink); font: inherit; font-size: 10px; padding: 2px 6px; border-radius: 6px; }
        .l7-up { color: #27b27b; font-size: 10px; font-weight: 600; }
        .l7-bars { display: flex; align-items: flex-end; gap: 10px; height: 110px; margin-top: 22px; }
        .l7-bars div { flex: 1; border-radius: 4px 4px 0 0; background: linear-gradient(#fbd9a8, #fdeccf); position: relative; }
        .l7-bars div.hi { background: linear-gradient(#f9b25e, var(--org)); }
        .l7-bars div u { position: absolute; top: -24px; left: 50%; transform: translateX(-50%); background: var(--org); color: #fff; border-radius: 7px; padding: 1px 8px; font-size: 9px; text-decoration: none; white-space: nowrap; }
        @media (max-width: 1080px) {
          .l7-layout { grid-template-columns: 1fr; }
          .l7-col.left, .l7-col.right { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); }
        }
        @media (max-width: 640px) {
          .l7-mid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="l7-shell">
        <header className="l7-header">
          <div className="l7-brand-group">
            {!embedded && (
              <button
                type="button"
                className="l7-back-btn"
                onClick={() => (onBack ? onBack() : (window.location.href = "/#powerbi-activities"))}
              >
                ← Portfolio
              </button>
            )}
            <div className="l7-title-box">
              <h1>
                Lab 7: Advanced Modeling <span className="l7-header-badge">Power BI Mart</span>
              </h1>
              <p>One Dim_Date, Three Role-Playing Dimensions (Order, Ship, Delivery)</p>
            </div>
          </div>

          <label className="l7-searchbar">
            <span>🔍</span>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter orders or sales figures…"
              aria-label="Search orders"
            />
          </label>

          <a
            href={GOOGLE_DRIVE_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="l7-drive-btn"
          >
            Download .PBIX ↗
          </a>
        </header>

        <main className="l7-layout">
          <aside className="l7-col left">
            <section className="l7-card">
              <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "12px" }}>
                <div
                  className="l7-av"
                  style={{
                    width: "44px",
                    height: "44px",
                    background: "linear-gradient(135deg,#3d5af1,#8fa2ff)"
                  }}
                >
                  L7
                </div>
                <div>
                  <b style={{ display: "block", fontSize: "12px" }}>Lab 7</b>
                  <span className="l7-sub">Advanced Modeling</span>
                </div>
              </div>
              <div className="l7-contact">
                <i />
                <div>
                  <span>File</span>Lab7_AdvancedModeling.pbix
                </div>
              </div>
              <div className="l7-contact">
                <i style={{ background: "#27b27b" }} />
                <div>
                  <span>Tables</span>Fact_Sales, Dim_Date,
                  <br />
                  Dim_Order_Attributes
                </div>
              </div>
              <div className="l7-contact">
                <i style={{ background: "var(--org)" }} />
                <div>
                  <span>Date range</span>1 Jan – 9 Apr 2024
                  <br />
                  100 days
                </div>
              </div>
            </section>

            <section className="l7-card">
              <h3>Orders</h3>
              <div className="l7-msg-row">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search order #…"
                />
                <button type="button" className="l7-plus" onClick={() => setSearchQuery("")}>
                  +
                </button>
              </div>
              <button type="button" className="l7-newm" onClick={() => setSearchQuery("")}>
                Show all 33 orders
              </button>
              <div className="l7-orders">
                {filteredOrders.length === 0 ? (
                  <div className="l7-sub" style={{ padding: "8px" }}>
                    No order matches that number.
                  </div>
                ) : (
                  filteredOrders.map((item) => (
                    <button
                      type="button"
                      key={item.orderId}
                      className={`l7-person ${item.index === selectedIdx ? "on" : ""}`}
                      onClick={() => setSelectedIdx(item.index)}
                    >
                      <div
                        className="l7-av"
                        style={{
                          width: "28px",
                          height: "28px",
                          fontSize: "9px",
                          background: AVATAR_COLS[item.index % 6]
                        }}
                      >
                        {String(item.orderId).slice(-2)}
                      </div>
                      <div>
                        <b>Order {item.orderId}</b>
                        <span className="l7-sub">
                          {item.units} {item.units === 1 ? "unit" : "units"}
                        </span>
                      </div>
                      <time>{fmtCurrency(item.sales)}</time>
                    </button>
                  ))
                )}
              </div>
            </section>
          </aside>

          <div className="l7-mid">
            <section className="l7-card">
              <div className="l7-head">
                <div>
                  <h3>Q1 2024 sales</h3>
                  <div className="l7-sub">One Dim_Date, three roles</div>
                </div>
                <span className="l7-pill">2024 Qtr 1</span>
              </div>
              <div className="l7-course">
                <div className="r">
                  <i style={{ background: "#3d5af1" }} />
                  Sales by Order Date<em>15,277.40</em>
                </div>
                <div className="l7-bar">
                  <b style={{ width: "100%", background: "#3d5af1" }} />
                </div>
              </div>
              <div className="l7-course">
                <div className="r">
                  <i style={{ background: "#f5a54c" }} />
                  Sales by Ship Date<em>15,277.40</em>
                </div>
                <div className="l7-bar">
                  <b style={{ width: "100%", background: "#f5a54c" }} />
                </div>
              </div>
              <div className="l7-course">
                <div className="r">
                  <i style={{ background: "#27b27b" }} />
                  Sales by Delivery Date<em>14,939.61</em>
                </div>
                <div className="l7-bar">
                  <b style={{ width: "97.8%", background: "#27b27b" }} />
                </div>
              </div>
              <div className="l7-course">
                <div className="r">
                  <i style={{ background: "#ef476f" }} />
                  Distinct Orders<em>60</em>
                </div>
                <div className="l7-bar">
                  <b style={{ width: "100%", background: "#ef476f" }} />
                </div>
              </div>
            </section>

            <section className="l7-card">
              <div className="l7-head">
                <div>
                  <h3>Running total</h3>
                  <div className="l7-sub">33 visible orders</div>
                </div>
                <span className="l7-pill">SalesAmount</span>
              </div>
              <div className="l7-chart">
                <div className="l7-yl">
                  <span>10k</span>
                  <span>5k</span>
                  <span>0</span>
                </div>
                <svg viewBox="0 0 300 150" preserveAspectRatio="none" height="150">
                  <defs>
                    <linearGradient id="l7-la" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#f5a54c" stopOpacity="0.35" />
                      <stop offset="1" stopColor="#f5a54c" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {[0, 1, 2].map((g) => {
                    const y = (g / 2) * 149 + 0.5;
                    return (
                      <line
                        key={g}
                        x1="0"
                        x2="300"
                        y1={y}
                        y2={y}
                        stroke="currentColor"
                        strokeOpacity="0.12"
                        strokeDasharray="3 4"
                      />
                    );
                  })}
                  <path d={`${runningTotals.dAll} L300,150 L0,150Z`} fill="url(#l7-la)" />
                  <path d={runningTotals.dAll} fill="none" stroke="#f5a54c" strokeWidth="2" />
                  <path d={runningTotals.dFour} fill="none" stroke="#3d5af1" strokeWidth="2" />
                </svg>
                <div
                  className="l7-dot"
                  style={{
                    left: "calc(26px + (100% - 26px) * 0.62)",
                    top: `${runningTotals.markTopPct}%`
                  }}
                />
                <div
                  className="l7-tip"
                  style={{
                    left: "calc(26px + (100% - 26px) * 0.62)",
                    top: `${runningTotals.markTopPct}%`
                  }}
                >
                  {runningTotals.markVal}
                </div>
              </div>
              <div className="l7-xl">
                <span>90002</span>
                <span>90015</span>
                <span>90028</span>
                <span>90037</span>
              </div>
              <div className="l7-legend">
                <span>
                  <i style={{ background: "var(--org)" }} />
                  All orders
                </span>
                <span>
                  <i style={{ background: "var(--blue)" }} />
                  4-unit orders
                </span>
              </div>
            </section>

            <section className="l7-card wide">
              <div className="l7-head">
                <div>
                  <h3>Sales and units by order</h3>
                  <div className="l7-sub">Hover, or pick an order on the left</div>
                </div>
                <div className="l7-tabs">
                  {[
                    { id: "all", label: "Both" },
                    { id: "s", label: "Sales" },
                    { id: "u", label: "Units" }
                  ].map((t) => (
                    <button
                      type="button"
                      key={t.id}
                      className={chartMode === t.id ? "on" : ""}
                      onClick={() => setChartMode(t.id)}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="l7-legend" style={{ margin: "0 0 8px" }}>
                <span>
                  <i style={{ background: "var(--org)" }} />
                  9,496.06 Sales
                </span>
                <span>
                  <i style={{ background: "var(--blue)" }} />
                  87 Units
                </span>
              </div>

              <div className="l7-chart">
                <div className="l7-yl">
                  <span>700</span>
                  <span>525</span>
                  <span>350</span>
                  <span>175</span>
                  <span>0</span>
                </div>
                <svg
                  viewBox="0 0 600 200"
                  preserveAspectRatio="none"
                  height="200"
                  onPointerMove={handleBigChartPointerMove}
                  style={{ cursor: "crosshair" }}
                >
                  <defs>
                    <linearGradient id="l7-ba" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#f5a54c" stopOpacity="0.35" />
                      <stop offset="1" stopColor="#f5a54c" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="l7-bb" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#3d5af1" stopOpacity="0.35" />
                      <stop offset="1" stopColor="#3d5af1" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {[0, 1, 2, 3, 4].map((g) => {
                    const y = (g / 4) * 199 + 0.5;
                    return (
                      <line
                        key={g}
                        x1="0"
                        x2="600"
                        y1={y}
                        y2={y}
                        stroke="currentColor"
                        strokeOpacity="0.12"
                        strokeDasharray="3 4"
                      />
                    );
                  })}
                  {chartMode !== "u" && (
                    <>
                      <path d={`${bigChartData.dSales} L600,200 L0,200Z`} fill="url(#l7-ba)" />
                      <path d={bigChartData.dSales} fill="none" stroke="#f5a54c" strokeWidth="2" />
                    </>
                  )}
                  {chartMode !== "s" && (
                    <>
                      <path d={`${bigChartData.dUnits} L600,200 L0,200Z`} fill="url(#l7-bb)" />
                      <path d={bigChartData.dUnits} fill="none" stroke="#3d5af1" strokeWidth="2" />
                    </>
                  )}
                </svg>

                <div className="l7-vline" style={{ left: selLeftCalc }} />
                {chartMode !== "u" && (
                  <>
                    <div
                      className="l7-dot o"
                      style={{
                        left: selLeftCalc,
                        top: `${(bigChartData.PS[selectedIdx][1] / bigChartData.H) * 100}%`
                      }}
                    />
                    <div
                      className="l7-tip"
                      style={{
                        left: selLeftCalc,
                        top: `${(bigChartData.PS[selectedIdx][1] / bigChartData.H) * 100}%`
                      }}
                    >
                      Order {selOrder[0]} · {fmtCurrency(selOrder[1])}
                    </div>
                  </>
                )}
                {chartMode !== "s" && (
                  <>
                    <div
                      className="l7-dot"
                      style={{
                        left: selLeftCalc,
                        top: `${(bigChartData.PU[selectedIdx][1] / bigChartData.H) * 100}%`
                      }}
                    />
                    <div
                      className="l7-tip"
                      style={{
                        left: selLeftCalc,
                        top: `${(bigChartData.PU[selectedIdx][1] / bigChartData.H) * 100}%`
                      }}
                    >
                      {chartMode === "u"
                        ? `Order ${selOrder[0]} · ${selOrder[2]} units`
                        : `${selOrder[2]} units`}
                    </div>
                  </>
                )}
              </div>

              <div className="l7-xl">
                <span>90002</span>
                <span>90010</span>
                <span>90018</span>
                <span>90026</span>
                <span>90031</span>
                <span>90037</span>
              </div>

              <div style={{ marginTop: "12px" }}>
                <div className="l7-gather">
                  <span className="t">Orders captured</span>
                  <div className="l7-track">
                    <b style={{ width: "55%" }} />
                  </div>
                  <span className="l7-sub">55%</span>
                  <button type="button" className="l7-go">
                    33 of 60
                  </button>
                  <div className="meta">
                    <span>1 PBIX file</span>
                    <span>Pages: 4</span>
                    <span>Visuals: 8</span>
                    <span>Tables: 3</span>
                  </div>
                </div>
                <div className="l7-gather">
                  <span className="t">Delivery vs order</span>
                  <div className="l7-track">
                    <b style={{ width: "97.8%" }} />
                  </div>
                  <span className="l7-sub">97.8%</span>
                  <button type="button" className="l7-go">
                    Q1
                  </button>
                  <div className="meta">
                    <span>Gap: 337.79</span>
                    <span>Active: OrderDateKey</span>
                    <span>Inactive: Ship, Delivery</span>
                  </div>
                </div>
              </div>

              <div className="l7-pager">
                <button
                  type="button"
                  className="w"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </button>
                {[1, 2, 3, "…", 9, 10].map((l, idx) => (
                  <button
                    type="button"
                    key={idx}
                    className={l === currentPage ? "on" : ""}
                    onClick={() => typeof l === "number" && setCurrentPage(l)}
                  >
                    {l}
                  </button>
                ))}
                <button
                  type="button"
                  className="w"
                  onClick={() => setCurrentPage((p) => Math.min(10, p + 1))}
                >
                  Next
                </button>
              </div>
            </section>
          </div>

          <aside className="l7-col right">
            <section className="l7-card">
              <div className="l7-head">
                <div>
                  <h3>Dim_Date</h3>
                  <div className="l7-sub">Days per month</div>
                </div>
                <span className="l7-pill">2024</span>
              </div>
              <div>
                {GANTT_MONTHS.map((m) => (
                  <div className="l7-gr" key={m[0]}>
                    <span>{m[0]}</span>
                    <div>
                      <span
                        className="b"
                        style={{ left: `${m[1]}%`, width: `${m[2]}%`, background: m[3] }}
                      />
                    </div>
                  </div>
                ))}
                <div className="l7-xl" style={{ marginLeft: "26px" }}>
                  <span>1 Jan</span>
                  <span>1 Mar</span>
                  <span>9 Apr</span>
                </div>
              </div>
            </section>

            <section className="l7-card">
              <h3 style={{ marginBottom: "12px" }}>Key figures</h3>
              <div className="l7-stats">
                <div className="l7-stat" style={{ background: "linear-gradient(135deg,#1fb58f,#3ed3a5)" }}>
                  <i />
                  <b>60</b>
                  <small>Distinct orders</small>
                </div>
                <div className="l7-stat" style={{ background: "linear-gradient(135deg,#f5a54c,#f8c070)" }}>
                  <i />
                  <b>155</b>
                  <small>Total units</small>
                </div>
                <div className="l7-stat" style={{ background: "linear-gradient(135deg,#27a9e8,#5cc8f5)" }}>
                  <i />
                  <b>100</b>
                  <small>Days in Dim_Date</small>
                </div>
                <div className="l7-stat" style={{ background: "linear-gradient(135deg,#ef5d4f,#f6926a)" }}>
                  <i />
                  <b>3</b>
                  <small>Date roles</small>
                </div>
              </div>
            </section>

            <section className="l7-card">
              <div className="l7-vis">
                <h3>Units per order</h3>
                <label className="l7-sub">
                  Sort by:{" "}
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="n">Orders</option>
                    <option value="s">Sales</option>
                  </select>
                </label>
              </div>
              <div className="l7-vis" style={{ marginTop: "6px" }}>
                <span className="l7-sub">33 visible orders</span>
                <span className="l7-up">Most: {unitBars.hi + 1} units</span>
              </div>
              <div className="l7-bars">
                {unitBars.vals.map((val, i) => (
                  <div
                    key={i}
                    className={i === unitBars.hi ? "hi" : ""}
                    style={{ height: `${(val / unitBars.mx) * 100}%` }}
                  >
                    {i === unitBars.hi && (
                      <u>{unitBars.isSales ? fmtCurrency(val) : `${val} orders`}</u>
                    )}
                  </div>
                ))}
              </div>
              <div className="l7-xl" style={{ marginLeft: 0, justifyContent: "space-around" }}>
                <span>1 unit</span>
                <span>2 units</span>
                <span>3 units</span>
                <span>4 units</span>
              </div>
            </section>
          </aside>
        </main>
      </div>
    </div>
  );
}

