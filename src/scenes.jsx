/* ============================================================
   scenes.jsx — Hero + project scenes & interactive demos.
   • Hero: real 3D wireframe shapes.
   • BCI: animated OpenBCI Cyton montage diagram (head + forearm,
     wired into the board) that reacts to the gesture demo.
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

/* ---------- BCI scene — OpenBCI Cyton montage diagram ---------------- */
/* Faithful to the real setup: a head wearing the Cyton headband with
   Fp1/Fp2 electrodes + REF/GND ear clips, wired into the OpenBCI box,
   and a forearm with EMG Ch1+/Ch1− pads. Gestures from the demo light
   up the matching electrodes, fire a signal pulse down the wires, and
   burst the live scope traces. The face reacts too: eyes blink, brows
   raise, the hand clenches. */

const BCI_WIRES = {
  fp1:  "M172 178 C 148 116, 244 88, 296 126 C 338 156, 368 178, 402 196",
  fp2:  "M238 176 C 286 130, 344 170, 402 214",
  ref:  "M112 262 C 118 352, 276 352, 402 232",
  gnd:  "M298 260 C 332 294, 366 268, 402 250",
  emg1: "M736 366 C 690 320, 640 286, 578 228",
  emg2: "M800 380 C 724 350, 636 314, 578 246",
};

const BCI_GESTURES = {
  blink: { ch: "eeg", ember: false, status: "BLINK → FP1 · FP2" },
  brow:  { ch: "eeg", ember: true,  status: "BROW → FP1 · FP2" },
  tap:   { ch: "emg", ember: false, status: "TAP → EMG CH1" },
  fist:  { ch: "emg", ember: true,  status: "CLENCH → EMG CH1" },
};

const TAU = Math.PI * 2;
function makeWave(width, steps, fn) {
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * width;
    d += (i === 0 ? "M" : "L") + x.toFixed(1) + " " + fn(x).toFixed(2) + " ";
  }
  return d;
}
/* Periodic over 140 units so the two scrolling copies tile seamlessly. */
const EEG_WAVE = makeWave(140, 70, x =>
  3.2 * Math.sin(TAU * 2 * x / 140) + 2.1 * Math.sin(TAU * 5 * x / 140 + 1.3) + 1.8 * Math.sin(TAU * 9 * x / 140 + 0.4));
const EMG_WAVE = makeWave(140, 110, x =>
  1.2 * Math.sin(TAU * 13 * x / 140) + 0.9 * Math.sin(TAU * 23 * x / 140 + 0.8) + 0.8 * Math.sin(TAU * 31 * x / 140 + 2.1));

function Electrode({ x, y, r = 10, hot, ember, delay = 0 }) {
  return (
    <g className={"bci-elg" + (hot ? " is-hot" : "") + (ember ? " is-ember" : "")}>
      <circle className="bci-halo" cx={x} cy={y} r={r + 7} style={{ animationDelay: `${delay}ms` }} />
      <circle className="bci-el-ring" cx={x} cy={y} r={r} />
      <circle className="bci-el-core" cx={x} cy={y} r={r * 0.42} />
    </g>
  );
}

function ScopeStrip({ x, y, w, h, clipId, label, color, path, burst, fast }) {
  const cy = y + h / 2;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} className="bci-strip" />
      <text x={x + 8} y={cy + 3} className="bci-lbl bci-lbl--dim">{label}</text>
      <clipPath id={clipId}><rect x={x + 66} y={y + 2} width={w - 72} height={h - 4} /></clipPath>
      <g clipPath={`url(#${clipId})`}>
        <g transform={`translate(${x + 66} ${cy})`}>
          <g className={"bci-tracewrap" + (burst ? " is-burst" : "")}>
            <g className={"bci-scroll" + (fast ? " bci-scroll--fast" : "")}>
              <path className={`bci-trace bci-trace--${color}`} d={path} />
              <path className={`bci-trace bci-trace--${color}`} d={path} transform="translate(140 0)" />
            </g>
          </g>
        </g>
      </g>
    </g>
  );
}

