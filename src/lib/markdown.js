/**
 * Shared markdown renderer with table support.
 * Used by Metrics Diagnosis and future tools. PRD Generator has its own
 * local copy; consolidation happens in a later polish pass.
 */

export function renderMD(text) {
  if (!text) return null;
  const lines = text.split("\n");
  const elements = [];
  let tableRows = [];
  let inTable = false;

  const flushTable = (key) => {
    if (!tableRows.length) return;
    const rows = tableRows;
    tableRows = [];
    inTable = false;
    elements.push(
      <div key={`t-${key}`} style={{ overflowX: "auto", margin: "8px 0" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
          <thead>
            <tr>
              {rows[0].map((h, j) => (
                <th key={j} style={{ padding: "6px 10px", textAlign: "left", background: "var(--muted)", border: "1px solid var(--border)", fontFamily: "var(--mono)", fontSize: 10, color: "var(--accent)", letterSpacing: "0.06em" }}>
                  {h.replace(/\*\*/g, "")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(1).map((row, r) => (
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
  };

  lines.forEach((line, i) => {
    if (line.startsWith("| ") && line.endsWith(" |") && !line.startsWith("| ---") && !/^\|[\s|:-]+\|$/.test(line)) {
      inTable = true;
      tableRows.push(line.split("|").filter((c) => c.trim() !== "").map((c) => c.trim()));
      return;
    }
    if (/^\|[\s|:-]+\|$/.test(line) || line.startsWith("| ---")) return;
    if (inTable) flushTable(i);

    if (line.startsWith("## ")) {
      elements.push(<h2 key={i} style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)", margin: "22px 0 8px", fontFamily: "var(--mono)", letterSpacing: "0.06em", borderBottom: "1px solid var(--border)", paddingBottom: 4 }}>{line.slice(3)}</h2>);
    } else if (line.startsWith("### ")) {
      elements.push(<h3 key={i} style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", margin: "12px 0 5px" }}>{line.slice(4)}</h3>);
    } else if (line.startsWith("* ") || line.startsWith("- ")) {
      elements.push(<li key={i} style={{ marginBottom: 3, marginLeft: 18, fontSize: 12, lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: line.slice(2).replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />);
    } else if (line === "---") {
      elements.push(<hr key={i} style={{ border: "none", borderTop: "1px solid var(--border)", margin: "16px 0" }} />);
    } else if (line.trim() === "") {
      elements.push(<div key={i} style={{ height: 6 }} />);
    } else {
      elements.push(<p key={i} style={{ fontSize: 12, lineHeight: 1.65, marginBottom: 4 }} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/`(.*?)`/g, '<code style="font-family:var(--mono);font-size:10px;background:var(--muted);padding:1px 5px;border-radius:3px">$1</code>') }} />);
    }
  });
  flushTable("end");
  return elements;
}

export function downloadMarkdown(content, filename) {
  const blob = new Blob([content], { type: "text/markdown" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function exportPrintPDF(content, title, subtitle) {
  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${title}</title>
<style>
  body{font-family:'Segoe UI',Arial,sans-serif;font-size:11pt;color:#0f1f35;line-height:1.6;padding:40px;max-width:820px;margin:0 auto}
  .hdr{border-bottom:3px solid #1a56db;padding-bottom:14px;margin-bottom:24px}
  .hdr h1{font-size:18pt;font-weight:800;margin-bottom:6px}
  .meta{font-size:9pt;color:#6b7d93;font-family:monospace;letter-spacing:.08em}
  h2{font-size:11pt;font-weight:700;color:#1a56db;margin:20pt 0 6pt;text-transform:uppercase;letter-spacing:.05em;border-bottom:1pt solid #e2e8f0;padding-bottom:3pt}
  h3{font-size:10.5pt;font-weight:700;margin:10pt 0 4pt}
  p,li{font-size:10pt;line-height:1.55;margin-bottom:4pt}
  ul{padding-left:16pt}
  table{width:100%;border-collapse:collapse;margin:8pt 0;font-size:9pt}
  th{background:#f0f4f8;padding:5pt 7pt;font-weight:700;border:1pt solid #cbd5e0;color:#1a56db;font-size:8.5pt;text-align:left}
  td{padding:4pt 7pt;border:1pt solid #cbd5e0;vertical-align:top}
  tr:nth-child(even) td{background:#f9fafb}
  .ftr{margin-top:32pt;padding-top:8pt;border-top:1pt solid #e8edf3;font-size:8pt;color:#6b7d93;font-family:monospace}
  @media print{body{padding:20px}}
</style></head><body>
<div class="hdr"><h1>${title}</h1><div class="meta">${subtitle} &nbsp;·&nbsp; ${date}</div></div>
${content.split("\n").map((l) => {
    if (l.startsWith("## ")) return `<h2>${l.slice(3)}</h2>`;
    if (l.startsWith("### ")) return `<h3>${l.slice(4)}</h3>`;
    if (/^\|[\s|:-]+\|$/.test(l) || l.startsWith("| ---")) return "";
    if (l.startsWith("| ") && l.endsWith(" |")) { const c = l.split("|").filter(x=>x.trim()); return `<tr>${c.map(x=>`<td>${x.trim().replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>")}</td>`).join("")}</tr>`; }
    if (l.startsWith("* ")||l.startsWith("- ")) return `<li>${l.slice(2).replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>")}</li>`;
    if (l === "---") return `<hr>`;
    if (l.trim() === "") return `<p style="margin:3pt 0">&nbsp;</p>`;
    return `<p>${l.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>")}</p>`;
  }).join("\n")}
<div class="ftr">Generated by Sunny Bhargava · AI Product Managers Dashboard · ${date}</div>
</body></html>`;
  const w = window.open("", "_blank");
  w.document.write(html); w.document.close();
  setTimeout(() => { w.focus(); w.print(); }, 600);
}
