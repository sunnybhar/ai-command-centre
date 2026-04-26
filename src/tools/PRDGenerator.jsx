import { useState } from "react";
import { Icon, Icons } from "../components/Icons";

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

function renderMarkdown(text) {
  return text.split("\n").map((line, i) => {
    if (line.startsWith("## "))  return <h2 key={i}>{line.slice(3)}</h2>;
    if (line.startsWith("### ")) return <h3 key={i}>{line.slice(4)}</h3>;
    if (line.startsWith("* ") || line.startsWith("- ")) {
      return <li key={i} dangerouslySetInnerHTML={{ __html: line.slice(2).replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />;
    }
    if (line.trim() === "") return <br key={i} />;
    return <p key={i} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />;
  });
}

export default function PRDGenerator({ apiKey }) {
  const [idea, setIdea]       = useState("");
  const [output, setOutput]   = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab]         = useState("rendered");
  const [copied, setCopied]   = useState(false);
  const [err, setErr]         = useState("");

  async function generate() {
    if (!idea.trim() || !apiKey) return;
    setLoading(true); setOutput(""); setErr("");
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
          system: PRD_SYSTEM,
          messages: [{ role: "user", content: `User Idea: ${idea}` }],
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      setOutput(data.content?.map((b) => b.text || "").join("") || "");
    } catch (e) {
      setErr("Error: " + e.message);
    }
    setLoading(false);
  }

  function copy() {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
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
            onChange={(e) => setIdea(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={generate} disabled={loading || !idea.trim() || !apiKey}>
          {loading ? <span className="spinner" /> : <Icon d={Icons.run} size={14} />}
          {loading ? "Generating PRD..." : "Generate PRD"}
        </button>
      </div>

      {err && (
        <div className="alert alert-err">
          <Icon d={Icons.warning} size={14} /> {err}
        </div>
      )}

      {loading && (
        <div className="status">
          <div className="spinner" /> Consulting Principal Product Manager...
        </div>
      )}

      {output && (
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
            <div className="tabs" style={{ flex: 1, marginBottom: 0 }}>
              {["rendered", "raw"].map((t) => (
                <button key={t} className={`tab${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>
                  {t === "rendered" ? "📄 Document" : "📝 Raw Markdown"}
                </button>
              ))}
            </div>
            <button className="copy-btn" onClick={copy}>
              {copied ? "✓ Copied" : "Copy"}
            </button>
          </div>
          {tab === "rendered" ? (
            <div className="output md-output">{renderMarkdown(output)}</div>
          ) : (
            <div className="output">{output}</div>
          )}
        </div>
      )}
    </div>
  );
}