export function SceneBCI({ activeGesture = null }) {
  const fire = activeGesture ? BCI_GESTURES[activeGesture] : null;
  // Bump the key on every trigger so the pulse animation replays even
  // when the same gesture is pressed twice in a row.
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => { if (activeGesture) setTick(t => t + 1); }, [activeGesture]);

  const eegHot = fire?.ch === "eeg";
  const emgHot = fire?.ch === "emg";
  const rootCls = "bci-rig"
    + (fire ? " is-firing" : "")
    + (fire?.ember ? " is-ember" : "")
    + (activeGesture ? ` is-${activeGesture}` : "");

  return (
    <svg viewBox="0 0 920 560" preserveAspectRatio="xMidYMid meet" className={rootCls}>
      <defs>
        <pattern id="bciDots" width="26" height="26" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="rgba(236,238,241,0.05)" />
        </pattern>
      </defs>
      <rect width="920" height="560" fill="url(#bciDots)" />

      {/* dashed instrument frames, like a wiring schematic */}
      <rect x="54" y="96" width="330" height="330" className="bci-frame" />
      <text x="60" y="88" className="bci-lbl bci-lbl--dim">Subject · EEG/EOG montage</text>
      <rect x="566" y="332" width="342" height="110" className="bci-frame" />
      <text x="572" y="324" className="bci-lbl bci-lbl--dim">Forearm · EMG montage</text>

      {/* wires: base + slow streaming dashes */}
      {Object.entries(BCI_WIRES).map(([k, d]) => <path key={k} className="bci-wire" d={d} />)}
      {Object.entries(BCI_WIRES).map(([k, d], i) => (
        <path key={"f" + k} className="bci-wire--flow" d={d} style={{ animationDelay: `${i * -0.35}s` }} />
      ))}

      {/* ---------- HEAD (front view) ---------- */}
      <g>
        {/* face + neck + shoulders */}
        <ellipse cx="205" cy="245" rx="82" ry="105" className="bci-line" fill="none" />
        <path className="bci-line bci-line--soft" d="M168 342 C 170 366, 166 382, 158 394 M242 342 C 240 366, 244 382, 252 394" fill="none" />
        <path className="bci-line bci-line--soft" d="M158 394 C 120 402, 84 414, 58 434 M252 394 C 290 402, 326 414, 352 434" fill="none" />
        {/* ears */}
        <path className="bci-line" d="M122 230 C 106 232, 104 260, 120 264 M288 230 C 304 232, 306 260, 290 264" fill="none" />
        {/* face: brows raise on "brow", eyes close on "blink" */}
        <path className="bci-line bci-brow" d="M156 212 Q 172 205 188 212" fill="none" />
        <path className="bci-line bci-brow" d="M222 212 Q 238 205 254 212" fill="none" />
        <ellipse className="bci-eye" cx="172" cy="228" rx="8.5" ry="3.6" />
        <ellipse className="bci-eye" cx="238" cy="228" rx="8.5" ry="3.6" />
        <path className="bci-line bci-line--soft" d="M205 232 L 201 258 Q 205 263 210 258" fill="none" />
        <path className="bci-line bci-line--soft" d="M188 287 Q 205 294 222 287" fill="none" />

        {/* Cyton headband: forehead strap + crown straps + top knob */}
        <path className="bci-gear" d="M127 196 Q 205 178 283 196" fill="none" />
        <path className="bci-gear" d="M127 206 Q 205 188 283 206" fill="none" />
        <path className="bci-gear" d="M146 192 Q 205 92 264 192" fill="none" />
        <path className="bci-gear" d="M168 188 Q 205 110 242 188" fill="none" />
        <circle className="bci-gear" cx="205" cy="116" r="7" fill="none" />
        <circle className="bci-gear" cx="205" cy="116" r="2.5" fill="none" />
        <circle className="bci-gear" cx="146" cy="190" r="5" fill="none" />
        <circle className="bci-gear" cx="264" cy="190" r="5" fill="none" />

        {/* ear clips */}
        <rect className="bci-clip" x="106" y="244" width="13" height="15" rx="2" />
        <rect className="bci-clip" x="291" y="244" width="13" height="15" rx="2" />
      </g>

      {/* Fp1 / Fp2 electrodes on the strap */}
      <Electrode x={172} y={188} r={10} hot={eegHot} ember={fire?.ember} delay={0} />
      <Electrode x={238} y={188} r={10} hot={eegHot} ember={fire?.ember} delay={400} />

      {/* head labels + leaders */}
      <text x="108" y="124" textAnchor="end" className="bci-lbl">FP1</text>
      <path className="bci-leader" d="M114 130 L 164 176" />
      <text x="302" y="124" className="bci-lbl">FP2</text>
      <path className="bci-leader" d="M296 130 L 246 176" />
      <text x="44" y="226" className="bci-lbl">REF</text>
      <path className="bci-leader" d="M70 232 L 106 248" />
      <text x="318" y="226" className="bci-lbl">GND</text>
      <path className="bci-leader" d="M338 232 L 306 248" />

      {/* ---------- FOREARM + HAND ---------- */}
      <g transform="translate(582 348)">
        {/* forearm */}
        <path className="bci-line" d="M320 12 C 262 6, 198 6, 152 12" fill="none" />
        <path className="bci-line" d="M320 62 C 262 66, 198 64, 154 58" fill="none" />
        {/* open hand */}
        <g className="bci-hand bci-hand--open">
          <path className="bci-line" d="M152 12 C 118 4, 80 2, 52 10 C 26 16, 10 26, 10 36 C 10 48, 30 58, 58 60 C 92 64, 128 62, 154 58" fill="none" />
          <path className="bci-line bci-line--soft" d="M14 30 L 52 27 M16 44 L 54 44 M64 56 C 56 48, 56 38, 62 32" fill="none" />
        </g>
        {/* fist */}
        <g className="bci-hand bci-hand--fist">
          <path className="bci-line" d="M152 14 C 128 4, 96 2, 76 10 C 58 16, 50 26, 50 36 C 50 48, 60 56, 80 58 C 106 62, 132 60, 154 58" fill="none" />
          <path className="bci-line bci-line--soft" d="M56 18 C 49 20, 49 25, 56 27 M54 30 C 47 32, 47 37, 54 39 M55 42 C 48 44, 48 49, 55 51" fill="none" />
        </g>
        {/* tap ripple at the fingertip */}
        <circle className="bci-tap" cx="14" cy="34" r="8" />
      </g>

      {/* EMG pads */}
      <Electrode x={736} y={376} r={10} hot={emgHot} ember={fire?.ember} delay={200} />
      <Electrode x={800} y={390} r={10} hot={emgHot} ember={fire?.ember} delay={600} />

      {/* arm labels + leaders */}
      <text x="700" y="466" textAnchor="middle" className="bci-lbl">EMG CH1+ · Active</text>
      <path className="bci-leader" d="M736 388 L 706 454" />
      <text x="816" y="488" textAnchor="middle" className="bci-lbl">EMG CH1− · Reference</text>
      <path className="bci-leader" d="M800 402 L 812 476" />

      {/* ---------- OPENBCI BOX ---------- */}
      <g>
        <rect className="bci-box" x="402" y="172" width="176" height="104" />
        {/* input ports */}
        {[193, 211, 229, 247].map(y => <rect key={y} className="bci-pin" x="398" y={y} width="8" height="6" />)}
        {[225, 243].map(y => <rect key={y} className="bci-pin" x="574" y={y} width="8" height="6" />)}
        <text x="414" y="208" className="bci-title">OpenBCI</text>
        <text x="414" y="226" className="bci-lbl bci-lbl--dim">Cyton · 8-ch · 250 Hz</text>
        {/* pin header */}
        {Array.from({ length: 8 }).map((_, i) => (
          <rect key={i} className="bci-pin" x={414 + i * 13} y="248" width="7" height="9" />
        ))}
        <circle className="bci-led" cx="560" cy="190" r="3.5" />
        {/* stubs down to the scope strips */}
        <path className="bci-leader" d="M470 276 L 470 296 M510 276 L 510 296" />
      </g>

      {/* live scope traces */}
      <ScopeStrip x={402} y={296} w={176} h={30} clipId="bciScope1"
        label="EEG · FP" color="eeg" path={EEG_WAVE} burst={eegHot} fast={eegHot} />
      <ScopeStrip x={402} y={334} w={176} h={30} clipId="bciScope2"
        label="EMG · CH1" color="emg" path={EMG_WAVE} burst={emgHot} fast={emgHot} />

      {/* status readout */}
      <text x="402" y="390" className={"bci-lbl" + (fire ? "" : " bci-lbl--dim")}
        fill={fire ? (fire.ember ? "var(--ember)" : "var(--pulse)") : undefined}>
        {fire ? fire.status : "streaming · 250 Hz · 2 ch"}
      </text>

      {/* signal pulse racing down the active wires */}
      {fire && (
        <g key={tick}>
          {(fire.ch === "eeg" ? ["fp1", "fp2"] : ["emg1", "emg2"]).map(w => (
            <path key={w} d={BCI_WIRES[w]}
              className={"bci-pulse " + (fire.ember ? "bci-pulse--ember" : "bci-pulse--cyan")} />
          ))}
        </g>
      )}
    </svg>
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
   runs ResNet → LSTM → adjusted aim; a top-down range view shows wind
   particles, a camera scan, the uncorrected drift arc drawing itself,
   then a tracer shot + impact ripple, with metrics counting up. */

/* fixed pseudo-random positions for the wind streak particles */
const WIND_SEEDS = [
  [34, 84], [228, 70], [120, 128], [262, 150], [58, 182], [180, 96], [90, 250],
  [210, 224], [150, 180], [44, 300], [246, 290], [140, 300], [74, 120], [196, 160],
];

/* count-up for the result metrics */
function useCountUp(target, run, dur = 700) {
  const [v, setV] = React.useState(0);
  React.useEffect(() => {
    if (!run) { setV(0); return; }
    let raf, t0;
    const tick = (now) => {
      if (!t0) t0 = now;
      const p = Math.min(1, (now - t0) / dur);
      setV(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run, dur]);
  return v;
}

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
  const active = step !== "idle";

  // Wind unit vector + drift on the target plane (0–300 viewBox).
  // angle 90 = right, 270 = left, etc.
  const rad = s ? (s.wind.angle - 90) * Math.PI / 180 : 0;
  const ux = Math.cos(rad), uy = Math.sin(rad);
  const dx = s ? ux * s.wind.speed * 3.4 : 0;
  const dy = s ? uy * s.wind.speed * 1.1 : 0;
  const segLen = s ? 6 + s.wind.speed : 0;            // streak length ∝ speed
  const travel = s ? 34 + s.wind.speed * 3 : 0;       // drift distance per loop
  const windDur = s ? Math.max(0.9, 3.4 - s.wind.speed * 0.22) : 3;

  const errVal = useCountUp(s ? s.error : 0, fired);
  const msVal = useCountUp(42, fired);

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
          <svg viewBox="0 0 300 360" preserveAspectRatio="xMidYMid meet"
               width="100%" height="100%" style={{ display: "block" }}>
            <defs>
              <pattern id="hackGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M30 0 L0 0 0 30" fill="none" stroke="#1A1F29" strokeWidth="0.8" />
              </pattern>
              <linearGradient id="hackScanG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="rgba(109,243,215,0)" />
                <stop offset="0.5" stopColor="rgba(109,243,215,0.16)" />
                <stop offset="1" stopColor="rgba(109,243,215,0)" />
              </linearGradient>
              <marker id="hackArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto">
                <path d="M0 0 L10 5 L0 10 Z" fill="#F4B842" />
              </marker>
            </defs>

            <rect width="300" height="360" fill="url(#hackGrid)" />

            {/* viewfinder corners — this is a camera feed, after all */}
            <path className="hackr-corner" d="M8 20 L8 8 L20 8 M280 8 L292 8 L292 20 M292 340 L292 352 L280 352 M20 352 L8 352 L8 340" />

            {/* range distance ticks */}
            {[{ y: 238, m: "200" }, { y: 140, m: "400" }, { y: 42, m: "600" }].map(t => (
              <g key={t.m}>
                <line x1="8" y1={t.y} x2="16" y2={t.y} stroke="#39404D" strokeWidth="1" />
                <text x="20" y={t.y + 2.5} className="hackr-txt">{t.m}m</text>
              </g>
            ))}

            {/* wind streak particles — direction, length & speed match the scenario */}
            {s && active && WIND_SEEDS.map((p, i) => (
              <line key={i} className="hackr-wind"
                x1={p[0]} y1={p[1]} x2={p[0] + ux * segLen} y2={p[1] + uy * segLen}
                style={{
                  "--wx": `${(ux * travel).toFixed(1)}px`,
                  "--wy": `${(uy * travel).toFixed(1)}px`,
                  animationDuration: `${windDur}s`,
                  animationDelay: `${(-((i * 0.37) % windDur)).toFixed(2)}s`,
                }} />
            ))}

            {/* camera scan sweep while the frame is being read */}
            {(step === "camera" || step === "resnet") && (
              <rect className="hackr-scanline" x="8" y="0" width="284" height="16" fill="url(#hackScanG)" />
            )}

            {/* shooter */}
            <g transform="translate(150 336)">
              <path d="M-6 6 L0 -6 L6 6" fill="none" stroke="#ECEEF1" strokeWidth="1.4" />
              <text y="16" textAnchor="middle" className="hackr-txt">Shooter</text>
            </g>

            {/* target */}
            <g transform="translate(150 42)">
              <circle r="27" fill="none" stroke="#1F2530" strokeWidth="1.4" />
              <circle r="18" fill="none" stroke="#1F2530" strokeWidth="1.4" />
              <circle r="9" fill="none" stroke="#7C8492" strokeWidth="1.4" />
              <circle r="2.4" fill="#7C8492" />
              <text y="-34" textAnchor="middle" className="hackr-txt">Target · 600 m</text>
              {/* crosshair locks on while the LSTM solves the hold-over */}
              {(step === "lstm" || fired) && (
                <g className="hackr-cross">
                  <line x1="-15" y1="0" x2="15" y2="0" />
                  <line x1="0" y1="-15" x2="0" y2="15" />
                  <circle r="8" fill="none" />
                </g>
              )}
              {/* impact ripple + hit marker */}
              {fired && (<>
                <circle className="hackr-impact" r="14" />
                <circle className="hackr-impact hackr-impact--late" r="22" />
                <circle className="hackr-hit" r="3.2" />
              </>)}
            </g>

            {/* wind vector readout */}
            {s && active && step !== "camera" && (
              <g className="hackr-windvec" transform="translate(252 84)">
                <text y="-12" textAnchor="middle">Wind · {s.wind.speed} m/s</text>
                <line x1="0" y1="0"
                  x2={(ux * Math.min(s.wind.speed, 10) * 2.4).toFixed(1)}
                  y2={(uy * Math.min(s.wind.speed, 10) * 2.4).toFixed(1)}
                  markerEnd="url(#hackArr)" />
              </g>
            )}

            {/* uncorrected drift arc — draws itself once the LSTM stage hits */}
            {(step === "lstm" || fired) && s && (
              <path className="hackr-naive" pathLength="1"
                d={`M150 336 Q ${(150 + dx * 0.25).toFixed(1)} 200, ${(150 + dx).toFixed(1)} ${(42 + dy).toFixed(1)}`} />
            )}
            {fired && s && (
              <g className="hackr-miss" transform={`translate(${(150 + dx).toFixed(1)} ${(42 + dy).toFixed(1)})`}>
                <path d="M-4 -4 L4 4 M-4 4 L4 -4" />
                <text x="8" y="3">drift</text>
              </g>
            )}

            {/* corrected tracer + muzzle flash */}
            {fired && (<>
              <path className="hackr-shot" pathLength="1" d="M150 336 L150 42" />
              <circle className="hackr-flash" cx="150" cy="330" r="5" />
            </>)}
          </svg>
        </div>

        <div className="hack__metrics">
          {fired && s ? (
            <>
              <div className="hack__metric">
                <span className="hack__metric-lbl">Angular error</span>
                <span className="hack__metric-val" style={{ color: "var(--pulse)" }}>{errVal.toFixed(1)}°</span>
              </div>
              <div className="hack__metric">
                <span className="hack__metric-lbl">Target</span>
                <span className="hack__metric-val">&lt; 5°</span>
              </div>
              <div className="hack__metric">
                <span className="hack__metric-lbl">Inference</span>
                <span className="hack__metric-val">{Math.round(msVal)} ms</span>
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
