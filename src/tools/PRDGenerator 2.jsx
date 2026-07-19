import { useState } from "react";
import { Icon, Icons } from "../components/Icons";

// ── Variation Config ──────────────────────────────────────────────────────────
const VARIATIONS = [
  { id: "lean",       label: "Lean MVP",                emoji: "🚀", color: "#0a9e78", desc: "0→1 founders, pre-Series A" },
  { id: "aiml",       label: "AI/ML Feature",           emoji: "🤖", color: "#7c3aed", desc: "LLM-powered features" },
  { id: "growth",     label: "B2B SaaS Growth",         emoji: "📈", color: "#1a56db", desc: "Activation & retention" },
  { id: "enterprise", label: "Enterprise",              emoji: "🏢", color: "#0891b2", desc: "Regulated industries" },
  { id: "launch",     label: "Cross-Functional Launch", emoji: "🎯", color: "#ea580c", desc: "Full team alignment" },
];

// ── Base Sections (injected into every prompt) ────────────────────────────────
const BASE = `
Your output MUST always include all of the following sections in this exact order. Do not skip any section.

## 1. Executive Summary
- **5 Whys Root Cause Analysis**: Surface problem → underlying behavior → system gap → organizational cause → root truth. End with a bold one-sentence Root Cause Summary.
- **Target Audience**: Primary Persona (name, role, company size, daily frustration), Secondary Persona (adjacent user who benefits), Anti-Persona (who this is NOT for — mandatory for scope control), Emotional JTBD (what does the user feel when this is solved?)
- **Strategic Fit**: Market signal that triggered this, opportunity window, why this and why now

## 2. Assumptions
Table with columns: Assumption | Category (User/Technical/Business) | Risk if Wrong | How to Validate
Minimum 5 rows. Be specific — generic assumptions are useless.

## 3. Detailed Functional Requirements
- **User Stories (Gherkin Format)**: Minimum 3 scenarios — Happy Path, Failure/Error Path, Empty/First-Time User State. Format strictly: Given [context], When [action], Then [outcome], And [secondary effect]
- **Detailed Workflow**: Step-by-step — 1. Entry Point, 2. First Screen, 3. Decision Point, 4. Core Action, 5. Confirmation, 6. Re-entry

## 4. UX/UI Requirements
- **Screen-by-Screen Wireframe Description**: For each key screen describe: layout grid, component list, visual hierarchy (what draws eye 1st/2nd/3rd), accessibility notes (WCAG 2.1 AA)
- **Copywriting & Microcopy**: Table — Element | Copy Text | Tone. Cover: Page Headline, CTA Button, Empty State, Error State, Success Toast, Tooltip

## 5. Technical Specifications
- **API Logic**: Define necessary endpoints — Method | Path | Purpose | Request Body (key fields) | Response structure. Reference pattern only, no full implementation spec.
- **Data Model**: Table — Field | Type | Required | Validation Rule | Description
- **Integrations**: Table — Tool | Purpose | Auth Method | Fallback if Down

## 6. Edge Cases & Error Handling
3 complex scenarios, each with: Situation, System Behavior, Specific Error Message text (exact words the user sees)

## 7. Risks & Mitigations
- **Technical Risks**: Table — Risk | Likelihood (H/M/L) | Impact (H/M/L) | Mitigation
- **Business Risks**: Table — Risk | Description | Mitigation
- **Top 3 Mitigations**: Summarize in plain language

## 8. Success Metrics
- **North Star Metric**: One business outcome metric — not a vanity metric. State measurement method and timeframe.
- **Supporting Metrics**: Table — Metric | Target | Measurement Method | Reporting Cadence
- **Counter Metrics (Guardrails)**: Table — Guardrail | Current Baseline | Acceptable Degradation Threshold

## 9. Open Questions
Table — Question | Owner | Priority (H/M/L) | Answer | Date Resolved
Minimum 5 questions. Leave Answer and Date Resolved blank. These are blockers — sprint 1 cannot begin without answers.

## 10. Out of Scope
Minimum 5 features explicitly NOT being built in this version. Each with a one-line reason. This is mandatory — it prevents scope creep.

## 11. Validate With Team
List 3-5 specific things requiring developer, designer, or direct customer input before this PRD is finalized. This was generated from one input — these gaps must be filled collaboratively.

---
End with a bold line: **What this PRD does NOT decide:** followed by 3-5 implementation decisions deliberately left to engineering.

Rules: Format strictly in Markdown. Be exhaustive. No API implementation code. No infrastructure decisions. Flag every assumption explicitly.`;

