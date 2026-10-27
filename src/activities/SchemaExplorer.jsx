import React, { useState, useRef, useEffect, useCallback } from "react";
import { SCHEMA_DATA } from "../data/schemaExplorerData";
import { GOOGLE_DRIVE_REPO_URL } from "../data/portfolioData";

function cloneTables(schemaKey) {
  return SCHEMA_DATA[schemaKey].tables.map((t) => ({
    ...t,
    pos: { ...t.pos },
    columns: [...t.columns]
  }));
}

function calculateSmartAnchors(x1, y1, w1, h1, x2, y2, w2, h2) {
  const c1 = { x: x1 + w1 / 2, y: y1 + h1 / 2 };
  const c2 = { x: x2 + w2 / 2, y: y2 + h2 / 2 };
  const dx = c2.x - c1.x;
  const dy = c2.y - c1.y;

  let source = { x: 0, y: 0 };
  let target = { x: 0, y: 0 };
  let sourceSide = "right";
  let targetSide = "left";

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0) {
      source = { x: x1 + w1, y: c1.y };
      target = { x: x2, y: c2.y };
      sourceSide = "right";
      targetSide = "left";
    } else {
      source = { x: x1, y: c1.y };
      target = { x: x2 + w2, y: c2.y };
      sourceSide = "left";
      targetSide = "right";
    }
  } else {
    if (dy > 0) {
      source = { x: c1.x, y: y1 + h1 };
      target = { x: c2.x, y: y2 };
      sourceSide = "bottom";
      targetSide = "top";
    } else {
      source = { x: c1.x, y: y1 };
      target = { x: c2.x, y: y2 + h2 };
      sourceSide = "top";
      targetSide = "bottom";
    }
  }

  return { source, target, sourceSide, targetSide };
}

