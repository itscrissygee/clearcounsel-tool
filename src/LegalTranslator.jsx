import { useState, useRef } from "react";

const STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
  "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
  "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada",
  "New Hampshire","New Jersey","New Mexico","New York","North Carolina",
  "North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island",
  "South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont",
  "Virginia","Washington","West Virginia","Wisconsin","Wyoming","Washington D.C."
];

const DOC_TYPES = [
  {
    id: "plea",
    icon: "📜",
    label: "Plea Agreement",
    desc: "A document where you agree to plead guilty, no contest, or Alford to a crime",
    warning: "This document can follow you for life. Read every word before signing anything.",
  },
  {
    id: "order",
    icon: "⚖️",
    label: "Court Order",
    desc: "A document from a judge telling you what you must or must not do",
    warning: "Ignoring a court order can result in arrest. Understand it before you do anything.",
  },
  {
    id: "summons",
    icon: "📋",
    label: "Summons",
    desc: "A document telling you that you're being sued or must appear in court",
    warning: "There is a deadline to respond. Missing it means you automatically lose.",
  },
];

const SECTION_LABELS = [
  { key: "summary", icon: "📖", label: "What This Document Says", color: "#38bdf8" },
  { key: "means", icon: "🎯", label: "What This Means For You", color: "#c4a244" },
  { key: "todo", icon: "✅", label: "What You Need To Do & By When", color: "#34d399" },
  { key: "rights", icon: "🛡", label: "Your Rights In This Situation", color: "#a78bfa" },
];

function parseResponse(text) {
  const result = { summary: "", means: "", todo: "", rights: "" };
  const markers = [
    { key: "summary", patterns: ["WHAT THIS DOCUMENT SAYS", "WHAT THIS SAYS"] },
    { key: "means", patterns: ["WHAT THIS MEANS FOR YOU", "WHAT THIS MEANS"] },
    { key: "todo", patterns: ["WHAT YOU NEED TO DO", "WHAT TO DO"] },
    { key: "rights", patterns: ["YOUR RIGHTS", "YOUR RIGHTS IN THIS SITUATION"] },
  ];
  let current = null;
  const lines = text.split("\n");
  for (const line of lines) {
    const upper = line.trim().toUpperCase();
    const matched = markers.find(m => m.patterns.some(p => upper.includes(p)));
    if (matched) { current = matched.key; continue; }
    if (current && line.trim()) result[current] += line + "\n";
  }
  return result;
}

