/* ============================================================
   components.jsx — Page-level pieces for the portfolio.
   Real CV info. Interactive scenes. Experience + Awards sections.
   ============================================================ */
import React from "react";
import {
  useSceneProgress, SceneBCI,
  RAGDemo, LSEGDemo, TelekomDemo, CloudGeometryDemo, DigitalNexusDemo,
  HackathonDemo, PlaceholderDemo, HeroScene,
} from "./scenes.jsx";

export function Nav() {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <nav className={"nav" + (scrolled ? " is-scrolled" : "")}>
      <a href="#top" className="nav__brand">
        <img src={`${import.meta.env.BASE_URL}assets/logo-mark.svg`} alt="" />
        andrei lupica
      </a>
      <div className="nav__links">
        <a href="#work">Work</a>
        <a href="#experience">Experience</a>
        <a href="#awards">Awards</a>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
      </div>
      <div className="pill" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--pulse)", boxShadow: "0 0 0 4px var(--pulse-20)" }} />
        Currently @ LSEG · Telekom
      </div>
    </nav>
  );
}

/* ---------- HERO with real 3D background ---------------------------- */
export function Hero() {
  return (
    <header className="hero" id="top">
      <div className="hero__bg"><HeroScene /></div>
      <div className="shell" style={{ position: "relative", zIndex: 2 }}>
        <div className="hero__eyebrow">
          <span className="dot"></span>
          AI Engineer · Bucharest, RO · Moving to Odense, DK · Sep 2026
        </div>
        <h1 className="hero__display">
          I build systems<br/>
          that <em>ship</em>.
        </h1>
        <p className="hero__sub">
          <strong>Andrei Lupica.</strong> RAG pipelines on AWS, agentic workflows, brain-computer interfaces, and a 1st-place hackathon win. Currently AI Engineer at LSEG and Deutsche Telekom.
        </p>
        <div className="hero__ctas">
          <a href="#work" className="btn btn--primary">See the work <span aria-hidden>↓</span></a>
          <a href="#contact" className="btn">Get in touch →</a>
        </div>
      </div>
      <div className="hero__scroll-hint">
        <span>scroll</span>
        <span className="line"></span>
      </div>
    </header>
  );
}

/* ---------- MARQUEE — real CV skills -------------------------------- */
export function MarqueeTicker() {
  const items = [
    "LLMs & RAG", "AWS Bedrock", "Dagster", "Langflow", "Elasticsearch", "MongoDB",
    "OpenAI · Claude · Gemini APIs", "Agentic workflows", "ChromaDB", "ECS · AuroraDB",
    "Docker · Kubernetes", "Python · C++", "ROS 2", "UR5 / URScript", "Brain-computer interfaces",
    "Quantum computing (learning)", "Speaks Romanian · English",
  ];
  const acc = (i) => i % 3 === 0 ? "accent" : (i % 5 === 0 ? "ember" : "");
  const list = items.concat(items);
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker__track">
        {list.map((t, i) => (
          <span key={i} className={acc(i)}>{t} <span style={{ color: "var(--ash-dim)" }}>·</span></span>
        ))}
      </div>
    </div>
  );
}

/* ---------- Section header ----------------------------------------- */
export function SectionHeader({ num, title, meta }) {
  return (
    <div className="section-header">
      <div className="section-header__num">{num}</div>
      <h2 className="section-header__title" dangerouslySetInnerHTML={{ __html: title }} />
      <div className="section-header__meta">{meta}</div>
    </div>
  );
}

/* ---------- Project rows ------------------------------------------- */
export function ProjectRow({ num, title, blurb, meta, isActive, onClick }) {
  return (
    <div className={"project-row" + (isActive ? " is-active" : "")} role="link" tabIndex="0"
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}>
      <div className="project-row__num">{num}</div>
      <div>
        <div className="project-row__title" dangerouslySetInnerHTML={{ __html: title }} />
        <div className="project-row__blurb">{blurb}</div>
      </div>
      <div className="project-row__meta">{meta.map((m, i) => <span key={i}>{m}</span>)}</div>
    </div>
  );
}

export function Chip({ children, variant }) {
  const cls = variant === "accent" ? "chip chip--accent" : variant === "ember" ? "chip chip--ember" : "chip";
  return <span className={cls}>{children}</span>;
}

