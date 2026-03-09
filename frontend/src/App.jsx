import React, { useState, useEffect, useRef } from "react";

// ── Demo data ──────────────────────────────────────────────────────────────────
const DEMO_CASES = [
  {
    case_id: "demo-001",
    case_title: "Kesavananda Bharati v. State of Kerala",
    court: "Supreme Court of India",
    year: "1973",
    judge: "CJ S.M. Sikri (13-judge bench)",
    case_category: "Constitutional",
    case_number: "Writ Petition (Civil) 135/1970",
    issue:
      "Whether Parliament has unlimited power to amend the Constitution under Article 368, or whether there are implied limitations that prevent amendment of the 'basic structure' of the Constitution.",
    petitioner_arguments: [
      "Fundamental rights under Part III are inviolable and cannot be amended by Parliament.",
      "Article 368 does not grant unlimited amending power — only procedural amendments.",
      "The right to property under Article 31 cannot be extinguished through amendment.",
      "Democratic republic character forms the basic structure and is unamendable.",
    ],
    respondent_arguments: [
      "Article 368 grants Parliament unlimited constituent power to amend any provision.",
      "The 24th, 25th and 29th Amendments are valid exercises of parliamentary power.",
      "Golak Nath was incorrectly decided and should be overruled.",
      "Parliament represents sovereign will and cannot be restricted in amending power.",
    ],
    law_sections: [
      "Article 13 Constitution of India",
      "Article 31 Constitution of India",
      "Article 368 Constitution of India",
      "Article 19(1)(f) Constitution of India",
      "24th Constitutional Amendment Act 1971",
    ],
    precedents: [
      { case_name: "I.C. Golak Nath v. State of Punjab", citation: "AIR 1967 SC 1643", relevance: "Parliament cannot amend fundamental rights" },
      { case_name: "Shankari Prasad v. Union of India", citation: "AIR 1951 SC 458", relevance: "Parliament can amend any part of Constitution" },
    ],
    court_reasoning:
      "The Supreme Court by a 7-6 majority held that while Parliament has wide powers to amend the Constitution, it cannot destroy its 'basic structure'. The majority identified core features including: supremacy of the Constitution, republican and democratic government, secular character, separation of powers, and federal character. Constituent power under Article 368 is limited by the constitutional framework itself.",
    final_judgment:
      "The Court upheld the 24th Amendment but struck down part of the 25th Amendment. The landmark Basic Structure Doctrine was established — Parliament can amend the Constitution but cannot destroy its essential features.",
    summary:
      "Kesavananda Bharati (1973) established the Basic Structure Doctrine, the most important constitutional principle in Indian law. Parliament may amend but cannot alter the fundamental identity of the Constitution.",
  },
  {
    case_id: "demo-002",
    case_title: "Maneka Gandhi v. Union of India",
    court: "Supreme Court of India",
    year: "1978",
    judge: "Justice P.N. Bhagwati",
    case_category: "Constitutional / Fundamental Rights",
    case_number: "Writ Petition 231/1977",
    issue:
      "Whether impounding of a passport without giving reasons violates Article 21, and whether 'procedure established by law' must be just, fair and reasonable.",
    petitioner_arguments: [
      "Impounding the passport without reasons violates natural justice.",
      "Article 21's procedure must be just, fair and reasonable — not arbitrary.",
      "Right to travel abroad is part of personal liberty under Article 21.",
      "Passport Act lacks adequate procedural safeguards.",
    ],
    respondent_arguments: [
      "Government has statutory power to impound passports under Passport Act 1967.",
      "Article 21 only requires procedure be 'established by law', not that it be reasonable.",
      "State security justifies impounding without reasons.",
      "A.K. Gopalan supports reading Articles 19, 21 and 22 independently.",
    ],
    law_sections: [
      "Article 21 Constitution of India",
      "Article 19(1)(a) Constitution of India",
      "Article 14 Constitution of India",
      "Passport Act 1967 Section 10(3)(c)",
    ],
    precedents: [
      { case_name: "A.K. Gopalan v. State of Madras", citation: "AIR 1950 SC 27", relevance: "Narrow interpretation of Article 21 — overruled" },
      { case_name: "R.C. Cooper v. Union of India", citation: "AIR 1970 SC 564", relevance: "Fundamental rights must be read together" },
    ],
    court_reasoning:
      "The Court held that A.K. Gopalan was wrongly decided and fundamental rights must be read as a connected whole. Article 21's 'procedure established by law' must not be arbitrary — importing a due process standard. The Court expanded Article 21 to encompass right to dignity, livelihood, health, and numerous unenumerated rights.",
    final_judgment:
      "Impounding of passport without reasons held violative of Articles 14 and 21. Government directed to furnish reasons. Article 21 dramatically expanded — any law affecting personal liberty must be just, fair and reasonable.",
    summary:
      "Maneka Gandhi (1978) transformed Indian constitutional law by expanding Article 21 beyond its literal text. Personal liberty now includes travel abroad, and any curtailing procedure must be just, fair and reasonable.",
  },
  {
    case_id: "demo-003",
    case_title: "State of Maharashtra v. Ramesh Sharma",
    court: "Bombay High Court",
    year: "2021",
    judge: "Justice Priya Kulkarni",
    case_category: "Criminal",
    case_number: "Criminal Appeal 445/2020",
    issue:
      "Whether the accused is guilty under IPC Section 420 for fraudulently inducing 47 victims to invest Rs 2.3 crore in a Ponzi scheme promising 24% returns.",
    petitioner_arguments: [
      "Accused made fraudulent representations knowing them to be false.",
      "Collected Rs 2.3 crore from 47 victims with no legitimate business infrastructure.",
      "WhatsApp messages prove deliberate deception.",
      "Accused has prior criminal antecedents for similar offences.",
    ],
    respondent_arguments: [
      "Accused genuinely believed in the scheme — no dishonest intention.",
      "Business failure does not amount to criminal cheating under IPC 420.",
      "Prosecution witnesses are interested and unreliable.",
      "Mens rea not established beyond reasonable doubt.",
    ],
    law_sections: ["IPC Section 420", "IPC Section 415", "IPC Section 34", "Evidence Act Section 65B", "Prevention of Money Laundering Act"],
    precedents: [
      { case_name: "Hridaya Ranjan Pd. Verma v. State of Bihar", citation: "AIR 2000 SC 2341", relevance: "Civil breach vs criminal cheating distinction" },
      { case_name: "Vesa Holdings v. State of Kerala", citation: "(2015) 8 SCC 293", relevance: "Dishonest intention at inception required" },
    ],
    court_reasoning:
      "Accused had dishonest intention from the very beginning as evidenced by complete absence of legitimate investment infrastructure. WhatsApp messages clearly showed the accused knew the scheme was fraudulent. Distinguished business failure from deliberate cheating — this case fell squarely in the latter.",
    final_judgment:
      "Appeal dismissed. Conviction under IPC 420 upheld. 3 years rigorous imprisonment with fine of Rs 50 lakhs confirmed. Accused directed to repay victims from fine amount.",
    summary:
      "State v. Sharma (2021) — Classic Ponzi scheme case under IPC 420. Bombay HC upheld conviction, finding fraudulent intent existed from inception. Key precedent on mens rea in cheating cases and use of electronic evidence.",
  },
];

