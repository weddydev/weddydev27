/* Small shared building blocks */
import { Fragment } from 'react';

/* "*word*" → gold italic, "~word~" → outlined. Config strings only. */
export function Rich({ text, emClass = 'gold-text' }) {
  const parts = String(text || '').split(/(\*[^*]+\*|~[^~]+~)/);
  return parts.map((p, i) => {
    if (/^\*.*\*$/.test(p)) return <em key={i} className={`italic ${emClass}`}>{p.slice(1, -1)}</em>;
    if (/^~.*~$/.test(p)) return <span key={i} className="text-outline">{p.slice(1, -1)}</span>;
    return <Fragment key={i}>{p}</Fragment>;
  });
}

/* Hairline kicker label above section titles */
export function Kicker({ children, center = false, className = '' }) {
  return <p className={`eyebrow kicker ${center ? 'kicker-center' : ''} ${className}`}>{children}</p>;
}

/* Four ornamental gold corners for frames */
export function Corners({ size = 58 }) {
  const s = { width: size, height: size };
  return (
    <>
      <span className="orn-corner -left-px -top-px" style={s} />
      <span className="orn-corner -right-px -top-px -scale-x-100" style={s} />
      <span className="orn-corner -left-px -bottom-px -scale-y-100" style={s} />
      <span className="orn-corner -right-px -bottom-px -scale-100" style={s} />
    </>
  );
}

/* Hand-drawn underline */
export function Squiggle() {
  return (
    <svg viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true">
      <path pathLength="1" d="M1 6 C 20 2, 38 9, 55 5 S 88 3, 99 6" />
    </svg>
  );
}

/* Shared SVG paint servers (gold, wax) */
export function SvgDefs() {
  return (
    <svg className="absolute h-0 w-0 overflow-hidden" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="g-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7a5822" /><stop offset=".22" stopColor="#d9b56a" />
          <stop offset=".42" stopColor="#fbeec3" /><stop offset=".58" stopColor="#c39444" />
          <stop offset=".8" stopColor="#f1d995" /><stop offset="1" stopColor="#8a6527" />
        </linearGradient>
        <radialGradient id="g-wax" cx=".38" cy=".32" r=".8">
          <stop offset="0" stopColor="#b23a4c" /><stop offset=".35" stopColor="#7d1428" />
          <stop offset=".75" stopColor="#4a0815" /><stop offset="1" stopColor="#2b040b" />
        </radialGradient>
        <radialGradient id="g-wax-sheen" cx=".3" cy=".25" r=".5">
          <stop offset="0" stopColor="#fff" stopOpacity=".55" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}
