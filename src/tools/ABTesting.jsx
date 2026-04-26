import { useState, useRef } from "react";
import { Icon, Icons } from "../components/Icons";

function chiSquare(a_conv, a_total, b_conv, b_total) {
  const a_fail = a_total - a_conv, b_fail = b_total - b_conv;
  const N = a_total + b_total;
  const E_a_c = (a_total * (a_conv + b_conv)) / N;
  const E_a_f = (a_total * (a_fail + b_fail)) / N;
  const E_b_c = (b_total * (a_conv + b_conv)) / N;
  const E_b_f = (b_total * (a_fail + b_fail)) / N;
  const chi =
    (a_conv - E_a_c) ** 2 / E_a_c +
    (a_fail - E_a_f) ** 2 / E_a_f +
    (b_conv - E_b_c) ** 2 / E_b_c +
    (b_fail - E_b_f) ** 2 / E_b_f;
  const p = Math.exp(-0.5 * chi) * (1 + chi / 2);
  return { chi: chi.toFixed(4), p: Math.min(p, 1).toFixed(4) };
}

function parseCSV(text) {
  const rows = text.trim().split("\n").map((r) => r.split(","));
  const header = rows[0].map((h) => h.trim().replace(/^"|"$/g, ""));
  return rows.slice(1).map((r) => {
    const obj = {};
    header.forEach((h, i) => (obj[h] = (r[i] || "").trim().replace(/^"|"$/g, "")));
    return obj;
  });
}

export default function ABTesting({ apiKey }) {
  const [csv, setCsv]       = useState(null);
  const [result, setResult] = useState(null);
  const [aiMsg, setAiMsg]   = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep]     = useState("");
  const fileRef = useRef();

  async function run() {
    if (!csv) return;
    setLoading(true); setAiMsg(""); setResult(null);
    try {
      setStep("Parsing CSV...");
      const parsed = parseCSV(csv);
      const groups = {};
      parsed.forEach((r) => {
        const g = r.Group || r.group;
        const c = parseInt(r.Converted || r.converted || 0);
        if (!groups[g]) groups[g] = { conv: 0, total: 0 };
        groups[g].conv += c;
        groups[g].total += 1;
      });
      const keys = Object.keys(groups);
      const A = groups[keys[0]], B = groups[keys[1]];
      const crA = ((A.conv / A.total) * 100).toFixed(2);
      const crB = ((B.conv / B.total) * 100).toFixed(2);
      const { p } = chiSquare(A.conv, A.total, B.conv, B.total);
      const sig = parseFloat(p) < 0.05;
      const lift = (((B.conv / B.total - A.conv / A.total) / (A.conv / A.total)) * 100).toFixed(1);
      setResult({ keys, A, B, crA, crB, p, sig, lift });

      setStep("Generating AI summary...");
      const statsText = `Group A (${keys[0]}) CR: ${crA}%\nGroup B (${keys[1]}) CR: ${crB}%\nP-Value: ${p}\nLift: ${lift}%\nResult: ${sig ? "WINNER" : "INCONCLUSIVE"}`;
      const prompt = `You are a Senior PM presenting A/B test results to a VP.\n\nStats:\n${statsText}\n\nWrite a concise Slack message (max 120 words) that:\n1. Announces the winner in plain English\n2. Explains p-value using a simple analogy (no jargon)\n3. Gives a clear GO / NO-GO recommendation\n4. Uses 1-2 emojis\n\nDo NOT use "statistically significant", "null hypothesis", or "chi-squared".`;

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
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const d = await res.json();
      setAiMsg(d.content?.map((b) => b.text || "").join("") || "");
    } catch (e) {
      setStep("Error: " + e.message);
    }
    setLoading(false); setStep("");
  }

  return (
    <div>
      <div className="card">
        <div className="card-title">Upload A/B Test Data</div>
        <div className="alert alert-warn">
          <Icon d={Icons.warning} size={14} />
          CSV must have columns: <strong>Visitor_ID, Group, Converted</strong>
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
