/* ============================================================
   App.jsx — composes the portfolio.
   ============================================================ */
import React from "react";
import {
  Nav, Hero, MarqueeTicker, SectionHeader, ProjectRow,
  FeaturedProject, Experience, Awards, About, Contact, Footer,
} from "./components.jsx";

export default function App() {
  const [focused, setFocused] = React.useState("lseg");

  const projects = [
    { id: "lseg",     num: "01", title: "London Stock Exchange · <em>Corporate-tree</em>", blurb: "An LLM + web-search pipeline that checks whether companies in a hierarchy still exist, have been renamed, merged or dissolved. Plus an evaluation framework + cost model.", meta: ["LSEG · Contract", "May 2026 – now", "AI Engineer"] },
    { id: "bci",      num: "02", title: "Minimal Command <em>AAC</em>",          blurb: "A speech tool for people who can only make a few small movements. Reads four facial gestures, turns them into phrases. Published thesis — cited in an Elsevier review paper (Biocybernetics and Biomedical Engineering).",                   meta: ["Bachelor thesis", "2025 – 26", "Solo"] },
    { id: "cloud",    num: "03", title: "<em>CloudGeometry</em>",                blurb: "Sub-second RAG pipelines on AWS (Bedrock + ECS + AuroraDB), multi-stage agent workflows, and a low-code platform that shipped 10+ NLP agents via Langflow + GPT / Claude / Gemini.",   meta: ["CloudGeometry", "Oct 2025 – May 2026", "AI & MLOps Engineer"] },
    { id: "telekom",  num: "04", title: "Deutsche <em>Telekom</em>",             blurb: "Enterprise ingestion + context-aware RAG: Dagster pipelines feeding Elasticsearch + MongoDB, dynamic conversational interfaces on top, 35% faster query resolution.",                 meta: ["Deutsche Telekom", "Aug 2025 – now", "Data Scientist · PT"] },
    { id: "hackathon",num: "05", title: "Ultrahack <em>DEFINE</em> · 1st place", blurb: "Camera-only, real-time wind prediction for bullet trajectories. ResNet-18 features + LSTM temporal drift → under 5° angular error in 48 hours.",                              meta: ["Ultrahack · powered by Sako", "May 2025", "Team lead"] },
    { id: "dnai",     num: "06", title: "Digital Nexus · <em>SWE Agent</em>",    blurb: "Co-built an AI software-engineer agent that turns feature tickets into validated pull requests. 42% faster PR turnaround, +25% test coverage from LLM-driven suggestions.",            meta: ["Digital Nexus AI", "Mar – Aug 2025", "Gen AI Engineer · Intern"] },
    { id: "rag",      num: "07", title: "Satakuntaliitto · <em>Land-use AI</em>",blurb: "A research assistant for a Finnish regional council. Generative-AI pipeline that drafts legal statements from prior land-use documents — cuts manual processing time by 70%.",  meta: ["RoboAI Academy", "Sep 2024 – Apr 2025", "AI/ML & Robotics"] },
  ];

  const featuredCopy = {
    rag: {
      eyebrow: "07 · RoboAI Academy · AI/ML & Robotics Engineer",
      headline: "A research assistant for Finnish land-use officers.",
      lede: "A generative-AI pipeline that drafts legal statements from prior land-use documents — cuts manual processing time by 70%.",
      year: "Sep 2024 – Apr 2025",
      role: "RoboAI Academy · w/ Leevi Kivimäki",
      stack: ["Gemini API", "ChromaDB", "Python", "Structured parsing"],
      source: "Satakuntaliitto regional council · RoboAI Academy partnership.",
      body: [
        "Satakuntaliitto's officers spend hours hunting through plans, statements, and regulations in Finnish. I built a generative-AI pipeline that reads the corpus, retrieves the right precedents, and drafts a statement — every claim attached to a source document.",
        "The same role also covered a remote-surveillance build on a Unitree Go2 over VPN (360° + thermal cameras) and 3D surface mapping via a UR5 + Gocator line scanner — but the Satakuntaliitto pipeline is the one that shipped to a real user.",
      ],
    },
    dnai: {
      eyebrow: "06 · Digital Nexus AI · Gen AI Engineer (Internship)",
      headline: "A software-engineer agent that ships its own pull requests.",
      lede: "Turns feature tickets into validated PRs — 42% faster turnaround, +25% test coverage.",
      year: "Mar – Aug 2025",
      role: "Internship · Gen AI Engineer",
      stack: ["Python", "GitHub Actions", "pytest", "OpenAI", "Agentic workflows"],
      source: "Digital Nexus AI · 6-month internship.",
      body: [
        "Co-developed an AI software-engineer agent that reads a feature ticket, generates the code, opens a pull request, and validates it against the project's test suite — average PR turnaround dropped 42%.",
        "Authored an evaluation harness on pytest + GitHub Actions that benchmarks generated output against coding standards before merge. LLM-driven code suggestions and validation steps also lifted overall test coverage by 25%.",
      ],
    },
    hackathon: {
      eyebrow: "05 · Ultrahack DEFINE · 1st place",
      headline: "Predict <em>wind</em> from a single camera.",
      lede: "A camera-only model that estimates wind drift in real time — to first place in 48 hours.",
      year: "May 2025",
      role: "Team lead · Ultrahack",
      stack: ["PyTorch", "ResNet-18", "LSTM", "OpenCV"],
      source: "Ultrahack DEFINE 2025 · powered by Sako · 1st place.",
      body: [
        "DEFINE asked teams to estimate the wind influence on a long-range bullet trajectory using only a camera — no anemometer, no radar. I led a small team to design a two-stage pipeline: a ResNet-18 extracted scene features from each frame, and an LSTM modelled the temporal drift across a short observation window.",
        "We hit under 5° of angular error on the held-out evaluation, took first place against international teams, and shipped the whole thing inside the 48-hour window.",
      ],
    },
    telekom: {
      eyebrow: "04 · Deutsche Telekom · Data Scientist (Part-Time)",
      headline: "Enterprise RAG that <em>predicts</em> what the user is asking.",
      lede: "A context-aware retrieval pipeline that resolves customer queries 35% faster.",
      year: "Aug 2025 – Present",
      role: "Part-time · Data Scientist",
      stack: ["Dagster", "Elasticsearch", "MongoDB", "OpenAI GPT", "Python", "LLMOps"],
      source: "Deutsche Telekom · ongoing engagement.",
      body: [
        "Built ingestion + processing pipelines that hit 99.9% uptime — Dagster orchestrating chunking, sorting, and indexing of raw unstructured data into Elasticsearch and MongoDB so downstream ML can use it.",
        "Designed a custom context-aware RAG architecture that links vectorised Elasticsearch data with the OpenAI GPT API. Predictive analytics anticipate query intent and cut resolution time by 35%. The same data source dynamically generates specialised conversational AI interfaces on demand.",
      ],
    },
    cloud: {
      eyebrow: "03 · CloudGeometry · AI & MLOps Engineer",
      headline: "Low-code AI platform · ten agents in production.",
      lede: "Sub-second RAG on AWS, multi-stage agent workflows, and a Langflow-based platform anyone on the team can deploy from.",
      year: "Oct 2025 – May 2026",
      role: "AI & MLOps Engineer",
      stack: ["AWS Bedrock", "ECS", "AuroraDB", "Langflow", "GPT / Claude / Gemini APIs", "Secrets Manager"],
      source: "CloudGeometry · full-time engagement.",
      body: [
        "Engineered scalable RAG pipelines with sub-second latency — AWS Bedrock for embeddings, ECS containers for orchestration, AuroraDB for vector search. Architected multi-stage agent workflows (chained prompts, external API validation, dynamic scoring) that cut manual evaluation time by 60%.",
        "Led architecture for a centralised low-code AI platform that lets teams deploy NLP agents via Langflow + Secrets Manager — 10+ custom agents shipped against the GPT, Claude, and Gemini APIs.",
      ],
    },
    bci: {
      eyebrow: "02 · Brain-computer interface · Thesis",
      headline: "Talk with a blink, a tap, a clench, or a raised brow.",
      lede: "A speech tool built for people whose body only allows a few small movements.",
      year: "2025 – 26",
      role: "Bachelor thesis · solo",
      stack: ["Python", "PyTorch", "BrainFlow", "OpenBCI", "Tkinter"],
      source: "Published on Theseus. Cited in an Elsevier review paper (Biocybernetics and Biomedical Engineering).",
      caseStudyUrl: "https://scholar.google.com/scholar?q=Lupica%20A.E..%20Minimal%20command%20AAC%3A%20comparing%20classic%20signal%20processing%20vs%20AI%20on%20minimal%20EEG%2FEMG.%20Bachelor%E2%80%99s%20thesis%2C%20Satakunta%20University%20of%20Applied%20Sciences%3B%202026.",
      body: [
        "Some people can't use a keyboard, a touchscreen, or reliably press a switch. They still want to say things. The system reads four small gestures — a blink, a finger tap, a clenched fist, a raised eyebrow — and turns them into navigation through a phrase tree, then speaks the chosen phrase out loud.",
        "The hardware is open and affordable. The detection runs in real time on a laptop. I also trained two AI models on the same data to see where learning beats hand-written rules — and where it doesn't.",
      ],
    },
    lseg: {
      eyebrow: "01 · London Stock Exchange · AI Engineer (Contract)",
      headline: "Check if a company still exists — automatically.",
      lede: "An LLM + web-search pipeline that verifies a corporate hierarchy against the live internet.",
      year: "May 2026 – Present",
      role: "Contract · solo",
      stack: ["Python", "RAG", "LLM web search", "Evaluation harness"],
      source: "London Stock Exchange Group · contract engagement.",
      body: [
        "LSEG keeps a giant graph of parent companies and their subsidiaries. Companies merge, rebrand, go bankrupt, get acquired — and the graph has to keep up. Doing it by hand is slow and expensive.",
        "Built a pipeline that searches the live web for every node in the tree, has an LLM read the results, and emits a structured diff with supporting links: unchanged, renamed, merged, dissolved, or unverifiable. Delivered with an evaluation framework (automated + human review), a cost-vs-scale model, and stakeholder presentations.",
      ],
    },
  };

  return (
    <div className="page">
      <Nav />
      <Hero />
      <MarqueeTicker />

      <section className="section" id="work">
        <div className="shell">
          <SectionHeader num="02 / Work" title="Seven shipped <em>engagements</em>." meta="Most recent first · LSEG · BCI · CloudGeometry · Telekom · Ultrahack · DN AI · Satakuntaliitto" />

          <div className="work-split">
            <div className="work-split__list">
              <div className="work-list work-list--compact">
                {projects.map(p => (
                  <ProjectRow
                    key={p.id}
                    num={p.num}
                    title={p.title}
                    blurb={p.blurb}
                    meta={p.meta}
                    isActive={focused === p.id}
                    onClick={() => {
                      setFocused(p.id);
                      // On narrow (stacked) layouts the panel sits below the list,
                      // so bring it into view. On the side-by-side desktop layout
                      // it's already visible, so this is a no-op there.
                      if (window.matchMedia("(max-width: 1079px)").matches) {
                        setTimeout(() => {
                          document.querySelector(".work-split__featured")?.scrollIntoView({ behavior: "smooth", block: "start" });
                        }, 50);
                      }
                    }}
                  />
                ))}
              </div>

              <div className="work-cue">
                <span>Showing <span className="pulse-txt">{featuredCopy[focused].eyebrow}</span></span>
                <span className="mono-dim">select a project →</span>
              </div>
            </div>

            <div className="work-split__featured">
              <FeaturedProject key={focused} sceneId={focused} project={featuredCopy[focused]} />
            </div>
          </div>
        </div>
      </section>

      <Experience />
      <Awards />
      <About />
      <Contact />
      <Footer />
    </div>
  );
}
