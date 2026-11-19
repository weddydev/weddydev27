/* The couple's crest: double ring, laurel branches, interlaced initials.
   variant: "draw" (starts invisible, animated by GSAP) | "mini" | default.
   mono: render in currentColor instead of gold. */
import C from '../config.js';
import { parts, roman } from '../lib/utils.js';

function branch(from, to, side) {
  const r = 77, steps = 6, out = [];
  const pt = (deg) => [100 + r * Math.cos((deg * Math.PI) / 180), 100 + r * Math.sin((deg * Math.PI) / 180)];
  const [x1, y1] = pt(from), [x2, y2] = pt(to);
  out.push(<path key="stem" className="c-leaf" pathLength="1" d={`M${x1.toFixed(1)} ${y1.toFixed(1)} A${r} ${r} 0 0 ${side < 0 ? 1 : 0} ${x2.toFixed(1)} ${y2.toFixed(1)}`} />);
  for (let i = 1; i <= steps; i++) {
    const t = from + (to - from) * (i / (steps + 0.6));
    const [x, y] = pt(t);
    const base = side < 0 ? t + 180 : t;
    const sc = (1 - i * 0.045).toFixed(2);
    [-38, 38].forEach((tilt) =>
      out.push(<path key={`${i}${tilt}`} className="c-leaf" pathLength="1" transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(base + tilt).toFixed(1)}) scale(${sc})`} d="M0 0 Q4.6 -6 0 -13 Q-4.6 -6 0 0Z" />)
    );
  }
  return out;
}

export default function Monogram({ variant = '', mono = false, className = '' }) {
  const [a, b] = C.couple.initials;
  const mini = variant === 'mini';
  const year = (parts(C.date) || { y: 2026 }).y;
  return (
    <svg className={`crest ${variant === 'draw' ? 'is-drawing' : ''} ${mono ? 'crest-mono' : ''} block h-auto w-full overflow-visible ${className}`} viewBox="0 0 200 200" role="img" aria-label={`${a} & ${b} monogram`}>
      <circle className="c-line" pathLength="1" cx="100" cy="100" r="95" transform="rotate(-90 100 100)" />
      <circle className="c-line c-thin" pathLength="1" cx="100" cy="100" r="89" transform="rotate(90 100 100)" />
      {!mini && branch(103, 212, -1)}
      {!mini && branch(77, -32, 1)}
      <path className="c-dot" d="M100 24 L104.5 30 L100 36 L95.5 30Z" />
      <path className="c-line c-thin" pathLength="1" d="M76 30 H90 M110 30 H124" />
      <text className="c-letter l1" x="83" y="128" textAnchor="middle">{a}</text>
      <text className="c-letter l2" x="119" y="134" textAnchor="middle">{b}</text>
      {!mini && <text className="c-year" x="100" y="160" textAnchor="middle">{roman(year)}</text>}
    </svg>
  );
}

/* Timeline helper: draw a crest inside `root` */
export function drawCrest(gsap, root, k = 1) {
  const q = (s) => root.querySelectorAll(s);
  return gsap.timeline({ defaults: { ease: 'power2.inOut' } })
    .to(q('.c-line'), { strokeDashoffset: 0, duration: 2.4 * k, stagger: 0.25 * k }, 0.2)
    .to(q('.c-leaf'), { strokeDashoffset: 0, duration: 1.3 * k, stagger: 0.03 * k, ease: 'power2.out' }, 0.8 * k)
    .to(q('.c-letter'), { strokeDashoffset: 0, duration: 2.2 * k, stagger: 0.3 * k }, 0.5 * k)
    .to(q('.c-letter'), { fillOpacity: 1, duration: 1.4 * k, ease: 'power1.inOut' }, 2.1 * k)
    .to(q('.c-dot, .c-year'), { opacity: 1, duration: 1 * k }, 2.3 * k);
}
