import { useState, useRef } from "react";

// ── Icons ──────────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const Icons = {
  prd:       "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
  ab:        "M18 20V10 M12 20V4 M6 20v-6",
  sentiment: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  scout:     "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  price:     "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z M7 7h.01",
  leads:     "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.05 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z",
  key:       "M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4",
  copy:      "M8 17.929H6c-1.105 0-2-.912-2-2.036V5.036C4 3.91 4.895 3 6 3h8c1.105 0 2 .911 2 2.036v1.866m-6 .17h8c1.105 0 2 .91 2 2.035v10.857C20 21.09 19.105 22 18 22h-8c-1.105 0-2-.911-2-2.036V9.107c0-1.124.895-2.036 2-2.036z",
  download:  "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3",
  run:       "M5 3l14 9-14 9V3z",
  upload:    "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12",
  check:     "M20 6L9 17l-5-5",
  warning:   "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01",
};

// ── Styles ─────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Syne:wght@400;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:       #f4f6f9;
    --surface:  #ffffff;
    --border:   #e2e8f0;
    --muted:    #edf2f7;
    --text:     #1a2535;
    --dim:      #7a90a8;
    --accent:   #1a56db;
    --accent2:  #0a9e78;
    --danger:   #dc3545;
    --mono:     'IBM Plex Mono', monospace;
    --sans:     'Syne', sans-serif;
  }

  body { background: var(--bg); color: var(--text); font-family: var(--sans); }

  .shell { display: flex; height: 100vh; overflow: hidden; }

  /* SIDEBAR */
  .sidebar {
    width: 220px; min-width: 220px;
    background: var(--surface);
    border-right: 1px solid var(--border);
    display: flex; flex-direction: column;
    padding: 0;
  }
  .logo {
    padding: 20px 20px 16px;
    border-bottom: 1px solid var(--border);
  }
  .logo-label {
    font-family: var(--mono); font-size: 10px; letter-spacing: 0.15em;
    color: var(--accent); text-transform: uppercase; margin-bottom: 4px;
  }
  .logo-title {
    font-family: var(--sans); font-size: 18px; font-weight: 800;
    color: var(--text); line-height: 1.1;
  }
  .logo-sub {
    font-family: var(--mono); font-size: 9px; color: var(--dim);
    letter-spacing: 0.1em; margin-top: 2px;
  }
  .nav { flex: 1; padding: 12px 10px; display: flex; flex-direction: column; gap: 2px; }
  .nav-section-label {
    font-family: var(--mono); font-size: 9px; letter-spacing: 0.15em;
    color: var(--dim); text-transform: uppercase; padding: 8px 10px 4px;
  }
  .nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 12px; border-radius: 6px; cursor: pointer;
    font-family: var(--sans); font-size: 13px; font-weight: 600;
    color: #7a9cc0; transition: all 0.15s; border: 1px solid transparent;
    background: none;
  }
  .nav-item:hover { color: #ffffff; background: rgba(255,255,255,0.07); }
  .nav-item.active {
    color: #ffffff; background: rgba(26,86,219,0.3);
    border-color: rgba(26,86,219,0.4);
  }
  .nav-item .badge {
    margin-left: auto; font-family: var(--mono); font-size: 9px;
    padding: 2px 6px; border-radius: 3px; background: rgba(255,255,255,0.08);
    color: #5a7a9a; letter-spacing: 0.05em;
  }
  .nav-item.active .badge { background: rgba(26,86,219,0.3); color: #90b8ff; }

  /* API KEY BAR */
  .apibar {
    padding: 14px 16px;
    border-top: 1px solid rgba(255,255,255,0.08);
    background: #131e2e;
  }
  .apibar-label {
    font-family: var(--mono); font-size: 9px; letter-spacing: 0.12em;
    color: #4a6a8a; text-transform: uppercase; margin-bottom: 6px;
    display: flex; align-items: center; gap: 6px;
  }
  .apibar-label .dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--danger); display: inline-block;
  }
  .apibar-label .dot.ok { background: var(--accent2); }
  .apibar input {
    width: 100%; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1);
    border-radius: 5px; padding: 7px 10px; color: #c8d6e0;
    font-family: var(--mono); font-size: 11px;
    outline: none; transition: border 0.15s;
  }
  .apibar input:focus { border-color: #1a56db; }

  /* MAIN */
  .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

  /* TOPBAR */
  .topbar {
    height: 56px; min-height: 56px;
    background: var(--surface); border-bottom: 1px solid var(--border);
    display: flex; align-items: center; padding: 0 28px;
    gap: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  }
  .topbar-title { font-size: 16px; font-weight: 800; color: var(--text); }
  .topbar-desc { font-family: var(--mono); font-size: 11px; color: var(--dim); }
  .topbar-tag {
    margin-left: auto; font-family: var(--mono); font-size: 10px;
    padding: 3px 8px; border-radius: 4px; letter-spacing: 0.08em;
    background: rgba(26,86,219,0.08); color: var(--accent); border: 1px solid rgba(26,86,219,0.2);
  }
  .topbar-tag.ai { background: rgba(10,158,120,0.08); color: var(--accent2); border-color: rgba(10,158,120,0.2); }

  /* PANEL */
  .panel { flex: 1; overflow-y: auto; padding: 28px; }
  .panel::-webkit-scrollbar { width: 4px; }
  .panel::-webkit-scrollbar-track { background: transparent; }
  .panel::-webkit-scrollbar-thumb { background: var(--muted); border-radius: 2px; }

  /* CARDS */
  .card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 10px; padding: 22px; margin-bottom: 16px;
  }
  .card-title {
    font-family: var(--mono); font-size: 10px; letter-spacing: 0.15em;
    color: var(--accent); text-transform: uppercase; margin-bottom: 12px;
  }

  /* FORM ELEMENTS */
  textarea, input[type=text], input[type=url] {
    width: 100%; background: var(--bg); border: 1px solid var(--border);
    border-radius: 6px; padding: 12px 14px; color: var(--text);
    font-family: var(--mono); font-size: 12px; outline: none;
    transition: border 0.15s; resize: vertical;
  }
  textarea:focus, input[type=text]:focus, input[type=url]:focus {
    border-color: var(--accent);
  }
  label {
    display: block; font-family: var(--mono); font-size: 10px;
    letter-spacing: 0.1em; color: var(--dim); text-transform: uppercase;
    margin-bottom: 6px;
  }
  .field { margin-bottom: 14px; }

  /* BUTTONS */
  .btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 10px 20px; border-radius: 6px; border: none;
    font-family: var(--sans); font-size: 13px; font-weight: 700;
    cursor: pointer; transition: all 0.15s; letter-spacing: 0.02em;
  }
  .btn-primary {
    background: var(--accent); color: #fff;
  }
  .btn-primary:hover { background: #1446b8; transform: translateY(-1px); }
  .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
  .btn-ghost {
    background: var(--muted); color: var(--text); border: 1px solid var(--border);
  }
  .btn-ghost:hover { background: var(--border); }

  /* OUTPUT */
  .output {
    background: var(--bg); border: 1px solid var(--border);
    border-radius: 8px; padding: 20px; margin-top: 16px;
    font-family: var(--mono); font-size: 12px; line-height: 1.7;
    color: var(--text); white-space: pre-wrap;
    max-height: 500px; overflow-y: auto;
  }
  .output::-webkit-scrollbar { width: 4px; }
  .output::-webkit-scrollbar-thumb { background: var(--muted); }

  /* MARKDOWN OUTPUT */
  .md-output { font-family: var(--sans); font-size: 14px; line-height: 1.7; }
  .md-output h2 { font-size: 16px; font-weight: 700; color: var(--accent); margin: 20px 0 8px; font-family: var(--mono); letter-spacing: 0.05em; }
  .md-output h3 { font-size: 14px; font-weight: 700; color: var(--text); margin: 14px 0 6px; }
  .md-output ul { padding-left: 20px; }
  .md-output li { margin-bottom: 4px; }
  .md-output strong { color: var(--text); }
  .md-output p { margin-bottom: 8px; }
  .md-output code { font-family: var(--mono); font-size: 11px; background: var(--muted); padding: 2px 6px; border-radius: 3px; }

  /* STATUS / SPINNER */
  .status {
    display: flex; align-items: center; gap: 10px;
    font-family: var(--mono); font-size: 11px; color: var(--dim);
    padding: 12px 0;
  }
  .spinner {
    width: 14px; height: 14px; border: 2px solid var(--muted);
    border-top-color: var(--accent); border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ALERT */
  .alert {
    padding: 12px 16px; border-radius: 6px; font-family: var(--mono); font-size: 11px;
    display: flex; align-items: center; gap: 10px; margin-bottom: 14px;
  }
  .alert-warn { background: rgba(26,86,219,0.06); border: 1px solid rgba(26,86,219,0.2); color: #1446b8; }
  .alert-ok   { background: rgba(10,158,120,0.06); border: 1px solid rgba(10,158,120,0.2); color: var(--accent2); }
  .alert-err  { background: rgba(220,53,69,0.06); border: 1px solid rgba(220,53,69,0.2); color: var(--danger); }

  /* STATS GRID */
  .stats-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; margin-bottom: 16px; }
  .stat-card {
    background: var(--bg); border: 1px solid var(--border); border-radius: 8px;
    padding: 16px; text-align: center;
  }
  .stat-value { font-family: var(--mono); font-size: 28px; font-weight: 600; color: #fff; line-height: 1; }
  .stat-label { font-family: var(--mono); font-size: 9px; letter-spacing: 0.12em; color: var(--dim); margin-top: 6px; text-transform: uppercase; }
  .stat-card.highlight .stat-value { color: var(--accent2); }
  .stat-card.danger .stat-value { color: var(--danger); }

  /* TABLE */
  .data-table { width: 100%; border-collapse: collapse; font-family: var(--mono); font-size: 11px; }
  .data-table th { text-align: left; padding: 8px 12px; color: var(--dim); font-weight: 500; border-bottom: 1px solid var(--border); font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; }
  .data-table td { padding: 10px 12px; border-bottom: 1px solid rgba(30,40,50,0.5); color: var(--text); vertical-align: top; }
  .data-table tr:hover td { background: rgba(255,255,255,0.02); }
  .chip {
    display: inline-block; padding: 2px 8px; border-radius: 3px;
    font-size: 9px; letter-spacing: 0.08em; font-weight: 600;
  }
  .chip-green { background: rgba(0,200,160,0.15); color: var(--accent2); }
  .chip-red   { background: rgba(224,85,85,0.15); color: var(--danger); }
  .chip-amber { background: rgba(240,165,0,0.15); color: var(--accent); }

  /* TABS */
  .tabs { display: flex; gap: 2px; margin-bottom: 16px; }
  .tab {
    padding: 7px 16px; font-family: var(--mono); font-size: 11px;
    cursor: pointer; border-radius: 5px; border: 1px solid transparent;
    color: var(--dim); transition: all 0.15s; background: none;
  }
  .tab.active { color: var(--accent); border-color: rgba(240,165,0,0.2); background: rgba(240,165,0,0.08); }
  .tab:hover:not(.active) { color: var(--text); background: var(--muted); }

  /* PROGRESS BAR */
  .progress-bar { height: 4px; background: var(--muted); border-radius: 2px; overflow: hidden; margin: 6px 0; }
  .progress-fill { height: 100%; background: var(--accent); border-radius: 2px; transition: width 0.3s; }
  .progress-fill.green { background: var(--accent2); }

  /* COPY BTN */
  .copy-btn {
    font-family: var(--mono); font-size: 10px; padding: 5px 10px;
    background: var(--muted); border: 1px solid var(--border);
    color: var(--dim); border-radius: 4px; cursor: pointer;
    transition: all 0.15s;
  }
  .copy-btn:hover { color: var(--text); background: var(--border); }

  /* COMING SOON */
  .coming-soon {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    height: 300px; gap: 14px; opacity: 0.4;
  }
  .coming-soon-icon { font-size: 40px; }
  .coming-soon-text { font-family: var(--mono); font-size: 12px; color: var(--dim); letter-spacing: 0.1em; }

  /* URL ROW */
  .url-row { display: flex; gap: 8px; margin-bottom: 8px; }
  .url-row input { flex: 1; }

  /* SENTIMENT BAR */
  .sent-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
  .sent-label { font-family: var(--mono); font-size: 10px; color: var(--dim); width: 100px; flex-shrink: 0; }
  .sent-bar-wrap { flex: 1; height: 6px; background: var(--muted); border-radius: 3px; overflow: hidden; }
  .sent-bar-fill { height: 100%; border-radius: 3px; }
  .sent-count { font-family: var(--mono); font-size: 10px; color: var(--dim); width: 30px; text-align: right; }
`;

// ── Markdown Renderer ───────────────────────────────────────────────────────────
function renderMarkdown(text) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    if (line.startsWith("## "))  return <h2 key={i}>{line.slice(3)}</h2>;
    if (line.startsWith("### ")) return <h3 key={i}>{line.slice(4)}</h3>;
    if (line.startsWith("* ") || line.startsWith("- ")) {
      return <li key={i} dangerouslySetInnerHTML={{ __html: line.slice(2).replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>") }} />;
    }
    if (line.trim() === "") return <br key={i} />;
    return <p key={i} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>") }} />;
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// TOOL 1: PRD GENERATOR
// ═══════════════════════════════════════════════════════════════════════════════
const PRD_SYSTEM = `You are a Principal Product Manager at a major tech company.
Task: Take the user's rough idea and expand it into a fully detailed Technical Product Requirements Document (PRD).

Output Structure (Strictly Follow This):

## 1. Executive Summary
* **The Problem:** Root cause analysis (5 Whys).
* **Target Audience:** Personas and User Context.
* **Strategic Fit:** Why this? Why now?

## 2. Detailed Functional Requirements
* **User Stories (Gherkin Format):** Given [context], When [action], Then [outcome].
* **Detailed Workflow:** Step-by-step user journey.

## 3. UX/UI Requirements
* **Wireframe Description:** Describe exactly what the screen looks like.
* **Copywriting:** Key headlines or button text.

## 4. Technical Specifications
* **API Logic:** Define necessary API endpoints (JSON examples).
* **Data Model:** List data fields needed.
* **Integrations:** Third-party tools required.

## 5. Edge Cases & Error Handling
* **Corner Cases:** List 3 complex scenarios.
* **Error Messages:** Specific text for error states.

## 6. Risks & Mitigations
* **Technical Risks:** Security, latency, or scalability issues.
* **Business Risks:** Adoption barriers or legal concerns.
* **Mitigation Strategies:** How to solve these risks.

## 7. Success Metrics
* **North Star Metric:** The primary KPI.
* **Counter Metric:** What strictly not to break (Guardrails).

Format in Markdown. Be exhaustive.`;

function PRDGenerator() {
  const [idea, setIdea] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("rendered");
  const [copied, setCopied] = useState(false);
  const [err, setErr] = useState("");

  async function generate() {
    if (!idea.trim()) return;
    setLoading(true); setOutput(""); setErr("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: PRD_SYSTEM,
          messages: [{ role: "user", content: `User Idea: ${idea}` }]
        })
      });
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("") || "";
      setOutput(text);
    } catch(e) { setErr("API error: " + e.message); }
    setLoading(false);
  }

  function copy() {
    navigator.clipboard.writeText(output);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div>
      <div className="card">
        <div className="card-title">Product Idea</div>
        <div className="field">
          <textarea
            rows={4}
            placeholder="Describe your product idea — e.g. A feature for Uber that lets users split fares in real time..."
            value={idea}
            onChange={e => setIdea(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={generate} disabled={loading || !idea.trim()}>
          {loading ? <span className="spinner" /> : <Icon d={Icons.run} size={14} />}
          {loading ? "Generating PRD..." : "Generate PRD"}
        </button>
      </div>

      {err && <div className="alert alert-err"><Icon d={Icons.warning} size={14} />{err}</div>}

      {loading && (
        <div className="status">
          <div className="spinner" />
          Consulting Principal Product Manager...
        </div>
      )}

      {output && (
        <div className="card">
          <div style={{ display:"flex", alignItems:"center", marginBottom:14 }}>
            <div className="tabs" style={{ flex:1, marginBottom:0 }}>
              {["rendered","raw"].map(t => (
                <button key={t} className={`tab${tab===t?" active":""}`} onClick={() => setTab(t)}>
                  {t === "rendered" ? "📄 Document" : "📝 Raw Markdown"}
                </button>
              ))}
            </div>
            <button className="copy-btn" onClick={copy}>
              {copied ? "✓ Copied" : "Copy"}
            </button>
          </div>

          {tab === "rendered" ? (
            <div className="output md-output" style={{ whiteSpace:"normal" }}>
              {renderMarkdown(output)}
            </div>
          ) : (
            <div className="output">{output}</div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TOOL 2: AB TESTING
// ═══════════════════════════════════════════════════════════════════════════════
function chiSquare(a_conv, a_total, b_conv, b_total) {
  const a_fail = a_total - a_conv, b_fail = b_total - b_conv;
  const N = a_total + b_total;
  const E_a_c = (a_total * (a_conv + b_conv)) / N;
  const E_a_f = (a_total * (a_fail + b_fail)) / N;
  const E_b_c = (b_total * (a_conv + b_conv)) / N;
  const E_b_f = (b_total * (a_fail + b_fail)) / N;
  const chi = ((a_conv-E_a_c)**2/E_a_c) + ((a_fail-E_a_f)**2/E_a_f) +
               ((b_conv-E_b_c)**2/E_b_c) + ((b_fail-E_b_f)**2/E_b_f);
  // p-value approx from chi-sq with df=1
  const p = Math.exp(-0.5 * chi) * (1 + chi/2);
  return { chi: chi.toFixed(4), p: Math.min(p, 1).toFixed(4) };
}

function ABTesting() {
  const [csv, setCsv] = useState(null);
  const [result, setResult] = useState(null);
  const [aiMsg, setAiMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("");
  const fileRef = useRef();

  function parseCSV(text) {
    const rows = text.trim().split("\n").map(r => r.split(","));
    const header = rows[0].map(h => h.trim().replace(/^"|"$/g,""));
    return rows.slice(1).map(r => {
      const obj = {};
      header.forEach((h,i) => obj[h] = (r[i]||"").trim().replace(/^"|"$/g,""));
      return obj;
    });
  }

  function analyze(data) {
    const groups = {};
    data.forEach(r => {
      const g = r.Group || r.group;
      const c = parseInt(r.Converted || r.converted || 0);
      if (!groups[g]) groups[g] = { conv:0, total:0 };
      groups[g].conv += c; groups[g].total += 1;
    });
    return groups;
  }

  async function run() {
    if (!csv) return;
    setLoading(true); setAiMsg(""); setResult(null);

    try {
      setStep("Parsing CSV...");
      const parsed = parseCSV(csv);
      const groups = analyze(parsed);
      const keys = Object.keys(groups);
      const A = groups[keys[0]], B = groups[keys[1]];
      const crA = ((A.conv/A.total)*100).toFixed(2);
      const crB = ((B.conv/B.total)*100).toFixed(2);
      const { chi, p } = chiSquare(A.conv, A.total, B.conv, B.total);
      const sig = parseFloat(p) < 0.05;
      const lift = (((B.conv/B.total) - (A.conv/A.total))/(A.conv/A.total)*100).toFixed(1);

      const stats = { keys, A, B, crA, crB, chi, p, sig, lift };
      setResult(stats);

      setStep("AI generating Slack summary...");
      const statsText = `Group A (${keys[0]}) CR: ${crA}%\nGroup B (${keys[1]}) CR: ${crB}%\nP-Value: ${p}\nLift: ${lift}%\nTest Result: ${sig?"WINNER":"INCONCLUSIVE"}`;
      const prompt = `You are a Senior PM presenting A/B test results to a VP.\n\nStats:\n${statsText}\n\nWrite a concise Slack message (max 120 words) that:\n1. Announces the winner in plain English\n2. Explains p-value using a simple analogy (no jargon)\n3. Gives clear GO / NO-GO recommendation\n4. Uses 1-2 emojis\n\nDo NOT use "statistically significant", "null hypothesis", or "chi-squared".`;

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          messages: [{ role:"user", content: prompt }]
        })
      });
      const d = await res.json();
      setAiMsg(d.content?.map(b=>b.text||"").join("") || "");
    } catch(e) { setStep("Error: " + e.message); }
    setLoading(false); setStep("");
  }

  return (
    <div>
      <div className="card">
        <div className="card-title">Upload A/B Test Data (CSV)</div>
        <div className="alert alert-warn">
          <Icon d={Icons.warning} size={14} />
          CSV must have columns: <strong>Visitor_ID, Group, Converted</strong>
        </div>
        <input ref={fileRef} type="file" accept=".csv"
          style={{ display:"none" }}
          onChange={e => {
            const f = e.target.files[0];
            if (!f) return;
            const r = new FileReader();
            r.onload = ev => setCsv(ev.target.result);
            r.readAsText(f);
          }}
        />
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <button className="btn btn-ghost" onClick={() => fileRef.current.click()}>
            <Icon d={Icons.upload} size={14} />
            {csv ? "✓ CSV Loaded" : "Choose CSV"}
          </button>
          <button className="btn btn-primary" onClick={run} disabled={!csv || loading}>
            {loading ? <span className="spinner"/> : <Icon d={Icons.run} size={14}/>}
            {loading ? step || "Analyzing..." : "Run Analysis"}
          </button>
        </div>
      </div>

      {result && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{result.crA}%</div>
              <div className="stat-label">Control CR ({result.keys[0]})</div>
            </div>
            <div className={`stat-card ${result.sig ? "highlight" : ""}`}>
              <div className="stat-value">{result.crB}%</div>
              <div className="stat-label">Variant CR ({result.keys[1]})</div>
            </div>
            <div className={`stat-card ${result.sig ? "highlight" : "danger"}`}>
              <div className="stat-value">{result.sig ? "✓ WIN" : "— N/S"}</div>
              <div className="stat-label">p={result.p} | lift {result.lift}%</div>
            </div>
          </div>

          <div className={`alert ${result.sig ? "alert-ok" : "alert-err"}`}>
            <Icon d={result.sig ? Icons.check : Icons.warning} size={14} />
            {result.sig
              ? `Statistically significant at p=${result.p}. Variant B wins with +${result.lift}% lift. Recommend shipping.`
              : `Not significant (p=${result.p}). Difference may be random noise. Do not ship yet.`}
          </div>
        </>
      )}

      {aiMsg && (
        <div className="card">
          <div className="card-title">📣 AI Slack Summary (VP-Ready)</div>
          <div className="output">{aiMsg}</div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TOOL 3: SENTIMENT SENTINEL
// ═══════════════════════════════════════════════════════════════════════════════
const SENTINEL_SYSTEM = `You are a brand sentiment intelligence AI.
You analyze public Reddit posts about a brand.
Respond ONLY in this exact JSON format (no markdown fences):
{
  "sentiment": one of ["Positive","Negative","Crisis Risk","Emerging Trend","Neutral"],
  "sentiment_score": integer from -100 to +100,
  "themes": ["theme1","theme2"],
  "crisis_flag": true or false,
  "trend_signal": true or false,
  "one_line_summary": "under 15 words"
}`;

function SentimentSentinel() {
  const [brand, setBrand] = useState("Harley Davidson");
  const [posts, setPosts] = useState([]);
  const [digest, setDigest] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("");
  const [score, setScore] = useState(null);

  const MOCK_POSTS = [
    { title: `${brand} just dropped their new lineup and it looks incredible`, body: "The new models are stunning. Gen Z is finally paying attention.", subreddit:"motorcycles", score:312 },
    { title: `Why does ${brand} cost so much? Indian is better value`, body:"Switched to Indian last month. No regrets honestly.", subreddit:"motorcycles", score:89 },
    { title: `${brand} owner community is so welcoming`, body:"Went to my first rally. Everyone was super friendly.", subreddit:"motocamping", score:201 },
    { title: `${brand} reliability issues in 2024 — anyone else?`, body:"Third time back at the dealer this year. Getting tired of it.", subreddit:"harley", score:445 },
    { title: `Young riders are choosing ${brand} for adventure touring now`, body:"Van life + motorcycle combo is trending. HD fits right in.", subreddit:"vanlife", score:178 },
  ];

  async function run() {
    setLoading(true); setPosts([]); setDigest(""); setScore(null);
    const analyzed = [];
    for (let i = 0; i < MOCK_POSTS.length; i++) {
      const p = MOCK_POSTS[i];
      setStep(`Analyzing post ${i+1}/${MOCK_POSTS.length}...`);
      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body: JSON.stringify({
            model:"claude-sonnet-4-20250514", max_tokens:1000,
            system: SENTINEL_SYSTEM,
            messages:[{ role:"user", content:`Analyze this Reddit post about ${brand}:\n\nSubreddit: r/${p.subreddit}\nTitle: ${p.title}\nBody: ${p.body}\nUpvotes: ${p.score}` }]
          })
        });
        const d = await res.json();
        const txt = d.content?.map(b=>b.text||"").join("") || "{}";
        try {
          const ai = JSON.parse(txt.replace(/```json|```/g,"").trim());
          analyzed.push({ ...p, ai });
        } catch { analyzed.push({ ...p, ai:{ sentiment:"Neutral", sentiment_score:0, themes:[], crisis_flag:false, trend_signal:false, one_line_summary:"Parse error" } }); }
      } catch(e) { console.error(e); }
    }
    const avg = Math.round(analyzed.reduce((s,p)=>s+(p.ai?.sentiment_score||0),0)/analyzed.length);
    setScore(avg); setPosts(analyzed);

    setStep("Generating digest...");
    const summary = analyzed.map(p=>({ title:p.title, sentiment:p.ai?.sentiment, themes:p.ai?.themes }));
    const dRes = await fetch("https://api.anthropic.com/v1/messages", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({
        model:"claude-sonnet-4-20250514", max_tokens:1000,
        messages:[{ role:"user", content:`You are a brand strategist. Write a concise 150-word weekly brand health digest for executives about ${brand}.\n\nPosts analyzed:\n${JSON.stringify(summary,null,2)}\n\nFocus on sentiment trends, risks, and opportunities. Be direct and actionable.` }]
      })
    });
    const dData = await dRes.json();
    setDigest(dData.content?.map(b=>b.text||"").join("") || "");
    setLoading(false); setStep("");
  }

  const sentColors = { Positive:"var(--accent2)", Negative:"var(--danger)", "Crisis Risk":"var(--danger)", "Emerging Trend":"var(--accent)", Neutral:"var(--dim)" };
  const sentCounts = posts.reduce((acc,p) => { const s=p.ai?.sentiment||"Neutral"; acc[s]=(acc[s]||0)+1; return acc; }, {});

  return (
    <div>
      <div className="card">
        <div className="card-title">Brand Monitor Configuration</div>
        <div className="field">
          <label>Brand Name</label>
          <input type="text" value={brand} onChange={e=>setBrand(e.target.value)} />
        </div>
        <div className="alert alert-warn">
          <Icon d={Icons.warning} size={14}/>
          Demo mode: analyzing 5 curated posts. Production version fetches live Reddit data.
        </div>
        <button className="btn btn-primary" onClick={run} disabled={loading||!brand.trim()}>
          {loading ? <span className="spinner"/> : <Icon d={Icons.run} size={14}/>}
          {loading ? step : "Run Brand Scan"}
        </button>
      </div>

      {score !== null && (
        <div className="stats-grid">
          <div className={`stat-card ${score>20?"highlight":score<-20?"danger":""}`}>
            <div className="stat-value">{score > 0 ? "+" : ""}{score}</div>
            <div className="stat-label">Brand Health Score</div>
          </div>
          <div className={`stat-card ${posts.filter(p=>p.ai?.crisis_flag).length>0?"danger":"highlight"}`}>
            <div className="stat-value">{posts.filter(p=>p.ai?.crisis_flag).length}</div>
            <div className="stat-label">Crisis Flags</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{posts.filter(p=>p.ai?.trend_signal).length}</div>
            <div className="stat-label">Trend Signals</div>
          </div>
        </div>
      )}

      {posts.length > 0 && (
        <>
          <div className="card">
            <div className="card-title">Sentiment Breakdown</div>
            {["Positive","Neutral","Emerging Trend","Negative","Crisis Risk"].map(s => (
              <div key={s} className="sent-row">
                <div className="sent-label">{s}</div>
                <div className="sent-bar-wrap">
                  <div className="sent-bar-fill" style={{ width:`${((sentCounts[s]||0)/posts.length)*100}%`, background: sentColors[s] }} />
                </div>
                <div className="sent-count">{sentCounts[s]||0}</div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-title">Post Analysis</div>
            <table className="data-table">
              <thead><tr><th>Title</th><th>Sentiment</th><th>Score</th><th>Summary</th></tr></thead>
              <tbody>
                {posts.map((p,i) => (
                  <tr key={i}>
                    <td style={{maxWidth:200}}>{p.title.slice(0,60)}...</td>
                    <td><span className="chip" style={{ background:`${sentColors[p.ai?.sentiment]}22`, color:sentColors[p.ai?.sentiment] }}>{p.ai?.sentiment}</span></td>
                    <td style={{color: p.ai?.sentiment_score>0?"var(--accent2)":"var(--danger)"}}>{p.ai?.sentiment_score>0?"+":""}{p.ai?.sentiment_score}</td>
                    <td style={{color:"var(--dim)",fontSize:10}}>{p.ai?.one_line_summary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {digest && (
        <div className="card">
          <div className="card-title">Executive Digest</div>
          <div className="output">{digest}</div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TOOL 4: SCOUT AGENT
// ═══════════════════════════════════════════════════════════════════════════════
const SCOUT_SYSTEM = `You are a Sales Scout Agent — an AI sales intelligence system.
You analyze a prospect profile and make smart outreach decisions.
Respond ONLY in this exact JSON (no markdown fences):
{
  "urgency": "URGENT" or "STANDARD",
  "recommended_channel": one of ["Instagram DM","TikTok Ad","Dealer Visit","Retarget Ad","Email"],
  "reasoning": "2-3 sentences",
  "email_subject": "under 10 words",
  "email_body": "4-5 sentence personalized outreach"
}`;

function ScoutAgent() {
  const [csv, setCsv] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("");
  const [selected, setSelected] = useState(null);
  const fileRef = useRef();

  function parseLeads(text) {
    const rows = text.trim().split("\n").map(r=>r.split(","));
    const h = rows[0].map(x=>x.trim().replace(/^"|"$/g,""));
    return rows.slice(1).map(r => {
      const o={};
      h.forEach((k,i)=>o[k]=(r[i]||"").trim().replace(/^"|"$/g,""));
      return o;
    }).filter(r=>r.cohort==="Gen Z"&&r.intent_category==="High")
      .sort((a,b)=>parseInt(b.intent_score)-parseInt(a.intent_score))
      .slice(0,5);
  }

  async function run() {
    if (!csv) return;
    setLoading(true); setResults([]); setSelected(null);
    const leads = parseLeads(csv);
    const out = [];
    for (let i=0;i<leads.length;i++) {
      const l = leads[i];
      setStep(`Analyzing lead ${i+1}/${leads.length}: ${l.profile_id}`);
      try {
        const res = await fetch("https://api.anthropic.com/v1/messages",{
          method:"POST",headers:{"Content-Type":"application/json"},
          body:JSON.stringify({
            model:"claude-sonnet-4-20250514",max_tokens:1000,
            system:SCOUT_SYSTEM,
            messages:[{role:"user",content:`Analyze this prospect for Harley-Davidson:\n${JSON.stringify({
              age:l.age,state:l.state,platform:l.primary_platform,
              intent_score:l.intent_score,competitor_interest:l.competitor_interest,
              follows_harley:l.follows_harley,test_ridden_bike:l.test_ridden_bike,
              attended_moto_event:l.attended_moto_event
            },null,2)}`}]
          })
        });
        const d=await res.json();
        const txt=(d.content?.map(b=>b.text||"").join("")||"{}").replace(/```json|```/g,"").trim();
        try { out.push({...l,ai:JSON.parse(txt)}); }
        catch { out.push({...l,ai:{urgency:"STANDARD",recommended_channel:"Email",reasoning:"Parse error",email_subject:"",email_body:""}}); }
      } catch(e){console.error(e);}
    }
    setResults(out); setLoading(false); setStep("");
  }

  return (
    <div>
      <div className="card">
        <div className="card-title">Upload Prospect CSV (harley_profiles.csv)</div>
        <div className="alert alert-warn">
          <Icon d={Icons.warning} size={14}/>
          Expects columns: profile_id, cohort, age, state, intent_score, intent_category, etc.
          Processes top 5 High-Intent Gen Z leads.
        </div>
        <input ref={fileRef} type="file" accept=".csv" style={{display:"none"}}
          onChange={e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>setCsv(ev.target.result);r.readAsText(f);}}
        />
        <div style={{display:"flex",gap:10}}>
          <button className="btn btn-ghost" onClick={()=>fileRef.current.click()}>
            <Icon d={Icons.upload} size={14}/>{csv?"✓ CSV Loaded":"Choose CSV"}
          </button>
          <button className="btn btn-primary" onClick={run} disabled={!csv||loading}>
            {loading?<span className="spinner"/>:<Icon d={Icons.run} size={14}/>}
            {loading?step:"Run Scout Agent"}
          </button>
        </div>
      </div>

      {results.length>0 && (
        <div className="card">
          <div className="card-title">Lead Intelligence Report</div>
          <table className="data-table">
            <thead><tr><th>#</th><th>Profile</th><th>Age/State</th><th>Score</th><th>Urgency</th><th>Channel</th><th>Action</th></tr></thead>
            <tbody>
              {results.map((r,i)=>(
                <tr key={i}>
                  <td style={{color:"var(--dim)"}}>{i+1}</td>
                  <td>{r.profile_id}</td>
                  <td>{r.age} / {r.state}</td>
                  <td><strong style={{color:"var(--accent)"}}>{r.intent_score}</strong></td>
                  <td><span className={`chip ${r.ai?.urgency==="URGENT"?"chip-red":"chip-amber"}`}>{r.ai?.urgency}</span></td>
                  <td style={{color:"var(--dim)",fontSize:10}}>{r.ai?.recommended_channel}</td>
                  <td><button className="copy-btn" onClick={()=>setSelected(selected?.profile_id===r.profile_id?null:r)}>
                    {selected?.profile_id===r.profile_id?"Hide":"View Email"}
                  </button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="card">
          <div className="card-title">Email Draft — {selected.profile_id}</div>
          <div style={{marginBottom:10,fontFamily:"var(--mono)",fontSize:11,color:"var(--dim)"}}>
            Subject: <span style={{color:"var(--text)"}}>{selected.ai?.email_subject}</span>
          </div>
          <div className="output">{selected.ai?.email_body}</div>
          <div style={{marginTop:10,fontFamily:"var(--mono)",fontSize:10,color:"var(--dim)"}}>
            Reasoning: {selected.ai?.reasoning}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TOOL 5: PRICE TRACKER
// ═══════════════════════════════════════════════════════════════════════════════
function PriceTracker() {
  const [urls, setUrls] = useState(["http://books.toscrape.com/catalogue/a-light-in-the-attic_1000/index.html"]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("");

  function addUrl() { setUrls([...urls,""]); }
  function updateUrl(i,v) { const u=[...urls]; u[i]=v; setUrls(u); }
  function removeUrl(i) { setUrls(urls.filter((_,idx)=>idx!==i)); }

  async function run() {
    setLoading(true); setResults([]); setStep("");
    const out = [];
    const validUrls = urls.filter(u=>u.trim());
    for (let i=0;i<validUrls.length;i++) {
      const u = validUrls[i];
      setStep(`Scraping ${i+1}/${validUrls.length}...`);
      try {
        const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(u)}`);
        const d = await res.json();
        const html = d.contents;
        const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/);
        const priceMatch = html.match(/class="price_color"[^>]*>(.*?)<\/p>/);
        const availMatch = html.match(/class="instock availability"[^>]*>\s*<i[^>]*><\/i>\s*(.*?)\s*<\/p>/);
        out.push({
          url: u,
          title: titleMatch?titleMatch[1].replace(/&amp;/g,"&").replace(/&#39;/g,"'"):"Unknown",
          price: priceMatch?priceMatch[1].replace(/&pound;/g,"£").replace(/&#163;/g,"£"):"N/A",
          availability: availMatch?availMatch[1].trim():"Unknown",
          timestamp: new Date().toLocaleString()
        });
      } catch(e) {
        out.push({ url:u, title:"Error", price:"N/A", availability:"Error", timestamp: new Date().toLocaleString() });
      }
    }
    setResults(out); setLoading(false); setStep("");
  }

  function exportCSV() {
    const header = "Title,Price,Availability,URL,Timestamp";
    const rows = results.map(r=>`"${r.title}","${r.price}","${r.availability}","${r.url}","${r.timestamp}"`);
    const blob = new Blob([[header,...rows].join("\n")],{type:"text/csv"});
    const a = document.createElement("a"); a.href=URL.createObjectURL(blob);
    a.download=`price_tracker_${Date.now()}.csv`; a.click();
  }

  return (
    <div>
      <div className="card">
        <div className="card-title">Product URLs to Track</div>
        {urls.map((u,i)=>(
          <div key={i} className="url-row">
            <input type="url" placeholder="https://..." value={u} onChange={e=>updateUrl(i,e.target.value)}/>
            {urls.length>1 && <button className="copy-btn" onClick={()=>removeUrl(i)}>✕</button>}
          </div>
        ))}
        <div style={{display:"flex",gap:10,marginTop:8}}>
          <button className="btn btn-ghost" onClick={addUrl}>+ Add URL</button>
          <button className="btn btn-primary" onClick={run} disabled={loading||!urls.some(u=>u.trim())}>
            {loading?<span className="spinner"/>:<Icon d={Icons.run} size={14}/>}
            {loading?step:"Scrape Prices"}
          </button>
        </div>
      </div>

      {results.length>0 && (
        <div className="card">
          <div style={{display:"flex",alignItems:"center",marginBottom:14}}>
            <div className="card-title" style={{marginBottom:0}}>Results — {results.length} products</div>
            <button className="btn btn-ghost" style={{marginLeft:"auto",padding:"6px 12px",fontSize:11}}
              onClick={exportCSV}>
              <Icon d={Icons.download} size={12}/> Export CSV
            </button>
          </div>
          <table className="data-table">
            <thead><tr><th>Product</th><th>Price</th><th>Availability</th><th>Scraped At</th></tr></thead>
            <tbody>
              {results.map((r,i)=>(
                <tr key={i}>
                  <td style={{maxWidth:200}}>{r.title}</td>
                  <td style={{color:"var(--accent)",fontWeight:600}}>{r.price}</td>
                  <td><span className={`chip ${r.availability.includes("In stock")?"chip-green":"chip-red"}`}>{r.availability}</span></td>
                  <td style={{color:"var(--dim)",fontSize:10}}>{r.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TOOL 6: LEADS ENGINE
// ═══════════════════════════════════════════════════════════════════════════════
function LeadsEngine() {
  const [csv, setCsv] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("");
  const [selected, setSelected] = useState(null);
  const fileRef = useRef();

  function parseLeads(text) {
    const rows = text.trim().split("\n").map(r => {
      const cols=[]; let cur="",inQ=false;
      for(const c of r){if(c==='"'){inQ=!inQ;}else if(c===","&&!inQ){cols.push(cur);cur="";}else{cur+=c;}}
      cols.push(cur); return cols;
    });
    const h=rows[0].map(x=>x.trim());
    return rows.slice(1).map(r=>{const o={};h.forEach((k,i)=>o[k]=(r[i]||"").trim());return o;})
      .filter(r=>r["Pipeline Status"]==="1-Ready for AI")
      .slice(0,5);
  }

  async function run() {
    if(!csv) return;
    setLoading(true); setLeads([]); setSelected(null);
    const rawLeads = parseLeads(csv);
    const out = [];
    for(let i=0;i<rawLeads.length;i++){
      const l=rawLeads[i];
      setStep(`Drafting email ${i+1}/${rawLeads.length}: ${l["Brand Name"]}`);
      const prompt=`You are an elite B2B sales copywriter. Write a personalized cold email.

Lead: ${l["First Name"]} at ${l["Brand Name"]}
Storefronts: ${l["Active Storefronts"]}
Trigger: ${l["Trigger Event"]}
Pain Point: ${l["Assumed Pain Point"]}

RULES: Exactly 4 short sentences. Casual, peer-to-peer tone.
Sentence 1: Acknowledge their trigger event enthusiastically.
Sentence 2: Connect it to how it worsens their pain point.
Sentence 3: State that GrowthSync solves this automatically.
Sentence 4: Soft CTA — low friction ask.`;
      try {
        const res=await fetch("https://api.anthropic.com/v1/messages",{
          method:"POST",headers:{"Content-Type":"application/json"},
          body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:prompt}]})
        });
        const d=await res.json();
        out.push({...l,email:d.content?.map(b=>b.text||"").join("")||""});
      } catch(e){out.push({...l,email:"Error generating email."});}
    }
    setLeads(out); setLoading(false); setStep("");
  }

  function exportCSV(){
    if(!leads.length)return;
    const h=["First Name","Last Name","Brand Name","Active Storefronts","Trigger Event","AI Email Draft"];
    const rows=leads.map(l=>`"${l["First Name"]}","${l["Last Name"]}","${l["Brand Name"]}","${l["Active Storefronts"]}","${l["Trigger Event"]}","${l.email?.replace(/"/g,"'")}"`);
    const blob=new Blob([[h.join(","),...rows].join("\n")],{type:"text/csv"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`leads_${Date.now()}.csv`;a.click();
  }

  return (
    <div>
      <div className="card">
        <div className="card-title">Upload Leads CSV (growthsync_leads.csv)</div>
        <div className="alert alert-warn">
          <Icon d={Icons.warning} size={14}/>
          Expects columns: First Name, Brand Name, Active Storefronts, Trigger Event, Assumed Pain Point, Pipeline Status.
          Processes leads with status "1-Ready for AI" (max 5).
        </div>
        <input ref={fileRef} type="file" accept=".csv" style={{display:"none"}}
          onChange={e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>setCsv(ev.target.result);r.readAsText(f);}}
        />
        <div style={{display:"flex",gap:10}}>
          <button className="btn btn-ghost" onClick={()=>fileRef.current.click()}>
            <Icon d={Icons.upload} size={14}/>{csv?"✓ CSV Loaded":"Choose CSV"}
          </button>
          <button className="btn btn-primary" onClick={run} disabled={!csv||loading}>
            {loading?<span className="spinner"/>:<Icon d={Icons.run} size={14}/>}
            {loading?step:"Generate Emails"}
          </button>
        </div>
      </div>

      {leads.length>0 && (
        <>
          <div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}>
            <button className="btn btn-ghost" onClick={exportCSV} style={{fontSize:12,padding:"7px 14px"}}>
              <Icon d={Icons.download} size={12}/> Export Drafted CSV
            </button>
          </div>
          <div className="card">
            <div className="card-title">{leads.length} Emails Drafted</div>
            <table className="data-table">
              <thead><tr><th>Lead</th><th>Brand</th><th>Storefronts</th><th>Trigger</th><th>Action</th></tr></thead>
              <tbody>
                {leads.map((l,i)=>(
                  <tr key={i}>
                    <td>{l["First Name"]} {l["Last Name"]}</td>
                    <td>{l["Brand Name"]}</td>
                    <td style={{fontSize:10,color:"var(--dim)"}}>{l["Active Storefronts"]}</td>
                    <td style={{fontSize:10,color:"var(--dim)",maxWidth:150}}>{l["Trigger Event"]}</td>
                    <td><button className="copy-btn" onClick={()=>setSelected(selected?.["Brand Name"]===l["Brand Name"]?null:l)}>
                      {selected?.["Brand Name"]===l["Brand Name"]?"Hide":"View"}
                    </button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {selected && (
        <div className="card">
          <div className="card-title">Email Draft — {selected["First Name"]} @ {selected["Brand Name"]}</div>
          <div className="output">{selected.email}</div>
          <button className="copy-btn" style={{marginTop:10}} onClick={()=>{navigator.clipboard.writeText(selected.email);}}>Copy Email</button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TOOLS CONFIG
// ═══════════════════════════════════════════════════════════════════════════════
const TOOLS = [
  { id:"prd",       label:"PRD Generator",      icon:Icons.prd,       tag:"AI",   desc:"Generate Product Requirements Documents",    Component: PRDGenerator },
  { id:"ab",        label:"A/B Testing",         icon:Icons.ab,        tag:"AI",   desc:"Statistical analysis + AI narrative",         Component: ABTesting },
  { id:"sentiment", label:"Sentiment Sentinel",  icon:Icons.sentiment, tag:"AI",   desc:"Brand sentiment monitoring via Reddit",        Component: SentimentSentinel },
  { id:"scout",     label:"Scout Agent",         icon:Icons.scout,     tag:"AI",   desc:"AI lead scoring + personalized outreach",     Component: ScoutAgent },
  { id:"price",     label:"Price Tracker",       icon:Icons.price,     tag:"SCRAPER", desc:"Track product prices across URLs",          Component: PriceTracker },
  { id:"leads",     label:"Leads Engine",        icon:Icons.leads,     tag:"AI",   desc:"AI cold email generator for B2B leads",       Component: LeadsEngine },
];

// ═══════════════════════════════════════════════════════════════════════════════
// APP SHELL
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [active, setActive] = useState("prd");
  const tool = TOOLS.find(t => t.id === active);
  const Component = tool.Component;

  return (
    <>
      <style>{css}</style>
      <div className="shell">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="logo">
            <div className="logo-label">AI Ops Toolkit</div>
            <div className="logo-title">Sunny Bhargava<br/>Command Centre<br/>for Product Management</div>
            <div className="logo-sub">6 tools · Powered by Claude</div>
          </div>

          <nav className="nav">
            <div className="nav-section-label">Tools</div>
            {TOOLS.map(t => (
              <button
                key={t.id}
                className={`nav-item${active===t.id?" active":""}`}
                onClick={() => setActive(t.id)}
              >
                <Icon d={t.icon} size={15} />
                {t.label}
                <span className="badge">{t.tag}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <main className="main">
          <div className="topbar">
            <div>
              <div className="topbar-title">{tool.label}</div>
              <div className="topbar-desc">{tool.desc}</div>
            </div>
            <span className={`topbar-tag${tool.tag==="AI"?" ai":""}`}>{tool.tag}</span>
          </div>

          <div className="panel">
            <Component />
          </div>
        </main>
      </div>
    </>
  );
}