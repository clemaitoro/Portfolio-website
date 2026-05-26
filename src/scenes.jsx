/* ============================================================
   scenes.jsx — Hero + project scenes & interactive demos.
   • Hero: real 3D wireframe shapes.
   • BCI: real 3D head + orbiting orbs (the only 3D scene).
   • All other projects: 2D INTERACTIVE demos, no 3D shapes.
   ============================================================ */
import React from "react";
import { Stage3D, Float3D, DotCloud, WireSphere, Cube, Octahedron } from "./shapes3d.jsx";

export function useSceneProgress(ref) {
  const [p, setP] = React.useState(0);
  React.useEffect(() => {
    const el = ref.current; if (!el) return;
    let raf = 0;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      const total = rect.height + vh;
      const passed = vh - rect.top;
      setP(Math.min(1, Math.max(0, passed / total)));
    };
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, [ref]);
  return p;
}

/* ---------- HERO 3D scene ------------------------------------------- */
export function HeroScene() {
  return (
    <Stage3D perspective={1600} parallaxStrength={18} spinRate={0.12}>
      {({ t }) => (
        <>
          <Float3D x={0} y={0} z={-340} t={t} ry={0.3} rx={0.08}>
            <DotCloud count={140} radius={460} color="#7C8492" size={2.4} />
          </Float3D>
          <Float3D x={0} y={0} z={-160} t={t} ry={0.4} rx={0.12}>
            <WireSphere size={360} color="#6DF3D7" thickness={1} rings={7} opacity={0.55} />
          </Float3D>
          <Float3D x={280} y={-160} z={140} t={t} ry={0.5} rx={0.35}>
            <Cube size={130} color="#6DF3D7" thickness={1.2} />
          </Float3D>
          <Float3D x={-300} y={150} z={90} t={t} ry={-0.45} rx={0.18}>
            <Octahedron size={170} color="#F4B842" thickness={1.2} />
          </Float3D>
          <Float3D x={-200} y={-200} z={-30} t={t} ry={0.8} rx={-0.4}>
            <Cube size={70} color="#7C8492" thickness={1} />
          </Float3D>
          <Float3D x={340} y={120} z={250} t={t} ry={1.0} rx={0.5}>
            <Octahedron size={80} color="#ECEEF1" thickness={1} />
          </Float3D>
        </>
      )}
    </Stage3D>
  );
}

/* ---------- BCI 3D scene -------------------------------------------- */
/* A "neural" brain made of two counter-rotating wireframe spheres, with
   four cardinal gesture orbs connected by hairline rays that light up
   when the matching demo button is pressed. */
export function SceneBCI({ activeGesture = null }) {
  const gestures = [
    // y < 0 = top; we use cardinal positions in screen space
    { id: "blink", label: "blink",  color: "#6DF3D7", dx:    0, dy: -220 }, // top
    { id: "tap",   label: "tap",    color: "#6DF3D7", dx:  280, dy:    0 }, // right
    { id: "fist",  label: "clench", color: "#F4B842", dx:    0, dy:  220 }, // bottom
    { id: "brow",  label: "brow",   color: "#F4B842", dx: -280, dy:    0 }, // left
  ];

  return (
    <Stage3D perspective={1500} parallaxStrength={12} spinRate={0.08}>
      {({ t }) => (
        <>
          {/* faint dot cloud back */}
          <Float3D x={0} y={0} z={-380} t={t} ry={0.2}>
            <DotCloud count={80} radius={420} color="#7C8492" size={2} />
          </Float3D>

          {/* connection rays — pure SVG plane behind orbs */}
          <Float3D x={0} y={0} z={-40}>
            <ConnectionRays gestures={gestures} active={activeGesture} />
          </Float3D>

          {/* outer brain sphere */}
          <Float3D x={0} y={0} z={-60} t={t} ry={0.45} rx={0.18}>
            <WireSphere size={300} color="#6DF3D7" thickness={1} rings={8} opacity={0.55} />
          </Float3D>

          {/* inner counter-rotating sphere */}
          <Float3D x={0} y={0} z={-40} t={-t * 1.6} ry={0.55} rx={-0.22}>
            <WireSphere size={180} color="#ECEEF1" thickness={1} rings={6} opacity={0.45} />
          </Float3D>

          {/* core pulse dot (always pulses gently) */}
          <Float3D x={0} y={0} z={0}>
            <div style={{
              width: 14, height: 14, borderRadius: "50%",
              background: "#6DF3D7",
              boxShadow: "0 0 24px #6DF3D7, 0 0 48px rgba(109,243,215,0.6)",
              animation: "bciCorePulse 2.6s cubic-bezier(0.2,0.7,0.2,1) infinite",
            }}/>
          </Float3D>

          {/* gesture orbs at cardinal positions */}
          {gestures.map((g) => {
            const active = activeGesture === g.id;
            const fwd = active ? 160 : 60;
            return (
              <Float3D key={g.id} x={g.dx} y={g.dy} z={fwd} scale={active ? 1.4 : 1}>
                <GestureOrb label={g.label} color={g.color} active={active} />
              </Float3D>
            );
          })}
        </>
      )}
    </Stage3D>
  );
}

