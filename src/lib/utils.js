/* ==========================================================================
   Utilities — environment, formatting, personalisation, theme
   ========================================================================== */
import C from '../config.js';

const mm = (q) => typeof window !== 'undefined' && window.matchMedia(q).matches;
export const env = {
  reduced: mm('(prefers-reduced-motion: reduce)'),
  finePointer: mm('(hover: hover) and (pointer: fine)'),
  isMobile: mm('(max-width: 899px)')
};

export const EASE = 'power4.out';        // ≈ cubic-bezier(.22,1,.36,1)
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const wait = (ms) => new Promise((r) => setTimeout(r, ms));
export const plain = (s) => String(s || '').replace(/[*~]/g, '');
export const buzz = (p) => { try { navigator.vibrate && navigator.vibrate(p); } catch { /* unsupported */ } };

export const store = {
  get: (k) => { try { return sessionStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { sessionStorage.setItem(k, v); } catch { /* private mode */ } },
  del: (k) => { try { sessionStorage.removeItem(k); } catch { /* noop */ } }
};

/* ---------- Personalised guest from ?guest=Name (or ?g=). React escapes it on render. ---------- */
export const guest = (() => {
  try {
    const p = new URLSearchParams(window.location.search);
    return (p.get('guest') || p.get('g') || '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 90);
  } catch { return ''; }
})();
export const fill = (tpl, name) => String(tpl || '').replace(/\{guest\}/g, name || guest || 'a guest');

/* ---------- Unsplash sizing ---------- */
export const img = (url, w = 1400, q = 72) =>
  url && /images\.unsplash\.com/.test(url) && !url.includes('?') ? `${url}?auto=format&fit=crop&w=${w}&q=${q}` : url;
export const srcSet = (url) =>
  url && /images\.unsplash\.com/.test(url) && !url.includes('?') ? [640, 1000, 1600, 2200].map((w) => `${img(url, w)} ${w}w`).join(', ') : undefined;

/* ---------- Dates (always shown in the venue's local time) ---------- */
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const ORD = ['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth', 'twentieth', 'twenty-first', 'twenty-second', 'twenty-third', 'twenty-fourth', 'twenty-fifth', 'twenty-sixth', 'twenty-seventh', 'twenty-eighth', 'twenty-ninth', 'thirtieth', 'thirty-first'];
const HOURS = ['twelve', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven'];

export const roman = (n) => {
  const map = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
  let out = ''; n = +n;
  map.forEach(([v, s]) => { while (n >= v) { out += s; n -= v; } });
  return out;
};
export const parts = (iso) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(iso || '');
  if (!m) return null;
  const [y, mo, d, h, mi] = m.slice(1).map(Number);
  return { y, mo, d, h, mi, weekday: DAYS[new Date(Date.UTC(y, mo - 1, d)).getUTCDay()], month: MONTHS[mo - 1] };
};
export const time = (iso) => {
  const p = parts(iso); if (!p) return '';
  return `${p.h % 12 || 12}:${String(p.mi).padStart(2, '0')} ${p.h < 12 ? 'AM' : 'PM'}`;
};
export const fmt = {
  dots: (iso) => { const p = parts(iso); return p ? `${String(p.d).padStart(2, '0')}.${String(p.mo).padStart(2, '0')}.${p.y}` : ''; },
  short: (iso) => { const p = parts(iso); return p ? `${p.weekday} · ${p.d} ${p.month} ${p.y}` : ''; },
  dayMonth: (iso) => { const p = parts(iso); return p ? `${p.weekday}, ${p.d} ${p.month}` : ''; },
  long: (iso) => {
    const p = parts(iso); if (!p) return '';
    const period = p.h < 12 ? 'in the morning' : p.h < 17 ? 'in the afternoon' : 'in the evening';
    const t = p.mi === 0 ? `${HOURS[p.h % 12]} o’clock ${period}` : time(iso);
    return `${p.weekday}, the ${ORD[p.d]} of ${p.month} · ${roman(p.y)} · ${t}`;
  }
};

/* ---------- Theme from config → Tailwind's CSS variables ---------- */
export const applyTheme = () => {
  const t = C.theme || {};
  const r = document.documentElement.style;
  if (t.obsidian) r.setProperty('--color-obsidian', t.obsidian);
  if (t.ivory) r.setProperty('--color-ivory', t.ivory);
  if (t.gold) r.setProperty('--color-gold', t.gold);
  if (t.accent) r.setProperty('--color-burgundy', t.accent);
  if (t.accentDeep) r.setProperty('--color-burgundy-deep', t.accentDeep);
};

/* ---------- Film grain tile ---------- */
export const makeGrain = () => {
  try {
    const c = document.createElement('canvas'); c.width = c.height = 180;
    const x = c.getContext('2d'); const d = x.createImageData(180, 180);
    for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
    x.putImageData(d, 0, 0);
    document.documentElement.style.setProperty('--noise', `url(${c.toDataURL('image/png')})`);
  } catch { /* canvas blocked */ }
};
