import { useState } from "react";
import { Icon, Icons } from "../components/Icons";

const SENTINEL_SYSTEM = `You are a brand sentiment intelligence AI.
Analyze public Reddit posts about a brand.
Respond ONLY in this exact JSON format (no markdown fences):
{
  "sentiment": one of ["Positive","Negative","Crisis Risk","Emerging Trend","Neutral"],
  "sentiment_score": integer from -100 to +100,
  "themes": ["theme1","theme2"],
  "crisis_flag": true or false,
  "trend_signal": true or false,
  "one_line_summary": "under 15 words"
}`;

const SENT_COLORS = {
  Positive:        "#0a9e78",
  Negative:        "#dc3545",
  "Crisis Risk":   "#dc3545",
  "Emerging Trend":"#f59e0b",
  Neutral:         "#6b7d93",
};

export default function SentimentSentinel({ apiKey }) {
  const [brand, setBrand]   = useState("Harley Davidson");
  const [posts, setPosts]   = useState([]);
  const [digest, setDigest] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep]     = useState("");
  const [score, setScore]   = useState(null);

  const MOCK_POSTS = [
    { title: `${brand} just dropped their new lineup and it looks incredible`, body: "The new models are stunning. Gen Z is finally paying attention.", subreddit: "motorcycles", score: 312 },
    { title: `Why does ${brand} cost so much? Indian is better value`, body: "Switched to Indian last month. No regrets honestly.", subreddit: "motorcycles", score: 89 },
    { title: `${brand} owner community is so welcoming`, body: "Went to my first rally. Everyone was super friendly.", subreddit: "motocamping", score: 201 },
    { title: `${brand} reliability issues in 2024 — anyone else?`, body: "Third time back at the dealer this year. Getting tired of it.", subreddit: "harley", score: 445 },
    { title: `Young riders are choosing ${brand} for adventure touring now`, body: "Van life + motorcycle combo is trending. HD fits right in.", subreddit: "vanlife", score: 178 },
  ];

  async function run() {
    setLoading(true); setPosts([]); setDigest(""); setScore(null);
    const analyzed = [];

    for (let i = 0; i < MOCK_POSTS.length; i++) {
      const p = MOCK_POSTS[i];
      setStep(`Analyzing post ${i + 1}/${MOCK_POSTS.length}...`);
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
            system: SENTINEL_SYSTEM,
            messages: [{ role: "user", content: `Analyze this Reddit post about ${brand}:\n\nSubreddit: r/${p.subreddit}\nTitle: ${p.title}\nBody: ${p.body}\nUpvotes: ${p.score}` }],
          }),
        });
        const d = await res.json();
        const txt = d.content?.map((b) => b.text || "").join("") || "{}";
        try {
          const ai = JSON.parse(txt.replace(/```json|```/g, "").trim());
          analyzed.push({ ...p, ai });
        } catch {
          analyzed.push({ ...p, ai: { sentiment: "Neutral", sentiment_score: 0, themes: [], crisis_flag: false, trend_signal: false, one_line_summary: "Parse error" } });
        }
      } catch (e) { console.error(e); }
    }

    const avg = Math.round(analyzed.reduce((s, p) => s + (p.ai?.sentiment_score || 0), 0) / analyzed.length);
    setScore(avg); setPosts(analyzed);

    setStep("Generating executive digest...");
    const summary = analyzed.map((p) => ({ title: p.title, sentiment: p.ai?.sentiment, themes: p.ai?.themes }));
    const dRes = await fetch("/v1/messages", {
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
        messages: [{ role: "user", content: `You are a brand strategist. Write a concise 150-word weekly brand health digest for executives about ${brand}.\n\nPosts analyzed:\n${JSON.stringify(summary, null, 2)}\n\nFocus on sentiment trends, risks, and opportunities. Be direct and actionable.` }],
      }),
    });
    const dData = await dRes.json();
    setDigest(dData.content?.map((b) => b.text || "").join("") || "");
    setLoading(false); setStep("");
  }

  const sentCounts = posts.reduce((acc, p) => {
    const s = p.ai?.sentiment || "Neutral";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <div className="card">
        <div className="card-title">Brand Configuration</div>
        <div className="field">
          <label>Brand Name</label>
          <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} />
        </div>
        <div className="alert alert-warn">
          <Icon d={Icons.warning} size={14} />
          Demo mode: analyzing 5 curated posts. Production version fetches live Reddit data.
        </div>
        <button className="btn btn-primary" onClick={run} disabled={loading || !brand.trim() || !apiKey}>
          {loading ? <span className="spinner" /> : <Icon d={Icons.run} size={14} />}
          {loading ? step : "Run Brand Scan"}
        </button>
      </div>

      {score !== null && (
        <div className="stats-grid">
          <div className={`stat-card ${score > 20 ? "highlight" : score < -20 ? "danger" : ""}`}>
            <div className="stat-value">{score > 0 ? "+" : ""}{score}</div>
            <div className="stat-label">Brand Health Score</div>
          </div>
          <div className={`stat-card ${posts.filter((p) => p.ai?.crisis_flag).length > 0 ? "danger" : "highlight"}`}>
            <div className="stat-value">{posts.filter((p) => p.ai?.crisis_flag).length}</div>
            <div className="stat-label">Crisis Flags</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{posts.filter((p) => p.ai?.trend_signal).length}</div>
            <div className="stat-label">Trend Signals</div>
          </div>
        </div>
      )}

      {posts.length > 0 && (
        <>
          <div className="card">
            <div className="card-title">Sentiment Breakdown</div>
            {["Positive", "Neutral", "Emerging Trend", "Negative", "Crisis Risk"].map((s) => (
              <div key={s} className="sent-row">
                <div className="sent-label">{s}</div>
                <div className="sent-bar-wrap">
                  <div className="sent-bar-fill" style={{ width: `${((sentCounts[s] || 0) / posts.length) * 100}%`, background: SENT_COLORS[s] }} />
                </div>
                <div className="sent-count">{sentCounts[s] || 0}</div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-title">Post Analysis</div>
            <table className="data-table">
              <thead><tr><th>Title</th><th>Sentiment</th><th>Score</th><th>Summary</th></tr></thead>
              <tbody>
                {posts.map((p, i) => (
                  <tr key={i}>
                    <td style={{ maxWidth: 200 }}>{p.title.slice(0, 60)}...</td>
                    <td>
                      <span className="chip" style={{ background: `${SENT_COLORS[p.ai?.sentiment]}18`, color: SENT_COLORS[p.ai?.sentiment] }}>
                        {p.ai?.sentiment}
                      </span>
                    </td>
                    <td style={{ color: p.ai?.sentiment_score > 0 ? "var(--green)" : "var(--danger)", fontFamily: "var(--mono)" }}>
                      {p.ai?.sentiment_score > 0 ? "+" : ""}{p.ai?.sentiment_score}
                    </td>
                    <td style={{ color: "var(--dim)", fontSize: 11 }}>{p.ai?.one_line_summary}</td>
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