// ── System Prompts ────────────────────────────────────────────────────────────
const PROMPTS = {

lean: `You are a Senior PM at a pre-Series A startup with 6 months of runway. Your discipline: ruthless scope control, fast shipping, and measurable learning. Every section must earn its place. The biggest PRD failure mode at this stage is scope expansion disguised as thoroughness.

After the base sections, add:

## 12. MVP Scope Table
Table: Feature | User Value | Engineering Effort (S/M/L) | Ship In Sprint
P0 features only. If it does not directly test the hypothesis, it is not in this table.

## 13. MVP Hypothesis
One testable statement: "If we ship [X], we believe [Y]% of [persona] will [Z] within [N] days."
This is the only thing that matters until validated. Everything else is secondary.

## 14. MVP Success Threshold
The minimum result that proves the hypothesis before any further investment. Be specific with numbers and timeframe.

${BASE}`,

aiml: `You are a PM building an AI/ML-powered feature. Your discipline: treat the model as a third-party dependency with an SLA and failure modes — not as magic. Most AI PRDs fail because they don't specify what happens when the model is wrong, slow, or confidently incorrect.

After the base sections, add:

## 12. Model Behavior Specification
Table: Behavior | Expected Output | Confidence Threshold | Fallback Action
Cover: High confidence (>0.90), Medium confidence (0.60-0.90), Low confidence (<0.60), Model timeout (>3s), Model API downtime

## 13. Prompt Engineering Requirements
- **System Prompt Template**: Define the base system instruction
- **Dynamic Context Injection**: Which runtime variables are injected?
- **Output Format Enforcement**: JSON schema, structured fields, length limits
- **Prohibited Outputs**: What must the model never return?
- **Token Budget**: Max input tokens / output tokens per API call

## 14. Human-in-the-Loop Triggers
List all scenarios where a human MUST review AI output before it is shown or acted upon. Non-negotiable.

## 15. AI Ethics & Responsible AI Checklist
- Bias Audit Plan: Which groups are tested for output disparity?
- Explainability: Can the system explain results to a non-technical user?
- Opt-Out: Can users disable AI and use the manual flow?
- Data Usage Consent: Is user input used for model training? Is this disclosed in ToS?
- Audit Trail: Every AI decision logged with model version, input hash, output, confidence score

${BASE}`,

growth: `You are a Growth PM at a Series B+ B2B SaaS company. Every feature must have a measurable, direct impact on activation, retention, expansion, or referral. You connect product decisions to MRR — not just user experience. Features without a funnel connection are UX improvements masquerading as growth work.

After the base sections, add:

## 12. Funnel Stage Analysis
- **Funnel Stage Targeted**: Acquisition / Activation / Retention / Expansion / Referral — state which and why
- **Current Drop-Off**: Where exactly are users falling off? Use specific percentages.
- **Behavioral Signal**: The in-product event that predicts churn or upgrade before it happens
- **Activation Moment**: The 'aha moment' this feature is designed to accelerate
- **ICP Fit**: Which ICP segment has highest likelihood to respond?

## 13. Revenue Impact Model
Table: Scenario | MRR Impact | Basis / Assumption
Rows: Conservative | Base | Optimistic. Every number requires an explicit assumption.

## 14. PLG Journey Map
Table: Stage | Touchpoint | Channel | Message | Success Indicator | Failure State
Stages: Awareness → Activation → Habit Formation → Expansion → Advocacy

## 15. Pricing Gate Logic
- Feature gating by tier: Free / Starter / Pro / Enterprise
- Upgrade trigger design: soft wall vs. hard paywall vs. usage-based gate
- Trial mechanic: does this unlock a higher tier trial? Duration?
- Downgrade behavior: what happens to user data if they downgrade?

## 16. A/B Test Plan
Table: Variant | Hypothesis | Primary Metric | Sample Size | Duration
Include: Control, Variant A, decision criteria for calling the test

${BASE}`,

enterprise: `You are an Enterprise PM building for regulated industries — Finance, Healthcare, Legal, or Government. Your PRD must survive procurement review, legal sign-off, and a CISO interview, while remaining useful to an engineering team. The real audience is not just engineering — it is the economic buyer, compliance officer, IT gatekeeper, and security team.

After the base sections, add:

## 12. Stakeholder Map
Table: Stakeholder | Team/Role | Primary KPI They're Measured On | Technical Literacy (1-5) | What 'Success' Looks Like
Must include: Economic Buyer, Champion, End User, IT Gatekeeper, Compliance Officer

## 13. Compliance Driver
- Regulatory requirement (GDPR / HIPAA / SOC 2 / Internal Audit / None): state which
- Is this feature required by compliance, or does it affect compliance? Explain.
- Compliance assumptions being made (must be validated by legal before shipping)

## 14. Role-Based Access Control (RBAC) — Gherkin Scenarios
Write scenarios for minimum 3 roles: Admin User (config, audit log), Read-Only/Standard User, API Integration User.
Each scenario must include what is logged in the audit trail.

## 15. Data Model — Compliance Fields
Table: Field | Type | PII? | Encrypted? | Retention Policy | GDPR Basis
Every field touching user or customer data must appear here.

## 16. Non-Functional Requirements (NFRs)
Table: NFR Category | Requirement | Measurement Method | SLA Threshold
Must cover: Performance, Availability, Security, Scalability, Disaster Recovery / RTO

## 17. Rollout Plan
Table: Phase | Audience | % Rollout | Duration | Success Gate | Rollback Trigger
Phases: Dark Launch → Internal Beta → Limited GA → Full GA

${BASE}`,

launch: `You are a Staff PM responsible for a feature spanning Design, Engineering, Data, Marketing, Legal, and Customer Success. Your PRD is the single source of truth — detailed enough for engineers to build without a meeting, strategic enough for executives to approve without a demo.

This is PASS 1 — Strategy. Focus on: Executive TL;DR, RACI, problem analysis, and requirements.
Pass 2 (Execution) will generate: Sprint plan, GTM, legal checklist, launch readiness, post-launch review.

After the base sections, add:

## 12. Executive TL;DR (One Page Maximum)
- **Problem**: One paragraph, no jargon. A non-technical executive must understand it.
- **Solution**: One paragraph — what we're building and the core mechanism
- **Why Now**: Time-sensitive context that makes delay costly
- **Estimated Effort**: T-shirt size across [N] sprints — broken down by team
- **Recommendation**: APPROVE / DEFER / KILL — state this explicitly with clear reasoning. No hedging.

## 13. RACI Matrix
Table: Stakeholder | Team | Role in This PRD | RACI (R/A/C/I) | Review Due By
Must cover: Engineering Lead, Design, Legal, Data/Analytics, Marketing, Customer Success, Executive Sponsor

## 14. Living Document Notice
"This PRD must be updated after each sprint retrospective. All stakeholders in the RACI matrix must be notified of material changes. Last updated: [date]."

${BASE}`,
};

