# ⚖ ClearCounsel — Tool

**The AI compliance tool for legal professionals.**

> *Redact before you paste. Disclose after you file.*

Live at **[tool.clearcounsel.app](https://tool.clearcounsel.app)** *(coming soon)*  
Landing page at **[clearcounsel.app](https://clearcounsel.app)**

---

## What This Repo Is

This is the application repository for ClearCounsel — the two-tab compliance tool built for paralegals, attorneys, and legal ops professionals navigating AI use in legal practice.

For the marketing and landing page, see [clearcounsel-app](https://github.com/itscrissygee/clearcounsel-app).

---

## The Tool

### 🛡 Tab 1 — Redact Before You Paste
Detects and removes sensitive client information from any document before it enters an AI tool. Protects attorney-client privilege and satisfies **ABA Model Rule 1.6 (Confidentiality)**.

Detects and redacts:
- Social Security Numbers
- Email addresses & phone numbers
- Specific dates & street addresses
- Court case numbers
- Financial account data

### 📋 Tab 2 — Disclose After You File
Generates court-appropriate AI disclosure language for any filing in seconds. Select your court, jurisdiction, filing type, and AI tools used — output is ready to paste directly into your brief or motion. Satisfies **ABA Model Rule 3.3 (Candor to Tribunal)**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React + Vite |
| AI Engine | Anthropic Claude API (server-side via Vercel function) |
| API Proxy | Vercel Serverless Function (`/api/disclose`) |
| Deployment | Vercel |
| Domain | `clearcounsel.app` |

---

## Project Structure

```
clearcounsel-tool/
├── index.html              # Vite HTML entry point
├── package.json            # Dependencies
├── vite.config.js          # Vite configuration
├── .gitignore
├── api/
│   └── disclose.js         # Vercel serverless function (API proxy)
└── src/
    ├── main.jsx            # React entry point
    └── ClearCounsel.jsx    # Main application component
```

---

## Roadmap

- [x] PII detection & redaction (v1)
- [x] AI-powered disclosure generator (v1)
- [x] Vercel serverless API proxy
- [ ] PDF export with firm header
- [ ] Disclosure history & audit log
- [ ] Team / firm seat licensing
- [ ] Jurisdiction-specific standing order database
- [ ] Bar association partnership integrations

---

## Legal Disclaimer

ClearCounsel is a productivity and compliance aid. It does not constitute legal advice. The PII detection tool uses pattern-matching heuristics and may not detect every instance of sensitive information — always conduct a manual review before sharing documents with any third-party AI system. Generated disclosure language should be reviewed by the supervising attorney before inclusion in any court filing.

---

## Contact

**Email:** hello@clearcounsel.app  
Built for legal ops. Legal tech. Legal compliance.  
**Portfolio:** [itscrissygee.github.io](https://itscrissygee.github.io)

---

*© 2026 ClearCounsel · clearcounsel.app*
