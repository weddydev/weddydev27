/* Metallic burgundy wax seal with an organic edge and gilded initials */
import C from '../config.js';

const blob = (() => {
  const N = 30, pts = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const r = 46 + Math.sin(i * 2.7) * 1.8 + Math.cos(i * 1.3) * 1.4 + (i % 3 === 0 ? 1.4 : 0);
    pts.push([50 + r * Math.cos(a), 50 + r * Math.sin(a)]);
  }
  const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  let d = '';
  for (let i = 0; i < N; i++) {
    const p = pts[i], n = pts[(i + 1) % N], n2 = pts[(i + 2) % N];
    if (i === 0) { const m = mid(p, n); d += `M${m[0].toFixed(2)} ${m[1].toFixed(2)}`; }
    const m2 = mid(n, n2);
    d += ` Q${n[0].toFixed(2)} ${n[1].toFixed(2)} ${m2[0].toFixed(2)} ${m2[1].toFixed(2)}`;
  }
  return d + 'Z';
})();

export default function WaxSeal() {
  const [a, b] = C.couple.initials;
  const letters = <>{a}<tspan fontStyle="italic">{b}</tspan></>;
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <path d={blob} fill="url(#g-wax)" />
      <circle cx="50" cy="50" r="34" fill="none" stroke="rgba(0,0,0,.35)" strokeWidth="2.4" />
      <circle cx="49.4" cy="49.4" r="34" fill="none" stroke="rgba(255,190,190,.16)" strokeWidth="1" />
      <circle cx="50" cy="50" r="30" fill="none" stroke="url(#g-gold)" strokeWidth=".5" opacity=".75" />
      <text x="51" y="61" textAnchor="middle" fontFamily="Bodoni Moda, Didot, serif" fontSize="30" fill="rgba(0,0,0,.45)">{letters}</text>
      <text x="50" y="60" textAnchor="middle" fontFamily="Bodoni Moda, Didot, serif" fontSize="30" fill="url(#g-gold)">{letters}</text>
      <ellipse cx="38" cy="32" rx="22" ry="15" fill="url(#g-wax-sheen)" opacity=".5" />
    </svg>
  );
}
