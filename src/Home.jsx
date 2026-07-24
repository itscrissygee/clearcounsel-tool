export default function Home() {
  const navigate = (path) => { window.location.hash = path; };

  const s = {
    root: {
      minHeight: "100vh",
      background: "#070d1a",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      color: "#e8e0d0",
      display: "flex",
      flexDirection: "column",
    },
    header: {
      background: "linear-gradient(135deg, #0d1a2e 0%, #0a1220 100%)",
      borderBottom: "1px solid rgba(196,162,68,0.2)",
      padding: "28px 40px",
      display: "flex",
      alignItems: "center",
      gap: 14,
    },
    logo: {
      width: 42, height: 42,
      background: "linear-gradient(135deg, #c4a244, #e8c96a)",
      borderRadius: 10,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 22,
      boxShadow: "0 0 20px rgba(196,162,68,0.3)",
    },
    brandName: {
      fontSize: 22, fontWeight: 700,
      background: "linear-gradient(135deg, #c4a244, #f0d98a)",
      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
    },
    brandTag: { fontSize: 11, color: "#6b7280", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 2 },
    hero: {
      textAlign: "center",
      padding: "72px 24px 48px",
      position: "relative",
    },
    glow: {
      position: "absolute",
      top: 0, left: "50%",
      transform: "translateX(-50%)",
      width: 600, height: 300,
      background: "radial-gradient(ellipse, rgba(196,162,68,0.08) 0%, transparent 70%)",
      pointerEvents: "none",
    },
    heroTitle: {
      fontFamily: "Georgia, 'Times New Roman', serif",
      fontSize: "clamp(32px, 6vw, 54px)",
      fontWeight: 700, lineHeight: 1.15,
      marginBottom: 16, position: "relative",
    },
    heroGold: {
      background: "linear-gradient(135deg, #c4a244, #f0d98a)",
      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
    },
    heroSub: {
      fontSize: 17, color: "#6b7280",
      maxWidth: 520, margin: "0 auto 56px",
      lineHeight: 1.7, fontWeight: 300,
      position: "relative",
    },
    paths: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 20,
      maxWidth: 840,
      margin: "0 auto",
      padding: "0 24px 80px",
    },
    pathCard: (accent) => ({
      background: "#0d1a2e",
      border: `1px solid ${accent}25`,
      borderRadius: 16,
      padding: "36px 32px",
      cursor: "pointer",
      transition: "all 0.2s",
      textAlign: "left",
      position: "relative",
      overflow: "hidden",
    }),
    pathAccent: (accent) => ({
      position: "absolute",
      top: 0, left: 0, right: 0,
      height: 3,
      background: `linear-gradient(90deg, ${accent}, ${accent}80)`,
    }),
    pathIcon: { fontSize: 40, marginBottom: 20, display: "block" },
    pathWho: (accent) => ({
      fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
      textTransform: "uppercase", color: accent, marginBottom: 8,
    }),
    pathTitle: {
      fontFamily: "Georgia, serif",
      fontSize: 24, fontWeight: 700,
      color: "#e8e0d0", marginBottom: 12, lineHeight: 1.2,
    },
    pathDesc: {
      fontSize: 14, color: "#6b7280",
      lineHeight: 1.65, marginBottom: 24, fontWeight: 300,
    },
    pathFeatures: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 },
    pathFeature: (accent) => ({
      display: "flex", alignItems: "flex-start", gap: 10,
      fontSize: 13, color: "#9ca3af",
    }),
    featureDot: (accent) => ({
      width: 6, height: 6, borderRadius: "50%",
      background: accent, flexShrink: 0, marginTop: 5,
      boxShadow: `0 0 6px ${accent}80`,
    }),
    pathCta: (accent) => ({
      display: "inline-flex", alignItems: "center", gap: 8,
      padding: "11px 22px",
      background: `${accent}15`,
      border: `1px solid ${accent}40`,
      borderRadius: 8,
      color: accent, fontSize: 14, fontWeight: 700,
      letterSpacing: "0.02em",
      transition: "all 0.15s",
    }),
    divider: {
      display: "flex", alignItems: "center",
      gap: 16, padding: "0 24px",
      maxWidth: 840, margin: "0 auto 0",
    },
    dividerLine: { flex: 1, height: 1, background: "rgba(255,255,255,0.06)" },
    dividerText: { fontSize: 12, color: "#374151", letterSpacing: "0.06em", textTransform: "uppercase" },
    footer: {
      borderTop: "1px solid rgba(255,255,255,0.06)",
      padding: "24px 40px",
      display: "flex", alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap", gap: 16,
      marginTop: "auto",
    },
    footerBrand: {
      fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 700,
      background: "linear-gradient(135deg, #c4a244, #f0d98a)",
      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
    },
    footerLinks: { display: "flex", gap: 20, listStyle: "none", padding: 0, margin: 0 },
    footerLink: { fontSize: 12, color: "#4b5563", textDecoration: "none" },
  };

  const handleHover = (e, accent) => {
    e.currentTarget.style.borderColor = `${accent}50`;
    e.currentTarget.style.transform = "translateY(-4px)";
    e.currentTarget.style.boxShadow = `0 12px 40px ${accent}15`;
  };
  const handleLeave = (e, accent) => {
    e.currentTarget.style.borderColor = `${accent}25`;
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.boxShadow = "none";
  };

  return (
    <div style={s.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>

      {/* Header */}
      <div style={s.header}>
        <div style={s.logo}>⚖</div>
        <div>
          <div style={s.brandName}>ClearCounsel™</div>
          <div style={s.brandTag}>Legal Access & Compliance Platform</div>
        </div>
      </div>

      {/* Hero */}
      <div style={s.hero}>
        <div style={s.glow} />
        <h1 style={s.heroTitle}>
          The law should work<br />
          <span style={s.heroGold}>for everyone.</span>
        </h1>
        <p style={s.heroSub}>
          Whether you're a legal professional navigating AI compliance
          or someone representing yourself in court — ClearCounsel™
          gives you the tools to protect yourself and understand your rights.
        </p>
      </div>

      {/* Two Paths */}
      <div style={s.paths}>

        {/* Path 1 — Legal Professionals */}
        <div
          style={s.pathCard("#c4a244")}
          onClick={() => navigate("/professional")}
          onMouseEnter={e => handleHover(e, "#c4a244")}
          onMouseLeave={e => handleLeave(e, "#c4a244")}
        >
          <div style={s.pathAccent("#c4a244")} />
          <span style={s.pathIcon}>⚖️</span>
          <div style={s.pathWho("#c4a244")}>For Legal Professionals</div>
          <div style={s.pathTitle}>AI Compliance Tools</div>
          <div style={s.pathDesc}>
            Protect your clients and your license when using AI in legal practice.
            Built around ABA Model Rules 1.1, 1.6, and 3.3.
          </div>
          <div style={s.pathFeatures}>
            {[
              "Redact client data before pasting into any AI tool",
              "Generate court-ready AI disclosure statements",
              "Satisfy ABA confidentiality and candor requirements",
            ].map(f => (
              <div key={f} style={s.pathFeature("#c4a244")}>
                <span style={s.featureDot("#c4a244")} />
                <span>{f}</span>
              </div>
            ))}
          </div>
          <div style={s.pathCta("#c4a244")}>
            Open Compliance Tools →
          </div>
        </div>

        {/* Path 2 — Pro Se */}
        <div
          style={s.pathCard("#a78bfa")}
          onClick={() => navigate("/prose")}
          onMouseEnter={e => handleHover(e, "#a78bfa")}
          onMouseLeave={e => handleLeave(e, "#a78bfa")}
        >
          <div style={s.pathAccent("#a78bfa")} />
          <span style={s.pathIcon}>🧑‍⚖️</span>
          <div style={s.pathWho("#a78bfa")}>For People Representing Themselves</div>
          <div style={s.pathTitle}>Legal Jargon Translator</div>
          <div style={s.pathDesc}>
            Got a legal document you don't understand? We'll explain exactly what it says,
            what it means for your life, and what your rights are — in plain English.
          </div>
          <div style={s.pathFeatures}>
            {[
              "Understand plea agreements, court orders & summons",
              "Know your rights in your specific state",
              "Get clear action steps with deadlines",
            ].map(f => (
              <div key={f} style={s.pathFeature("#a78bfa")}>
                <span style={s.featureDot("#a78bfa")} />
                <span>{f}</span>
              </div>
            ))}
          </div>
          <div style={s.pathCta("#a78bfa")}>
            Translate My Document →
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={s.footer}>
        <div style={s.footerBrand}>⚖ ClearCounsel™</div>
        <ul style={s.footerLinks}>
          {[
            ["Home", "https://clearcounsel.app"],
            ["How It Works", "https://clearcounsel.app/how-it-works"],
            ["FAQ", "https://clearcounsel.app/faq"],
            ["Privacy", "https://clearcounsel.app/privacy"],
            ["Terms", "https://clearcounsel.app/terms"],
          ].map(([label, href]) => (
            <li key={label}><a href={href} style={s.footerLink}>{label}</a></li>
          ))}
        </ul>
        <div style={{ fontSize: 12, color: "#374151" }}>© 2026 ClearCounsel™</div>
      </div>
    </div>
  );
}
