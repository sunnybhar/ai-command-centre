import { useState } from "react";
import "./styles/dashboard.css";
import { Icon, Icons } from "./components/Icons";
import PRDGenerator      from "./tools/PRDGenerator";
import ABTesting         from "./tools/ABTesting";
import SentimentSentinel from "./tools/SentimentSentinel";
import ScoutAgent        from "./tools/ScoutAgent";
import PriceTracker      from "./tools/PriceTracker";
import LeadsEngine       from "./tools/LeadsEngine";

// ── Tool Registry ─────────────────────────────────────────────────────────────
const TOOLS = [
  {
    id: "prd",
    num: "TOOL 01",
    label: "PRD Generator",
    emoji: "📄",
    icon: Icons.prd,
    tag: "AI",
    color: "#1a56db",
    desc: "Converts a rough product idea into a fully structured PRD — user stories, tech specs, risks, and KPIs.",
    Component: PRDGenerator,
  },
  {
    id: "ab",
    num: "TOOL 02",
    label: "A/B Testing",
    emoji: "📊",
    icon: Icons.ab,
    tag: "AI",
    color: "#0a9e78",
    desc: "Upload test data, run chi-squared analysis, and get an AI-generated VP-ready Slack summary.",
    Component: ABTesting,
  },
  {
    id: "sentiment",
    num: "TOOL 03",
    label: "Sentiment Sentinel",
    emoji: "🛡️",
    icon: Icons.sentiment,
    tag: "AI",
    color: "#7c3aed",
    desc: "Monitors Reddit for brand sentiment — crisis flags, Gen Z trends, and weekly executive digest.",
    Component: SentimentSentinel,
  },
  {
    id: "scout",
    num: "TOOL 04",
    label: "Scout Agent",
    emoji: "🎯",
    icon: Icons.scout,
    tag: "AI",
    color: "#db2777",
    desc: "Scores Gen Z leads by intent signals and generates personalized outreach emails per prospect.",
    Component: ScoutAgent,
  },
  {
    id: "price",
    num: "TOOL 05",
    label: "Price Tracker",
    emoji: "🏷️",
    icon: Icons.price,
    tag: "SCRAPER",
    color: "#0891b2",
    desc: "Scrapes live product prices across any URL list and exports timestamped CSV reports.",
    Component: PriceTracker,
  },
  {
    id: "leads",
    num: "TOOL 06",
    label: "Leads Engine",
    emoji: "🚀",
    icon: Icons.leads,
    tag: "AI",
    color: "#ea580c",
    desc: "Reads B2B lead CSVs and drafts AIDA-framework cold emails tailored to each prospect's pain point.",
    Component: LeadsEngine,
  },
];

// ── Home Page ─────────────────────────────────────────────────────────────────
function HomePage({ onLaunch }) {
  return (
    <div className="home">
      {/* Header */}
      <div className="home-eyebrow">AI Ops Toolkit · Fordham MBA · Gabelli School of Business</div>
      <h1 className="home-title">AI Command Centre</h1>
      <p className="home-sub">
        A personal product management toolkit. Each tool handles one part of the PM workflow —
        from writing PRDs and running A/B tests to brand monitoring, lead scoring, and cold outreach.
      </p>

      {/* Progress */}
      <div className="progress-card">
        <div className="progress-label">Suite Progress</div>
        <div className="progress-bar-wrap">
          <div className="progress-bar-fill" style={{ width: "100%" }} />
        </div>
        <div className="progress-meta">6 / 6 tools built</div>
        <div>
          <div className="progress-count">6</div>
          <div className="progress-of">of 6 live</div>
        </div>
      </div>

      {/* Tool Cards */}
      <div className="section-label">Live Tools — Click to Launch</div>
      <div className="cards-grid">
        {TOOLS.map((t) => (
          <div
            key={t.id}
            className="tool-card"
            style={{ "--card-color": t.color }}
            onClick={() => onLaunch(t.id)}
          >
            <div className="tool-card-top">
              <div className="tool-card-num">{t.num}</div>
              <div className="tool-card-arrow">→</div>
            </div>
            <div className="tool-card-icon">{t.emoji}</div>
            <div className="tool-card-title">{t.label}</div>
            <div className="tool-card-desc">{t.desc}</div>
            <div className="tool-card-launch">
              Launch →
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── App Shell ─────────────────────────────────────────────────────────────────
export default function App() {
  const [active, setActive]     = useState("home");
  const [apiKey, setApiKey]     = useState("");
  const [keySaved, setKeySaved] = useState(false);

  const tool = TOOLS.find((t) => t.id === active);

  function saveKey() {
    if (apiKey.trim().length > 10) setKeySaved(true);
  }

  return (
    <div className="shell">
      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-eyebrow">AI Ops Toolkit</div>
          <div className="logo-title">
            Sunny Bhargava<br />
            Command Centre<br />
            for Product Management
          </div>
          <div className="logo-sub">Fordham · Gabelli MBA · 2027</div>
        </div>

        <nav className="nav">
          {/* Home */}
          <button
            className={`nav-home${active === "home" ? " active" : ""}`}
            onClick={() => setActive("home")}
          >
            <Icon d={Icons.home} size={15} /> Dashboard Home
          </button>

          <div className="nav-label">Tools</div>
          {TOOLS.map((t) => (
            <button
              key={t.id}
              className={`nav-item${active === t.id ? " active" : ""}`}
              onClick={() => setActive(t.id)}
            >
              <Icon d={t.icon} size={15} />
              {t.label}
              <span className="badge">{t.tag}</span>
            </button>
          ))}
        </nav>

        {/* API Key */}
        <div className="apibar">
          <div className="apibar-label">
            <span className={`dot${keySaved ? " ok" : ""}`} />
            {keySaved ? "API Key Active" : "Anthropic API Key"}
          </div>
          <input
            type="password"
            placeholder="sk-ant-..."
            value={apiKey}
            onChange={(e) => { setApiKey(e.target.value); setKeySaved(false); }}
            onBlur={saveKey}
            onKeyDown={(e) => e.key === "Enter" && saveKey()}
          />
          {keySaved ? (
            <div className="apibar-hint" style={{ color: "var(--green)" }}>✓ All AI tools ready</div>
          ) : apiKey.length > 10 ? (
            <div className="apibar-hint" style={{ color: "#3a5a7a" }}>Press Enter to activate</div>
          ) : null}
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="main">
        {/* Topbar */}
        {active !== "home" && tool && (
          <div className="topbar">
            <div>
              <div className="topbar-title">{tool.label}</div>
              <div className="topbar-desc">{tool.desc}</div>
            </div>
            <span className={`topbar-tag${tool.tag === "AI" ? "" : " green"}`}>{tool.tag}</span>
          </div>
        )}

        {active === "home" && (
          <div className="topbar">
            <div>
              <div className="topbar-title">AI Command Centre</div>
              <div className="topbar-desc">Sunny Bhargava · Fordham Gabelli MBA · Class of 2027</div>
            </div>
          </div>
        )}

        {/* Panel */}
        <div className="panel">
          {active === "home" ? (
            <HomePage onLaunch={(id) => setActive(id)} />
          ) : (
            <>
              {!keySaved && tool?.tag === "AI" && (
                <div className="alert alert-warn" style={{ marginBottom: 20 }}>
                  <Icon d={Icons.warning} size={14} />
                  Enter your Anthropic API key in the sidebar to activate this tool.
                  Get a free key at <strong>console.anthropic.com</strong>
                </div>
              )}
              {tool && <tool.Component apiKey={apiKey} />}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
