/* ==========================================================================
   Canvas FX — gold dust, petals & embers, golden confetti, plus shared tilt
   input (mouse / gyroscope). DPR is capped, loops pause off-screen.
   ========================================================================== */
import { env, clamp } from './utils.js';

/* ---------- Shared tilt input ---------- */
export const tilt = { x: 0, y: 0, gyro: false };
if (typeof window !== 'undefined') {
  window.addEventListener('mousemove', (e) => { tilt.x = (e.clientX / window.innerWidth) * 2 - 1; tilt.y = (e.clientY / window.innerHeight) * 2 - 1; }, { passive: true });
}
const onOrient = (e) => { if (e.gamma == null) return; tilt.gyro = true; tilt.x = clamp(e.gamma / 25, -1, 1); tilt.y = clamp((e.beta - 45) / 25, -1, 1); };
/* iOS requires this to be called from a tap — we call it when the seal is broken */
export function enableGyro() {
  const DOE = window.DeviceOrientationEvent;
  if (!DOE) return;
  if (typeof DOE.requestPermission === 'function') DOE.requestPermission().then((s) => s === 'granted' && window.addEventListener('deviceorientation', onOrient, { passive: true })).catch(() => {});
  else window.addEventListener('deviceorientation', onOrient, { passive: true });
}

/* ---------- Canvas loop helper ---------- */
function loop(canvas, { setup, frame, observe = true }) {
  const ctx = canvas.getContext('2d');
  const st = { ctx, w: 0, h: 0, t: 0, running: false, raf: 0 };
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, env.isMobile ? 1.5 : 1.75);
    st.w = canvas.clientWidth; st.h = canvas.clientHeight;
    canvas.width = Math.round(st.w * dpr); canvas.height = Math.round(st.h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    setup && setup(st);
  };
  let last = 0;
  const tick = (now) => {
    if (!st.running) return;
    const dt = Math.min(50, now - (last || now)); last = now; st.t += dt;
    frame(st, dt / 16.67);
    st.raf = requestAnimationFrame(tick);
  };
  st.start = () => { if (st.running) return; st.running = true; last = 0; st.raf = requestAnimationFrame(tick); };
  st.stop = () => { st.running = false; cancelAnimationFrame(st.raf); };
  resize();
  let rT; const onResize = () => { clearTimeout(rT); rT = setTimeout(resize, 200); };
  window.addEventListener('resize', onResize);
  let io;
  const onVis = () => document.hidden && st.stop();
  if (observe && 'IntersectionObserver' in window) {
    io = new IntersectionObserver(([en]) => (en.isIntersecting && !document.hidden ? st.start() : st.stop()));
    io.observe(canvas);
    document.addEventListener('visibilitychange', onVis);
  }
  st.destroy = () => { st.stop(); window.removeEventListener('resize', onResize); io && io.disconnect(); document.removeEventListener('visibilitychange', onVis); };
  return st;
}

function sprite(r, g, b, size) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const x = c.getContext('2d');
  const grd = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grd.addColorStop(0, 'rgba(255,248,225,1)'); grd.addColorStop(0.18, `rgba(${r},${g},${b},.9)`);
  grd.addColorStop(0.5, `rgba(${r},${g},${b},.18)`); grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
  x.fillStyle = grd; x.fillRect(0, 0, size, size);
  return c;
}
function petal(c1, c2, size) {
  const c = document.createElement('canvas'); c.width = size; c.height = size * 1.3;
  const x = c.getContext('2d'); const s = size / 2;
  x.translate(s, size * 0.65);
  const grd = x.createLinearGradient(-s, -s, s, s); grd.addColorStop(0, c1); grd.addColorStop(1, c2);
  x.fillStyle = grd; x.beginPath();
  x.moveTo(0, -s * 1.2); x.bezierCurveTo(s * 0.95, -s * 0.7, s * 0.8, s * 0.75, 0, s * 1.1); x.bezierCurveTo(-s * 0.8, s * 0.75, -s * 0.95, -s * 0.7, 0, -s * 1.2);
  x.fill();
  x.globalAlpha = 0.35; x.strokeStyle = 'rgba(255,255,255,.4)'; x.lineWidth = 0.8;
  x.beginPath(); x.moveTo(0, -s * 0.9); x.quadraticCurveTo(s * 0.12, 0, 0, s * 0.9); x.stroke();
  return c;
}

/* ---------- Hero gold dust (reacts to cursor / gyroscope) ---------- */
export function goldDust(canvas) {
  if (!canvas || env.reduced) return null;
  const N = env.isMobile ? 56 : 130;
  const spr = sprite(232, 190, 110, 64);
  const cur = { x: 0, y: 0 };
  let P = [];
  return loop(canvas, {
    setup(st) {
      P = Array.from({ length: N }, () => {
        const z = Math.pow(Math.random(), 1.6);
        return { x: Math.random() * st.w, y: Math.random() * st.h, z, s: 0.5 + z * 2.8, vy: -(0.05 + z * 0.32), ph: Math.random() * 6.28, tw: 0.6 + Math.random() * 1.8, sw: Math.random() * 0.6 };
      });
      for (let i = 0; i < (env.isMobile ? 4 : 8); i++) P.push({ x: Math.random() * st.w, y: Math.random() * st.h, z: 1.2, s: 9 + Math.random() * 10, vy: -0.08, ph: Math.random() * 6, tw: 0.3, sw: 0.2, bokeh: true });
    },
    frame(st, k) {
      const { ctx, w, h, t } = st;
      cur.x += (tilt.x - cur.x) * 0.04; cur.y += (tilt.y - cur.y) * 0.04;
      ctx.clearRect(0, 0, w, h); ctx.globalCompositeOperation = 'lighter';
      for (const p of P) {
        p.y += p.vy * k; p.x += Math.sin(t * 0.0004 + p.ph) * p.sw * 0.3 * k;
        if (p.y < -30) { p.y = h + 20; p.x = Math.random() * w; }
        const a = p.bokeh ? 0.07 : (0.22 + 0.78 * Math.min(1, p.z)) * (0.45 + 0.55 * Math.sin(t * 0.001 * p.tw + p.ph));
        if (a <= 0) continue;
        ctx.globalAlpha = a;
        const d = p.s * 6;
        ctx.drawImage(spr, p.x - cur.x * 46 * p.z - d / 2, p.y - cur.y * 34 * p.z - d / 2, d, d);
      }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    }
  });
}

