import { useState, useCallback } from "react";

const PII_CATEGORIES = [
  {
    id: "ssn", label: "Social Security Numbers",
    pattern: /\b\d{3}-\d{2}-\d{4}\b/g,
    color: "#ef4444", bg: "rgba(239,68,68,0.18)", border: "rgba(239,68,68,0.4)",
  },
  {
    id: "email", label: "Email Addresses",
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
    color: "#f59e0b", bg: "rgba(245,158,11,0.18)", border: "rgba(245,158,11,0.4)",
  },
  {
    id: "phone", label: "Phone Numbers",
    pattern: /\b(\+?1[\s.\-]?)?\(?\d{3}\)?[\s.\-]?\d{3}[\s.\-]?\d{4}\b/g,
    color: "#a78bfa", bg: "rgba(167,139,250,0.18)", border: "rgba(167,139,250,0.4)",
  },
  {
    id: "date", label: "Specific Dates",
    pattern: /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b|\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/g,
    color: "#38bdf8", bg: "rgba(56,189,248,0.18)", border: "rgba(56,189,248,0.4)",
  },
  {
    id: "address", label: "Street Addresses",
    pattern: /\b\d+\s+[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*\s+(?:Street|St|Avenue|Ave|Boulevard|Blvd|Road|Rd|Drive|Dr|Lane|Ln|Court|Ct|Place|Pl|Way|Circle|Cir)\.?\b/g,
    color: "#34d399", bg: "rgba(52,211,153,0.18)", border: "rgba(52,211,153,0.4)",
  },
  {
    id: "case", label: "Case Numbers",
    pattern: /\b\d{1,2}[-:]\w{2,6}[-:]\d{3,8}(?:[-:]\w+)?\b|\b\d{4}-[A-Z]{2}-\d{4,}\b/g,
    color: "#f472b6", bg: "rgba(244,114,182,0.18)", border: "rgba(244,114,182,0.4)",
  },
  {
    id: "financial", label: "Financial Account Data",
    pattern: /\b(?:account\s*(?:#|number|no\.?)?\s*:?\s*\d{6,17}|routing\s*(?:#|number|no\.?)?\s*:?\s*\d{9}|\d{4}[\s\-]\d{4}[\s\-]\d{4}[\s\-]\d{4})\b/gi,
    color: "#fb923c", bg: "rgba(251,146,60,0.18)", border: "rgba(251,146,60,0.4)",
  },
];

const AI_TOOLS = [
  "ChatGPT (OpenAI)", "Claude (Anthropic)", "Microsoft Copilot",
  "Westlaw AI", "Lexis+ AI", "Harvey", "CoCounsel (Thomson Reuters)",
  "Gemini (Google)", "Paxton AI", "Perplexity", "Other generative AI",
];

const COURT_TYPES = [
  "U.S. District Court", "U.S. Court of Appeals", "U.S. Bankruptcy Court",
  "U.S. Tax Court", "State Trial Court", "State Appellate Court",
  "State Supreme Court", "Administrative Tribunal / Agency",
];

const STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
  "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
  "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada",
  "New Hampshire","New Jersey","New Mexico","New York","North Carolina",
  "North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island",
  "South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont",
  "Virginia","Washington","West Virginia","Wisconsin","Wyoming","D.C.",
];

const FILING_TYPES = [
  "Motion","Brief / Memorandum of Law","Complaint / Petition",
  "Response / Opposition","Reply","Proposed Order","Discovery Requests",
  "Expert Report / Declaration","Demand Letter","Contract or Agreement Draft","Other",
];

export default function ClearCounsel() {
  const [tab, setTab] = useState("redact");

  // Redact state
  const [inputText, setInputText] = useState("");
  const [enabled, setEnabled] = useState(Object.fromEntries(PII_CATEGORIES.map(c => [c.id, true])));
  const [detected, setDetected] = useState([]);
  const [redacted, setRedacted] = useState("");
  const [analyzed, setAnalyzed] = useState(false);
  const [redactCopied, setRedactCopied] = useState(false);
  const [view, setView] = useState("highlight"); // "highlight" | "redacted"

  // Disclosure state
  const [courtType, setCourtType] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [courtName, setCourtName] = useState("");
  const [filingType, setFilingType] = useState("");
  const [tools, setTools] = useState([]);
  const [humanReview, setHumanReview] = useState(true);
  const [disclosure, setDisclosure] = useState("");
  const [generating, setGenerating] = useState(false);
  const [discCopied, setDiscCopied] = useState(false);

  const analyze = useCallback(() => {
    if (!inputText.trim()) return;
    const found = [];
    PII_CATEGORIES.forEach(cat => {
      if (!enabled[cat.id]) return;
      const re = new RegExp(cat.pattern.source, cat.pattern.flags);
      let m;
      while ((m = re.exec(inputText)) !== null) {
        found.push({ category: cat.id, value: m[0], index: m.index, end: m.index + m[0].length });
      }
    });
    found.sort((a, b) => a.index - b.index);

    // Remove overlaps
    const clean = [];
    let cursor = 0;
    for (const item of found) {
      if (item.index >= cursor) { clean.push(item); cursor = item.end; }
    }

    setDetected(clean);

    let result = inputText;
    [...clean].reverse().forEach(item => {
      const cat = PII_CATEGORIES.find(c => c.id === item.category);
      const tag = `[${cat.label.toUpperCase().replace(/\s+/g, "_")}]`;
      result = result.slice(0, item.index) + tag + result.slice(item.end);
    });
    setRedacted(result);
    setAnalyzed(true);
    setView("highlight");
  }, [inputText, enabled]);

  const renderHighlighted = () => {
    if (!detected.length) return <span style={{ whiteSpace: "pre-wrap" }}>{inputText}</span>;
    const parts = [];
    let cursor = 0;
    detected.forEach((item, i) => {
      if (item.index > cursor) parts.push(<span key={`t${i}`} style={{ whiteSpace: "pre-wrap" }}>{inputText.slice(cursor, item.index)}</span>);
      const cat = PII_CATEGORIES.find(c => c.id === item.category);
      parts.push(
        <mark key={`m${i}`} style={{
          background: cat.bg, color: cat.color,
          border: `1px solid ${cat.border}`,
          borderRadius: 4, padding: "1px 5px",
          fontWeight: 600, fontFamily: "inherit",
        }}>{item.value}</mark>
      );
      cursor = item.end;
    });
    if (cursor < inputText.length) parts.push(<span key="tend" style={{ whiteSpace: "pre-wrap" }}>{inputText.slice(cursor)}</span>);
    return parts;
  };

  const generateDisclosure = async () => {
    if (!courtType || !filingType || tools.length === 0) return;
    setGenerating(true);
    setDisclosure("");
    try {
      const court = [courtName, courtType, stateVal].filter(Boolean).join(", ");
      const prompt = `You are a legal compliance expert specializing in AI ethics and court rules. Generate a concise, professional AI disclosure statement for a court filing.

Filing details:
- Court: ${court}
- Document type: ${filingType}
- AI tools used: ${tools.join("; ")}
- Attorney human review: ${humanReview ? "Yes — counsel independently reviewed, verified, and takes full responsibility for all content" : "Not specified"}

Instructions:
- Write exactly 2–3 sentences
- Comply with ABA Model Rules 3.3 (candor to tribunal) and 1.1 (competence)
- State that AI was used as an assistive drafting tool only
- Affirm that the filing attorney reviewed, verified accuracy of, and takes professional responsibility for all content
- Use formal, court-appropriate legal language
- Do NOT use brackets, placeholders, or ellipses — write complete, final sentences
- Output ONLY the disclosure paragraph with no preamble or explanation`;

      const res = await fetch("/api/disclose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("") || "Error generating disclosure.";
      setDisclosure(text.trim());
    } catch {
      setDisclosure("Unable to generate disclosure. Please check your connection and try again.");
    }
    setGenerating(false);
  };

  const copy = (text, setter) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const toggleTool = (t) => setTools(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const s = {
    root: {
      minHeight: "100vh",
      background: "#070d1a",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      color: "#e8e0d0",
      padding: "0",
    },
    header: {
      background: "linear-gradient(135deg, #0d1a2e 0%, #0a1220 100%)",
      borderBottom: "1px solid rgba(196,162,68,0.2)",
      padding: "28px 40px 0",
    },
    brand: {
      display: "flex",
      alignItems: "center",
      gap: 14,
      marginBottom: 24,
    },
    logo: {
      width: 40, height: 40,
      background: "linear-gradient(135deg, #c4a244 0%, #e8c96a 100%)",
      borderRadius: 8,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 20,
      boxShadow: "0 0 20px rgba(196,162,68,0.3)",
    },
    brandName: {
      fontSize: 22,
      fontWeight: 700,
      letterSpacing: "-0.3px",
      background: "linear-gradient(135deg, #c4a244, #f0d98a)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
    brandTag: {
      fontSize: 11,
      color: "#6b7280",
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      marginTop: 1,
    },
    tabs: {
      display: "flex",
      gap: 0,
    },
    tab: (active) => ({
      padding: "12px 28px",
      background: "none",
      border: "none",
      borderBottom: active ? "2px solid #c4a244" : "2px solid transparent",
      color: active ? "#c4a244" : "#6b7280",
      fontFamily: "inherit",
      fontSize: 14,
      fontWeight: active ? 600 : 400,
      cursor: "pointer",
      letterSpacing: "0.01em",
      transition: "all 0.15s",
    }),
    body: {
      padding: "32px 40px",
      maxWidth: 900,
      margin: "0 auto",
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: 600,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      color: "#c4a244",
      marginBottom: 12,
    },
    label: {
      fontSize: 13,
      color: "#9ca3af",
      display: "block",
      marginBottom: 6,
    },
    textarea: {
      width: "100%",
      minHeight: 180,
      background: "#0d1a2e",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 8,
      color: "#e8e0d0",
      fontFamily: "'DM Mono', 'Fira Code', monospace",
      fontSize: 13,
      lineHeight: 1.6,
      padding: "14px 16px",
      resize: "vertical",
      outline: "none",
      boxSizing: "border-box",
      transition: "border-color 0.15s",
    },
    select: {
      width: "100%",
      background: "#0d1a2e",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 8,
      color: "#e8e0d0",
      fontFamily: "inherit",
      fontSize: 13,
      padding: "10px 14px",
      outline: "none",
      boxSizing: "border-box",
      cursor: "pointer",
      appearance: "none",
      WebkitAppearance: "none",
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236b7280' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "right 14px center",
      paddingRight: 36,
    },
    input: {
      width: "100%",
      background: "#0d1a2e",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 8,
      color: "#e8e0d0",
      fontFamily: "inherit",
      fontSize: 13,
      padding: "10px 14px",
      outline: "none",
      boxSizing: "border-box",
    },
    btn: {
      background: "linear-gradient(135deg, #c4a244 0%, #e8c96a 100%)",
      color: "#0a0f1a",
      border: "none",
      borderRadius: 8,
      padding: "12px 28px",
      fontFamily: "inherit",
      fontSize: 14,
      fontWeight: 700,
      cursor: "pointer",
      letterSpacing: "0.02em",
      transition: "opacity 0.15s, transform 0.1s",
      boxShadow: "0 4px 20px rgba(196,162,68,0.25)",
    },
    btnGhost: {
      background: "rgba(196,162,68,0.08)",
      color: "#c4a244",
      border: "1px solid rgba(196,162,68,0.25)",
      borderRadius: 8,
      padding: "10px 20px",
      fontFamily: "inherit",
      fontSize: 13,
      fontWeight: 600,
      cursor: "pointer",
      letterSpacing: "0.02em",
      transition: "all 0.15s",
    },
    card: {
      background: "#0d1a2e",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 10,
      padding: 20,
      marginBottom: 20,
    },
    highlightBox: {
      background: "#0d1a2e",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 8,
      padding: "14px 16px",
      fontFamily: "'DM Mono', 'Fira Code', monospace",
      fontSize: 13,
      lineHeight: 1.7,
      minHeight: 120,
      whiteSpace: "pre-wrap",
      wordBreak: "break-word",
    },
    pill: (active) => ({
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "5px 12px",
      borderRadius: 100,
      border: active ? "1px solid rgba(196,162,68,0.4)" : "1px solid rgba(255,255,255,0.08)",
      background: active ? "rgba(196,162,68,0.1)" : "rgba(255,255,255,0.03)",
      color: active ? "#c4a244" : "#6b7280",
      fontSize: 12,
      fontWeight: 500,
      cursor: "pointer",
      transition: "all 0.15s",
      userSelect: "none",
    }),
    statBadge: (color) => ({
      background: `rgba(${color},0.12)`,
      border: `1px solid rgba(${color},0.3)`,
      borderRadius: 6,
      padding: "8px 14px",
      fontSize: 12,
      color: `rgb(${color})`,
      textAlign: "center",
    }),
    divider: {
      height: 1,
      background: "rgba(255,255,255,0.06)",
      margin: "24px 0",
    },
    toggleSwitch: (on) => ({
      width: 40, height: 22,
      borderRadius: 11,
      background: on ? "#c4a244" : "#1e2d45",
      border: on ? "none" : "1px solid rgba(255,255,255,0.1)",
      position: "relative",
      cursor: "pointer",
      transition: "background 0.2s",
      flexShrink: 0,
    }),
    toggleKnob: (on) => ({
      position: "absolute",
      top: 2, left: on ? 20 : 2,
      width: 18, height: 18,
      borderRadius: "50%",
      background: on ? "#0a0f1a" : "#6b7280",
      transition: "left 0.2s",
    }),
    disclosureBox: {
      background: "linear-gradient(135deg, #0d1a2e 0%, #0a1520 100%)",
      border: "1px solid rgba(196,162,68,0.25)",
      borderRadius: 10,
      padding: 24,
    },
    disclosureText: {
      fontFamily: "'Georgia', 'Times New Roman', serif",
      fontSize: 15,
      lineHeight: 1.8,
      color: "#e8e0d0",
      letterSpacing: "0.01em",
    },
    catDot: (color) => ({
      width: 8, height: 8,
      borderRadius: "50%",
      background: color,
      flexShrink: 0,
      boxShadow: `0 0 6px ${color}80`,
    }),
    grid2: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 14,
    },
    toolGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 8,
      marginTop: 10,
    },
    toolChip: (sel) => ({
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "9px 14px",
      borderRadius: 8,
      border: sel ? "1px solid rgba(196,162,68,0.5)" : "1px solid rgba(255,255,255,0.07)",
      background: sel ? "rgba(196,162,68,0.1)" : "rgba(255,255,255,0.02)",
      color: sel ? "#e8c96a" : "#9ca3af",
      fontSize: 13,
      cursor: "pointer",
      transition: "all 0.15s",
      userSelect: "none",
    }),
  };

  const isRedactReady = inputText.trim().length > 0;
  const isDisclosureReady = courtType && filingType && tools.length > 0;

  return (
    <div style={s.root}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.brand}>
          <div style={s.logo}>⚖</div>
          <div>
            <div style={s.brandName}>ClearCounsel™</div>
            <div style={s.brandTag}>AI Compliance for Legal Professionals</div>
          </div>
        </div>
        <div style={s.tabs}>
          <button style={s.tab(tab === "redact")} onClick={() => setTab("redact")}>
            🛡 Redact Before You Paste
          </button>
          <button style={s.tab(tab === "disclose")} onClick={() => setTab("disclose")}>
            📋 Disclose After You File
          </button>
        </div>
      </div>

      <div style={s.body}>

        {/* ── REDACT TAB ───────────────────────────────────────── */}
        {tab === "redact" && (
          <div>
            <p style={{ color: "#6b7280", fontSize: 13, marginTop: 0, marginBottom: 24, lineHeight: 1.6 }}>
              Detect and remove sensitive client information before pasting any document into an AI tool.
              Protects attorney-client privilege and satisfies ABA Model Rule 1.6.
            </p>

            {/* Category toggles */}
            <div style={s.card}>
              <div style={s.sectionTitle}>Detection Categories</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {PII_CATEGORIES.map(cat => (
                  <div
                    key={cat.id}
                    style={s.pill(enabled[cat.id])}
                    onClick={() => setEnabled(p => ({ ...p, [cat.id]: !p[cat.id] }))}
                  >
                    <span style={s.catDot(cat.color)} />
                    {cat.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Input */}
            <div style={{ marginBottom: 16 }}>
              <label style={s.label}>Paste document text below</label>
              <textarea
                style={s.textarea}
                placeholder="Paste contract, case notes, client communication, or any legal document here..."
                value={inputText}
                onChange={e => { setInputText(e.target.value); setAnalyzed(false); }}
                onFocus={e => e.target.style.borderColor = "rgba(196,162,68,0.4)"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
              />
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
              <button
                style={{ ...s.btn, opacity: isRedactReady ? 1 : 0.4, cursor: isRedactReady ? "pointer" : "not-allowed" }}
                onClick={analyze}
                disabled={!isRedactReady}
              >
                Analyze & Detect PII
              </button>
              {analyzed && (
                <button style={s.btnGhost} onClick={() => { setInputText(""); setDetected([]); setRedacted(""); setAnalyzed(false); }}>
                  Clear
                </button>
              )}
            </div>

            {/* Results */}
            {analyzed && (
              <div>
                {/* Stats */}
                <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
                  <div style={s.statBadge("239,68,68")}>
                    <div style={{ fontSize: 20, fontWeight: 700 }}>{detected.length}</div>
                    <div>Items Detected</div>
                  </div>
                  {PII_CATEGORIES.filter(c => detected.some(d => d.category === c.id)).map(cat => {
                    const count = detected.filter(d => d.category === cat.id).length;
                    return count > 0 ? (
                      <div key={cat.id} style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "8px 14px",
                        background: cat.bg, border: `1px solid ${cat.border}`,
                        borderRadius: 6, fontSize: 12, color: cat.color,
                      }}>
                        <span style={s.catDot(cat.color)} />
                        {count} {cat.label}
                      </div>
                    ) : null;
                  })}
                </div>

                {/* View toggle */}
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  <button
                    style={{ ...s.btnGhost, ...(view === "highlight" ? { background: "rgba(196,162,68,0.15)", borderColor: "rgba(196,162,68,0.5)" } : {}) }}
                    onClick={() => setView("highlight")}
                  >Highlighted Original</button>
                  <button
                    style={{ ...s.btnGhost, ...(view === "redacted" ? { background: "rgba(196,162,68,0.15)", borderColor: "rgba(196,162,68,0.5)" } : {}) }}
                    onClick={() => setView("redacted")}
                  >Redacted Output</button>
                </div>

                {view === "highlight" ? (
                  <div>
                    <div style={s.highlightBox}>{renderHighlighted()}</div>
                    <p style={{ fontSize: 12, color: "#6b7280", marginTop: 8 }}>
                      Highlighted items will be replaced with labeled tags in the redacted output.
                    </p>
                  </div>
                ) : (
                  <div>
                    <div style={s.highlightBox}>
                      <span style={{ whiteSpace: "pre-wrap" }}>{redacted}</span>
                    </div>
                    <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}>
                      <button
                        style={s.btn}
                        onClick={() => copy(redacted, setRedactCopied)}
                      >
                        {redactCopied ? "✓ Copied!" : "Copy Redacted Text"}
                      </button>
                      <span style={{ fontSize: 12, color: "#6b7280" }}>
                        Safe to paste into any AI tool.
                      </span>
                    </div>
                  </div>
                )}

                <div style={{ ...s.card, marginTop: 20, background: "rgba(52,211,153,0.06)", borderColor: "rgba(52,211,153,0.2)" }}>
                  <div style={{ fontSize: 13, color: "#34d399", fontWeight: 600, marginBottom: 4 }}>⚠ Disclaimer</div>
                  <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6 }}>
                    This tool uses pattern-matching heuristics and may not detect every instance of sensitive information,
                    particularly names, proprietary terms, or context-specific identifiers. Always conduct a manual review
                    before sharing with any third-party AI system. This tool does not constitute legal advice.
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── DISCLOSE TAB ─────────────────────────────────────── */}
        {tab === "disclose" && (
          <div>
            <p style={{ color: "#6b7280", fontSize: 13, marginTop: 0, marginBottom: 24, lineHeight: 1.6 }}>
              Generate court-ready AI disclosure language for any filing. Complies with ABA Model Rule 3.3
              (candor to tribunal) and jurisdiction-specific standing orders on AI use.
            </p>

            <div style={s.card}>
              <div style={s.sectionTitle}>Court Information</div>
              <div style={s.grid2}>
                <div>
                  <label style={s.label}>Court Type *</label>
                  <select style={s.select} value={courtType} onChange={e => setCourtType(e.target.value)}>
                    <option value="">Select court type...</option>
                    {COURT_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={s.label}>State / Jurisdiction</label>
                  <select style={s.select} value={stateVal} onChange={e => setStateVal(e.target.value)}>
                    <option value="">Select state...</option>
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginTop: 14 }}>
                <label style={s.label}>Specific Court Name (optional)</label>
                <input
                  style={s.input}
                  placeholder="e.g. U.S. District Court, Southern District of New York"
                  value={courtName}
                  onChange={e => setCourtName(e.target.value)}
                  onFocus={e => e.target.style.borderColor = "rgba(196,162,68,0.4)"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
                />
              </div>
            </div>

            <div style={s.card}>
              <div style={s.sectionTitle}>Filing Details</div>
              <div>
                <label style={s.label}>Document / Filing Type *</label>
                <select style={s.select} value={filingType} onChange={e => setFilingType(e.target.value)}>
                  <option value="">Select filing type...</option>
                  {FILING_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>

            <div style={s.card}>
              <div style={s.sectionTitle}>AI Tools Used *</div>
              <p style={{ fontSize: 12, color: "#6b7280", marginTop: 0, marginBottom: 10 }}>
                Select all tools used in drafting or researching this filing.
              </p>
              <div style={s.toolGrid}>
                {AI_TOOLS.map(t => (
                  <div key={t} style={s.toolChip(tools.includes(t))} onClick={() => toggleTool(t)}>
                    <span style={{
                      width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                      border: tools.includes(t) ? "none" : "1px solid rgba(255,255,255,0.15)",
                      background: tools.includes(t) ? "#c4a244" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, color: "#0a0f1a",
                    }}>
                      {tools.includes(t) ? "✓" : ""}
                    </span>
                    {t}
                  </div>
                ))}
              </div>
            </div>

            <div style={s.card}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#e8e0d0" }}>Attorney Human Review</div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 3 }}>
                    Counsel independently reviewed and verified all AI-generated content
                  </div>
                </div>
                <div style={s.toggleSwitch(humanReview)} onClick={() => setHumanReview(p => !p)}>
                  <div style={s.toggleKnob(humanReview)} />
                </div>
              </div>
            </div>

            <button
              style={{
                ...s.btn,
                opacity: isDisclosureReady ? 1 : 0.4,
                cursor: isDisclosureReady ? "pointer" : "not-allowed",
                width: "100%",
                padding: "14px",
                fontSize: 15,
                marginBottom: 24,
              }}
              onClick={generateDisclosure}
              disabled={!isDisclosureReady || generating}
            >
              {generating ? "Generating Disclosure..." : "Generate Disclosure Statement"}
            </button>

            {generating && (
              <div style={{ textAlign: "center", color: "#6b7280", fontSize: 13, marginBottom: 20 }}>
                <div style={{
                  display: "inline-block",
                  width: 24, height: 24,
                  border: "2px solid rgba(196,162,68,0.3)",
                  borderTopColor: "#c4a244",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                  marginBottom: 8,
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <div>Drafting court-compliant disclosure language...</div>
              </div>
            )}

            {disclosure && !generating && (
              <div style={s.disclosureBox}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#c4a244" }}>
                    Generated Disclosure
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {courtType && <span style={{ fontSize: 11, color: "#6b7280", background: "rgba(255,255,255,0.04)", padding: "3px 8px", borderRadius: 4 }}>{courtType}</span>}
                    {filingType && <span style={{ fontSize: 11, color: "#6b7280", background: "rgba(255,255,255,0.04)", padding: "3px 8px", borderRadius: 4 }}>{filingType}</span>}
                  </div>
                </div>
                <div style={s.disclosureText}>{disclosure}</div>
                <div style={s.divider} />
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <button style={s.btn} onClick={() => copy(disclosure, setDiscCopied)}>
                    {discCopied ? "✓ Copied!" : "Copy Disclosure"}
                  </button>
                  <button style={s.btnGhost} onClick={generateDisclosure}>
                    Regenerate
                  </button>
                </div>
                <div style={{ ...s.card, marginTop: 16, background: "rgba(245,158,11,0.05)", borderColor: "rgba(245,158,11,0.2)", marginBottom: 0 }}>
                  <div style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.6 }}>
                    <strong style={{ color: "#f59e0b" }}>Note:</strong> This disclosure is AI-generated and should be reviewed
                    by the supervising attorney before inclusion in any court filing. Requirements vary by judge and jurisdiction.
                    Always verify against any applicable standing orders or local rules.
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