const AGENTS = [
  { id: "doc",        name: "Document Ingestion",   icon: "DOC",  desc: "Extracting text from PDF",          color: "#c084fc" },
  { id: "issue",      name: "Issue Identification",  icon: "ISS",  desc: "Detecting core legal question",     color: "#818cf8" },
  { id: "petitioner", name: "Petitioner Agent",      icon: "PET",  desc: "Extracting petitioner arguments",   color: "#60a5fa" },
  { id: "respondent", name: "Respondent Agent",      icon: "RES",  desc: "Extracting respondent arguments",   color: "#34d399" },
  { id: "law",        name: "Law Section Agent",     icon: "LAW",  desc: "Identifying statutes & sections",   color: "#fbbf24" },
  { id: "precedent",  name: "Precedent Analysis",    icon: "PRE",  desc: "Detecting cited past judgments",    color: "#f97316" },
  { id: "reasoning",  name: "Court Reasoning",       icon: "REA",  desc: "Summarizing judge's reasoning",     color: "#f43f5e" },
  { id: "judgment",   name: "Final Judgment",        icon: "JUD",  desc: "Extracting final verdict",          color: "#e879f9" },
  { id: "metadata",   name: "Metadata Agent",        icon: "META", desc: "Generating case metadata",          color: "#a3e635" },
  { id: "master",     name: "Master Agent",          icon: "MERGE", desc: "Merging all outputs to JSON",      color: "#fb923c" },
];

// ── Utilities ──────────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const THEMES = {
  dark: {
    pageBg: "radial-gradient(ellipse at 20% 10%, #0f172a 0%, #060d1a 60%)",
    panel: "#0a1628",
    panelSoft: "#0f172a",
    panelBorder: "#1e293b",
    text: "#e2e8f0",
    textMuted: "#94a3b8",
    textFaint: "#64748b",
    title: "#f1f0e8",
    primary: "#d97706",
    primarySoft: "#f59e0b",
    accent: "#818cf8",
    navBg: "#060d1a",
  },
  light: {
    pageBg: "radial-gradient(ellipse at 20% 10%, #f8fafc 0%, #eef2ff 70%)",
    panel: "#ffffff",
    panelSoft: "#f8fafc",
    panelBorder: "#dbe4ef",
    text: "#0f172a",
    textMuted: "#334155",
    textFaint: "#64748b",
    title: "#111827",
    primary: "#b45309",
    primarySoft: "#d97706",
    accent: "#4f46e5",
    navBg: "#ffffffee",
  },
};

async function apiRequest(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, options);
  if (!res.ok) {
    let detail = `${res.status} ${res.statusText}`;
    try {
      const payload = await res.json();
      detail = payload?.detail || detail;
    } catch {
      // Keep default error detail
    }
    throw new Error(detail);
  }
  return res.json();
}

function normalizeCase(row) {
  const structured = typeof row?.structured_data === "string"
    ? (() => {
        try { return JSON.parse(row.structured_data); } catch { return {}; }
      })()
    : (row?.structured_data || {});

  const normalizedStructured =
    Object.keys(structured || {}).length > 0 ? structured : (row || {});

  return {
    case_id: row?.case_id || row?.id || structured?.case_id || "",
    case_title: row?.case_title || structured?.case_title || "Untitled Case",
    court: row?.court || structured?.court || "Unknown Court",
    year: String(row?.year || structured?.year || ""),
    judge: row?.judge || structured?.judge || "",
    case_category: row?.case_category || structured?.case_category || "Uncategorized",
    case_number: row?.case_number || structured?.case_number || "",
    issue: row?.issue || structured?.issue || "",
    petitioner_arguments: Array.isArray(structured?.petitioner_arguments)
      ? structured.petitioner_arguments
      : (Array.isArray(row?.petitioner_arguments) ? row.petitioner_arguments : []),
    respondent_arguments: Array.isArray(structured?.respondent_arguments)
      ? structured.respondent_arguments
      : (Array.isArray(row?.respondent_arguments) ? row.respondent_arguments : []),
    law_sections: Array.isArray(structured?.law_sections)
      ? structured.law_sections
      : (Array.isArray(row?.law_sections) ? row.law_sections : []),
    precedents: Array.isArray(structured?.precedents)
      ? structured.precedents
      : (Array.isArray(row?.precedents) ? row.precedents : []),
    court_reasoning: row?.court_reasoning || structured?.court_reasoning || "",
    final_judgment: row?.final_judgment || structured?.final_judgment || "",
    summary: row?.summary || structured?.summary || "",
    source_validation: row?.source_validation || structured?.source_validation || null,
    structured_data: normalizedStructured,
  };
}