export default function SchemaExplorer({ embedded = false, onBack }) {
  const [schemaKey, setSchemaKey] = useState("snowflake");
  const [tables, setTables] = useState(() => cloneTables("snowflake"));
  const [zoom, setZoom] = useState(0.85);
  const [pan, setPan] = useState({ x: 30, y: 20 });
  const [searchTerm, setSearchTerm] = useState("");
  const [hoveredTableId, setHoveredTableId] = useState(null);
  const [hoveredRelIdx, setHoveredRelIdx] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [modalTable, setModalTable] = useState(null);
  const [toastMsg, setToastMsg] = useState("");

  const canvasRef = useRef(null);
  const dragStateRef = useRef({
    type: null, // 'pan' | 'card'
    tableId: null,
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0
  });
  const toastTimerRef = useRef(null);

  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToastMsg("");
    }, 2500);
  }, []);

  const handleSwitchSchema = (nextKey) => {
    if (nextKey === schemaKey) return;
    setSchemaKey(nextKey);
    setTables(cloneTables(nextKey));
    setSearchTerm("");
    showToast(`Switched to ${nextKey === "snowflake" ? "Snowflake" : "Star"} Schema`);
  };

  const handleReorganize = () => {
    setTables(cloneTables(schemaKey));
    setPan({ x: 30, y: 20 });
    setZoom(0.85);
    showToast("Layout reorganized to optimal spacing");
  };

  const handleFocusTable = (tableId) => {
    const t = tables.find((x) => x.id === tableId);
    if (!t || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setPan({
      x: rect.width / 2 - (t.pos.x + 120) * zoom,
      y: rect.height / 2 - (t.pos.y + 120) * zoom
    });
    setHoveredTableId(tableId);
    setTimeout(() => setHoveredTableId(null), 1200);
  };

  const handleCanvasMouseDown = (e) => {
    if (e.target.closest(".se-table-card") || e.target.closest("button")) return;
    dragStateRef.current = {
      type: "pan",
      startX: e.clientX - pan.x,
      startY: e.clientY - pan.y
    };
  };

  const handleCardMouseDown = (e, table) => {
    if (e.target.closest("button")) return;
    e.stopPropagation();
    dragStateRef.current = {
      type: "card",
      tableId: table.id,
      startX: e.clientX,
      startY: e.clientY,
      initialX: table.pos.x,
      initialY: table.pos.y
    };
    setDraggingId(table.id);
  };

  useEffect(() => {
    const onMouseMove = (e) => {
      const st = dragStateRef.current;
      if (!st.type) return;
      if (st.type === "pan") {
        setPan({
          x: e.clientX - st.startX,
          y: e.clientY - st.startY
        });
      } else if (st.type === "card") {
        const dx = (e.clientX - st.startX) / zoom;
        const dy = (e.clientY - st.startY) / zoom;
        setTables((prev) =>
          prev.map((t) =>
            t.id === st.tableId
              ? { ...t, pos: { x: st.initialX + dx, y: st.initialY + dy } }
              : t
          )
        );
      }
    };
    const onMouseUp = () => {
      dragStateRef.current = { type: null };
      setDraggingId(null);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [zoom]);

  const applyZoom = (nextZoom) => {
    const clamped = Math.min(Math.max(nextZoom, 0.45), 1.6);
    setZoom(clamped);
  };

  const currentData = SCHEMA_DATA[schemaKey];
  const query = searchTerm.trim().toLowerCase();

  const generateDDL = (table) => {
    if (!table) return "";
    const lines = table.columns.map((c) => {
      let line = `  ${c.name.padEnd(18)} ${c.type.padEnd(14)}`;
      if (c.key === "PK") line += " PRIMARY KEY";
      return line;
    });
    return `CREATE TABLE ${table.name} (\n${lines.join(",\n")}\n);`;
  };

  const copySQL = () => {
    if (!modalTable) return;
    const sql = generateDDL(modalTable);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(sql);
    }
    showToast("SQL DDL copied to clipboard!");
  };

  return (
    <div className="se-root">
      <style>{`
        .se-root {
          background: #08070d;
          color: #e2e8f0;
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
          height: ${embedded ? "100%" : "100vh"};
          min-height: 540px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          user-select: none;
        }
        .se-header {
          min-height: 60px;
          background: rgba(16, 14, 27, 0.96);
          border-bottom: 1px solid rgba(139, 92, 246, 0.22);
          padding: 8px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          z-index: 30;
        }
        .se-brand-row {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .se-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 700;
          background: rgba(139, 92, 246, 0.14);
          color: #c4b5fd;
          border: 1px solid rgba(139, 92, 246, 0.35);
          cursor: pointer;
          text-decoration: none;
        }
        .se-back-btn:hover {
          background: #7c3aed;
          color: #fff;
        }
        .se-logo-box {
          width: 36px;
          height: 36px;
          border-radius: 12px;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          display: grid;
          place-items: center;
          color: #fff;
          font-weight: 800;
          font-size: 14px;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.35);
        }
        .se-title-main {
          font-size: 14px;
          font-weight: 800;
          color: #fff;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .se-badge-dwh {
          font-size: 9.5px;
          text-transform: uppercase;
          padding: 2px 8px;
          border-radius: 999px;
          background: rgba(124, 58, 237, 0.25);
          color: #c4b5fd;
          border: 1px solid rgba(139, 92, 246, 0.4);
        }
        .se-subtitle {
          font-size: 11px;
          color: #94a3b8;
          margin: 0;
        }
        .se-switcher {
          display: flex;
          align-items: center;
          background: #0f172a;
          padding: 3px;
          border-radius: 12px;
          border: 1px solid rgba(139, 92, 246, 0.25);
          gap: 4px;
        }
        .se-switch-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 9px;
          font-size: 11.5px;
          font-weight: 700;
          color: #94a3b8;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }
        .se-switch-btn.active {
          background: #7c3aed;
          color: #ffffff;
          box-shadow: 0 2px 10px rgba(124, 58, 237, 0.4);
        }
        .se-switch-tag {
          font-size: 9.5px;
          padding: 1px 6px;
          border-radius: 999px;
          background: rgba(0, 0, 0, 0.3);
        }
        .se-search-wrap {
          position: relative;
          width: 220px;
        }
        .se-search-input {
          width: 100%;
          background: #0f172a;
          border: 1px solid rgba(139, 92, 246, 0.25);
          border-radius: 10px;
          padding: 6px 26px 6px 12px;
          font-size: 11.5px;
          color: #e2e8f0;
          outline: none;
        }
        .se-search-input:focus {
          border-color: #8b5cf6;
        }
        .se-controls-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .se-drive-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          color: #fff;
          border-radius: 10px;
          font-size: 11.5px;
          font-weight: 700;
          text-decoration: none;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
        }
        .se-zoom-box {
          display: flex;
          align-items: center;
          background: #0f172a;
          border: 1px solid rgba(139, 92, 246, 0.25);
          border-radius: 10px;
          padding: 2px;
        }
        .se-zoom-btn {
          padding: 4px 8px;
          color: #94a3b8;
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 12px;
          font-weight: 700;
          border-radius: 6px;
        }
        .se-zoom-btn:hover {
          background: #1e293b;
          color: #fff;
        }
        .se-zoom-label {
          font-family: monospace;
          font-size: 11px;
          padding: 0 6px;
          color: #cbd5e1;
        }
        .se-body {
          flex: 1;
          display: flex;
          overflow: hidden;
          position: relative;
        }
        .se-sidebar {
          width: 280px;
          background: #121722;
          border-right: 1px solid #1e293b;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow-y: auto;
          padding: 16px;
          z-index: 20;
          flex-shrink: 0;
        }
        @media (max-width: 860px) {
          .se-sidebar { display: none; }
        }
        .se-metrics-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 8px;
        }
        .se-metric-card {
          padding: 10px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.03);
        }
        .se-metric-label {
          font-size: 10.5px;
          font-weight: 600;
          margin-bottom: 2px;
        }
        .se-metric-val {
          font-size: 18px;
          font-weight: 800;
          color: #fff;
        }
        .se-metric-sub {
          font-size: 9.5px;
          color: #64748b;
        }
        .se-table-nav-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 7px 10px;
          border-radius: 10px;
          font-size: 11.5px;
          cursor: pointer;
          transition: background 0.15s;
          color: #cbd5e1;
        }
        .se-table-nav-item:hover {
          background: rgba(139, 92, 246, 0.14);
          color: #fff;
        }
        .se-type-pill {
          font-size: 9.5px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 999px;
        }
        .se-type-fact { background: rgba(249, 115, 22, 0.2); color: #fb923c; }
        .se-type-dim { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
        .se-type-subdim { background: rgba(20, 184, 166, 0.2); color: #2dd4bf; }
        .se-arch-card {
          padding: 12px;
          border-radius: 14px;
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid rgba(148, 163, 184, 0.15);
          font-size: 11px;
          color: #94a3b8;
          line-height: 1.5;
        }
        .se-canvas {
          flex: 1;
          position: relative;
          overflow: hidden;
          background-color: #0c1017;
          background-size: 28px 28px;
          background-image: radial-gradient(circle, #334155 1.2px, transparent 1.2px);
          cursor: grab;
        }
        .se-canvas:active {
          cursor: grabbing;
        }
        .se-legend-bar {
          position: absolute;
          top: 12px;
          left: 16px;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(18, 23, 34, 0.92);
          backdrop-filter: blur(8px);
          padding: 6px 14px;
          border-radius: 12px;
          border: 1px solid rgba(148, 163, 184, 0.15);
          font-size: 11px;
          color: #cbd5e1;
          flex-wrap: wrap;
        }
        .se-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
          margin-right: 5px;
        }
        .se-table-card {
          position: absolute;
          width: 235px;
          border-radius: 14px;
          background: #161c28;
          border: 1px solid #1e293b;
          box-shadow: 0 16px 32px rgba(0, 0, 0, 0.45);
          cursor: move;
          transition: box-shadow 0.2s, border-color 0.2s, opacity 0.2s;
          z-index: 10;
        }
        .se-table-card.hovered, .se-table-card.dragging {
          border-color: #8b5cf6;
          box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.4), 0 20px 40px rgba(0, 0, 0, 0.6);
          z-index: 20;
        }
        .se-card-head {
          padding: 9px 12px;
          border-bottom: 1px solid #1e293b;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-radius: 14px 14px 0 0;
        }
        .se-card-head.fact { background: linear-gradient(90deg, rgba(249, 115, 22, 0.18), transparent); }
        .se-card-head.dim { background: rgba(30, 41, 59, 0.55); }
        .se-card-head.subdim { background: rgba(13, 148, 136, 0.16); }
        .se-card-cols {
          padding: 6px;
          max-height: 240px;
          overflow-y: auto;
        }
        .se-col-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 3px 8px;
          font-size: 11px;
          border-radius: 6px;
          font-family: monospace;
          color: #cbd5e1;
        }
        .se-col-row.match {
          background: rgba(245, 158, 11, 0.25);
          color: #fde68a;
        }
        .se-key-pk {
          font-size: 9px;
          font-weight: 800;
          padding: 1px 4px;
          border-radius: 4px;
          background: rgba(245, 158, 11, 0.2);
          color: #fbbf24;
          margin-right: 6px;
        }
        .se-key-fk {
          font-size: 9px;
          font-weight: 800;
          padding: 1px 4px;
          border-radius: 4px;
          background: rgba(59, 130, 246, 0.2);
          color: #60a5fa;
          margin-right: 6px;
        }
        .se-card-foot {
          padding: 5px 12px;
          border-top: 1px solid #1e293b;
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          color: #64748b;
        }
        .se-ddl-link {
          color: #8b5cf6;
          cursor: pointer;
          font-weight: 700;
        }
        .se-ddl-link:hover {
          text-decoration: underline;
        }
        .se-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(4px);
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }
        .se-modal-box {
          background: #121722;
          border: 1px solid #1e293b;
          border-radius: 20px;
          max-width: 620px;
          width: 100%;
          overflow: hidden;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.6);
        }
        .se-toast {
          position: fixed;
          bottom: 18px;
          left: 50%;
          transform: translateX(-50%);
          background: #fff;
          color: #0f172a;
          padding: 8px 16px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
          z-index: 60;
        }
      `}</style>

      {/* Top Navigation */}
      <header className="se-header">
        <div className="se-brand-row">
          {!embedded && (
            <button
              type="button"
              className="se-back-btn"
              onClick={() => (onBack ? onBack() : (window.location.href = "/#powerbi-activities"))}
            >
              ← Portfolio
            </button>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="se-logo-box">DB</div>
            <div>
              <div className="se-title-main">
                SchemaStudio <span style={{ color: "#a78bfa", fontWeight: 500 }}>| Lab 6</span>
                <span className="se-badge-dwh">Power BI DWH</span>
              </div>
              <p className="se-subtitle">Star Schema &amp; Snowflake Schema Architecture</p>
            </div>
          </div>

          <div className="se-switcher">
            <button
              type="button"
              className={`se-switch-btn ${schemaKey === "snowflake" ? "active" : ""}`}
              onClick={() => handleSwitchSchema("snowflake")}
            >
              <span>❄ Snowflake Schema</span>
              <span className="se-switch-tag">Normalized</span>
            </button>
            <button
              type="button"
              className={`se-switch-btn ${schemaKey === "star" ? "active" : ""}`}
              onClick={() => handleSwitchSchema("star")}
            >
              <span>★ Star Schema</span>
              <span className="se-switch-tag">Optimized</span>
            </button>
          </div>
        </div>

        <div className="se-search-wrap">
          <input
            type="text"
            className="se-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tables or attributes..."
          />
        </div>

        <div className="se-controls-right">
          <a
            href={GOOGLE_DRIVE_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="se-drive-btn"
          >
            Download .PBIX ↗
          </a>
          <div className="se-zoom-box">
            <button type="button" className="se-zoom-btn" onClick={() => applyZoom(zoom - 0.12)}>
              −
            </button>
            <span className="se-zoom-label">{Math.round(zoom * 100)}%</span>
            <button type="button" className="se-zoom-btn" onClick={() => applyZoom(zoom + 0.12)}>
              +
            </button>
            <button
              type="button"
              className="se-zoom-btn"
              onClick={handleReorganize}
              title="Reset & Auto-Align Canvas"
            >
              ⟲
            </button>
          </div>
        </div>
      </header>

      {/* Body Workspace */}
      <div className="se-body">
        <aside className="se-sidebar">
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", fontWeight: 800, color: "#fff", textTransform: "uppercase" }}>
                  Schema Metrics
                </span>
                <span className="se-badge-dwh">
                  {schemaKey === "snowflake" ? "Snowflake" : "Star Schema"}
                </span>
              </div>
              <div className="se-metrics-grid">
                <div className="se-metric-card">
                  <div className="se-metric-label" style={{ color: "#fb923c" }}>Fact Tables</div>
                  <div className="se-metric-val">1</div>
                  <div className="se-metric-sub">Fact_Sales (Grain)</div>
                </div>
                <div className="se-metric-card">
                  <div className="se-metric-label" style={{ color: "#60a5fa" }}>Dimensions</div>
                  <div className="se-metric-val">{currentData.metrics.dims}</div>
                  <div className="se-metric-sub">
                    {schemaKey === "snowflake" ? "Normalized" : "Flattened"}
                  </div>
                </div>
                <div className="se-metric-card">
                  <div className="se-metric-label" style={{ color: "#34d399" }}>Attributes</div>
                  <div className="se-metric-val">{currentData.metrics.cols}</div>
                  <div className="se-metric-sub">Across Model</div>
                </div>
                <div className="se-metric-card">
                  <div className="se-metric-label" style={{ color: "#a78bfa" }}>Relationships</div>
                  <div className="se-metric-val">{currentData.metrics.joins}</div>
                  <div className="se-metric-sub">1:N Cardinality</div>
                </div>
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#e2e8f0" }}>Tables in Schema</span>
                <span style={{ fontSize: "10px", color: "#64748b" }}>Click to focus</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                {tables.map((t) => (
                  <div
                    key={t.id}
                    className="se-table-nav-item"
                    onClick={() => handleFocusTable(t.id)}
                  >
                    <span style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {t.name}
                    </span>
                    <span
                      className={`se-type-pill ${
                        t.type === "fact"
                          ? "se-type-fact"
                          : t.type === "subdim"
                          ? "se-type-subdim"
                          : "se-type-dim"
                      }`}
                    >
                      {t.type === "fact" ? "Fact" : t.type === "subdim" ? "Sub-Dim" : "Dim"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="se-arch-card">
              <div style={{ fontWeight: 800, color: "#fff", marginBottom: "4px" }}>
                {currentData.title}
              </div>
              <p style={{ margin: "0 0 8px" }}>{currentData.description}</p>
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "6px" }}>
                <span>Query Complexity:</span>
                <strong style={{ color: "#fbbf24" }}>{currentData.complexity}</strong>
              </div>
            </div>
          </div>
        </aside>

        {/* Interactive Diagram Canvas */}
        <main ref={canvasRef} className="se-canvas" onMouseDown={handleCanvasMouseDown}>
          <div className="se-legend-bar">
            <span><i className="se-dot" style={{ background: "#f97316" }} />Fact Table</span>
            <span><i className="se-dot" style={{ background: "#3b82f6" }} />Primary Dim</span>
            <span><i className="se-dot" style={{ background: "#14b8a6" }} />Normalized Sub-Dim</span>
            <span style={{ color: "#94a3b8" }}>• Drag cards to reposition • Click View DDL for SQL</span>
          </div>

          <div
            style={{
              position: "absolute",
              inset: 0,
              transformOrigin: "0 0",
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
            }}
          >
            {/* SVG Connections */}
            <svg
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "3200px",
                height: "2400px",
                pointerEvents: "none",
                zIndex: 1
              }}
            >
              <defs>
                <marker
                  id="se-arrow-blue"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 8 5 L 0 9 z" fill="#3b82f6" />
                </marker>
                <marker
                  id="se-arrow-orange"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 8 5 L 0 9 z" fill="#f97316" />
                </marker>
              </defs>
              {currentData.relationships.map((rel, idx) => {
                const fromT = tables.find((t) => t.id === rel.from);
                const toT = tables.find((t) => t.id === rel.to);
                if (!fromT || !toT) return null;

                const w1 = 235;
                const h1 = 62 + fromT.columns.length * 22;
                const w2 = 235;
                const h2 = 62 + toT.columns.length * 22;

                const anchor = calculateSmartAnchors(
                  fromT.pos.x,
                  fromT.pos.y,
                  w1,
                  h1,
                  toT.pos.x,
                  toT.pos.y,
                  w2,
                  h2
                );

                const deltaX = Math.abs(anchor.target.x - anchor.source.x);
                const curvature = Math.max(deltaX * 0.5, 40);
                const p1x =
                  anchor.source.x +
                  (anchor.sourceSide === "right" ? curvature : anchor.sourceSide === "left" ? -curvature : 0);
                const p1y =
                  anchor.source.y +
                  (anchor.sourceSide === "bottom" ? curvature : anchor.sourceSide === "top" ? -curvature : 0);
                const p2x =
                  anchor.target.x +
                  (anchor.targetSide === "right" ? curvature : anchor.targetSide === "left" ? -curvature : 0);
                const p2y =
                  anchor.target.y +
                  (anchor.targetSide === "bottom" ? curvature : anchor.targetSide === "top" ? -curvature : 0);

                const d = `M ${anchor.source.x} ${anchor.source.y} C ${p1x} ${p1y}, ${p2x} ${p2y}, ${anchor.target.x} ${anchor.target.y}`;
                const isHighlighted =
                  hoveredRelIdx === idx ||
                  hoveredTableId === rel.from ||
                  hoveredTableId === rel.to;

                const midX = (anchor.source.x + anchor.target.x) / 2;
                const midY = (anchor.source.y + anchor.target.y) / 2;

                return (
                  <g key={`${rel.from}-${rel.to}`}>
                    <path
                      d={d}
                      fill="none"
                      stroke={isHighlighted ? "#f97316" : "#64748b"}
                      strokeWidth={isHighlighted ? 3 : 2}
                      strokeDasharray={isHighlighted ? "6, 6" : undefined}
                      markerEnd={isHighlighted ? "url(#se-arrow-orange)" : "url(#se-arrow-blue)"}
                      style={{ pointerEvents: "stroke", cursor: "pointer" }}
                      onMouseEnter={() => {
                        setHoveredRelIdx(idx);
                        showToast(`Join: ${rel.from}.${rel.fromKey} ⇄ ${rel.to}.${rel.toKey}`);
                      }}
                      onMouseLeave={() => setHoveredRelIdx(null)}
                    />
                    <rect
                      x={midX - 24}
                      y={midY - 9}
                      width="48"
                      height="18"
                      rx="9"
                      fill="#1e293b"
                      stroke={isHighlighted ? "#f97316" : "#475569"}
                      strokeWidth="1"
                    />
                    <text
                      x={midX}
                      y={midY + 3.5}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="700"
                      fill={isHighlighted ? "#fb923c" : "#60a5fa"}
                    >
                      {rel.cardFrom} : {rel.cardTo}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Table Cards */}
            {tables.map((table) => {
              const tableMatches =
                !query ||
                table.name.toLowerCase().includes(query) ||
                table.columns.some((c) => c.name.toLowerCase().includes(query));

              return (
                <div
                  key={table.id}
                  className={`se-table-card ${hoveredTableId === table.id ? "hovered" : ""} ${
                    draggingId === table.id ? "dragging" : ""
                  }`}
                  style={{
                    left: `${table.pos.x}px`,
                    top: `${table.pos.y}px`,
                    opacity: query && !tableMatches ? 0.35 : 1
                  }}
                  onMouseDown={(e) => handleCardMouseDown(e, table)}
                  onMouseEnter={() => setHoveredTableId(table.id)}
                  onMouseLeave={() => setHoveredTableId(null)}
                >
                  <div className={`se-card-head ${table.type}`}>
                    <span style={{ fontWeight: 800, fontSize: "12px", color: "#fff" }}>
                      {table.name}
                    </span>
                    <span
                      className={`se-type-pill ${
                        table.type === "fact"
                          ? "se-type-fact"
                          : table.type === "subdim"
                          ? "se-type-subdim"
                          : "se-type-dim"
                      }`}
                    >
                      {table.type === "fact" ? "Fact" : table.type === "subdim" ? "Sub-Dim" : "Dim"}
                    </span>
                  </div>
                  <div className="se-card-cols">
                    {table.columns.map((col) => {
                      const colMatch = query && col.name.toLowerCase().includes(query);
                      return (
                        <div
                          key={col.name}
                          className={`se-col-row ${colMatch ? "match" : ""}`}
                        >
                          <div style={{ display: "flex", alignItems: "center", overflow: "hidden" }}>
                            {col.key === "PK" && <span className="se-key-pk">PK</span>}
                            {col.key === "FK" && <span className="se-key-fk">FK</span>}
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                              {col.name}
                            </span>
                          </div>
                          <span style={{ fontSize: "9.5px", color: "#64748b" }}>{col.type}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="se-card-foot">
                    <span>{table.columns.length} columns</span>
                    <span className="se-ddl-link" onClick={() => setModalTable(table)}>
                      View DDL →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      {/* SQL DDL Inspector Modal */}
      {modalTable && (
        <div className="se-modal-backdrop" onClick={() => setModalTable(null)}>
          <div className="se-modal-box" onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                padding: "14px 20px",
                borderBottom: "1px solid #1e293b",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 800, color: "#fff" }}>
                  {modalTable.name}
                </h3>
                <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                  {modalTable.type === "fact" ? "Fact Entity" : "Dimension Entity"} •{" "}
                  {modalTable.columns.length} Columns
                </span>
              </div>
              <button
                type="button"
                onClick={() => setModalTable(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  fontSize: "18px",
                  cursor: "pointer"
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: "18px 20px", maxHeight: "70vh", overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase" }}>
                  SQL DDL Definition
                </span>
                <button
                  type="button"
                  onClick={copySQL}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#60a5fa",
                    fontSize: "11.5px",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  Copy SQL
                </button>
              </div>
              <pre
                style={{
                  background: "#090d16",
                  padding: "14px",
                  borderRadius: "12px",
                  fontSize: "11.5px",
                  color: "#e2e8f0",
                  overflowX: "auto",
                  margin: 0
                }}
              >
                <code>{generateDDL(modalTable)}</code>
              </pre>
            </div>
          </div>
        </div>
      )}

      {toastMsg && <div className="se-toast">✓ {toastMsg}</div>}
    </div>
  );
}

