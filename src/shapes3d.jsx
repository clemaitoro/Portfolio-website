/* ============================================================
   shapes3d.jsx — Reusable real-3D primitives, pure CSS.
   Built with `transform-style: preserve-3d` so they actually
   come off the screen. Use inside a parent that has perspective
   set on it (e.g. perspective: 1400px).
   ============================================================ */
import React from "react";

/* useMouseParallax — returns {mx, my} normalized to -1..1.
   Pass an optional ref to track on a specific element; otherwise tracks the window. */
export function useMouseParallax(ref) {
  const [pos, setPos] = React.useState({ mx: 0, my: 0 });
  React.useEffect(() => {
    let raf = 0;
    const handler = (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const target = ref?.current;
        if (target) {
          const r = target.getBoundingClientRect();
          setPos({
            mx: ((e.clientX - r.left) / r.width  - 0.5) * 2,
            my: ((e.clientY - r.top)  / r.height - 0.5) * 2,
          });
        } else {
          setPos({
            mx: (e.clientX / window.innerWidth  - 0.5) * 2,
            my: (e.clientY / window.innerHeight - 0.5) * 2,
          });
        }
      });
    };
    window.addEventListener("mousemove", handler, { passive: true });
    return () => { cancelAnimationFrame(raf); window.removeEventListener("mousemove", handler); };
  }, [ref]);
  return pos;
}