/* SVG plane spanning the scene with rays from center → each orb position.
   Lights up the active ray with the orb's color. */
function ConnectionRays({ gestures, active }) {
  // viewBox spans roughly the orb radius × 2
  const W = 800, H = 600, cx = W / 2, cy = H / 2;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} fill="none" style={{
      position: "absolute", left: "50%", top: "50%",
      transform: "translate(-50%, -50%)",
      overflow: "visible",
    }}>
      {gestures.map(g => {
        const isActive = active === g.id;
        // orb positions in svg coords (translate by dx, dy from center)
        const ox = cx + g.dx;
        const oy = cy + g.dy;
        return (
          <g key={g.id}>
            <line x1={cx} y1={cy} x2={ox} y2={oy}
              stroke={isActive ? g.color : "#1F2530"}
              strokeWidth={isActive ? 1.6 : 1}
              strokeDasharray={isActive ? "0" : "4 4"}
              opacity={isActive ? 1 : 0.6}
              style={{ transition: "all 220ms cubic-bezier(0.2,0.7,0.2,1)" }}
            />
            {isActive && (
              <circle cx={ox} cy={oy} r="6" fill={g.color}>
                <animate attributeName="r" values="6;14;6" dur="0.6s" repeatCount="1" />
                <animate attributeName="opacity" values="1;0;1" dur="0.6s" repeatCount="1" />
              </circle>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function GestureOrb({ label, color, active = false }) {
  return (
    <div style={{
      width: 84, height: 84, borderRadius: "50%",
      border: `1.5px solid ${color}`,
      background: active ? color : "transparent",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "var(--ff-mono)", fontSize: 11, letterSpacing: "0.12em",
      textTransform: "uppercase", color: active ? "#0B0D10" : color,
      boxShadow: active ? `0 0 36px ${color}` : `0 0 12px ${color}40`,
      transition: "all 220ms cubic-bezier(0.2,0.7,0.2,1)",
    }}>{label}</div>
  );
}

/* =================================================================
   INTERACTIVE 2D DEMOS
   ================================================================= */

/* ---------- Satakuntaliitto RAG ------------------------------------- */
export function RAGDemo() {
  const questions = [
    { q: "Mitä Yyterin merialuekaava sanoo tuulivoimasta?",
      en: "What does the Yyteri marine plan say about wind power?",
      docs: ["Merialuekaava 2030", "Lausunto 14 / 2022", "Yleiskaava — Yyteri"],
      a: "The marine zone plan from 2030 designates the Yyteri offshore strip as restricted for new wind installations. A 2022 statement reaffirms protection of the dune ecosystem.",
      cites: [0, 1] },
    { q: "Onko alueella aiempia lausuntoja kaivostoiminnasta?",
      en: "Are there earlier statements about mining in this region?",
      docs: ["Lausunto 03 / 2024", "Maakuntakaava — kaivostoiminta", "Yleiskaava 2018"],
      a: "Yes. A 2024 statement responded to a permit request near Säkylä and recommended additional environmental review before approval.",
      cites: [0, 1] },
    { q: "Mitkä alueet on merkitty virkistyskäyttöön?",
      en: "Which areas are marked for recreational use?",
      docs: ["Maakuntakaava — virkistys", "Asemakaava — Selkämeri", "Lausunto 22 / 2023"],
      a: "Most of the western archipelago and the northern dune belt are zoned for recreational use under the regional plan.",
      cites: [0, 1, 2] },
  ];
  const [selected, setSelected] = React.useState(null);
  const [stage, setStage] = React.useState("idle");
  const ask = (i) => { setSelected(i); setStage("retrieving"); setTimeout(() => setStage("answering"), 900); };
  const reset = () => { setSelected(null); setStage("idle"); };
  const q = selected !== null ? questions[selected] : null;
  return (
    <div className="rag">
      <div className="rag__col">
        <div className="rag__lbl">Pick a question</div>
        <div className="rag__qs">
          {questions.map((qq, i) => (
            <button key={i} className={"rag__q" + (selected === i ? " is-active" : "")} onClick={() => ask(i)}>
              <div className="rag__q-fi">{qq.q}</div>
              <div className="rag__q-en">{qq.en}</div>
            </button>
          ))}
          {selected !== null && <button className="rag__reset" onClick={reset}>← Try another</button>}
        </div>
      </div>
      <div className="rag__col">
        <div className="rag__lbl">Retrieved documents</div>
        <div className="rag__docs">
          {q ? q.docs.map((d, i) => {
            const isCited = q.cites.includes(i);
            const isVisible = stage !== "idle";
            return (
              <div key={i} className={"rag__doc" + (isVisible ? " is-in" : "") + (isCited && stage === "answering" ? " is-cited" : "")} style={{ transitionDelay: `${i * 120}ms` }}>
                <div className="rag__doc-tag">{String(i + 1).padStart(2, "0")} · PDF</div>
                <div className="rag__doc-name">{d}</div>
                <div className="rag__doc-lines">{[0,1,2,3].map(j => <div key={j} style={{ width: `${50 + (j * 11) % 40}%` }}/>)}</div>
                {isCited && stage === "answering" && <div className="rag__doc-cite">cited</div>}
              </div>
            );
          }) : <div className="rag__empty">← choose a question to see retrieval</div>}
        </div>
      </div>
      <div className="rag__col">
        <div className="rag__lbl">Answer</div>
        <div className="rag__answer">
          {q && stage === "answering" ? (<>
            <p>{q.a}</p>
            <div className="rag__sources">
              <span className="rag__lbl-inline">Sources</span>
              {q.cites.map(c => <span key={c} className="rag__source-chip">{String(c + 1).padStart(2, "0")} {q.docs[c]}</span>)}
            </div>
          </>) : q && stage === "retrieving" ? (
            <div className="rag__searching">
              <span className="rag__searching-dot" /><span className="rag__searching-dot" /><span className="rag__searching-dot" />
              <span style={{ marginLeft: 14 }}>reading documents…</span>
            </div>
          ) : <div className="rag__empty">waiting for question</div>}
        </div>
      </div>
    </div>
  );
}

/* ---------- LSEG Corporate Tree ------------------------------------- */
export function LSEGDemo() {
  const root = { id: "R", label: "Parent Co.", x: 50, y: 8 };
  const l1 = [
    { id: "EU",   parent: "R", label: "EU Sub",   x: 18, y: 38 },
    { id: "US",   parent: "R", label: "US Sub",   x: 50, y: 38 },
    { id: "APAC", parent: "R", label: "APAC Sub", x: 82, y: 38 },
  ];
  const l2 = [
    { id: "DE", parent: "EU",   label: "Acme GmbH", x:  6, y: 78 },
    { id: "UK", parent: "EU",   label: "Acme UK",   x: 24, y: 78 },
    { id: "NY", parent: "US",   label: "Acme NY",   x: 42, y: 78 },
    { id: "LA", parent: "US",   label: "Acme LA",   x: 58, y: 78 },
    { id: "JP", parent: "APAC", label: "Acme JP",   x: 76, y: 78 },
    { id: "SG", parent: "APAC", label: "Acme SG",   x: 94, y: 78 },
  ];
  const allNodes = [root, ...l1, ...l2];
  const findNode = (id) => allNodes.find(n => n.id === id);
  const changes = {
    US:   { state: "merger",   note: "Merged with Globex Industries (Reuters, Mar 2024).",   url: "reuters.com / globex-acme" },
    LA:   { state: "merger",   note: "Operations consolidated into NY parent entity.",        url: "sec.gov / 8-K filing" },
    APAC: { state: "rename",   note: "Renamed to APAC Holdings Ltd.",                          url: "registry.sg / 2023-11" },
    DE:   { state: "bankrupt", note: "Filed for insolvency (Bundesanzeiger, Q3 2023).",        url: "handelsregister.de" },
  };
  const stateColor = { merger: "var(--pulse)", rename: "var(--ember)", bankrupt: "var(--flare)", ok: "var(--ash)" };
  const stateLabel = { merger: "MERGER", rename: "RENAMED", bankrupt: "DISSOLVED", ok: "UNCHANGED" };
  const [verified, setVerified] = React.useState(false);
  const [selected, setSelected] = React.useState(null);
  const verify = () => { setVerified(false); setSelected(null); setTimeout(() => setVerified(true), 200); };
  const reset = () => { setVerified(false); setSelected(null); };
  const stateFor = (id) => verified && changes[id] ? changes[id].state : "ok";
  const lines = [...l1, ...l2].map(n => { const p = findNode(n.parent); return { x1: p.x, y1: p.y, x2: n.x, y2: n.y, id: n.id }; });
  const sel = selected ? { node: findNode(selected), change: changes[selected] } : null;
  return (
    <div className="lseg">
      <div className="lseg__controls">
        <div className="lseg__lbl">Input</div>
        <div className="lseg__filename">acme_corp_tree.json</div>
        <div className="lseg__meta">{allNodes.length} entities · 2 levels deep</div>
        <div className="lseg__actions">
          {!verified
            ? <button className="btn btn--primary" onClick={verify}>Run validation →</button>
            : <button className="btn" onClick={reset}>← Reset</button>}
        </div>
        {verified && (
          <div className="lseg__legend">
            <div className="lseg__lbl">Flagged</div>
            <div className="lseg__legend-row"><span className="lseg__sw" style={{ background: "var(--pulse)" }}/> Merger / Acquired</div>
            <div className="lseg__legend-row"><span className="lseg__sw" style={{ background: "var(--ember)" }}/> Renamed</div>
            <div className="lseg__legend-row"><span className="lseg__sw" style={{ background: "var(--flare)" }}/> Dissolved</div>
          </div>
        )}
      </div>
      <div className="lseg__tree">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
          {lines.map((l, i) => {
            const flagged = verified && changes[l.id];
            return (
              <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
                stroke={flagged ? stateColor[changes[l.id].state] : "#1F2530"}
                strokeWidth={flagged ? 0.18 : 0.12}
                opacity={flagged ? 0.9 : 1}
                style={{ transition: "stroke 600ms cubic-bezier(0.2,0.7,0.2,1)" }} />
            );
          })}
        </svg>
        {allNodes.map(n => {
          const s = stateFor(n.id);
          const isFlagged = s !== "ok";
          return (
            <div key={n.id}
              className={"lseg__node lseg__node--" + s + (selected === n.id ? " is-selected" : "")}
              style={{ left: `${n.x}%`, top: `${n.y}%` }}
              onClick={() => isFlagged && setSelected(n.id)}>
              <span className="lseg__node-name">{n.label}</span>
              {isFlagged && <span className="lseg__node-flag">{stateLabel[s]}</span>}
            </div>
          );
        })}
      </div>
      <div className="lseg__detail">
        <div className="lseg__lbl">Detail</div>
        {sel ? (<>
          <div className="lseg__detail-name">{sel.node.label}</div>
          <div className="lseg__detail-state" style={{ color: stateColor[sel.change.state] }}>{stateLabel[sel.change.state]}</div>
          <p className="lseg__detail-note">{sel.change.note}</p>
          <div className="lseg__detail-src">↳ {sel.change.url}</div>
        </>) : verified ? <div className="lseg__empty">click a flagged node →</div> : <div className="lseg__empty">run validation to see findings</div>}
      </div>
    </div>
  );
}

/* ---------- Deutsche Telekom — data ingestion + context-aware RAG --- */
export function TelekomDemo() {
  const queries = [
    { q: "How do I reset my router after a firmware update?",
      a: "After a firmware update, hold the reset button for 10 seconds, then re-pair from the Speedport app. Your saved Wi-Fi names will reappear within 90 seconds.",
      sources: ["KB-2941 · Speedport firmware notes", "Ticket #88432 — resolved", "Speedport manual, p. 38"] },
    { q: "Why is my fiber connection slower at 8pm?",
      a: "Evening congestion in your CO. The peak-hour throttling band is documented in your service tier. Switching to wired routing or restarting the ONT typically restores full bandwidth.",
      sources: ["Service tier matrix", "Network ops daily report", "Ticket #92107 — partial"] },
    { q: "Can I bring my own modem to a business plan?",
      a: "Yes for plans above 250 Mbps. The modem must support DOCSIS 3.1 and be approved on the compatibility list. We register the MAC against your account.",
      sources: ["Approved modem list 2026-Q1", "B2B onboarding policy", "KB-1873"] },
  ];
  const [step, setStep] = React.useState("idle");
  const [query, setQuery] = React.useState(0);

  const run = (i) => {
    setQuery(i);
    setStep("ingest");
    setTimeout(() => setStep("retrieve"), 700);
    setTimeout(() => setStep("answer"), 1800);
  };
  const reset = () => setStep("idle");

  const active = step !== "idle";
  const q = queries[query];

  return (
    <div className="telekom">
      <div className="telekom__lbl">Pipeline · Dagster orchestration</div>
      <div className="telekom__pipe">
        {/* the four stages, lit up by `step` */}
        {[
          { id: "ingest",   name: "Ingest",         sub: "raw → chunks" },
          { id: "index",    name: "Index",          sub: "Elasticsearch · MongoDB" },
          { id: "retrieve", name: "Retrieve",       sub: "context-aware RAG" },
          { id: "answer",   name: "Answer",         sub: "OpenAI GPT" },
        ].map((s, i) => {
          let stageState = "dim";
          if (active) {
            if (step === "ingest" && i === 0) stageState = "live";
            else if (step === "ingest" && i > 0) stageState = "dim";
            else if (step === "retrieve" && i <= 2) stageState = i === 2 ? "live" : "done";
            else if (step === "answer") stageState = i === 3 ? "live" : "done";
          }
          return (
            <div key={i} className={"telekom__node telekom__node--" + stageState}>
              <div className="telekom__node-num">{String(i + 1).padStart(2, "0")}</div>
              <div className="telekom__node-name">{s.name}</div>
              <div className="telekom__node-sub">{s.sub}</div>
            </div>
          );
        })}
      </div>
      <div className="telekom__metric">99.9% uptime · 35% faster query resolution</div>

      <div className="telekom__lbl" style={{ marginTop: 30 }}>Ask the assistant</div>
      <div className="telekom__chat">
        <div className="telekom__qs">
          {queries.map((qq, i) => (
            <button key={i} className={"telekom__q" + (query === i && active ? " is-on" : "")} onClick={() => run(i)}>
              <span>›</span> {qq.q}
            </button>
          ))}
          {active && <button className="telekom__reset" onClick={reset}>← Reset pipeline</button>}
        </div>

        <div className="telekom__answer">
          {step === "answer" ? (<>
            <div className="telekom__answer-body">{q.a}</div>
            <div className="telekom__answer-srcs">
              {q.sources.map((s, i) => <div key={i} className="telekom__src">{s}</div>)}
            </div>
          </>) : step === "retrieve" ? (
            <div className="telekom__working">retrieving from vectorised Elasticsearch…</div>
          ) : step === "ingest" ? (
            <div className="telekom__working">chunking & embedding query…</div>
          ) : (
            <div className="telekom__working" style={{ color: "var(--ash-dim)" }}>pick a question →</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- CloudGeometry — multi-model low-code agent platform ----- */
export function CloudGeometryDemo() {
  const models = [
    { id: "gpt",     name: "GPT-4o",    color: "#6DF3D7" },
    { id: "claude",  name: "Claude 4.5",color: "#F4B842" },
    { id: "gemini",  name: "Gemini 2.5",color: "#ECEEF1" },
  ];
  const [picked, setPicked] = React.useState("gpt");
  const [running, setRunning] = React.useState(false);
  const [step, setStep] = React.useState(0);

  const blocks = [
    { name: "Retrieve",   role: "AuroraDB vector lookup" },
    { name: "Validate",   role: "External API check" },
    { name: "Score",      role: "Confidence scoring" },
    { name: "Compose",    role: picked === "claude" ? "Claude 4.5 reasoning" : picked === "gemini" ? "Gemini 2.5 reasoning" : "GPT-4o reasoning" },
  ];

  const run = () => {
    setRunning(true);
    setStep(0);
    blocks.forEach((_, i) => setTimeout(() => setStep(i + 1), (i + 1) * 600));
    setTimeout(() => { setRunning(false); }, blocks.length * 600 + 300);
  };

  return (
    <div className="cgeo">
      <div className="cgeo__lbl">Pick a model</div>
      <div className="cgeo__models">
        {models.map(m => (
          <button key={m.id} className={"cgeo__model" + (picked === m.id ? " is-on" : "")}
            style={{ "--c": m.color }}
            onClick={() => setPicked(m.id)}>
            <span className="cgeo__model-dot" style={{ background: m.color }} />
            {m.name}
          </button>
        ))}
      </div>

      <div className="cgeo__lbl" style={{ marginTop: 26 }}>Agent flow · Langflow-style</div>
      <div className="cgeo__flow">
        {blocks.map((b, i) => (
          <React.Fragment key={i}>
            <div className={"cgeo__block" + (running && step > i ? " is-done" : running && step === i ? " is-live" : "")}>
              <div className="cgeo__block-name">{b.name}</div>
              <div className="cgeo__block-role">{b.role}</div>
            </div>
            {i < blocks.length - 1 && <div className={"cgeo__edge" + (running && step > i ? " is-done" : "")} />}
          </React.Fragment>
        ))}
      </div>

      <div className="cgeo__actions">
        <button className="btn btn--primary" onClick={run} disabled={running}>
          {running ? "Running…" : "Run agent →"}
        </button>
        <div className="cgeo__metric">60% less manual evaluation · 10+ agents shipped</div>
      </div>
    </div>
  );
}

/* ---------- Digital Nexus AI — Software Engineer Agent -------------- */
export function DigitalNexusDemo() {
  const tickets = [
    { id: "ENG-411",  title: "Add CSV export to /reports page",
      desc: "When a user clicks the new Export button, generate a CSV of the visible filtered rows. Reuse the existing rows-state from useReports.",
      files: ["pages/Reports.tsx", "lib/csv.ts", "tests/reports.csv.test.ts"], tests: 5, time: 6.2 },
    { id: "ENG-512",  title: "Throttle webhook retries",
      desc: "Webhook delivery currently retries every 30s indefinitely. Cap at 12 attempts with exponential backoff.",
      files: ["workers/webhook.ts", "lib/backoff.ts", "tests/webhook.spec.ts"], tests: 8, time: 11.4 },
    { id: "ENG-588",  title: "Dark-mode for settings sidebar",
      desc: "Apply the existing tokens.dark palette to .settings-sidebar and its child rows.",
      files: ["components/SettingsSidebar.tsx", "styles/sidebar.css"], tests: 3, time: 4.1 },
  ];
  const [picked, setPicked] = React.useState(null);
  const [phase, setPhase] = React.useState("idle");
  const start = (i) => {
    setPicked(i); setPhase("plan");
    setTimeout(() => setPhase("code"), 700);
    setTimeout(() => setPhase("test"), 1500);
    setTimeout(() => setPhase("done"), 2500);
  };
  const reset = () => { setPicked(null); setPhase("idle"); };
  const t = picked !== null ? tickets[picked] : null;

  return (
    <div className="dnai">
      <div className="dnai__col">
        <div className="dnai__lbl">Inbox · pick a ticket</div>
        <div className="dnai__tickets">
          {tickets.map((tt, i) => (
            <button key={i} className={"dnai__ticket" + (picked === i ? " is-on" : "")} onClick={() => start(i)}>
              <div className="dnai__ticket-id">{tt.id}</div>
              <div className="dnai__ticket-title">{tt.title}</div>
              <div className="dnai__ticket-desc">{tt.desc}</div>
            </button>
          ))}
          {picked !== null && <button className="dnai__reset" onClick={reset}>← Reset</button>}
        </div>
      </div>

      <div className="dnai__col">
        <div className="dnai__lbl">Pull request</div>
        {t ? (
          <div className="dnai__pr">
            <div className="dnai__pr-head">
              <span className={"dnai__pr-state dnai__pr-state--" + (phase === "done" ? "ready" : "draft")}>
                {phase === "done" ? "READY TO MERGE" : "DRAFT"}
              </span>
              <span className="dnai__pr-title">PR #{1240 + picked} · {t.title}</span>
            </div>
            <div className="dnai__pr-files">
              {t.files.map((f, i) => {
                const showAt = phase === "plan" ? -1 : phase === "code" ? i - 0.5 : t.files.length;
                const visible = i <= showAt;
                return (
                  <div key={i} className={"dnai__file" + (visible ? " is-in" : "")}>
                    <span className="dnai__file-mark">+</span>
                    <span className="dnai__file-name">{f}</span>
                    {visible && <span className="dnai__file-lines">+{12 + i * 7} / -{2 + i}</span>}
                  </div>
                );
              })}
            </div>
            <div className="dnai__pr-tests">
              <span className="dnai__lbl-inline">Tests</span>
              {phase === "done"
                ? <span className="dnai__tests-ok">✓ {t.tests} of {t.tests} passing</span>
                : phase === "test" ? <span className="dnai__tests-run">running…</span>
                : phase === "code" ? <span className="dnai__tests-run">generating…</span>
                : <span className="dnai__tests-run">waiting</span>}
            </div>
            <div className="dnai__metric">
              Turnaround · <span style={{ color: "var(--pulse)" }}>{t.time} min</span>
              <span style={{ color: "var(--ash-dim)", margin: "0 10px" }}>·</span>
              <span style={{ color: "var(--ash)" }}>42% faster than manual baseline</span>
            </div>
          </div>
        ) : (
          <div className="dnai__empty">← pick a ticket to watch the SWE agent build a PR</div>
        )}
      </div>
    </div>
  );
}

/* ---------- HACKATHON DEMO — Ultrahack DEFINE 2025 ------------------- */
/* Camera-only wind prediction. User picks a wind condition; the pipeline
   runs ResNet → LSTM → adjusted aim; a top-down range view draws the
   trajectory + impact + angular error. */
export function HackathonDemo() {
  // wind scenarios: vector represents [angle_deg, strength m/s], plus the
  // model's predicted-vs-actual error built in.
  const scenarios = [
    { id: "calm",   name: "Calm",   wind: { angle: 0,   speed: 1 },  error: 1.8 },
    { id: "light",  name: "Light",  wind: { angle: 135, speed: 4 },  error: 3.4 },
    { id: "strong", name: "Strong", wind: { angle: 70,  speed: 9 },  error: 4.7 },
    { id: "gust",   name: "Gust",   wind: { angle: 200, speed: 11 }, error: 4.9 },
  ];

  const [picked, setPicked] = React.useState(null);
  const [step, setStep] = React.useState("idle"); // idle | camera | resnet | lstm | fired

  const run = (id) => {
    setPicked(id);
    setStep("camera");
    setTimeout(() => setStep("resnet"), 500);
    setTimeout(() => setStep("lstm"),   1100);
    setTimeout(() => setStep("fired"),  1900);
  };
  const reset = () => { setPicked(null); setStep("idle"); };

  const s = scenarios.find(x => x.id === picked);
  const fired = step === "fired";

  // Translate wind angle to an x-drift on the target plane (0–100 viewBox).
  // angle 90 = right, 270 = left, etc.
  const driftX = s ? Math.cos((s.wind.angle - 90) * Math.PI / 180) * s.wind.speed * 1.3 : 0;
  const driftY = s ? Math.sin((s.wind.angle - 90) * Math.PI / 180) * s.wind.speed * 0.4 : 0;

  return (
    <div className="hack">
      {/* LEFT — scenarios + pipeline */}
      <div className="hack__col hack__col--ctrl">
        <div className="hack__lbl">Pick a wind condition</div>
        <div className="hack__scenarios">
          {scenarios.map(sc => (
            <button key={sc.id}
              className={"hack__sc" + (picked === sc.id ? " is-on" : "")}
              onClick={() => run(sc.id)}>
              <span className="hack__sc-name">{sc.name}</span>
              <span className="hack__sc-meta">{sc.wind.speed} m/s · {sc.wind.angle}°</span>
            </button>
          ))}
          {picked && <button className="hack__reset" onClick={reset}>← Reset</button>}
        </div>

        <div className="hack__lbl" style={{ marginTop: 26 }}>Inference pipeline</div>
        <div className="hack__pipe">
          {[
            { id: "camera",  name: "Camera",   sub: "RGB frame" },
            { id: "resnet",  name: "ResNet-18",sub: "wind features" },
            { id: "lstm",    name: "LSTM",     sub: "temporal drift" },
            { id: "fired",   name: "Aim",      sub: "adjusted offset" },
          ].map((p, i) => {
            const ordered = ["camera", "resnet", "lstm", "fired"];
            const stepIdx = ordered.indexOf(step);
            const myIdx = ordered.indexOf(p.id);
            const cls = stepIdx < 0 ? "" : myIdx < stepIdx ? "is-done" : myIdx === stepIdx ? "is-live" : "";
            return (
              <div key={p.id} className={"hack__stage " + cls}>
                <div className="hack__stage-num">{String(i + 1).padStart(2, "0")}</div>
                <div className="hack__stage-name">{p.name}</div>
                <div className="hack__stage-sub">{p.sub}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT — top-down range view */}
      <div className="hack__col hack__col--range">
        <div className="hack__lbl">Top-down range · 600 m</div>
        <div className="hack__range">
          <svg viewBox="0 0 100 120" preserveAspectRatio="xMidYMid meet"
               width="100%" height="100%" style={{ display: "block" }}>
            {/* range grid */}
            <defs>
              <pattern id="rng" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M10 0 L0 0 0 10" fill="none" stroke="#1F2530" strokeWidth="0.3" />
              </pattern>
            </defs>
            <rect width="100" height="120" fill="url(#rng)" />

            {/* shooter at bottom */}
            <g transform="translate(50 112)">
              <circle r="2" fill="#ECEEF1" />
              <text y="6" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="3" fill="#7C8492" letterSpacing="0.1em">SHOOTER</text>
            </g>

            {/* target up range */}
            <g transform="translate(50 14)">
              <circle r="9" fill="none" stroke="#1F2530" strokeWidth="0.6" />
              <circle r="6" fill="none" stroke="#1F2530" strokeWidth="0.6" />
              <circle r="3" fill="none" stroke="#7C8492" strokeWidth="0.6" />
              <circle r="0.8" fill="#7C8492" />
              <text y="-12" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="3" fill="#7C8492" letterSpacing="0.1em">TARGET · 600 M</text>
            </g>

            {/* wind vector arrow at top-right corner */}
            {s && step !== "idle" && step !== "camera" && (
              <g transform="translate(82 22)" opacity={step === "resnet" || step === "lstm" || fired ? 1 : 0}
                 style={{ transition: "opacity 400ms cubic-bezier(0.2,0.7,0.2,1)" }}>
                <line x1="0" y1="0"
                      x2={Math.cos((s.wind.angle - 90) * Math.PI/180) * Math.min(s.wind.speed, 10)}
                      y2={Math.sin((s.wind.angle - 90) * Math.PI/180) * Math.min(s.wind.speed, 10)}
                      stroke="#F4B842" strokeWidth="0.6" markerEnd="url(#arr)" />
                <text x="0" y="-3" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="2.5" fill="#F4B842" letterSpacing="0.1em">
                  WIND · {s.wind.speed} M/S
                </text>
                <defs>
                  <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto">
                    <path d="M0 0 L10 5 L0 10 Z" fill="#F4B842"/>
                  </marker>
                </defs>
              </g>
            )}

            {/* naive (uncorrected) trajectory — dashed grey, shown once LSTM stage */}
            {(step === "lstm" || fired) && s && (
              <line x1="50" y1="112"
                    x2={50 + driftX} y2={14 + driftY}
                    stroke="#7C8492" strokeWidth="0.4" strokeDasharray="1.4 1"
                    opacity="0.7" />
            )}

            {/* corrected trajectory — solid pulse, only after fire */}
            {fired && s && (
              <>
                <line x1="50" y1="112" x2="50" y2="14"
                      stroke="#6DF3D7" strokeWidth="0.6" />
                <circle cx="50" cy="14" r="1.4" fill="#6DF3D7">
                  <animate attributeName="r" values="1.4;3.2;1.4" dur="0.7s" repeatCount="1" />
                </circle>
              </>
            )}

            {/* aim correction marker — small offset arrow showing how much we adjusted */}
            {fired && s && (
              <g transform="translate(50 60)">
                <line x1={0} y1={0} x2={-driftX} y2={-driftY}
                      stroke="#6DF3D7" strokeWidth="0.4" strokeDasharray="0.6 0.6" opacity="0.6" />
              </g>
            )}
          </svg>
        </div>

        <div className="hack__metrics">
          {fired && s ? (
            <>
              <div className="hack__metric">
                <span className="hack__metric-lbl">Angular error</span>
                <span className="hack__metric-val" style={{ color: "var(--pulse)" }}>{s.error}°</span>
              </div>
              <div className="hack__metric">
                <span className="hack__metric-lbl">Target</span>
                <span className="hack__metric-val">&lt; 5°</span>
              </div>
              <div className="hack__metric">
                <span className="hack__metric-lbl">Inference</span>
                <span className="hack__metric-val">42 ms</span>
              </div>
              <div className="hack__metric hack__metric--gold">
                <span className="hack__medal">🥇</span>
                <span>1st place · Ultrahack DEFINE</span>
              </div>
            </>
          ) : (
            <div className="hack__metric-empty">pick a wind condition to run the model →</div>
          )}
        </div>
      </div>
    </div>
  );
}

export function PlaceholderDemo({ company, role, hint }) {
  return (
    <div className="placeholder-demo">
      <div className="placeholder-demo__inner">
        <div className="placeholder-demo__tag">interactive demo</div>
        <div className="placeholder-demo__name">{company}</div>
        <div className="placeholder-demo__role">{role}</div>
        <div className="placeholder-demo__hint">{hint}</div>
      </div>
    </div>
  );
}
