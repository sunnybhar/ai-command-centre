/**
 * api.js — single integration point between the dashboard and the backend.
 *
 * Call order for AI generation:
 * 1. Backend /api/generate (enables free runs, analytics, cost control)
 * 2. If the backend is unreachable AND the user has their own key,
 *    fall back to calling Anthropic directly so the dashboard never
 *    hard-fails just because the Render free tier is waking up.
 *
 * Migration pattern for tools: replace the raw fetch to api.anthropic.com
 * with callAI({ tool, system, messages, maxTokens, apiKey }).
 */

// After deploying the backend on Render, put its URL here.
// Local development: http://localhost:8000
export const API_BASE =
  process.env.REACT_APP_API_BASE || "http://localhost:8000";

const DEFAULT_MODEL = "claude-sonnet-4-6";

// ── Visitor identity (anonymous, persistent per browser) ──────────────────────
export function getVisitorId() {
  let id = localStorage.getItem("cc_visitor_id");
  if (!id) {
    id = "v-" + crypto.randomUUID();
    localStorage.setItem("cc_visitor_id", id);
  }
  return id;
}

// ── Free run allowance ────────────────────────────────────────────────────────
export async function getFreeRuns() {
  try {
    const r = await fetch(`${API_BASE}/api/free-runs`, {
      headers: { "X-Visitor-Id": getVisitorId() },
    });
    if (!r.ok) return null;
    return await r.json(); // { limit, used, remaining }
  } catch {
    return null; // backend asleep or unreachable
  }
}

// ── Core AI call ──────────────────────────────────────────────────────────────
export async function callAI({ tool, system, messages, maxTokens = 4000, apiKey = "", model = DEFAULT_MODEL }) {
  // 1) Backend first
  try {
    const r = await fetch(`${API_BASE}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Visitor-Id": getVisitorId(),
      },
      body: JSON.stringify({
        tool,
        system: system || null,
        messages,
        max_tokens: maxTokens,
        model,
        api_key: apiKey || null,
      }),
    });
    const data = await r.json();
    if (r.status === 402) {
      // Free limit reached and no BYOK
      const err = new Error(data.detail || "Free limit reached.");
      err.code = "FREE_LIMIT";
      throw err;
    }
    if (!r.ok) { const err = new Error(data.detail || "Backend error"); err.code = "BACKEND_HTTP"; throw err; }
    return {
      text: data.text,
      source: "backend",
      keySource: data.key_source,
      freeRunsRemaining: data.free_runs_remaining,
    };
  } catch (e) {
    if (e.code === "FREE_LIMIT" || e.code === "BACKEND_HTTP") throw e; // real answer, do not fall back
    // 2) Backend unreachable → direct Anthropic if the user has a key
    if (!apiKey) {
      throw new Error(
        "Backend is waking up (Render free tier takes 30-60s after idle). Retry in a moment, or add your own API key in the sidebar."
      );
    }
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        ...(system ? { system } : {}),
        messages,
      }),
    });
    const data = await r.json();
    if (data.error) throw new Error(data.error.message);
    return {
      text: data.content?.map((b) => b.text || "").join("") || "",
      source: "direct",
      keySource: "byok",
      freeRunsRemaining: null,
    };
  }
}

// ── Fire-and-forget analytics for non-AI tools (e.g. Price Tracker) ──────────
export function logToolRun(tool, outcome = "success") {
  fetch(`${API_BASE}/api/log`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Visitor-Id": getVisitorId() },
    body: JSON.stringify({ tool, outcome }),
  }).catch(() => {});
}

// ── Aggregate stats for the landing page ──────────────────────────────────────
export async function getStats() {
  try {
    const r = await fetch(`${API_BASE}/api/stats`);
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}
