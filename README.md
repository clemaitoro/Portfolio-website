# Andrei Lupica — Portfolio

Personal portfolio for **Andrei Lupica — AI Engineer**. Dark-mode, instrument-style,
hairline-heavy. Single-page, scroll-driven, with real CSS-3D hero shapes and
per-project interactive demos.

Built from the `lupica-portfolio-design` design system handoff bundle (Claude Design).

## Stack

- **Vite** + **React 18** (production port of the design prototype).
- Pure CSS-3D for the hero / BCI scenes — no WebGL.
- Design tokens in `src/styles/colors_and_type.css`; site styles in `src/styles/kit.css`.

## Run

```bash
npm install
npm run dev       # dev server (default http://localhost:5173)
npm run build     # production build → dist/
npm run preview   # serve the production build
```

## Structure

| Path | What |
| --- | --- |
| `src/App.jsx` | Composes the page; owns project data + the focused-project state. |
| `src/components.jsx` | `Nav`, `Hero`, `MarqueeTicker`, `SectionHeader`, `ProjectRow`, `FeaturedProject`, `BCIDemo`, `Experience`, `Awards`, `About`, `Contact`, `Footer`. |
| `src/scenes.jsx` | Hero 3D scene, BCI 3D scene, and the interactive 2D project demos (RAG, LSEG, Telekom, CloudGeometry, Digital Nexus, Hackathon). |
| `src/shapes3d.jsx` | Reusable CSS-3D primitives: `Cube`, `Octahedron`, `WireSphere`, `DotCloud`, `Stage3D`, `Float3D`. |
| `src/styles/` | `colors_and_type.css` (tokens) + `kit.css` (components). |
| `public/assets/` | Logo marks + brand glyph icons. |

## Sections

Hero → skills marquee → **Work** (7 engagements, click a row to load its scene/demo)
→ **Experience** timeline → **Awards** → **About** → **Contact**.

## Known placeholders

- LinkedIn / GitHub links in `Contact` point to `#` — real URLs pending.
- Project demos use representative sample content (questions, tickets, corporate
  tree), not live data.