/* ---------- BCI Demo (interactive) ---------------------------------- */
export function BCIDemo({ activeGesture, setActiveGesture }) {
  const [tree, setTree] = React.useState({ category: 0, phrase: 0, spoken: null });
  const categories = [
    { name: "Greetings", items: ["Hello", "Good morning", "How are you?"] },
    { name: "Needs",     items: ["I'm thirsty", "I'm tired", "I need help"] },
    { name: "Comfort",   items: ["Yes", "No", "Thank you"] },
  ];
  const trigger = (g) => {
    setActiveGesture(g);
    setTimeout(() => setActiveGesture(null), 700);
    setTree(t => {
      if (g === "blink") {
        const items = categories[t.category].items;
        return { ...t, phrase: (t.phrase + 1) % items.length, spoken: null };
      }
      if (g === "tap") {
        const phrase = categories[t.category].items[t.phrase];
        return { ...t, spoken: phrase };
      }
      if (g === "fist")  return { ...t, category: (t.category + 1) % categories.length, phrase: 0, spoken: null };
      if (g === "brow")  return { ...t, category: 2, phrase: 2, spoken: null };
      return t;
    });
  };
  const cat = categories[tree.category];
  return (
    <div className="demo">
      <div className="demo__row">
        <div className="demo__gestures">
          <div className="demo__lbl">Try a gesture →</div>
          <div className="demo__btns">
            <button className={"gbtn" + (activeGesture === "blink" ? " is-on" : "")} onClick={() => trigger("blink")}>
              <span className="gbtn__name">Blink</span><span className="gbtn__act">next</span>
            </button>
            <button className={"gbtn" + (activeGesture === "tap" ? " is-on" : "")} onClick={() => trigger("tap")}>
              <span className="gbtn__name">Tap</span><span className="gbtn__act">select</span>
            </button>
            <button className={"gbtn gbtn--ember" + (activeGesture === "fist" ? " is-on" : "")} onClick={() => trigger("fist")}>
              <span className="gbtn__name">Clench</span><span className="gbtn__act">category</span>
            </button>
            <button className={"gbtn gbtn--ember" + (activeGesture === "brow" ? " is-on" : "")} onClick={() => trigger("brow")}>
              <span className="gbtn__name">Brow</span><span className="gbtn__act">favourite</span>
            </button>
          </div>
        </div>
        <div className="demo__tree">
          <div className="demo__lbl">Phrase tree</div>
          <div className="demo__cat"><span style={{ color: "var(--pulse)" }}>›</span> {cat.name}</div>
          <div className="demo__items">
            {cat.items.map((it, i) => (
              <div key={i} className={"demo__item" + (i === tree.phrase ? " is-cursor" : "")}>
                <span className="demo__cursor">{i === tree.phrase ? "→" : ""}</span>
                <span>{it}</span>
              </div>
            ))}
          </div>
          <div className="demo__spoken">
            {tree.spoken
              ? <><span style={{ color: "var(--pulse)" }}>◉ spoken</span> &nbsp; "{tree.spoken}"</>
              : <><span style={{ color: "var(--ash-dim)" }}>◯ waiting</span></>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Featured project — owns a scene + interactions ---------- */
export function FeaturedProject({ sceneId, project }) {
  const ref = React.useRef(null);
  useSceneProgress(ref);
  const [activeGesture, setActiveGesture] = React.useState(null);

  let sceneEl, sceneIs3D = false;
  if      (sceneId === "bci")      { sceneEl = <SceneBCI activeGesture={activeGesture} />; sceneIs3D = true; }
  else if (sceneId === "rag")      { sceneEl = <RAGDemo />; }
  else if (sceneId === "lseg")     { sceneEl = <LSEGDemo />; }
  else if (sceneId === "telekom")  { sceneEl = <TelekomDemo />; }
  else if (sceneId === "cloud")    { sceneEl = <CloudGeometryDemo />; }
  else if (sceneId === "dnai")     { sceneEl = <DigitalNexusDemo />; }
  else if (sceneId === "hackathon"){ sceneEl = <HackathonDemo />; }
  else                             { sceneEl = <PlaceholderDemo company="Unknown" role={project.role} hint="" />; }

  return (
    <section className={"featured" + (sceneIs3D ? " featured--3d" : " featured--flat")} ref={ref}>
      <div className="featured__scene">
        {sceneEl}
        {sceneIs3D && (
          <>
            <div style={{
              position: "absolute", left: 24, top: 24, zIndex: 5,
              fontFamily: "var(--ff-mono)", fontSize: 11, letterSpacing: "0.14em",
              color: "var(--pulse)", textTransform: "uppercase"
            }}>{project.eyebrow}</div>
            <div className="scene-badge">
              <span className="scene-badge__yr">{project.year}</span>
              <span className="scene-badge__role">{project.role}</span>
            </div>
          </>
        )}
      </div>

      <div className="featured__copy">
        <div>
          <span className="label">Stack</span>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {project.stack.map((s, i) => <Chip key={i}>{s}</Chip>)}
          </div>
          <div style={{ marginTop: 24 }}>
            <span className="label">Year · Role</span>
            <div style={{ fontFamily: "var(--ff-sans)", fontSize: 14, color: "var(--bone)" }}>{project.year}</div>
            <div style={{ fontFamily: "var(--ff-sans)", fontSize: 14, color: "var(--ash)" }}>{project.role}</div>
          </div>
          <div style={{ marginTop: 24 }}>
            <span className="label">Source</span>
            <div style={{ fontFamily: "var(--ff-sans)", fontSize: 14, color: "var(--bone)" }}>{project.source}</div>
          </div>
        </div>

        <div>
          <h3 dangerouslySetInnerHTML={{ __html: project.headline }} />
          <p style={{ marginTop: 16, fontSize: 20, color: "var(--bone)", lineHeight: 1.4, maxWidth: "30ch" }}>
            {project.lede}
          </p>
        </div>

        <div>
          <span className="label">In plain words</span>
          {project.body.map((b, i) => <p key={i}>{b}</p>)}
          {project.caseStudyUrl && (
            <div style={{ marginTop: 20 }}>
              <a className="btn" href={project.caseStudyUrl} target="_blank" rel="noopener noreferrer">
                Read the case study →
              </a>
            </div>
          )}
        </div>
      </div>

      {sceneId === "bci" && <BCIDemo activeGesture={activeGesture} setActiveGesture={setActiveGesture} />}
    </section>
  );
}

/* ---------- EXPERIENCE — real CV timeline --------------------------- */
export function Experience() {
  const items = [
    { year: "Sep 2024",  title: "RoboAI Academy",            sub: "AI/ML & Robotics Engineer — Satakuntaliitto + Unitree Go2 + UR5", kind: "work" },
    { year: "Mar 2025",  title: "Digital Nexus AI",          sub: "Generative AI Engineer (Internship) — Software-engineer AI agent", kind: "work" },
    { year: "May 2025",  title: "1st Place · Ultrahack",     sub: "DEFINE Hackathon by Sako — camera-only wind prediction", kind: "award" },
    { year: "May 2025",  title: "CERN Spring Campus",        sub: "QML, Graph Databases, scalable SWE — 1 week intensive", kind: "award" },
    { year: "Aug 2025",  title: "Deutsche Telekom",          sub: "Data Scientist (Part-Time) — Dagster + RAG + GPT", kind: "work" },
    { year: "Oct 2025",  title: "CloudGeometry",             sub: "AI & MLOps Engineer — AWS Bedrock RAG + Langflow platform", kind: "work" },
    { year: "Feb 2026",  title: "Graduated SAMK",            sub: "BEng · AI / Data Engineering · Pori, Finland", kind: "school" },
    { year: "May 2026",  title: "Thesis on Theseus",         sub: "Minimal Command AAC — 260+ downloads in 30 days", kind: "award" },
    { year: "May 2026",  title: "London Stock Exchange",     sub: "AI Engineer (Contract) — corporate-tree validation pipeline", kind: "work" },
    { year: "Sep 2026",  title: "MSc Quantum Computing",     sub: "Southern Denmark University — Odense", kind: "school" },
  ];
  const railRef = React.useRef(null);
  const scroll = (dir) => { if (railRef.current) railRef.current.scrollBy({ left: dir * 360, behavior: "smooth" }); };
  return (
    <section className="section section--exp" id="experience">
      <div className="shell">
        <SectionHeader num="03 / Experience" title="Six engagements, <em>two countries</em>, ten milestones." meta="2024 — now" />
        <div className="timeline">
          <div className="timeline__viewport" ref={railRef}>
            <div className="timeline__track">
              <div className="timeline__line" />
              {items.map((it, i) => (
                <div key={i} className={"tl-card tl-card--" + it.kind}>
                  <div className="tl-card__yr">{it.year}</div>
                  <div className="tl-card__dot" />
                  <div className="tl-card__body">
                    <div className="tl-card__title">{it.title}</div>
                    <div className="tl-card__sub">{it.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="timeline__nav">
            <span className="timeline__hint">drag or scroll →</span>
            <button className="btn" onClick={() => scroll(-1)} aria-label="Earlier">←</button>
            <button className="btn" onClick={() => scroll(1)}  aria-label="Later">→</button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- AWARDS — recognised highlights -------------------------- */
export function Awards() {
  return (
    <section className="section section--awards" id="awards">
      <div className="shell">
        <SectionHeader num="04 / Recognition" title="<em>Awards</em> & highlights." meta="2025 — 26" />
        <div className="awards-grid">
          <article className="award-card award-card--gold">
            <div className="award-card__tag">1st Place</div>
            <div className="award-card__name">Ultrahack DEFINE 2025</div>
            <div className="award-card__by">powered by Sako · May 2025</div>
            <p className="award-card__body">
              Led a team to first place against international talent. Built a camera-only, real-time wind prediction model for bullet trajectories — ResNet-18 for features, LSTM for temporal drift. <strong>Under 5% angular error in 48 hours.</strong>
            </p>
          </article>

          <article className="award-card">
            <div className="award-card__tag">Published</div>
            <div className="award-card__name">Minimal Command AAC — Thesis</div>
            <div className="award-card__by">Theseus · May 2026</div>
            <p className="award-card__body">
              Real-time brain-computer interface comparing classic signal processing against deep learning for facial-gesture detection. <strong>260+ downloads in its first 30 days.</strong>
            </p>
          </article>

          <article className="award-card">
            <div className="award-card__tag">Selected</div>
            <div className="award-card__name">CERN Spring Campus</div>
            <div className="award-card__by">CERN · May 2025</div>
            <p className="award-card__body">
              Intensive IT and computing programme led by CERN researchers. Quantum Machine Learning (QML), graph databases, and scalable software-engineering architecture — preparation for SDU's quantum MSc.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}

/* ---------- ABOUT --------------------------------------------------- */
export function About() {
  return (
    <section className="section" id="about">
      <div className="shell">
        <SectionHeader num="05 / About" title="The <em>operator</em>." meta="Bio · 1 minute" />
        <div className="about">
          <div>
            <p className="about__lede">
              I'm Andrei. I build AI systems that <em>actually ship</em> — and I do it across very different domains in parallel.
            </p>
            <div style={{ marginTop: 32, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Chip variant="accent">RAG · LLM pipelines</Chip>
              <Chip>Agentic workflows</Chip>
              <Chip variant="ember">Brain interfaces</Chip>
              <Chip>AWS · MLOps</Chip>
              <Chip>Robotics</Chip>
              <Chip>Quantum (next)</Chip>
            </div>
          </div>
          <div className="about__body">
            <p>
              I'm an AI Engineer based in Bucharest. Right now I'm contracting at <strong>London Stock Exchange Group</strong> on an LLM + web-search pipeline for corporate hierarchies, and working part-time at <strong>Deutsche Telekom</strong> on a context-aware RAG architecture that resolves customer queries 35% faster.
            </p>
            <p>
              Before that I led MLOps and platform work at <strong>CloudGeometry</strong>, co-built a software-engineer AI agent at <strong>Digital Nexus AI</strong>, and shipped a Finnish-language land-use AI for the <strong>Satakuntaliitto</strong> regional council during my time at RoboAI Academy.
            </p>
            <p>
              I also wrote a thesis on brain-computer interfaces (<strong>260+ downloads in 30 days</strong> on Theseus) and won <strong>1st place at Ultrahack DEFINE 2025</strong>. In September I move to Odense to start an MSc in Quantum Computing at SDU.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- CONTACT / FOOTER ---------------------------------------- */
export function Contact() {
  return (
    <section className="contact" id="contact">
      <div className="shell">
        <div style={{ fontFamily: "var(--ff-mono)", fontSize: 12, color: "var(--pulse)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 24 }}>
          06 / Contact
        </div>
        <h2 className="contact__display">
          Let's build something<br/>that <em>ships</em>.
        </h2>
        <div className="contact__row">
          <div className="contact__group">
            <span className="lbl">Email</span>
            <a href="mailto:lupica.andrei@gmail.com">lupica.andrei@gmail.com</a>
          </div>
          <div className="contact__group">
            <span className="lbl">Phone</span>
            <a href="tel:+40727293863">+40 727 293 863</a>
          </div>
          <div className="contact__group">
            <span className="lbl">LinkedIn</span>
            <a href="https://www.linkedin.com/in/andrei-lupica-413934193/" target="_blank" rel="noopener noreferrer">in/andrei-lupica</a>
          </div>
          <div className="contact__group">
            <span className="lbl">GitHub</span>
            <a href="https://github.com/clemaitoro" target="_blank" rel="noopener noreferrer">github.com/clemaitoro</a>
          </div>
          <div className="contact__group">
            <span className="lbl">Based in</span>
            <a href="#">Bucharest, RO → Odense, DK</a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="shell">
      <div className="footer">
        <span>© 2026 · Andrei Lupica · AI Engineer</span>
        <span>Bucharest → Odense · Currently shipping at LSEG + Deutsche Telekom</span>
      </div>
    </footer>
  );
}