function Badge({ children, color = "#818cf8", theme = THEMES.dark }) {
  return (
    <span
      style={{
        background: `${color}22`,
        color,
        border: `1px solid ${color}44`,
        padding: "2px 10px",
        borderRadius: 99,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.04em",
        whiteSpace: "nowrap",
        boxShadow: theme === THEMES.light ? "0 1px 0 #e2e8f0" : "none",
      }}
    >
      {children}
    </span>
  );
}

// ── Screens ────────────────────────────────────────────────────────────────────

function UploadScreen({ onUpload, uploading, theme }) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const fileRef = useRef();

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const handleDemo = () => onUpload(null, "demo");

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "60px 24px" }}>
      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <div style={{ fontSize: 36, marginBottom: 12, color: theme.primarySoft, lineHeight: 1, fontFamily: "'Segoe UI Emoji', 'Apple Color Emoji', sans-serif" }}>
          {"\u2696\uFE0F"}
        </div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 38, fontWeight: 700, color: theme.title, margin: 0, lineHeight: 1.2 }}>
          Upload a Judgment
        </h1>
        <p style={{ color: theme.textMuted, marginTop: 12, fontSize: 15 }}>
          Upload a judgment to get a clear case brief, key arguments, cited laws, and final decision.
        </p>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current.click()}
        style={{
          border: `2px dashed ${dragging ? theme.primarySoft : theme.panelBorder}`,
          borderRadius: 16,
          padding: "52px 32px",
          textAlign: "center",
          cursor: "pointer",
          background: dragging ? `${theme.primarySoft}12` : theme.panelSoft,
          transition: "all 0.2s",
          marginBottom: 20,
        }}
      >
        <input ref={fileRef} type="file" accept=".pdf,.txt" style={{ display: "none" }}
          onChange={(e) => setFile(e.target.files[0])} />
        <div style={{ fontSize: 36, marginBottom: 12 }}>
          {file ? "Ready" : "Select File"}
        </div>
        <div style={{ color: theme.text, fontWeight: 600, fontSize: 16 }}>
          {file ? file.name : "Drop PDF or TXT here"}
        </div>
        <div style={{ color: theme.textFaint, fontSize: 13, marginTop: 6 }}>
          {file ? `${(file.size / 1024).toFixed(1)} KB` : "or click to browse"}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 12 }}>
        <button
          onClick={() => file && onUpload(file)}
          disabled={!file || uploading}
          style={{
            flex: 1, padding: "14px 0",
            background: file && !uploading ? `linear-gradient(135deg, ${theme.primarySoft}, ${theme.primary})` : theme.panelBorder,
            color: file && !uploading ? "#fff" : theme.textFaint,
            border: "none", borderRadius: 10, fontWeight: 700, fontSize: 15,
            cursor: file && !uploading ? "pointer" : "not-allowed", transition: "all 0.2s",
            fontFamily: "'Sora', sans-serif",
          }}
        >
          {uploading ? "Uploading..." : "Analyze Judgment"}
        </button>
        <button
          onClick={handleDemo}
          style={{
            flex: 1, padding: "14px 0",
            background: theme.panelSoft,
            color: theme.primarySoft,
            border: `1px solid ${theme.primarySoft}44`, borderRadius: 10, fontWeight: 700, fontSize: 15,
            cursor: "pointer", fontFamily: "'Sora', sans-serif",
          }}
        >
          Load Demo Cases
        </button>
      </div>

      {/* Feature pills */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 36 }}>
        {["Detailed Case Brief", "Key Legal Sections", "Past Cases Cited", "Fast Case Lookup", "Question-Based Search", "Courtwise Insights"].map((f) => (
          <Badge key={f} color="#f59e0b">{f}</Badge>
        ))}
      </div>
    </div>
  );
}

