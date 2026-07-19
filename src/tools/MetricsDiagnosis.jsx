import { useState, useEffect, useRef } from "react";
import { Icon, Icons } from "../components/Icons";
import { callAI, getFreeRuns } from "../lib/api";
import { renderMD, downloadMarkdown, exportPrintPDF } from "../lib/markdown";

/**
 * METRICS DIAGNOSIS — Hero Tool
 * Structured root-cause analysis for product metric movements.
 * Enforces the diagnostic order most PMs skip: instrumentation first,
 * then internal vs external, segmentation, seasonality, and only then
 * ranked hypotheses with validation plans.
 *
 * Runs on claude-fable-5, the premium reasoning tier, because diagnosis
 * quality depends on multi-step causal reasoning.
 */

const DIAGNOSIS_MODEL = "claude-fable-5";

const SYSTEM_PROMPT = `You are a senior product analytics leader running a structured metric investigation. A PM has reported a metric movement. Your job is to walk a disciplined diagnostic tree BEFORE proposing causes. Undisciplined hypothesis-jumping is the failure mode you exist to prevent.

Non-negotiable rules:
1. Never invent specific numbers the user did not provide. Where data is missing, name the exact query or report that would provide it.
2. Instrumentation and data integrity come FIRST. A large share of "metric drops" are tracking bugs, definition changes, or pipeline failures.
3. Every hypothesis must carry a likelihood rating with reasoning AND a concrete validation step.
4. State your assumptions explicitly in a dedicated section. Do not smuggle them into conclusions.

Output EXACTLY this structure in Markdown:

## 1. Problem Restatement
Restate the movement precisely: metric, direction, magnitude, timeframe, and what remains unknown. One short paragraph.

## 2. Assumptions I Am Making
Bullet list of assumptions forced by missing information. Each one names what data would remove it.

## 3. Data Integrity Check (Always First)
Table: Check | What Could Be Wrong | How to Verify in 15 Minutes
Cover: tracking/instrumentation changes, metric definition changes, pipeline delays or failures, bot or spam filtering changes, timezone or date-window boundaries.

## 4. Shape of the Change
Analyze what sudden versus gradual onset would each imply for this specific metric. State which causes each shape rules in or out.

## 5. Internal vs External Scan
Two short lists: internal candidates (releases, experiments, pricing, policy changes, marketing pauses) and external candidates (competitor moves, seasonality, platform changes, market events). Tailored to the metric, not generic.

## 6. Segmentation Plan
Table: Segment Cut | What to Look For | What a Difference Would Mean
Cover at minimum: platform or device, geography, new vs returning users, acquisition channel, and one cut specific to this metric.

## 7. Ranked Hypotheses
Table: Rank | Hypothesis | Likelihood (H/M/L) | Reasoning | Validation Step
5 to 7 hypotheses, ordered by likelihood. Validation steps must be specific queries, cohorts, or checks, not "look into it."

## 8. First 60 Minutes
A numbered action sequence for the first hour of investigation, in priority order, with expected time per step.

## 9. What Would Change My Mind
2 to 3 findings that would invert the ranking above, and what each would point to instead.

Keep the whole response tight and information-dense. No filler sentences.`;

const TIMEFRAMES = ["vs yesterday", "week over week", "month over month", "vs same period last year", "gradual over weeks"];
const DIRECTIONS = ["dropped", "rose"];