// ── Pass 2 Prompt (Cross-Functional Execution) ────────────────────────────────
const PASS2 = `You are a Staff PM generating the Execution Plan (Pass 2) of a Cross-Functional PRD. Strategy and requirements have been defined in Pass 1. Produce only these sections in Markdown:

## 15. Sprint Breakdown
Table: Sprint | Scope | Definition of Done | Dependency | Owner
Minimum 4 sprints. Definition of Done must be specific and testable — not vague.

## 16. GTM Requirements
- **Positioning Statement**: "For [persona] who [need], [feature] is [category] that [benefit]. Unlike [alternative], [key differentiator]."
- **Launch Assets Checklist**: Table — Asset | Owner | Due Date | Status
  Must include: In-app announcement, Email campaign (subject + preview + CTA), Sales one-pager, CS FAQ doc, Help center article, LinkedIn/social post

## 17. Legal & Compliance Checklist
[ ] Data privacy review complete — DPA updated if required
[ ] Terms of Service update required? (Y/N) — legal sign-off obtained
[ ] Accessibility audit scheduled — WCAG 2.1 AA confirmed
[ ] Third-party license compliance verified for all new dependencies
[ ] Security pen test required? (Y/N) — CVSS thresholds reviewed
[ ] GDPR / CCPA impact assessment completed

## 18. Launch Readiness Checklist
[ ] Feature flag configured and tested in staging
[ ] Rollout plan defined: 1% → 10% → 50% → 100% with hold gates at each stage
[ ] Monitoring dashboards live — error rate, latency, conversion tracked
[ ] On-call rotation assigned for launch week (24/7 coverage)
[ ] Rollback plan documented, tested, and communicated to engineering
[ ] Support team trained — CS walkthrough completed
[ ] Analytics events verified in staging (all Gherkin scenarios firing)
[ ] Load test executed — passed at 2x projected launch traffic

## 19. Post-Launch Review Plan
Table: Checkpoint | Timing | What to Measure | Decision Gate
Must include: First Data Review (T+7), Retrospective (T+14), Cohort Analysis (T+30), QBR Inclusion (T+90)

**What this PRD does NOT decide:** [list 3-5 implementation decisions deliberately left to engineering]

Format strictly in Markdown. Be exhaustive.`;