/* useSpin — auto-rotation hook. Returns [rx, ry, rz] in degrees. */
export function useSpin({ rx = 0, ry = 0.2, rz = 0, paused = false } = {}) {
  const [t, setT] = React.useState(0);
  React.useEffect(() => {
    if (paused) return;
    let raf, last = performance.now();
    const tick = (now) => {
      setT(prev => prev + (now - last) * 0.06);
      last = now;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused]);
  return [t * rx, t * ry, t * rz];
}

/* ---------- Cube ----------------------------------------------------- */
/* A wireframe cube. `size` = px edge length. Faces have only borders. */
export function Cube({ size = 220, color = "#6DF3D7", thickness = 1, opacity = 1, style }) {
  const s = size, half = s / 2;
  const face = {
    position: "absolute",
    inset: 0,
    width: s,
    height: s,
    border: `${thickness}px solid ${color}`,
    boxSizing: "border-box",
    opacity,
    background: "transparent",
  };
  return (
    <div style={{ width: s, height: s, position: "relative", transformStyle: "preserve-3d", ...style }}>
      <div style={{ ...face, transform: `translateZ(${half}px)` }} />
      <div style={{ ...face, transform: `translateZ(-${half}px) rotateY(180deg)` }} />
      <div style={{ ...face, transform: `rotateY(90deg) translateZ(${half}px)` }} />
      <div style={{ ...face, transform: `rotateY(-90deg) translateZ(${half}px)` }} />
      <div style={{ ...face, transform: `rotateX(90deg) translateZ(${half}px)` }} />
      <div style={{ ...face, transform: `rotateX(-90deg) translateZ(${half}px)` }} />
    </div>
  );
}

/* ---------- Octahedron ----------------------------------------------- */
/* True wireframe octahedron built from 3 perpendicular great-squares.
   Each square's 4 edges (rotated 45° in its own plane) trace 4 of the
   12 octahedron edges. Together they form all 12 — clean & solid in 3D. */
export function Octahedron({ size = 200, color = "#6DF3D7", thickness = 1, style }) {
  const r = size / 2;
  // square side so its diagonal reaches vertex distance r → side = r * √2
  const side = r * Math.SQRT2;
  const faceBase = {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: side,
    height: side,
    marginLeft: -side / 2,
    marginTop:  -side / 2,
    border: `${thickness}px solid ${color}`,
    boxSizing: "border-box",
    background: "transparent",
  };
  return (
    <div style={{ width: size, height: size, position: "relative", transformStyle: "preserve-3d", ...style }}>
      {/* Plane in XY — corners at (±r,0,0), (0,±r,0) */}
      <div style={{ ...faceBase, transform: "rotateZ(45deg)" }} />
      {/* Plane in XZ — corners at (±r,0,0), (0,0,±r) */}
      <div style={{ ...faceBase, transform: "rotateX(90deg) rotateZ(45deg)" }} />
      {/* Plane in YZ — corners at (0,±r,0), (0,0,±r) */}
      <div style={{ ...faceBase, transform: "rotateY(90deg) rotateZ(45deg)" }} />
    </div>
  );
}

/* ---------- Wireframe sphere built from rings ------------------------ */
export function WireSphere({ size = 240, color = "#6DF3D7", thickness = 1, rings = 6, opacity = 1, style }) {
  const s = size;
  return (
    <div style={{ width: s, height: s, position: "relative", transformStyle: "preserve-3d", ...style }}>
      {/* horizontal rings */}
      {Array.from({ length: rings }).map((_, i) => {
        const phi = ((i + 0.5) / rings - 0.5) * Math.PI; // -π/2 .. π/2
        const r = Math.cos(phi) * (s / 2);
        const y = Math.sin(phi) * (s / 2);
        return (
          <div key={"h"+i} style={{
            position: "absolute", left: "50%", top: "50%",
            width: r * 2, height: r * 2,
            transform: `translate(-50%, -50%) translateY(${y}px) rotateX(90deg)`,
            border: `${thickness}px solid ${color}`,
            borderRadius: "50%",
            opacity,
            boxSizing: "border-box",
          }} />
        );
      })}
      {/* meridians (vertical great circles, rotated about Y) */}
      {Array.from({ length: rings }).map((_, i) => {
        const ang = (i / rings) * 180;
        return (
          <div key={"m"+i} style={{
            position: "absolute", left: "50%", top: "50%",
            width: s, height: s,
            transform: `translate(-50%, -50%) rotateY(${ang}deg)`,
            border: `${thickness}px solid ${color}`,
            borderRadius: "50%",
            opacity: opacity * 0.85,
            boxSizing: "border-box",
          }} />
        );
      })}
    </div>
  );
}

/* ---------- Dot cloud — points scattered in 3D space ----------------- */
export function DotCloud({ count = 80, radius = 280, color = "#6DF3D7", size = 3, style, seed = 7 }) {
  const dots = React.useMemo(() => {
    const out = [];
    let s = seed;
    const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    for (let i = 0; i < count; i++) {
      // distribute via fibonacci sphere then jitter radius for cloud feel
      const k = i + 0.5;
      const phi = Math.acos(1 - 2 * k / count);
      const theta = Math.PI * (1 + Math.sqrt(5)) * k;
      const r = radius * (0.6 + rand() * 0.5);
      out.push({
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.sin(phi) * Math.sin(theta),
        z: r * Math.cos(phi),
        s: size * (0.6 + rand() * 0.9),
        hi: rand() < 0.18,
      });
    }
    return out;
  }, [count, radius, size, seed]);
  return (
    <div style={{ position: "relative", width: 0, height: 0, transformStyle: "preserve-3d", ...style }}>
      {dots.map((d, i) => (
        <div key={i} style={{
          position: "absolute",
          width: d.s, height: d.s,
          borderRadius: "50%",
          background: d.hi ? "#6DF3D7" : color,
          opacity: d.hi ? 0.95 : 0.45,
          boxShadow: d.hi ? `0 0 12px ${color}` : "none",
          transform: `translate3d(${d.x}px, ${d.y}px, ${d.z}px) translate(-50%, -50%)`,
        }} />
      ))}
    </div>
  );
}

/* ---------- Stage — applies perspective + parallax + spin to children */
export function Stage3D({ children, perspective = 1400, parallaxStrength = 14, spinRate = 0.05, paused = false, style }) {
  const ref = React.useRef(null);
  const { mx, my } = useMouseParallax(ref);
  const [t, setT] = React.useState(0);
  React.useEffect(() => {
    if (paused) return;
    let raf, last = performance.now();
    const tick = (now) => { setT(p => p + (now - last) * spinRate * 0.06); last = now; raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [spinRate, paused]);
  return (
    <div ref={ref} className="stage3d" style={{
      position: "absolute", inset: 0, perspective: `${perspective}px`, perspectiveOrigin: "50% 50%",
      ...style
    }}>
      <div style={{
        position: "absolute", inset: 0, transformStyle: "preserve-3d",
        transform: `rotateX(${my * -parallaxStrength}deg) rotateY(${mx * parallaxStrength}deg)`,
        transition: "transform 220ms cubic-bezier(0.2,0.7,0.2,1)",
      }}>
        {typeof children === "function" ? children({ t, mx, my }) : children}
      </div>
    </div>
  );
}

/* ---------- Helper: float-and-rotate wrapper ------------------------- */
export function Float3D({ children, x = 0, y = 0, z = 0, t = 0, rx = 0, ry = 0, rz = 0, scale = 1, style }) {
  return (
    <div style={{
      position: "absolute", left: "50%", top: "50%",
      transformStyle: "preserve-3d",
      transform: `translate3d(${x}px, ${y}px, ${z}px) translate(-50%, -50%) rotateX(${t * rx}deg) rotateY(${t * ry}deg) rotateZ(${t * rz}deg) scale(${scale})`,
      ...style,
    }}>
      {children}
    </div>
  );
}