/* ---------- Finale: falling rose petals + rising gold embers ---------- */
export function petalsAndEmbers(canvas) {
  if (!canvas || env.reduced) return null;
  const PN = env.isMobile ? 26 : 50, EN = env.isMobile ? 40 : 90;
  const sprites = [petal('#8c1c32', '#3d0710', 40), petal('#a3263d', '#5a0f1f', 40), petal('#6e1225', '#2a050c', 40), petal('#f2d9a0', '#a57b34', 34)];
  const ember = sprite(240, 180, 90, 48);
  let P = [], E = [];
  const newPetal = (s, init) => ({ x: Math.random() * s.w, y: init ? Math.random() * s.h : -30, s: 12 + Math.random() * 16, vy: 0.35 + Math.random() * 0.55, vx: (Math.random() - 0.5) * 0.3, r: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.02, f: Math.random() * 6.28, vf: 0.01 + Math.random() * 0.03, v: Math.random() < 0.2 ? 3 : (Math.random() * 3) | 0, a: 0.55 + Math.random() * 0.4, ph: Math.random() * 6 });
  const newEmber = (s, init) => ({ x: Math.random() * s.w, y: init ? Math.random() * s.h : s.h + 10, s: 2 + Math.random() * 5, vy: -(0.25 + Math.random() * 0.7), a: 0.3 + Math.random() * 0.6, tw: 0.5 + Math.random() * 2, ph: Math.random() * 6 });
  return loop(canvas, {
    setup(s) { P = Array.from({ length: PN }, () => newPetal(s, true)); E = Array.from({ length: EN }, () => newEmber(s, true)); },
    frame(s, k) {
      const { ctx, w, h, t } = s;
      ctx.clearRect(0, 0, w, h); ctx.globalCompositeOperation = 'lighter';
      for (const e of E) {
        e.y += e.vy * k; e.x += Math.sin(t * 0.001 + e.ph) * 0.25 * k;
        if (e.y < -20) Object.assign(e, newEmber(s));
        ctx.globalAlpha = Math.max(0, e.a * (0.5 + 0.5 * Math.sin(t * 0.003 * e.tw + e.ph)));
        ctx.drawImage(ember, e.x - e.s, e.y - e.s, e.s * 2, e.s * 2);
      }
      ctx.globalCompositeOperation = 'source-over';
      for (const p of P) {
        p.y += p.vy * k; p.x += (Math.sin(t * 0.0007 + p.ph) * 0.6 + p.vx) * k; p.r += p.vr * k; p.f += p.vf * k;
        if (p.y > h + 40) Object.assign(p, newPetal(s));
        ctx.save(); ctx.globalAlpha = p.a; ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.scale(Math.cos(p.f), 1);
        ctx.drawImage(sprites[p.v], -p.s / 2, -p.s * 0.65, p.s, p.s * 1.3); ctx.restore();
      }
    }
  });
}

/* ---------- Golden petal confetti (RSVP success) ---------- */
export function confetti(canvas) {
  if (!canvas || env.reduced) return;
  canvas.style.display = 'block';
  const sprites = [petal('#fff1c4', '#b8893b', 36), petal('#f0d38a', '#8a6527', 36), petal('#e8c97f', '#6f4f1d', 36), petal('#a3263d', '#4a0815', 36)];
  const N = env.isMobile ? 110 : 190;
  let P = [];
  const st = loop(canvas, {
    observe: false,
    setup(s) {
      if (P.length) return;
      P = Array.from({ length: N }, (_, i) => {
        const left = i % 2 === 0, ang = ((left ? -60 : -120) + (Math.random() - 0.5) * 40) * Math.PI / 180, sp = 9 + Math.random() * 11;
        return { x: left ? -10 : s.w + 10, y: s.h * (0.55 + Math.random() * 0.25), vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.2, f: Math.random() * 6, vf: 0.05 + Math.random() * 0.1, s: 10 + Math.random() * 12, v: Math.random() < 0.15 ? 3 : (Math.random() * 3) | 0, a: 1 };
      });
    },
    frame(s, k) {
      const { ctx, w, h } = s;
      ctx.clearRect(0, 0, w, h);
      let alive = 0;
      for (const p of P) {
        p.vx *= Math.pow(0.975, k); p.vy = Math.min(2.2, p.vy * Math.pow(0.975, k) + 0.16 * k);
        p.x += (p.vx + Math.sin(p.f) * 0.6) * k; p.y += p.vy * k; p.r += p.vr * k; p.f += p.vf * k;
        if (s.t > 4200) p.a -= 0.012 * k;
        if (p.a <= 0 || p.y > h + 40) continue;
        alive++;
        ctx.save(); ctx.globalAlpha = Math.max(0, p.a); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.scale(Math.cos(p.f), 1);
        ctx.drawImage(sprites[p.v], -p.s / 2, -p.s * 0.65, p.s, p.s * 1.3); ctx.restore();
      }
      if (!alive || s.t > 9000) { st.destroy(); ctx.clearRect(0, 0, w, h); canvas.style.display = 'none'; }
    }
  });
  st.start();
}
