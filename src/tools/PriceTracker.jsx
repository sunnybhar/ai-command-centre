import { useState } from "react";
import { Icon, Icons } from "../components/Icons";

export default function PriceTracker() {
  const [urls, setUrls]       = useState(["http://books.toscrape.com/catalogue/a-light-in-the-attic_1000/index.html"]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep]       = useState("");

  function addUrl()           { setUrls([...urls, ""]); }
  function updateUrl(i, v)    { const u = [...urls]; u[i] = v; setUrls(u); }
  function removeUrl(i)       { setUrls(urls.filter((_, idx) => idx !== i)); }

  async function run() {
    setLoading(true); setResults([]); setStep("");
    const out = [];
    const validUrls = urls.filter((u) => u.trim());

    for (let i = 0; i < validUrls.length; i++) {
      const u = validUrls[i];
      setStep(`Scraping ${i + 1}/${validUrls.length}...`);
      try {
        const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(u)}`);
        const d = await res.json();
        const html = d.contents;
        const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/);
        const priceMatch = html.match(/class="price_color"[^>]*>(.*?)<\/p>/);
        const availMatch = html.match(/class="instock availability"[^>]*>\s*<i[^>]*><\/i>\s*(.*?)\s*<\/p>/);
        out.push({
          url: u,
          title: titleMatch ? titleMatch[1].replace(/&amp;/g, "&").replace(/&#39;/g, "'") : "Unknown",
          price: priceMatch ? priceMatch[1].replace(/&pound;/g, "£").replace(/&#163;/g, "£") : "N/A",
          availability: availMatch ? availMatch[1].trim() : "Unknown",
          timestamp: new Date().toLocaleString(),
        });
      } catch (e) {
        out.push({ url: u, title: "Error", price: "N/A", availability: "Error", timestamp: new Date().toLocaleString() });
      }
    }
    setResults(out); setLoading(false); setStep("");
  }

  function exportCSV() {
    const header = "Title,Price,Availability,URL,Timestamp";
    const rows = results.map((r) => `"${r.title}","${r.price}","${r.availability}","${r.url}","${r.timestamp}"`);
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `price_tracker_${Date.now()}.csv`;
    a.click();
  }

  return (
    <div>
      <div className="card">
        <div className="card-title">Product URLs to Track</div>
        {urls.map((u, i) => (
          <div key={i} className="url-row">
            <input type="url" placeholder="https://..." value={u} onChange={(e) => updateUrl(i, e.target.value)} />
            {urls.length > 1 && (
              <button className="copy-btn" onClick={() => removeUrl(i)}>✕</button>
            )}
          </div>
        ))}
        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <button className="btn btn-ghost" onClick={addUrl}>+ Add URL</button>
          <button className="btn btn-primary" onClick={run} disabled={loading || !urls.some((u) => u.trim())}>
            {loading ? <span className="spinner" /> : <Icon d={Icons.run} size={14} />}
            {loading ? step : "Scrape Prices"}
          </button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
            <div className="card-title" style={{ marginBottom: 0 }}>Results — {results.length} products</div>
            <button className="btn btn-ghost" style={{ marginLeft: "auto", padding: "6px 12px", fontSize: 11 }} onClick={exportCSV}>
              <Icon d={Icons.download} size={12} /> Export CSV
            </button>
          </div>
          <table className="data-table">
            <thead>
              <tr><th>Product</th><th>Price</th><th>Availability</th><th>Scraped At</th></tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i}>
                  <td style={{ maxWidth: 220 }}>{r.title}</td>
                  <td style={{ color: "var(--accent)", fontWeight: 700, fontFamily: "var(--mono)" }}>{r.price}</td>
                  <td>
                    <span className={`chip ${r.availability.includes("In stock") ? "chip-green" : "chip-red"}`}>
                      {r.availability}
                    </span>
                  </td>
                  <td style={{ color: "var(--dim)", fontSize: 11 }}>{r.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
