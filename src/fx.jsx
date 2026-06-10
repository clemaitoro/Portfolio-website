/* ============================================================
   fx.jsx — motion utilities: scroll reveals, magnetic hover,
   3D tilt cards. All effects respect prefers-reduced-motion
   (the global CSS kill-switch zeroes durations; JS effects
   bail out entirely).
   ============================================================ */
import React from "react";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/* useInView — true once the element has scrolled into view (fires once). */
export function useInView(ref, { threshold = 0.12, rootMargin = "0px 0px -8% 0px" } = {}) {
  const [inView, setInView] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) { setInView(true); return; }
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { threshold, rootMargin });
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, threshold, rootMargin]);
  return inView;
}

/* Reveal — fades/rises its content when scrolled into view.
   Children with the `reveal-stagger` pattern animate individually
   via the `--stagger` custom property (see kit.css). */
export function Reveal({ as: Tag = "div", className = "", delay = 0, y = 24, children, style, ...rest }) {
  const ref = React.useRef(null);
  const inView = useInView(ref);
  return (
    <Tag
      ref={ref}
      className={"reveal" + (inView ? " is-in" : "") + (className ? " " + className : "")}
      style={{ "--reveal-delay": `${delay}ms`, "--reveal-y": `${y}px`, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/* useMagnetic — element subtly follows the cursor while hovered. */
export function useMagnetic(strength = 0.18) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const move = (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) * strength;
      const y = (e.clientY - (r.top + r.height / 2)) * strength;
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    };
    const leave = () => { el.style.transform = "translate(0, 0)"; };
    el.addEventListener("mousemove", move, { passive: true });
    el.addEventListener("mouseleave", leave);
    return () => { el.removeEventListener("mousemove", move); el.removeEventListener("mouseleave", leave); };
  }, [strength]);
  return ref;
}

/* TiltCard — tilts in 3D toward the cursor and exposes --mx/--my
   (cursor position in %) for glow effects in CSS. */
export function TiltCard({ as: Tag = "div", className = "", max = 6, children, style, ...rest }) {
  const ref = React.useRef(null);
  const onMove = (e) => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--tilt-x", `${(-py * max).toFixed(2)}deg`);
    el.style.setProperty("--tilt-y", `${(px * max).toFixed(2)}deg`);
    el.style.setProperty("--mx", `${((px + 0.5) * 100).toFixed(1)}%`);
    el.style.setProperty("--my", `${((py + 0.5) * 100).toFixed(1)}%`);
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--tilt-x", "0deg");
    el.style.setProperty("--tilt-y", "0deg");
  };
  return (
    <Tag ref={ref} className={"tilt" + (className ? " " + className : "")}
      onMouseMove={onMove} onMouseLeave={onLeave} style={style} {...rest}>
      {children}
    </Tag>
  );
}