function ProcessingScreen({ jobStatus, theme }) {
  const completedCount = Math.min(
    AGENTS.length,
    (jobStatus?.agents_completed || []).length
  );
  const current = Math.min(completedCount, AGENTS.length - 1);
  const completed = AGENTS.slice(0, completedCount).map((a) => a.id);

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: theme.title, margin: 0 }}>
          Analysis in Progress
        </h2>
        <p style={{ color: theme.textMuted, marginTop: 8, fontSize: 14 }}>
          {completedCount} of {AGENTS.length} steps completed
        </p>
        <p style={{ color: theme.textFaint, marginTop: 4, fontSize: 12 }}>
          {jobStatus?.status ? `Status: ${jobStatus.status}` : "Status: processing"}
        </p>
        {/* Progress bar */}
        <div style={{ height: 4, background: theme.panelBorder, borderRadius: 99, marginTop: 20, overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: `${(completedCount / AGENTS.length) * 100}%`,
            background: "linear-gradient(90deg, #d97706, #f59e0b)",
            borderRadius: 99, transition: "width 0.4s ease",
          }} />
        </div>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {AGENTS.map((agent, idx) => {
          const done = completed.includes(agent.id);
          const active = idx === current && !done;
          return (
            <div
              key={agent.id}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "14px 18px",
                background: done ? `${agent.color}11` : active ? "#1e293b" : "#0a1628",
                border: `1px solid ${done ? agent.color + "44" : active ? "#334155" : "#1e293b"}`,
                borderRadius: 12,
                transition: "all 0.3s",
                opacity: idx > current + 1 && !done ? 0.4 : 1,
              }}
            >
              <span style={{ fontSize: 20 }}>{agent.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ color: done ? agent.color : active ? "#e2e8f0" : "#64748b", fontWeight: 600, fontSize: 13 }}>
                  {agent.name}
                </div>
                <div style={{ color: "#475569", fontSize: 11, marginTop: 2 }}>{agent.desc}</div>
              </div>
              <div>
                {done ? (
                  <span style={{ color: agent.color, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em" }}>DONE</span>
                ) : active ? (
                  <span style={{ display: "inline-block", width: 16, height: 16,
                    border: "2px solid #f59e0b", borderTopColor: "transparent",
                    borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                ) : (
                  <span style={{ color: "#334155", fontSize: 13 }}>—</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ResultCard({ label, children, accent = "#f59e0b", theme }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ background: theme.panel, border: `1px solid ${theme.panelBorder}`, borderRadius: 14, overflow: "hidden", marginBottom: 16 }}>
      <div
        onClick={() => setOpen(!open)}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "14px 20px", cursor: "pointer",
          borderLeft: `3px solid ${accent}`,
        }}
      >
        <span style={{ color: accent, fontWeight: 700, fontSize: 13, letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</span>
        <span style={{ color: "#475569", fontSize: 14 }}>{open ? "▲" : "▼"}</span>
      </div>
      {open && <div style={{ padding: "0 20px 18px" }}>{children}</div>}
    </div>
  );
}

function ResultsScreen({ caseData, onBack, theme }) {
  const [tab, setTab] = useState("structured");
  const tabs = ["structured", "evidence", "json", "timeline"];
  const validation =
    caseData?.source_validation ||
    caseData?.structured_data?.source_validation ||
    null;
  const jsonViewData = { ...caseData };
  delete jsonViewData.source_validation;
  if (jsonViewData.structured_data && typeof jsonViewData.structured_data === "object") {
    jsonViewData.structured_data = { ...jsonViewData.structured_data };
    delete jsonViewData.structured_data.source_validation;
  }

  const ACCENTS = {
    issue: "#818cf8",
    petitioner: "#60a5fa",
    respondent: "#34d399",
    law: "#fbbf24",
    precedents: "#f97316",
    reasoning: "#e879f9",
    judgment: "#f43f5e",
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 32 }}>
        <button onClick={onBack} style={{ background: theme.panelBorder, border: "none", color: theme.textMuted,
          padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>← Back</button>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
            <Badge color="#f59e0b">{caseData.case_category}</Badge>
            <Badge color="#818cf8">{caseData.court}</Badge>
            <Badge color="#34d399">{caseData.year}</Badge>
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: theme.title,
            margin: 0, lineHeight: 1.3 }}>{caseData.case_title}</h1>
          <p style={{ color: theme.textFaint, fontSize: 13, marginTop: 6 }}>
            {caseData.judge} · {caseData.case_number}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, background: theme.panelSoft,
        padding: 4, borderRadius: 10, width: "fit-content" }}>
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "8px 20px", borderRadius: 8,
            background: tab === t ? "#1e293b" : "transparent",
            color: tab === t ? "#f59e0b" : "#64748b",
            border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13,
            textTransform: "capitalize", fontFamily: "'Sora', sans-serif",
          }}>{t === "json" ? "Full Data" : t.charAt(0).toUpperCase() + t.slice(1)}</button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === "structured" && (
        <div>
          {/* Summary */}
          <div style={{ background: "linear-gradient(135deg, #0f172a, #1e1040)", border: "1px solid #312e81",
            borderRadius: 14, padding: "20px 24px", marginBottom: 20 }}>
            <div style={{ color: "#818cf8", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em",
              textTransform: "uppercase", marginBottom: 8 }}>Case Summary</div>
            <p style={{ color: "#c7d2fe", fontSize: 14, lineHeight: 1.7, margin: 0 }}>{caseData.summary}</p>
          </div>

          <ResultCard theme={theme} label="Core Legal Issue" accent={ACCENTS.issue}>
            <p style={{ color: "#c7d2fe", fontSize: 14, lineHeight: 1.7, margin: 0 }}>{caseData.issue}</p>
          </ResultCard>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <ResultCard theme={theme} label="Petitioner Arguments" accent={ACCENTS.petitioner}>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {caseData.petitioner_arguments.map((a, i) => (
                  <li key={i} style={{ color: theme.textMuted, fontSize: 13, lineHeight: 1.6, marginBottom: 6 }}>{a}</li>
                ))}
              </ul>
            </ResultCard>
            <ResultCard theme={theme} label="Respondent Arguments" accent={ACCENTS.respondent}>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {caseData.respondent_arguments.map((a, i) => (
                  <li key={i} style={{ color: theme.textMuted, fontSize: 13, lineHeight: 1.6, marginBottom: 6 }}>{a}</li>
                ))}
              </ul>
            </ResultCard>
          </div>

          <ResultCard theme={theme} label="Law Sections Applied" accent={ACCENTS.law}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {caseData.law_sections.map((s, i) => <Badge key={i} color="#fbbf24">{s}</Badge>)}
            </div>
          </ResultCard>

          <ResultCard theme={theme} label="Precedents Cited" accent={ACCENTS.precedents}>
            {caseData.precedents.map((p, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start",
                padding: "10px 0", borderBottom: i < caseData.precedents.length - 1 ? "1px solid #1e293b" : "none" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#f97316",
                  marginTop: 6, flexShrink: 0 }} />
                <div>
                  <div style={{ color: "#fb923c", fontWeight: 600, fontSize: 13 }}>{p.case_name}</div>
                  <div style={{ color: theme.textFaint, fontSize: 11, marginTop: 2 }}>{p.citation}</div>
                  <div style={{ color: theme.textMuted, fontSize: 12, marginTop: 4 }}>{p.relevance}</div>
                </div>
              </div>
            ))}
          </ResultCard>

          <ResultCard theme={theme} label="Court Reasoning" accent={ACCENTS.reasoning}>
            <p style={{ color: theme.textMuted, fontSize: 14, lineHeight: 1.8, margin: 0 }}>{caseData.court_reasoning}</p>
          </ResultCard>

          <ResultCard theme={theme} label="Final Judgment" accent={ACCENTS.judgment}>
            <div style={{ background: "#1a0a0a", border: "1px solid #7f1d1d", borderRadius: 8, padding: "14px 16px" }}>
              <p style={{ color: "#fca5a5", fontSize: 14, lineHeight: 1.7, margin: 0, fontWeight: 500 }}>
                {caseData.final_judgment}
              </p>
            </div>
          </ResultCard>
        </div>
      )}

      {tab === "evidence" && (
        <div style={{ display: "grid", gap: 14 }}>
          <div style={{
            background: theme.panel,
            border: `1px solid ${theme.panelBorder}`,
            borderRadius: 14,
            padding: "16px 18px",
          }}>
            <div style={{ fontSize: 12, color: theme.textFaint, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Evidence & Confidence
            </div>
            {!validation ? (
              <p style={{ color: theme.textMuted, marginTop: 10, marginBottom: 0 }}>
                No validation details available for this case.
              </p>
            ) : (
              <>
                <div style={{ marginTop: 10, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <Badge color="#16a34a" theme={theme}>
                    Overall Coverage: {validation?.overall_coverage_percent ?? 0}%
                  </Badge>
                  <span style={{ color: theme.textFaint, fontSize: 12 }}>
                    Method: {validation?.method || "n/a"}
                  </span>
                </div>

                <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
                  {Object.entries(validation?.field_coverage || {}).map(([field, stats]) => (
                    <div key={field} style={{
                      border: `1px solid ${theme.panelBorder}`,
                      borderRadius: 10,
                      padding: "10px 12px",
                      background: theme.panelSoft,
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                        <div style={{ color: theme.title, fontWeight: 600, fontSize: 13 }}>
                          {field.replaceAll("_", " ")}
                        </div>
                        <div style={{ color: theme.textFaint, fontSize: 12 }}>
                          {stats?.matched ?? 0}/{stats?.total ?? 0} matched ({stats?.percent ?? 0}%)
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {validation?.evidence && (
            <div style={{
              background: theme.panel,
              border: `1px solid ${theme.panelBorder}`,
              borderRadius: 14,
              padding: "16px 18px",
            }}>
              <div style={{ fontSize: 12, color: theme.textFaint, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                Source Snippets
              </div>
              {Object.entries(validation.evidence).map(([field, value]) => {
                const snippets = Array.isArray(value)
                  ? value
                  : [];
                const firstSnippet = snippets.find((x) => typeof x?.text === "string");
                const mappedSnippet = snippets.find((x) => Array.isArray(x?.evidence) && x.evidence[0]?.text);
                const displayText = firstSnippet?.text || mappedSnippet?.evidence?.[0]?.text || "";
                return (
                  <div key={field} style={{ marginBottom: 12 }}>
                    <div style={{ color: theme.title, fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                      {field.replaceAll("_", " ")}
                    </div>
                    <div style={{ color: theme.textMuted, fontSize: 13, lineHeight: 1.6 }}>
                      {displayText || "No snippet available."}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === "json" && (
        <div style={{ background: "#020817", border: `1px solid ${theme.panelBorder}`, borderRadius: 14, overflow: "auto" }}>
          <div style={{ padding: "12px 20px", borderBottom: `1px solid ${theme.panelBorder}`,
            display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#475569", fontSize: 12, fontFamily: "monospace" }}>structured_output.json</span>
            <button onClick={() => navigator.clipboard?.writeText(JSON.stringify(jsonViewData, null, 2))}
              style={{ background: theme.panelBorder, border: "none", color: "#f59e0b", padding: "4px 12px",
                borderRadius: 6, cursor: "pointer", fontSize: 12, fontFamily: "'Sora', sans-serif" }}>
              Copy
            </button>
          </div>
          <pre style={{ margin: 0, padding: "20px", color: "#a5f3fc", fontSize: 12,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace", lineHeight: 1.6,
            overflowX: "auto" }}>
            {JSON.stringify(jsonViewData, null, 2)}
          </pre>
        </div>
      )}

      {tab === "timeline" && (
        <div>
          <div style={{ position: "relative", paddingLeft: 32 }}>
            <div style={{ position: "absolute", left: 10, top: 0, bottom: 0,
              width: 2, background: "linear-gradient(#818cf8, #f43f5e)" }} />
            {[
              { label: "Case Filed", content: caseData.case_number, color: "#818cf8" },
              { label: "Issue Identified", content: caseData.issue.slice(0, 120) + "...", color: "#60a5fa" },
              { label: "Arguments Heard", content: `Petitioner: ${caseData.petitioner_arguments.length} arguments | Respondent: ${caseData.respondent_arguments.length} arguments`, color: "#34d399" },
              { label: "Precedents Considered", content: `${caseData.precedents.length} cases cited — ${caseData.precedents.map(p => p.case_name).join(", ")}`, color: "#fbbf24" },
              { label: "Court Reasoning", content: caseData.court_reasoning.slice(0, 150) + "...", color: "#e879f9" },
              { label: "Final Verdict", content: caseData.final_judgment, color: "#f43f5e" },
            ].map((item, i) => (
              <div key={i} style={{ position: "relative", marginBottom: 28 }}>
                <div style={{ position: "absolute", left: -26, top: 6, width: 12, height: 12,
                  borderRadius: "50%", background: item.color, boxShadow: `0 0 8px ${item.color}` }} />
                <div style={{ color: item.color, fontSize: 12, fontWeight: 700,
                  letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>{item.label}</div>
                <div style={{ color: theme.textMuted, fontSize: 13, lineHeight: 1.6 }}>{item.content}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CaseListScreen({ cases, onSelect, onUpload, onSearch, onAskNL, busy, apiError, theme }) {
  const [search, setSearch] = useState("");
  const [nlQuery, setNlQuery] = useState("");
  const [filter, setFilter] = useState("All");

  const categories = ["All", "Constitutional", "Criminal", "Civil"];
  const cardHoverBg = theme === THEMES.light ? "#f1f5f9" : "#0d1f3c";
  const cardHoverBorder = theme === THEMES.light ? "#cbd5e1" : "#f59e0b44";

  const filtered = cases.filter((c) => {
    const s = search.toLowerCase();
    const matchesSearch = !s ||
      c.case_title.toLowerCase().includes(s) ||
      c.issue.toLowerCase().includes(s) ||
      c.law_sections.some((l) => l.toLowerCase().includes(s)) ||
      c.court.toLowerCase().includes(s);
    const matchesCat = filter === "All" || c.case_category.includes(filter);
    return matchesSearch && matchesCat;
  });

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: theme.title, margin: 0 }}>
            Case Intelligence Library
          </h2>
          <p style={{ color: theme.textFaint, fontSize: 13, marginTop: 4 }}>{cases.length} cases processed</p>
        </div>
        <button onClick={onUpload} style={{ background: "linear-gradient(135deg, #d97706, #b45309)",
          border: "none", color: "#fff", padding: "10px 20px", borderRadius: 10, cursor: "pointer",
          fontWeight: 700, fontSize: 14, fontFamily: "'Sora', sans-serif" }}>
          + Upload Judgment
        </button>
      </div>

      {/* Ask in plain language */}
      <div style={{ background: "linear-gradient(135deg, #0f172a, #1e1040)", border: "1px solid #312e81",
        borderRadius: 14, padding: "18px 20px", marginBottom: 24 }}>
        <div style={{ color: "#818cf8", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
          textTransform: "uppercase", marginBottom: 10 }}>Ask in Plain Language</div>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            value={nlQuery}
            onChange={(e) => setNlQuery(e.target.value)}
            placeholder='Example: "Show cheating cases under IPC 420" or "Constitutional cases in 1978"'
            onKeyDown={(e) => e.key === "Enter" && onAskNL(nlQuery)}
            style={{ flex: 1, background: theme.panel, border: "1px solid #312e81",
              color: "#c7d2fe", padding: "10px 14px", borderRadius: 8, fontSize: 13,
              outline: "none", fontFamily: "'Sora', sans-serif" }}
          />
          <button onClick={() => onAskNL(nlQuery)} style={{ background: "#4c1d95",
            border: "none", color: "#c4b5fd", padding: "10px 18px", borderRadius: 8,
            cursor: "pointer", fontWeight: 600, fontSize: 13, fontFamily: "'Sora', sans-serif" }}>
            Search
          </button>
        </div>
        {apiError && (
          <div style={{ color: "#fca5a5", fontSize: 12, marginTop: 10 }}>{apiError}</div>
        )}
      </div>

      {/* Search + Filter */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch(search)}
          placeholder="Search by case, issue, section, court..."
          style={{ flex: 1, background: theme.panel, border: `1px solid ${theme.panelBorder}`,
            color: "#e2e8f0", padding: "10px 16px", borderRadius: 10, fontSize: 14,
            outline: "none", fontFamily: "'Sora', sans-serif" }}
        />
        <button onClick={() => onSearch(search)} style={{
          padding: "10px 16px", borderRadius: 10, border: `1px solid ${theme.panelBorder}`,
          background: theme.panel, color: "#f59e0b", cursor: "pointer",
          fontWeight: 600, fontSize: 13, fontFamily: "'Sora', sans-serif",
        }}>Search</button>
        {categories.map((cat) => (
          <button key={cat} onClick={() => setFilter(cat)} style={{
            padding: "10px 16px", borderRadius: 10, border: "1px solid",
            borderColor: filter === cat ? "#f59e0b" : "#1e293b",
            background: filter === cat ? "#f59e0b22" : "#0a1628",
            color: filter === cat ? "#f59e0b" : "#64748b",
            cursor: "pointer", fontWeight: 600, fontSize: 13, fontFamily: "'Sora', sans-serif",
          }}>{cat}</button>
        ))}
      </div>

      {/* Case Grid */}
      <div style={{ display: "grid", gap: 14 }}>
        {busy && (
          <div style={{ color: theme.textMuted, fontSize: 13 }}>Loading from backend...</div>
        )}
        {filtered.map((c) => (
          <div key={c.case_id} onClick={() => onSelect(c)}
            style={{ background: theme.panel, border: `1px solid ${theme.panelBorder}`,
              borderRadius: 14, padding: "20px 24px", cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = cardHoverBorder;
              e.currentTarget.style.background = cardHoverBg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = theme.panelBorder;
              e.currentTarget.style.background = theme.panel;
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                  <Badge color="#f59e0b">{c.case_category}</Badge>
                  <Badge color="#818cf8">{c.court}</Badge>
                  <Badge color="#34d399">{c.year}</Badge>
                </div>
                <h3 style={{ color: theme.title, fontFamily: "'Playfair Display', serif",
                  fontSize: 17, fontWeight: 700, margin: "0 0 8px" }}>{c.case_title}</h3>
                <p style={{ color: theme.textFaint, fontSize: 13, lineHeight: 1.5, margin: "0 0 12px" }}>
                  {c.issue.slice(0, 180)}...
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {c.law_sections.slice(0, 4).map((s, i) => (
                    <Badge key={i} color="#475569">{s}</Badge>
                  ))}
                  {c.law_sections.length > 4 && (
                    <Badge color="#334155">+{c.law_sections.length - 4} more</Badge>
                  )}
                </div>
              </div>
              <span style={{ color: "#f59e0b", fontSize: 16, marginLeft: 16, marginTop: 6 }}>View</span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", color: "#475569", padding: 60 }}>
            <div style={{ fontSize: 13, marginBottom: 12, color: theme.textFaint, textTransform: "uppercase", letterSpacing: "0.08em" }}>No matches</div>
            No cases match your query.
          </div>
        )}
      </div>
    </div>
  );
}

function DashboardScreen({ cases, analytics, theme }) {
  // Aggregate analytics
  const sectionCounts = {};
  const courtCounts = {};
  const yearCounts = {};
  const catCounts = {};

  cases.forEach((c) => {
    c.law_sections.forEach((s) => { sectionCounts[s] = (sectionCounts[s] || 0) + 1; });
    courtCounts[c.court] = (courtCounts[c.court] || 0) + 1;
    yearCounts[c.year] = (yearCounts[c.year] || 0) + 1;
    const cat = c.case_category.split("/")[0].trim();
    catCounts[cat] = (catCounts[cat] || 0) + 1;
  });

  const topSections = analytics?.law_sections?.length
    ? analytics.law_sections.slice(0, 8).map((item) => [item.section, item.count])
    : Object.entries(sectionCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const catData = Object.entries(catCounts);
  const COLORS = ["#f59e0b", "#818cf8", "#34d399", "#f43f5e", "#60a5fa", "#e879f9"];

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px" }}>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: theme.title, margin: 0 }}>
          Analytics Dashboard
        </h2>
        <p style={{ color: theme.textFaint, fontSize: 13, marginTop: 4 }}>
          Patterns across {cases.length} processed judgments
        </p>
      </div>

      {/* KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
        {[
          { label: "Total Cases", value: analytics?.total_cases ?? cases.length, icon: "CASES", color: "#f59e0b" },
          { label: "Law Sections", value: topSections.length || Object.keys(sectionCounts).length, icon: "LAW", color: "#818cf8" },
          { label: "Courts", value: analytics?.courts?.length ?? Object.keys(courtCounts).length, icon: "COURTS", color: "#34d399" },
          { label: "Analysis Steps", value: 10, icon: "STEPS", color: "#f97316" },
        ].map((k) => (
          <div key={k.label} style={{ background: theme.panel, border: `1px solid ${k.color}33`,
            borderRadius: 14, padding: "20px 18px", textAlign: "center" }}>
            <div style={{ fontSize: 28 }}>{k.icon}</div>
            <div style={{ color: k.color, fontSize: 28, fontWeight: 800, fontFamily: "'Playfair Display', serif", marginTop: 8 }}>
              {k.value}
            </div>
            <div style={{ color: theme.textFaint, fontSize: 12, marginTop: 4 }}>{k.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Top Law Sections */}
        <div style={{ background: theme.panel, border: `1px solid ${theme.panelBorder}`, borderRadius: 14, padding: "20px 24px" }}>
          <h3 style={{ color: "#fbbf24", fontSize: 14, fontWeight: 700, margin: "0 0 16px",
            letterSpacing: "0.08em", textTransform: "uppercase" }}>Frequently Cited Sections</h3>
          {topSections.map(([section, count], i) => (
            <div key={section} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ color: "#475569", fontSize: 11, width: 14, textAlign: "right" }}>{i + 1}</div>
              <div style={{ flex: 1, fontSize: 12, color: theme.textMuted, overflow: "hidden",
                textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{section}</div>
              <div style={{ width: `${topSections[0]?.[1] ? (count / topSections[0][1]) * 80 : 0}px`, height: 6,
                background: `linear-gradient(90deg, #fbbf24, #f97316)`, borderRadius: 99,
                flexShrink: 0 }} />
              <div style={{ color: "#fbbf24", fontSize: 12, fontWeight: 700, width: 20 }}>{count}</div>
            </div>
          ))}
        </div>

        {/* Category breakdown */}
        <div style={{ background: theme.panel, border: `1px solid ${theme.panelBorder}`, borderRadius: 14, padding: "20px 24px" }}>
          <h3 style={{ color: "#818cf8", fontSize: 14, fontWeight: 700, margin: "0 0 16px",
            letterSpacing: "0.08em", textTransform: "uppercase" }}>Case Categories</h3>
          {catData.map(([cat, count], i) => (
            <div key={cat} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ color: COLORS[i % COLORS.length], fontSize: 13, fontWeight: 600 }}>{cat}</span>
                <span style={{ color: theme.textFaint, fontSize: 12 }}>{count} case{count > 1 ? "s" : ""}</span>
              </div>
              <div style={{ height: 6, background: theme.panelBorder, borderRadius: 99, overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${(count / cases.length) * 100}%`,
                  background: COLORS[i % COLORS.length],
                  borderRadius: 99,
                }} />
              </div>
            </div>
          ))}

          {/* Analysis workflow visual */}
          <h3 style={{ color: "#f97316", fontSize: 14, fontWeight: 700, margin: "20px 0 12px",
            letterSpacing: "0.08em", textTransform: "uppercase" }}>Analysis Workflow</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {AGENTS.map((a) => (
              <div key={a.id} style={{ background: `${a.color}22`, border: `1px solid ${a.color}44`,
                borderRadius: 6, padding: "3px 8px", fontSize: 10, color: a.color, fontWeight: 600 }}>
                {a.icon}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Navigation ─────────────────────────────────────────────────────────────────

function Navbar({ activeNav, setNav, caseCount, theme, mode, onToggleMode }) {
  return (
    <nav style={{
      borderBottom: `1px solid ${theme.panelBorder}`,
      background: theme.navBg,
      backdropFilter: "blur(8px)",
      padding: "0 32px",
      display: "flex",
      alignItems: "center",
      gap: 0,
      height: 58,
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginRight: 40 }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: theme.primarySoft, lineHeight: 1, fontFamily: "'Segoe UI Emoji', 'Apple Color Emoji', sans-serif" }}>
          {"\u2696\uFE0F"}
        </span>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700,
          color: theme.primarySoft, letterSpacing: "-0.02em" }}>NyayaAI</span>
        <span style={{ color: theme.panelBorder, fontSize: 20, marginLeft: 2 }}>|</span>
        <span style={{ color: theme.textFaint, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Case Research Assistant
        </span>
      </div>

      {[
        { id: "upload", label: "Upload" },
        { id: "cases",  label: `Cases (${caseCount})` },
        { id: "dashboard", label: "Analytics" },
      ].map((item) => (
        <button key={item.id} onClick={() => setNav(item.id)} style={{
          background: "none", border: "none",
          color: activeNav === item.id ? theme.primarySoft : theme.textFaint,
          padding: "0 16px", height: "100%",
          borderBottom: activeNav === item.id ? `2px solid ${theme.primarySoft}` : "2px solid transparent",
          cursor: "pointer", fontWeight: 600, fontSize: 13,
          fontFamily: "'Sora', sans-serif", letterSpacing: "0.02em",
          transition: "color 0.2s",
        }}>{item.label}</button>
      ))}

      {/* Right side badge */}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
        <button
          onClick={onToggleMode}
          style={{
            border: `1px solid ${theme.panelBorder}`,
            background: theme.panel,
            color: theme.textMuted,
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 600,
            padding: "7px 10px",
            cursor: "pointer",
            fontFamily: "'Sora', sans-serif",
          }}
        >
          {mode === "dark" ? "Light Mode" : "Dark Mode"}
        </button>
        <Badge color="#16a34a" theme={theme}>10-Step Analysis</Badge>
      </div>
    </nav>
  );
}

// ── Root App ───────────────────────────────────────────────────────────────────

export default function App() {
  const [mode, setMode] = useState(() => localStorage.getItem("nyaya_theme_mode") || "dark");
  const [nav, setNav] = useState("upload");
  const [screen, setScreen] = useState("upload"); // upload | processing | result | cases | dashboard
  const [cases, setCases] = useState([]);
  const [activeCase, setActiveCase] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const [apiError, setApiError] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const theme = THEMES[mode] || THEMES.dark;

  // Load fonts
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Sora:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
    void loadCases();
    void loadAnalytics();
  }, []);

  useEffect(() => {
    localStorage.setItem("nyaya_theme_mode", mode);
  }, [mode]);

  const loadCases = async () => {
    try {
      const payload = await apiRequest("/cases");
      const normalized = (payload?.cases || []).map(normalizeCase);
      setCases(normalized);
    } catch {
      // Keep UI usable even when backend is down.
    }
  };

  const loadAnalytics = async () => {
    try {
      const payload = await apiRequest("/analytics");
      setAnalytics(payload);
    } catch {
      // Keep dashboard on local aggregate fallback.
    }
  };

  const pollJob = async (jobId) => {
    while (true) {
      const status = await apiRequest(`/status/${jobId}`);
      setJobStatus(status);
      if (status.status === "completed") {
        const completedCase = normalizeCase(status.result || {});
        if (status.case_id) completedCase.case_id = status.case_id;
        setActiveCase(completedCase);
        setScreen("result");
        setNav("cases");
        await loadCases();
        await loadAnalytics();
        setBusy(false);
        return;
      }
      if (status.status === "failed") {
        throw new Error(status.error || "Processing failed");
      }
      await sleep(1200);
    }
  };

  const handleUpload = async (file, mode) => {
    setApiError("");
    if (mode === "demo") {
      setCases(DEMO_CASES);
      setNav("cases");
      setScreen("cases");
      setAnalytics(null);
    } else {
      if (!file) return;
      setBusy(true);
      setScreen("processing");
      const form = new FormData();
      form.append("file", file);
      try {
        const upload = await apiRequest("/upload", { method: "POST", body: form });
        await pollJob(upload.job_id);
      } catch (err) {
        setBusy(false);
        setApiError(err?.message || "Upload failed");
        setScreen("upload");
      }
    }
  };

  const handleSelectCase = async (c) => {
    setApiError("");
    if (!c?.case_id) {
      setActiveCase(c);
      setScreen("result");
      return;
    }
    try {
      const details = await apiRequest(`/cases/${c.case_id}`);
      setActiveCase(normalizeCase(details));
    } catch {
      setActiveCase(c);
    }
    setScreen("result");
  };

  const handleSearch = async (text) => {
    const query = (text || "").trim();
    if (!query) {
      await loadCases();
      return;
    }
    setBusy(true);
    setApiError("");
    try {
      const payload = await apiRequest("/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const searchResults = (payload?.results || []).map(normalizeCase);
      setCases(searchResults);
    } catch (err) {
      setApiError(err?.message || "Search failed");
    } finally {
      setBusy(false);
    }
  };

  const handleAskNL = async (question) => {
    const q = (question || "").trim();
    if (!q) return;
    setBusy(true);
    setApiError("");
    try {
      const payload = await apiRequest("/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const queryResults = (payload?.results || []).map(normalizeCase);
      setCases(queryResults);
    } catch (err) {
      setApiError(err?.message || "Natural language query failed");
    } finally {
      setBusy(false);
    }
  };

  const handleNavChange = (id) => {
    setNav(id);
    if (id === "upload") setScreen("upload");
    else if (id === "cases") {
      setScreen("cases");
      void loadCases();
    } else if (id === "dashboard") {
      setScreen("dashboard");
      void loadAnalytics();
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: theme.pageBg,
      color: theme.text,
      fontFamily: "'Sora', sans-serif",
    }}>
      <Navbar
        activeNav={nav}
        setNav={handleNavChange}
        caseCount={cases.length}
        theme={theme}
        mode={mode}
        onToggleMode={() => setMode((prev) => (prev === "dark" ? "light" : "dark"))}
      />
      {apiError && (
        <div style={{
          margin: "12px 24px",
          padding: "10px 14px",
          borderRadius: 10,
          border: "1px solid #ef444455",
          background: mode === "dark" ? "#1f1111" : "#fff1f2",
          color: "#fca5a5",
          fontSize: 13,
        }}>
          {apiError}
        </div>
      )}

      {screen === "upload" && (
        <UploadScreen onUpload={handleUpload} uploading={busy} theme={theme} />
      )}
      {screen === "processing" && (
        <ProcessingScreen jobStatus={jobStatus} theme={theme} />
      )}
      {screen === "result" && activeCase && (
        <ResultsScreen
          caseData={activeCase}
          onBack={() => { setScreen("cases"); setNav("cases"); }}
          theme={theme}
        />
      )}
      {screen === "cases" && (
        <CaseListScreen
          cases={cases}
          onSelect={handleSelectCase}
          onUpload={() => { setNav("upload"); setScreen("upload"); }}
          onSearch={handleSearch}
          onAskNL={handleAskNL}
          busy={busy}
          apiError={apiError}
          theme={theme}
        />
      )}
      {screen === "dashboard" && (
        <DashboardScreen
          cases={cases.length > 0 ? cases : DEMO_CASES}
          analytics={analytics}
          theme={theme}
        />
      )}
    </div>
  );
}