// ── Scannable Suffix ──────────────────────────────────────────────────────────
const SCANNABLE = `

IMPORTANT FORMAT OVERRIDE: This is SCANNABLE format. Produce ONLY these 4 sections — nothing else. Do not include the base sections.

## What We're Building and Why
2-3 sentences maximum. User, problem, solution, business outcome.

## What We Are NOT Building
Bullet list — minimum 6 specific items. This is the scope boundary.

## How We'll Know It Worked
Exactly 3 metrics:
1. North Star Metric — [metric, target, timeframe]
2. Supporting Metric — [metric, target]
3. Guardrail — [what must not break]

## What the Team Must Decide Before We Start
Table: Question | Owner | Priority (H/M/L)
Minimum 5 questions. These are sprint 1 blockers.

Note at bottom: "This is an alignment tool — not a substitute for the full PRD. Generate the Full PRD for engineering handoff."`;

// ── Markdown Renderer ─────────────────────────────────────────────────────────
function renderMD(text) {
  if (!text) return null;
  const lines = text.split("\n");
  const elements = [];
  let tableRows = [];
  let inTable = false;

  lines.forEach((line, i) => {
    if (line.startsWith("| ") && line.endsWith(" |") && !line.startsWith("| ---")) {
      inTable = true;
      const cells = line.split("|").filter((c) => c.trim() !== "");
      tableRows.push(cells.map((c) => c.trim()));
    } else {
      if (inTable && tableRows.length > 0) {
        elements.push(
          <div key={`table-${i}`} style={{ overflowX: "auto", margin: "8px 0" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
              <thead>
                <tr>{tableRows[0].map((h, j) => <th key={j} style={{ padding: "6px 10px", textAlign: "left", background: "var(--muted)", border: "1px solid var(--border)", fontFamily: "var(--mono)", fontSize: 10, color: "var(--accent)", letterSpacing: "0.06em" }}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {tableRows.slice(1).map((row, r) => (
                  <tr key={r}>
                    {row.map((cell, c) => (
                      <td key={c} style={{ padding: "5px 10px", border: "1px solid var(--border)", color: "var(--text)", verticalAlign: "top" }}
                        dangerouslySetInnerHTML={{ __html: cell.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableRows = []; inTable = false;
      }

      if (line.startsWith("| ---")) return;
      if (line.startsWith("## ")) {
        elements.push(<h2 key={i} style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)", margin: "22px 0 8px", fontFamily: "var(--mono)", letterSpacing: "0.06em", borderBottom: "1px solid var(--border)", paddingBottom: 4 }}>{line.slice(3)}</h2>);
      } else if (line.startsWith("### ")) {
        elements.push(<h3 key={i} style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", margin: "12px 0 5px" }}>{line.slice(4)}</h3>);
      } else if (line.startsWith("#### ")) {
        elements.push(<h4 key={i} style={{ fontSize: 11, fontWeight: 700, color: "var(--dim)", margin: "8px 0 4px" }}>{line.slice(5)}</h4>);
      } else if (line.startsWith("* ") || line.startsWith("- ")) {
        elements.push(<li key={i} style={{ marginBottom: 3, marginLeft: 18, fontSize: 12, lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: line.slice(2).replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />);
      } else if (line.startsWith("[ ] ")) {
        elements.push(<div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 5, fontSize: 12, fontFamily: "var(--mono)" }}><span>☐</span><span>{line.slice(4)}</span></div>);
      } else if (line.startsWith("[x] ")) {
        elements.push(<div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 5, fontSize: 12, fontFamily: "var(--mono)", color: "var(--green)" }}><span>☑</span><span>{line.slice(4)}</span></div>);
      } else if (line === "---") {
        elements.push(<hr key={i} style={{ border: "none", borderTop: "1px solid var(--border)", margin: "16px 0" }} />);
      } else if (line.trim() === "") {
        elements.push(<div key={i} style={{ height: 6 }} />);
      } else {
        elements.push(<p key={i} style={{ fontSize: 12, lineHeight: 1.65, marginBottom: 4 }} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/`(.*?)`/g, '<code style="font-family:var(--mono);font-size:10px;background:var(--muted);padding:1px 5px;border-radius:3px">$1</code>') }} />);
      }
    }
  });
  return elements;
}

// ── Export Functions ──────────────────────────────────────────────────────────
function exportPDF(content, varId, fmt) {
  const v = VARIATIONS.find((x) => x.id === varId);
  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>PRD</title>
<style>
  body{font-family:'Segoe UI',Arial,sans-serif;font-size:11pt;color:#0f1f35;line-height:1.6;padding:40px;max-width:820px;margin:0 auto}
  .hdr{border-bottom:3px solid #1a56db;padding-bottom:14px;margin-bottom:24px}
  .hdr h1{font-size:20pt;font-weight:800;margin-bottom:6px}
  .meta{font-size:9pt;color:#6b7d93;font-family:monospace;letter-spacing:.08em}
  h2{font-size:11pt;font-weight:700;color:#1a56db;margin:20pt 0 6pt;text-transform:uppercase;letter-spacing:.05em;border-bottom:1pt solid #e2e8f0;padding-bottom:3pt}
  h3{font-size:10.5pt;font-weight:700;color:#0f1f35;margin:10pt 0 4pt}
  p,li{font-size:10pt;line-height:1.55;margin-bottom:4pt}
  ul{padding-left:16pt}
  table{width:100%;border-collapse:collapse;margin:8pt 0;font-size:9pt}
  th{background:#f0f4f8;padding:5pt 7pt;font-weight:700;border:1pt solid #cbd5e0;color:#1a56db;font-size:8.5pt;letter-spacing:.05em;text-align:left}
  td{padding:4pt 7pt;border:1pt solid #cbd5e0;vertical-align:top}
  tr:nth-child(even) td{background:#f9fafb}
  strong{font-weight:700}
  code{font-family:Consolas,monospace;font-size:8.5pt;background:#f0f4f8;padding:1pt 3pt;border-radius:2pt}
  hr{border:none;border-top:1pt solid #e2e8f0;margin:14pt 0}
  .ftr{margin-top:32pt;padding-top:8pt;border-top:1pt solid #e8edf3;font-size:8pt;color:#6b7d93;font-family:monospace}
  @media print{body{padding:20px}}
</style></head><body>
<div class="hdr"><h1>Product Requirements Document</h1>
<div class="meta">${v?.emoji} ${v?.label?.toUpperCase()} &nbsp;·&nbsp; ${fmt === "long" ? "FULL PRD" : "SCANNABLE"} &nbsp;·&nbsp; ${date}</div></div>
${content.split("\n").map((l) => {
    if (l.startsWith("## ")) return `<h2>${l.slice(3)}</h2>`;
    if (l.startsWith("### ")) return `<h3>${l.slice(4)}</h3>`;
    if (l.startsWith("#### ")) return `<h4>${l.slice(5)}</h4>`;
    if (l.startsWith("| ---")) return "";
    if (l.startsWith("| ") && l.endsWith(" |")) { const c = l.split("|").filter(x=>x.trim()); return `<tr>${c.map(x=>`<td>${x.trim().replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>")}</td>`).join("")}</tr>`; }
    if (l.startsWith("* ")||l.startsWith("- ")) return `<li>${l.slice(2).replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>")}</li>`;
    if (l.startsWith("[ ] ")) return `<p>☐ ${l.slice(4)}</p>`;
    if (l === "---") return `<hr>`;
    if (l.trim() === "") return `<p style="margin:3pt 0">&nbsp;</p>`;
    return `<p>${l.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>").replace(/`(.*?)`/g,"<code>$1</code>")}</p>`;
  }).join("\n")}
<div class="ftr">Generated by Sunny Bhargava · AI Command Centre · Fordham Gabelli MBA · ${date}</div>
</body></html>`;
  const w = window.open("", "_blank");
  w.document.write(html); w.document.close();
  setTimeout(() => { w.focus(); w.print(); }, 600);
}

function exportDOCX(content, varId, fmt) {
  const v = VARIATIONS.find((x) => x.id === varId);
  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'>
<style>
  body{font-family:Calibri,Arial,sans-serif;font-size:11pt;color:#0f1f35;margin:2cm}
  h1{font-size:18pt;font-weight:bold;border-bottom:2pt solid #1a56db;padding-bottom:6pt;margin-bottom:8pt}
  h2{font-size:11pt;font-weight:bold;color:#1a56db;margin-top:16pt;border-bottom:.5pt solid #e2e8f0;padding-bottom:2pt}
  h3{font-size:10.5pt;font-weight:bold;color:#0f1f35;margin-top:10pt}
  p,li{font-size:10pt;line-height:1.5}
  table{width:100%;border-collapse:collapse;margin:8pt 0}
  th{background:#f0f4f8;padding:5pt 7pt;font-weight:bold;border:.5pt solid #cbd5e0;font-size:9pt;color:#1a56db}
  td{padding:4pt 7pt;border:.5pt solid #cbd5e0;font-size:9pt;vertical-align:top}
  .meta{font-size:9pt;color:#6b7d93;font-family:'Courier New',monospace;margin-bottom:16pt}
  .ftr{margin-top:28pt;padding-top:8pt;border-top:.5pt solid #e2e8f0;font-size:8pt;color:#6b7d93}
</style></head><body>
<h1>Product Requirements Document</h1>
<div class="meta">${v?.emoji} ${v?.label?.toUpperCase()} &nbsp;·&nbsp; ${fmt === "long" ? "FULL PRD" : "SCANNABLE"} &nbsp;·&nbsp; ${date}</div>
${content.split("\n").map((l) => {
    if (l.startsWith("## ")) return `<h2>${l.slice(3)}</h2>`;
    if (l.startsWith("### ")) return `<h3>${l.slice(4)}</h3>`;
    if (l.startsWith("#### ")) return `<h4>${l.slice(5)}</h4>`;
    if (l.startsWith("| ---")) return "";
    if (l.startsWith("| ") && l.endsWith(" |")) { const c = l.split("|").filter(x=>x.trim()); return `<tr>${c.map(x=>`<td>${x.trim().replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>")}</td>`).join("")}</tr>`; }
    if (l.startsWith("* ")||l.startsWith("- ")) return `<li>${l.slice(2).replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>")}</li>`;
    if (l.startsWith("[ ] ")) return `<p>&#9744; ${l.slice(4)}</p>`;
    if (l === "---") return `<hr>`;
    if (l.trim() === "") return `<p>&nbsp;</p>`;
    return `<p>${l.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>").replace(/`(.*?)`/g,"<code>$1</code>")}</p>`;
  }).join("\n")}
<div class="ftr">Generated by Sunny Bhargava · AI Command Centre · Fordham Gabelli MBA · ${date}</div>
</body></html>`;
  const blob = new Blob([html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `PRD_${(v?.label||"").replace(/\s+/g,"_")}_${new Date().toISOString().slice(0,10)}.doc`;
  a.click(); URL.revokeObjectURL(url);
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function PRDGenerator({ apiKey }) {
  const [idea,       setIdea]       = useState("");
  const [variation,  setVariation]  = useState(null);
  const [format,     setFormat]     = useState("long");
  const [output,     setOutput]     = useState("");
  const [outputP2,   setOutputP2]   = useState("");
  const [loading,    setLoading]    = useState(false);
  const [loadingP2,  setLoadingP2]  = useState(false);
  const [tab,        setTab]        = useState("rendered");
  const [err,        setErr]        = useState("");
  const [copied,     setCopied]     = useState(false);

  const varCfg = VARIATIONS.find((v) => v.id === variation);

  async function callAPI(system, user) {
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
        max_tokens: 4000,
        system,
        messages: [{ role: "user", content: user }],
      }),
    });
    const d = await res.json();
    if (d.error) throw new Error(d.error.message);
    return d.content?.map((b) => b.text || "").join("") || "";
  }

  async function generate() {
    if (!idea.trim() || !variation || !apiKey) return;
    setLoading(true); setOutput(""); setOutputP2(""); setErr("");
    try {
      const systemPrompt = format === "scannable"
        ? PROMPTS[variation] + SCANNABLE
        : PROMPTS[variation];
      const result = await callAPI(systemPrompt, `Product idea: ${idea}`);
      setOutput(result);
    } catch (e) { setErr("Error: " + e.message); }
    setLoading(false);
  }

  async function generateP2() {
    if (!output || !apiKey) return;
    setLoadingP2(true); setErr("");
    try {
      const result = await callAPI(
        PASS2,
        `Product idea: ${idea}\n\nPass 1 Strategy PRD:\n${output}\n\nGenerate the Execution Plan (Pass 2).`
      );
      setOutputP2(result);
    } catch (e) { setErr("Error: " + e.message); }
    setLoadingP2(false);
  }

  function copy() {
    const all = outputP2 ? `${output}\n\n---\n\n${outputP2}` : output;
    navigator.clipboard.writeText(all);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  }

  const fullOutput = outputP2 ? `${output}\n\n---\n\n${outputP2}` : output;
  const canGenerate = idea.trim() && variation && apiKey;

  return (
    <div>
      {/* STEP 1 — Variation */}
      <div className="card">
        <div className="card-title">Step 1 — Select PRD Type</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10 }}>
          {VARIATIONS.map((v) => (
            <button key={v.id} onClick={() => setVariation(v.id)} style={{
              padding: "14px 8px", borderRadius: 8, textAlign: "center", cursor: "pointer", transition: "all 0.15s",
              border: `2px solid ${variation === v.id ? v.color : "var(--border)"}`,
              background: variation === v.id ? `${v.color}12` : "var(--bg)",
            }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{v.emoji}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: variation === v.id ? v.color : "var(--text)", marginBottom: 3 }}>{v.label}</div>
              <div style={{ fontSize: 9, color: "var(--dim)", fontFamily: "var(--mono)", lineHeight: 1.3 }}>{v.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* STEP 2 — Format */}
      <div className="card">
        <div className="card-title">Step 2 — Output Format</div>
        <div style={{ display: "flex", gap: 12 }}>
          {[
            { id: "long",      label: "📋 Full PRD",   desc: "All 11 sections — for stakeholders, sprint planning, engineering handoff" },
            { id: "scannable", label: "⚡ Scannable",   desc: "4 sections only — for standups, Slack updates, quick leadership alignment" },
          ].map((f) => (
            <button key={f.id} onClick={() => setFormat(f.id)} style={{
              flex: 1, padding: "14px 18px", borderRadius: 8, cursor: "pointer", textAlign: "left", transition: "all 0.15s",
              border: `2px solid ${format === f.id ? "var(--accent)" : "var(--border)"}`,
              background: format === f.id ? "rgba(26,86,219,0.06)" : "var(--bg)",
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: format === f.id ? "var(--accent)" : "var(--text)", marginBottom: 5 }}>{f.label}</div>
              <div style={{ fontSize: 11, color: "var(--dim)", fontFamily: "var(--mono)", lineHeight: 1.4 }}>{f.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* STEP 3 — Idea */}
      <div className="card">
        <div className="card-title">Step 3 — Describe Your Product Idea</div>
        <div className="field">
          <textarea rows={5} value={idea} onChange={(e) => setIdea(e.target.value)}
            placeholder={`Be specific — user, problem, context, business goal.\n\nExample: A feature for a B2B project management SaaS that detects when a sprint is at risk based on velocity data and sends contextual alerts to the PM and engineering lead with suggested actions. Target users are engineering managers at 50-200 person startups.`}
          />
        </div>
        {variation && (
          <div className="alert alert-ok" style={{ marginBottom: 14 }}>
            <span style={{ fontSize: 16 }}>{varCfg.emoji}</span>
            Generating <strong>{varCfg.label}</strong> PRD · <strong>{format === "long" ? "Full PRD (11 sections)" : "Scannable (4 sections)"}</strong>
          </div>
        )}
        {!apiKey && (
          <div className="alert alert-warn" style={{ marginBottom: 14 }}>
            <Icon d={Icons.warning} size={14} />
            Enter your Anthropic API key in the sidebar first.
          </div>
        )}
        <button className="btn btn-primary" onClick={generate} disabled={loading || !canGenerate}
          style={{ background: varCfg?.color || "var(--accent)" }}>
          {loading ? <span className="spinner" /> : <Icon d={Icons.run} size={14} />}
          {loading ? "Generating PRD..." : `Generate ${varCfg?.label || "PRD"}`}
        </button>
      </div>

      {err && <div className="alert alert-err"><Icon d={Icons.warning} size={14} />{err}</div>}

      {/* OUTPUT */}
      {output && (
        <div className="card">
          {/* Toolbar */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            <div className="tabs" style={{ flex: 1, marginBottom: 0 }}>
              <button className={`tab${tab === "rendered" ? " active" : ""}`} onClick={() => setTab("rendered")}>📄 Document</button>
              <button className={`tab${tab === "raw" ? " active" : ""}`} onClick={() => setTab("raw")}>📝 Markdown</button>
            </div>
            <button className="copy-btn" onClick={copy}>{copied ? "✓ Copied" : "Copy"}</button>
            <button className="copy-btn" onClick={() => exportPDF(fullOutput, variation, format)}
              style={{ background: "rgba(220,53,69,0.07)", borderColor: "rgba(220,53,69,0.2)", color: "var(--danger)" }}>
              📄 PDF
            </button>
            <button className="copy-btn" onClick={() => exportDOCX(fullOutput, variation, format)}
              style={{ background: "rgba(26,86,219,0.07)", borderColor: "rgba(26,86,219,0.2)", color: "var(--accent)" }}>
              📝 DOCX
            </button>
          </div>

          {/* Badge */}
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--dim)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
            {varCfg?.emoji} {varCfg?.label} · {format === "long" ? "Full PRD" : "Scannable"} · {new Date().toLocaleDateString()}
          </div>

          {tab === "rendered" ? (
            <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, padding: "16px 20px", maxHeight: 600, overflowY: "auto" }}>
              {renderMD(output)}
            </div>
          ) : (
            <div className="output">{output}</div>
          )}

          {/* Cross-Functional Pass 2 prompt */}
          {variation === "launch" && !outputP2 && (
            <div style={{ marginTop: 18, padding: 18, background: "rgba(234,88,12,0.05)", border: "1px solid rgba(234,88,12,0.18)", borderRadius: 8 }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "#ea580c", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
                🎯 Strategy complete — ready for Execution Plan (Pass 2)
              </div>
              <div style={{ fontSize: 12, color: "var(--dim)", marginBottom: 14, lineHeight: 1.55 }}>
                Pass 1 covers problem analysis, RACI, and requirements. Pass 2 generates the sprint breakdown, GTM plan, legal checklist, launch readiness, and post-launch review schedule.
              </div>
              <button className="btn btn-primary" onClick={generateP2} disabled={loadingP2} style={{ background: "#ea580c" }}>
                {loadingP2 ? <span className="spinner" /> : "🚀"}
                {loadingP2 ? "Generating Execution Plan..." : "Generate Execution Plan (Pass 2)"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* PASS 2 OUTPUT */}
      {outputP2 && (
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "#ea580c", letterSpacing: "0.1em", textTransform: "uppercase", flex: 1 }}>
              🎯 Execution Plan — Pass 2
            </div>
            <button className="copy-btn" onClick={() => exportPDF(fullOutput, variation, format)}
              style={{ background: "rgba(220,53,69,0.07)", borderColor: "rgba(220,53,69,0.2)", color: "var(--danger)" }}>
              📄 Export Full PRD (PDF)
            </button>
            <button className="copy-btn" onClick={() => exportDOCX(fullOutput, variation, format)}
              style={{ background: "rgba(26,86,219,0.07)", borderColor: "rgba(26,86,219,0.2)", color: "var(--accent)" }}>
              📝 Export Full PRD (DOCX)
            </button>
          </div>
          {tab === "rendered" ? (
            <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, padding: "16px 20px", maxHeight: 600, overflowY: "auto" }}>
              {renderMD(outputP2)}
            </div>
          ) : (
            <div className="output">{outputP2}</div>
          )}
        </div>
      )}
    </div>
  );
}
