import { useState, useRef } from "react";
import { Icon, Icons } from "../components/Icons";

function parseLeads(text) {
  const rows = text.trim().split("\n").map((r) => {
    const cols = []; let cur = "", inQ = false;
    for (const c of r) {
      if (c === '"') { inQ = !inQ; }
      else if (c === "," && !inQ) { cols.push(cur); cur = ""; }
      else { cur += c; }
    }
    cols.push(cur);
    return cols;
  });
  const h = rows[0].map((x) => x.trim());
  return rows
    .slice(1)
    .map((r) => { const o = {}; h.forEach((k, i) => (o[k] = (r[i] || "").trim())); return o; })
    .filter((r) => r["Pipeline Status"] === "1-Ready for AI")
    .slice(0, 5);
}

export default function LeadsEngine({ apiKey }) {
  const [csv, setCsv]         = useState(null);
  const [leads, setLeads]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep]       = useState("");
  const [selected, setSelected] = useState(null);
  const fileRef = useRef();

  async function run() {
    if (!csv) return;
    setLoading(true); setLeads([]); setSelected(null);
    const rawLeads = parseLeads(csv);
    const out = [];

    for (let i = 0; i < rawLeads.length; i++) {
      const l = rawLeads[i];
      setStep(`Drafting email ${i + 1}/${rawLeads.length}: ${l["Brand Name"]}`);
      const prompt = `You are an elite B2B sales copywriter. Write a personalized cold email.

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
        const res = await fetch("https://api.anthropic.com/v1/messages", {
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
        out.push({ ...l, email: d.content?.map((b) => b.text || "").join("") || "" });
      } catch (e) {
        out.push({ ...l, email: "Error generating email." });
      }
    }
    setLeads(out); setLoading(false); setStep("");
  }

  function exportCSV() {
    if (!leads.length) return;
    const h = ["First Name", "Last Name", "Brand Name", "Active Storefronts", "Trigger Event", "AI Email Draft"];
    const rows = leads.map((l) => `"${l["First Name"]}","${l["Last Name"]}","${l["Brand Name"]}","${l["Active Storefronts"]}","${l["Trigger Event"]}","${l.email?.replace(/"/g, "'")}"`);
    const blob = new Blob([[h.join(","), ...rows].join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `leads_${Date.now()}.csv`;
    a.click();
  }

  return (
    <div>
      <div className="card">
        <div className="card-title">Upload Leads CSV (growthsync_leads.csv)</div>
        <div className="alert alert-warn">
          <Icon d={Icons.warning} size={14} />
          Expects: First Name, Brand Name, Active Storefronts, Trigger Event, Assumed Pain Point, Pipeline Status. Processes leads with status "1-Ready for AI" (max 5).
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
            {loading ? step : "Generate Emails"}
          </button>
        </div>
      </div>

      {leads.length > 0 && (
        <>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
            <button className="btn btn-ghost" onClick={exportCSV} style={{ fontSize: 12, padding: "7px 14px" }}>
              <Icon d={Icons.download} size={12} /> Export Drafted CSV
            </button>
          </div>
          <div className="card">
            <div className="card-title">{leads.length} Emails Drafted</div>
            <table className="data-table">
              <thead>
                <tr><th>Lead</th><th>Brand</th><th>Storefronts</th><th>Trigger</th><th>Action</th></tr>
              </thead>
              <tbody>
                {leads.map((l, i) => (
                  <tr key={i}>
                    <td>{l["First Name"]} {l["Last Name"]}</td>
                    <td>{l["Brand Name"]}</td>
                    <td style={{ fontSize: 11, color: "var(--dim)" }}>{l["Active Storefronts"]}</td>
                    <td style={{ fontSize: 11, color: "var(--dim)", maxWidth: 150 }}>{l["Trigger Event"]}</td>
                    <td>
                      <button className="copy-btn" onClick={() => setSelected(selected?.["Brand Name"] === l["Brand Name"] ? null : l)}>
                        {selected?.["Brand Name"] === l["Brand Name"] ? "Hide" : "View"}
                      </button>
                    </td>
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
          <button className="copy-btn" style={{ marginTop: 10 }} onClick={() => navigator.clipboard.writeText(selected.email)}>
            Copy Email
          </button>
        </div>
      )}
    </div>
  );
}