export default function LegalTranslator() {
  const [step, setStep] = useState(1);
  const [state, setState] = useState("");
  const [docType, setDocType] = useState(null);
  const [docText, setDocText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const resultRef = useRef(null);

  const selectedDoc = DOC_TYPES.find(d => d.id === docType);

  const translate = async () => {
    if (!state || !docType || !docText.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    const prompt = `You are a compassionate legal document translator helping a person who is representing themselves in court. They are NOT a lawyer. They may be scared, confused, and overwhelmed. Your job is to help them understand this document clearly and honestly.

The person is located in: ${state}
Document type: ${selectedDoc?.label}

Document text:
${docText}

Please provide exactly four sections. Write every word in plain English — no legal jargon whatsoever. Write like you are a knowledgeable, caring friend explaining this over the kitchen table.

WHAT THIS DOCUMENT SAYS
Summarize what this document is saying in simple, clear language. What is being asked, required, or agreed to? Be specific about names, dates, amounts, or charges if they appear.

WHAT THIS MEANS FOR YOU
Be honest about the real consequences. How could this affect their life, record, housing, employment, family, or future in ${state}? If it's serious, say so clearly but compassionately. Do not minimize genuine risks.

WHAT YOU NEED TO DO AND BY WHEN
Give specific, numbered action steps. State any deadlines clearly. Tell them if they need to respond, appear, sign, or do nothing. If they should find a lawyer or legal aid, say so directly and remind them that free legal aid exists in every state.

YOUR RIGHTS IN THIS SITUATION
Explain the rights this person has under ${state} law and federal law. What protections do they have? What can they NOT be forced to do? What options do they have that they may not know about? Include any ${state}-specific protections that are relevant to this document type.

Use these exact headers with no additional formatting around them:
WHAT THIS DOCUMENT SAYS
WHAT THIS MEANS FOR YOU
WHAT YOU NEED TO DO AND BY WHEN
YOUR RIGHTS IN THIS SITUATION

End with a one-sentence reminder that free legal aid is available in ${state} and encourage them to seek it for serious matters.`;

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("") || "";
      if (!text) throw new Error("No response");
      setResult(parseResponse(text));
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const reset = () => {
    setStep(1); setState(""); setDocType(null);
    setDocText(""); setResult(null); setError("");
  };

  const s = {
    root: {
      minHeight: "100vh",
      background: "#070d1a",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      color: "#e8e0d0",
      padding: 0,
    },
    header: {
      background: "linear-gradient(135deg, #0d1a2e 0%, #0a1220 100%)",
      borderBottom: "1px solid rgba(196,162,68,0.2)",
      padding: "24px 32px",
    },
    brand: { display: "flex", alignItems: "center", gap: 12, marginBottom: 8 },
    logo: {
      width: 36, height: 36,
      background: "linear-gradient(135deg, #c4a244, #e8c96a)",
      borderRadius: 8,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 18,
    },
    brandName: {
      fontSize: 18, fontWeight: 700,
      background: "linear-gradient(135deg, #c4a244, #f0d98a)",
      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
    },
    tagline: { fontSize: 13, color: "#6b7280", marginLeft: 48 },
    body: { maxWidth: 760, margin: "0 auto", padding: "32px 24px" },
    heroBox: {
      background: "linear-gradient(135deg, rgba(196,162,68,0.08), rgba(196,162,68,0.03))",
      border: "1px solid rgba(196,162,68,0.2)",
      borderRadius: 12,
      padding: "28px 32px",
      marginBottom: 32,
    },
    heroTitle: {
      fontSize: 28, fontWeight: 700,
      background: "linear-gradient(135deg, #c4a244, #f0d98a)",
      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
      marginBottom: 10,
    },
    heroDesc: { fontSize: 15, color: "#9ca3af", lineHeight: 1.7, fontWeight: 300 },
    stepLabel: {
      fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
      textTransform: "uppercase", color: "#c4a244", marginBottom: 12,
    },
    card: {
      background: "#0d1a2e",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 10, padding: 24, marginBottom: 20,
    },
    label: { fontSize: 15, fontWeight: 600, color: "#e8e0d0", marginBottom: 6, display: "block" },
    sublabel: { fontSize: 13, color: "#6b7280", marginBottom: 14, display: "block" },
    select: {
      width: "100%", background: "#070d1a",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 8, color: "#e8e0d0",
      fontFamily: "inherit", fontSize: 15,
      padding: "12px 16px", outline: "none",
      cursor: "pointer", appearance: "none",
      WebkitAppearance: "none",
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236b7280' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "right 14px center",
      paddingRight: 36,
    },
    docGrid: { display: "grid", gridTemplateColumns: "1fr", gap: 12 },
    docCard: (sel) => ({
      display: "flex", alignItems: "flex-start", gap: 16,
      padding: "16px 20px",
      background: sel ? "rgba(196,162,68,0.08)" : "rgba(255,255,255,0.02)",
      border: sel ? "1px solid rgba(196,162,68,0.4)" : "1px solid rgba(255,255,255,0.06)",
      borderRadius: 10, cursor: "pointer",
      transition: "all 0.15s",
    }),
    docIcon: { fontSize: 28, flexShrink: 0, marginTop: 2 },
    docLabel: { fontSize: 15, fontWeight: 600, color: "#e8e0d0", marginBottom: 4 },
    docDesc: { fontSize: 13, color: "#6b7280", lineHeight: 1.5 },
    warningBox: {
      background: "rgba(239,68,68,0.06)",
      border: "1px solid rgba(239,68,68,0.2)",
      borderLeft: "3px solid #ef4444",
      borderRadius: 8, padding: "12px 16px",
      marginTop: 12,
      fontSize: 13, color: "#fca5a5", lineHeight: 1.6,
    },
    textarea: {
      width: "100%", minHeight: 200,
      background: "#070d1a",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 8, color: "#e8e0d0",
      fontFamily: "'DM Mono', monospace",
      fontSize: 13, lineHeight: 1.7,
      padding: "14px 16px", resize: "vertical",
      outline: "none", boxSizing: "border-box",
    },
    btn: {
      background: "linear-gradient(135deg, #c4a244, #e8c96a)",
      color: "#070d1a", border: "none", borderRadius: 8,
      padding: "14px 32px", fontFamily: "inherit",
      fontSize: 15, fontWeight: 700, cursor: "pointer",
      letterSpacing: "0.02em",
      boxShadow: "0 4px 20px rgba(196,162,68,0.25)",
      transition: "opacity 0.15s",
    },
    btnGhost: {
      background: "rgba(196,162,68,0.08)",
      color: "#c4a244",
      border: "1px solid rgba(196,162,68,0.25)",
      borderRadius: 8, padding: "12px 24px",
      fontFamily: "inherit", fontSize: 14, fontWeight: 600,
      cursor: "pointer", transition: "all 0.15s",
    },
    resultSection: (color) => ({
      background: "#0d1a2e",
      border: `1px solid ${color}30`,
      borderLeft: `3px solid ${color}`,
      borderRadius: 10, padding: 24, marginBottom: 16,
    }),
    resultHeader: { display: "flex", alignItems: "center", gap: 10, marginBottom: 14 },
    resultIcon: { fontSize: 20 },
    resultLabel: { fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" },
    resultText: { fontSize: 15, color: "#c9c1b0", lineHeight: 1.8, fontWeight: 300, whiteSpace: "pre-wrap" },
    loadingBox: {
      textAlign: "center", padding: "48px 24px",
      background: "#0d1a2e",
      border: "1px solid rgba(196,162,68,0.15)",
      borderRadius: 12, marginBottom: 20,
    },
    spinner: {
      width: 36, height: 36,
      border: "3px solid rgba(196,162,68,0.2)",
      borderTopColor: "#c4a244",
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
      margin: "0 auto 16px",
    },
    privacyNote: {
      background: "rgba(52,211,153,0.05)",
      border: "1px solid rgba(52,211,153,0.15)",
      borderRadius: 8, padding: "12px 16px",
      fontSize: 12, color: "#6b7280", lineHeight: 1.6,
      marginBottom: 20,
    },
    footer: {
      borderTop: "1px solid rgba(255,255,255,0.06)",
      padding: "24px 32px", textAlign: "center",
      fontSize: 12, color: "#4b5563",
    },
  };

  const canTranslate = state && docType && docText.trim().length > 50;

  return (
    <div style={s.root}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        select option { background: #0d1a2e; color: #e8e0d0; }
      `}</style>

      {/* Header */}
      <div style={s.header}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={s.brand}>
            <div style={s.logo}>⚖</div>
            <span style={s.brandName}>ClearCounsel™</span>
          </div>
          <button
            onClick={() => { window.location.hash = "/"; }}
            style={{ background: "none", border: "none", color: "#6b7280", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
          >
            ← All Tools
          </button>
        </div>
        <div style={s.tagline}>Legal Jargon Translator — Understanding the Law Is Your Right</div>
      </div>

      <div style={s.body}>

        {/* Hero */}
        <div style={s.heroBox}>
          <div style={s.heroTitle}>What Does This Legal Document Actually Mean?</div>
          <div style={s.heroDesc}>
            Legal documents are written by lawyers for lawyers — not for you. That's not an accident.
            Paste your document below and we'll translate it into plain English: what it says,
            what it means for your life, what you need to do, and what your rights are.
            <strong style={{ color: "#c4a244", display: "block", marginTop: 10 }}>
              Free. Private. No login required. Your document never leaves your device.
            </strong>
          </div>
        </div>

        {/* Privacy note */}
        <div style={s.privacyNote}>
          🔒 <strong style={{ color: "#34d399" }}>Your privacy is protected.</strong> The text
          you paste is sent only to generate your translation and is never stored, shared, or
          used for any other purpose. No account required.
        </div>

        {!result ? (
          <>
            {/* Step 1 — State */}
            <div style={s.card}>
              <div style={s.stepLabel}>Step 1 of 3</div>
              <label style={s.label}>What state are you in?</label>
              <span style={s.sublabel}>Laws and rights vary by state. We need this to give you accurate information.</span>
              <select
                style={s.select}
                value={state}
                onChange={e => setState(e.target.value)}
              >
                <option value="">Select your state...</option>
                {STATES.map(st => <option key={st} value={st}>{st}</option>)}
              </select>
            </div>

            {/* Step 2 — Document Type */}
            <div style={s.card}>
              <div style={s.stepLabel}>Step 2 of 3</div>
              <label style={s.label}>What type of document is this?</label>
              <span style={s.sublabel}>Not sure? Pick the one that sounds closest — we'll figure it out from the text.</span>
              <div style={s.docGrid}>
                {DOC_TYPES.map(doc => (
                  <div
                    key={doc.id}
                    style={s.docCard(docType === doc.id)}
                    onClick={() => setDocType(doc.id)}
                  >
                    <span style={s.docIcon}>{doc.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={s.docLabel}>{doc.label}</div>
                      <div style={s.docDesc}>{doc.desc}</div>
                      {docType === doc.id && (
                        <div style={s.warningBox}>⚠ {doc.warning}</div>
                      )}
                    </div>
                    <div style={{
                      width: 20, height: 20, borderRadius: "50%", flexShrink: 0, marginTop: 2,
                      border: docType === doc.id ? "none" : "1px solid rgba(255,255,255,0.15)",
                      background: docType === doc.id ? "#c4a244" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, color: "#0a0f1a",
                    }}>
                      {docType === doc.id ? "✓" : ""}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 3 — Document Text */}
            <div style={s.card}>
              <div style={s.stepLabel}>Step 3 of 3</div>
              <label style={s.label}>Paste your document text below</label>
              <span style={s.sublabel}>
                Copy the text from your document and paste it here. The more text you include, the better your translation will be.
                If you have a PDF, try copying the text directly from it.
              </span>
              <textarea
                style={s.textarea}
                placeholder="Paste your legal document text here...&#10;&#10;For example: 'THE STATE OF [STATE] vs. [NAME]. Defendant agrees to enter a plea of...' or 'YOU ARE HEREBY SUMMONED to appear before...' or 'IT IS HEREBY ORDERED that...'"
                value={docText}
                onChange={e => setDocText(e.target.value)}
                onFocus={e => e.target.style.borderColor = "rgba(196,162,68,0.4)"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
              />
              <div style={{ fontSize: 12, color: "#4b5563", marginTop: 8 }}>
                {docText.length} characters {docText.length < 50 && docText.length > 0 ? "— paste more text for a better translation" : ""}
              </div>
            </div>

            {error && (
              <div style={{ ...s.warningBox, marginBottom: 16 }}>
                {error}
              </div>
            )}

            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <button
                style={{
                  ...s.btn,
                  opacity: canTranslate ? 1 : 0.4,
                  cursor: canTranslate ? "pointer" : "not-allowed",
                }}
                onClick={translate}
                disabled={!canTranslate || loading}
              >
                Translate This Document →
              </button>
              {(!state || !docType || docText.length < 50) && (
                <span style={{ fontSize: 13, color: "#4b5563" }}>
                  {!state ? "Select your state first" : !docType ? "Choose a document type" : "Paste more document text"}
                </span>
              )}
            </div>

            <div style={{ marginTop: 24, padding: "16px 20px", background: "rgba(196,162,68,0.04)", borderRadius: 8, fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>
              <strong style={{ color: "#c4a244", display: "block", marginBottom: 4 }}>Important disclaimer</strong>
              This tool provides plain-English explanations to help you understand legal documents.
              It is not legal advice and does not create an attorney-client relationship.
              For serious legal matters — especially criminal charges, custody, or eviction —
              please contact a free legal aid organization in {state || "your state"}.
              Free help is available to everyone regardless of income.
            </div>
          </>
        ) : (
          <>
            {/* Results */}
            <div ref={resultRef}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#c4a244", marginBottom: 4 }}>
                    Translation Complete
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#e8e0d0" }}>
                    {selectedDoc?.label} · {state}
                  </div>
                </div>
                <button style={s.btnGhost} onClick={reset}>
                  Translate Another Document
                </button>
              </div>

              {SECTION_LABELS.map(sec => (
                result[sec.key] && (
                  <div key={sec.key} style={s.resultSection(sec.color)}>
                    <div style={s.resultHeader}>
                      <span style={s.resultIcon}>{sec.icon}</span>
                      <span style={{ ...s.resultLabel, color: sec.color }}>{sec.label}</span>
                    </div>
                    <div style={s.resultText}>{result[sec.key].trim()}</div>
                  </div>
                )
              ))}

              <div style={{
                background: "rgba(167,139,250,0.06)",
                border: "1px solid rgba(167,139,250,0.2)",
                borderRadius: 10, padding: 20, marginTop: 8,
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#a78bfa", marginBottom: 8 }}>
                  🆘 Need Free Legal Help in {state}?
                </div>
                <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.7 }}>
                  You have the right to legal representation. Free legal aid is available in every state regardless of your income.
                  Search <strong style={{ color: "#a78bfa" }}>"{state} legal aid"</strong> or visit{" "}
                  <strong style={{ color: "#a78bfa" }}>lawhelp.org</strong> to find free help near you.
                  For criminal matters, you have the right to a public defender — ask for one.
                </div>
              </div>

              <div style={{ textAlign: "center", marginTop: 32 }}>
                <button style={s.btn} onClick={reset}>
                  Translate Another Document
                </button>
              </div>
            </div>
          </>
        )}

        {loading && (
          <div style={s.loadingBox}>
            <div style={s.spinner} />
            <div style={{ fontSize: 16, fontWeight: 600, color: "#e8e0d0", marginBottom: 8 }}>
              Translating your document...
            </div>
            <div style={{ fontSize: 13, color: "#6b7280" }}>
              Reading your {selectedDoc?.label?.toLowerCase()} and checking {state} law.
              This takes about 15 seconds.
            </div>
          </div>
        )}

      </div>

      <div style={s.footer}>
        <strong style={{ color: "#c4a244" }}>ClearCounsel™</strong> · clearcounsel.app ·
        This tool provides plain-English explanations only and does not constitute legal advice. ·{" "}
        <a href="/privacy" style={{ color: "#4b5563" }}>Privacy</a> ·{" "}
        <a href="/terms" style={{ color: "#4b5563" }}>Terms</a>
      </div>
    </div>
  );
}
