import { useState, useRef } from "react";
import { Icon, Icons } from "../components/Icons";

const SCOUT_SYSTEM = `You are a Sales Scout Agent — an AI sales intelligence system.
Analyze a prospect profile and make smart outreach decisions.
Respond ONLY in this exact JSON (no markdown fences):
{
  "urgency": "URGENT" or "STANDARD",
  "recommended_channel": one of ["Instagram DM","TikTok Ad","Dealer Visit","Retarget Ad","Email"],
  "reasoning": "2-3 sentences",
  "email_subject": "under 10 words",
  "email_body": "4-5 sentence personalized outreach"
}`;

function parseLeads(text) {
  const rows = text.trim().split("\n").map((r) => r.split(","));
  const h = rows[0].map((x) => x.trim().replace(/^"|"$/g, ""));
  return rows
    .slice(1)
    .map((r) => {
      const o = {};
      h.forEach((k, i) => (o[k] = (r[i] || "").trim().replace(/^"|"$/g, "")));
      return o;
    })
    .filter((r) => r.cohort === "Gen Z" && r.intent_category === "High")
    .sort((a, b) => parseInt(b.intent_score) - parseInt(a.intent_score))
    .slice(0, 5);
}

export default function ScoutAgent({ apiKey }) {
  const [csv, setCsv]         = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep]       = useState("");
  const [selected, setSelected] = useState(null);
  const fileRef = useRef();

  async function run() {
    if (!csv) return;
    setLoading(true); setResults([]); setSelected(null);
    const leads = parseLeads(csv);
    const out = [];

    for (let i = 0; i < leads.length; i++) {
      const l = leads[i];
      setStep(`Analyzing lead ${i + 1}/${leads.length}: ${l.profile_id}`);
      try {
        const res = await fetch("/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
            "anthropic-dangerous-direct-browser-access": "true",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            system: SCOUT_SYSTEM,
            messages: [{
              role: "user",
              content: `Analyze this prospect for Harley-Davidson:\n${JSON.stringify({
                age: l.age, state: l.state, platform: l.primary_platform,
                intent_score: l.intent_score, competitor_interest: l.competitor_interest,
                follows_harley: l.follows_harley, test_ridden_bike: l.test_ridden_bike,
                attended_moto_event: l.attended_moto_event,
              }, null, 2)}`,
            }],
          }),
        });
        const d = await res.json();
        const txt = (d.content?.map((b) => b.text || "").join("") || "{}").replace(/```json|```/g, "").trim();
        try { out.push({ ...l, ai: JSON.parse(txt) }); }
        catch { out.push({ ...l, ai: { urgency: "STANDARD", recommended_channel: "Email", reasoning: "Parse error", email_subject: "", email_body: "" } }); }
      } catch (e) { console.error(e); }
    }

    setResults(out); setLoading(false); setStep("");
  }

  return (
    <div>
      <div className="card">
        <div className="card-title">Upload Prospect CSV (harley_profiles.csv)</div>
        <div className="alert alert-warn">
          <Icon d={Icons.warning} size={14} />
          Expects columns: profile_id, cohort, age, state, intent_score, intent_category, etc. Processes top 5 High-Intent Gen Z leads.
        </div>
        <input ref={fileRef} type="file" accept=".csv" style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files[0];
            if (!f) return;
            const r = new FileReader();
            r.onload = (ev) => setCsv(ev.target.result);
            r.readAsText(f);
          }}
        />
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-ghost" onClick={() => fileRef.current.click()}>
            <Icon d={Icons.upload} size={14} />
            {csv ? "✓ CSV Loaded" : "Choose CSV"}
          </button>
          <button className="btn btn-primary" onClick={run} disabled={!csv || loading || !apiKey}>
            {loading ? <span className="spinner" /> : <Icon d={Icons.run} size={14} />}
            {loading ? step : "Run Scout Agent"}
          </button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="card">
          <div className="card-title">Lead Intelligence Report</div>
          <table className="data-table">
            <thead>
              <tr><th>#</th><th>Profile</th><th>Age/State</th><th>Score</th><th>Urgency</th><th>Channel</th><th>Action</th></tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i}>
                  <td style={{ color: "var(--dim)" }}>{i + 1}</td>
                  <td>{r.profile_id}</td>
                  <td>{r.age} / {r.state}</td>
                  <td><strong style={{ color: "var(--accent)", fontFamily: "var(--mono)" }}>{r.intent_score}</strong></td>
                  <td><span className={`chip ${r.ai?.urgency === "URGENT" ? "chip-red" : "chip-amber"}`}>{r.ai?.urgency}</span></td>
                  <td style={{ fontSize: 11, color: "var(--dim)" }}>{r.ai?.recommended_channel}</td>
                  <td>
                    <button className="copy-btn" onClick={() => setSelected(selected?.profile_id === r.profile_id ? null : r)}>
                      {selected?.profile_id === r.profile_id ? "Hide" : "View Email"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="card">
          <div className="card-title">Email Draft — {selected.profile_id}</div>
          <div style={{ marginBottom: 10, fontFamily: "var(--mono)", fontSize: 11, color: "var(--dim)" }}>
            Subject: <span style={{ color: "var(--text)" }}>{selected.ai?.email_subject}</span>
          </div>
          <div className="output">{selected.ai?.email_body}</div>
          <div style={{ marginTop: 10, fontFamily: "var(--mono)", fontSize: 11, color: "var(--dim)" }}>
            Reasoning: {selected.ai?.reasoning}
          </div>
        </div>
      )}
    </div>
  );
}