export default function MetricsDiagnosis({ apiKey }) {
  // intake
  const [mode, setMode] = useState("guided");           // guided | freetext
  const [metric, setMetric] = useState("");
  const [direction, setDirection] = useState("dropped");
  const [magnitude, setMagnitude] = useState("");
  const [timeframe, setTimeframe] = useState("week over week");
  const [context, setContext] = useState("");
  const [freeText, setFreeText] = useState("");

  // output
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [tab, setTab] = useState("rendered");
  const [freeRuns, setFreeRuns] = useState(null);

  // interview mode
  const [interviewMode, setInterviewMode] = useState(false);
  const [revealed, setRevealed] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    getFreeRuns().then((d) => { if (d) setFreeRuns(d.remaining); });
    return () => clearInterval(timerRef.current);
  }, []);

  function startTimer() {
    clearInterval(timerRef.current);
    setSecondsLeft(25 * 60);
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) { clearInterval(timerRef.current); return 0; }
        return s - 1;
      });
    }, 1000);
  }

  function fmtTime(s) {
    if (s === null) return "25:00";
    const m = Math.floor(s / 60), sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }

  function buildUserContent() {
    if (mode === "freetext") return `Metric situation described by the PM:\n${freeText}`;
    return [
      `Metric: ${metric}`,
      `Movement: ${direction} ${magnitude ? magnitude + "%" : "by an unspecified amount"} ${timeframe}`,
      context.trim() ? `Known context from the PM: ${context}` : "No additional context provided.",
    ].join("\n");
  }

  const canGenerate =
    (mode === "guided" ? metric.trim() : freeText.trim()) &&
    (apiKey || (freeRuns !== null && freeRuns > 0));

  async function diagnose() {
    if (!canGenerate || loading) return;
    setLoading(true); setOutput(""); setErr("");
    setRevealed(!interviewMode);
    if (interviewMode) startTimer();
    try {
      const result = await callAI({
        tool: "metrics_diagnosis",
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: buildUserContent() }],
        maxTokens: 3000,
        apiKey,
        model: DIAGNOSIS_MODEL,
      });
      if (result.freeRunsRemaining !== null && result.freeRunsRemaining !== undefined) {
        setFreeRuns(result.freeRunsRemaining);
      }
      setOutput(result.text);
    } catch (e) {
      setErr(e.message);
      setRevealed(true);
      clearInterval(timerRef.current);
    }
    setLoading(false);
  }

  const exportSubtitle = mode === "guided" ? `${metric} ${direction} ${magnitude}% ${timeframe}` : "Free-form diagnosis";

  return (
    <div>
      {/* MODE + INTERVIEW TOGGLES */}
      <div className="card">
        <div className="card-title">Step 1 — Describe the Metric Movement</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <button className={`tab${mode === "guided" ? " active" : ""}`} onClick={() => setMode("guided")}>🧭 Guided Intake</button>
          <button className={`tab${mode === "freetext" ? " active" : ""}`} onClick={() => setMode("freetext")}>✍️ Free Text</button>
          <div style={{ flex: 1 }} />
          <button
            className={`tab${interviewMode ? " active" : ""}`}
            onClick={() => setInterviewMode(!interviewMode)}
            title="Hides the analysis behind a 25-minute practice timer"
          >
            🎤 Interview Practice Mode {interviewMode ? "ON" : "OFF"}
          </button>
        </div>

        {mode === "guided" ? (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1.5fr", gap: 10, marginBottom: 12 }}>
              <div>
                <label>Metric</label>
                <input type="text" placeholder="e.g. DAU, D7 retention, checkout conversion" value={metric} onChange={(e) => setMetric(e.target.value)} />
              </div>
              <div>
                <label>Direction</label>
                <select value={direction} onChange={(e) => setDirection(e.target.value)}
                  style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 7, padding: "11px 10px", color: "var(--text)", fontSize: 12, outline: "none" }}>
                  {DIRECTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label>Magnitude %</label>
                <input type="text" placeholder="e.g. 15" value={magnitude} onChange={(e) => setMagnitude(e.target.value)} />
              </div>
              <div>
                <label>Timeframe</label>
                <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)}
                  style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 7, padding: "11px 10px", color: "var(--text)", fontSize: 12, outline: "none" }}>
                  {TIMEFRAMES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="field">
              <label>Known Context (optional but improves the diagnosis significantly)</label>
              <textarea rows={3} value={context} onChange={(e) => setContext(e.target.value)}
                placeholder="e.g. We shipped a new onboarding flow 5 days ago. Android only app. Most users in India and Brazil. Marketing paused paid campaigns last week." />
            </div>
          </>
        ) : (
          <div className="field">
            <label>Describe the situation in your own words</label>
            <textarea rows={5} value={freeText} onChange={(e) => setFreeText(e.target.value)}
              placeholder="e.g. Our weekly active users dropped 12% over the last two weeks. It started gradually. We recently changed our push notification provider and also launched in two new countries..." />
          </div>
        )}

        {interviewMode && (
          <div className="alert alert-warn" style={{ marginBottom: 14 }}>
            <span style={{ fontSize: 15 }}>🎤</span>
            Interview mode: the analysis stays hidden behind a 25-minute timer. Work your answer out loud or on paper first, then reveal and compare against the structured diagnosis.
          </div>
        )}

        {!apiKey && (
          <div className={`alert ${freeRuns > 0 ? "alert-ok" : "alert-warn"}`} style={{ marginBottom: 14 }}>
            <Icon d={freeRuns > 0 ? Icons.check : Icons.warning} size={14} />
            {freeRuns === null
              ? "No API key entered. Checking free run availability..."
              : freeRuns > 0
              ? `No API key needed: ${freeRuns} free ${freeRuns === 1 ? "run" : "runs"} remaining today.`
              : "Free runs used up for today. Enter your Anthropic API key in the sidebar to continue."}
          </div>
        )}

        <button className="btn btn-primary" onClick={diagnose} disabled={loading || !canGenerate} style={{ background: "#6366f1" }}>
          {loading ? <span className="spinner" /> : <Icon d={Icons.run} size={14} />}
          {loading ? "Running diagnosis..." : "Diagnose"}
        </button>
      </div>

      {err && <div className="alert alert-err"><Icon d={Icons.warning} size={14} />{err}</div>}

      {loading && (
        <div className="status"><div className="spinner" /> Walking the diagnostic tree on {DIAGNOSIS_MODEL}...</div>
      )}

      {/* INTERVIEW COVER */}
      {output && !revealed && (
        <div className="card" style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🎤</div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 34, fontWeight: 700, color: secondsLeft === 0 ? "var(--danger)" : "var(--text)", marginBottom: 8 }}>
            {fmtTime(secondsLeft)}
          </div>
          <div style={{ fontSize: 13, color: "var(--dim)", marginBottom: 20, maxWidth: 460, margin: "0 auto 20px" }}>
            The structured diagnosis is ready but hidden. Practice your answer first: restate the problem, check data integrity, segment, then hypothesize. Reveal when you have committed to an answer.
          </div>
          <button className="btn btn-primary" onClick={() => { setRevealed(true); clearInterval(timerRef.current); }} style={{ background: "#6366f1" }}>
            Reveal the Diagnosis
          </button>
        </div>
      )}

      {/* OUTPUT */}
      {output && revealed && (
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            <div className="tabs" style={{ flex: 1, marginBottom: 0 }}>
              <button className={`tab${tab === "rendered" ? " active" : ""}`} onClick={() => setTab("rendered")}>📄 Diagnosis</button>
              <button className={`tab${tab === "raw" ? " active" : ""}`} onClick={() => setTab("raw")}>📝 Markdown</button>
            </div>
            <button className="copy-btn" onClick={() => navigator.clipboard.writeText(output)}>Copy</button>
            <button className="copy-btn" onClick={() => downloadMarkdown(output, `metrics_diagnosis_${Date.now()}.md`)}
              style={{ background: "rgba(99,102,241,0.07)", borderColor: "rgba(99,102,241,0.25)", color: "#6366f1" }}>
              ⬇ Markdown
            </button>
            <button className="copy-btn" onClick={() => exportPrintPDF(output, "Metric Diagnosis Report", exportSubtitle)}
              style={{ background: "rgba(220,53,69,0.07)", borderColor: "rgba(220,53,69,0.2)", color: "var(--danger)" }}>
              📄 PDF
            </button>
          </div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--dim)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
            Hero Tool · {DIAGNOSIS_MODEL} · {new Date().toLocaleDateString()}
          </div>
          {tab === "rendered" ? (
            <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, padding: "16px 20px", maxHeight: 640, overflowY: "auto" }}>
              {renderMD(output)}
            </div>
          ) : (
            <div className="output">{output}</div>
          )}
        </div>
      )}
    </div>
  );
}
