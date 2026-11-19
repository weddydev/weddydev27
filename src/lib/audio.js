/* ==========================================================================
   Audio — muted by default. Plays config.music.src if set, otherwise a
   generative ambient score (slow pad chords + distant bells, WebAudio).
   Sound effects (seal crack, paper, chime, whoosh) only play when on.
   ========================================================================== */
import C from '../config.js';

let ctx = null, master = null, wet = null, dry = null, on = false, el = null, timer = 0, nextAt = 0, idx = 0;
const VOL = (C.music && C.music.volume) || 0.55;
const listeners = new Set();
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

// Dmaj9 → Bm9 → Gmaj7(#11) → A6/9sus : warm, unresolved, cinematic
const CHORDS = [[38, 45, 54, 61, 64], [35, 42, 50, 57, 61], [31, 38, 47, 54, 61], [33, 40, 47, 54, 62]];
const BELLS = [[74, 78, 81, 85, 88], [71, 74, 78, 81, 85], [71, 74, 78, 79, 83], [69, 74, 76, 78, 81]];

function ensure() {
  if (ctx) return true;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return false;
  ctx = new AC();
  master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
  const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3; comp.connect(master);
  dry = ctx.createGain(); dry.gain.value = 0.7; dry.connect(comp);
  const conv = ctx.createConvolver();
  const len = ctx.sampleRate * 4, buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) { const d = buf.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.8); }
  conv.buffer = buf;
  wet = ctx.createGain(); wet.gain.value = 0.9; conv.connect(wet); wet.connect(comp); wet.input = conv;
  return true;
}

function voice(freq, start, dur, { type = 'sine', gain = 0.05, attack = 2.5, release = 4, cutoff = 1400 } = {}) {
  const o = ctx.createOscillator(); o.type = type; o.frequency.value = freq; o.detune.value = (Math.random() - 0.5) * 8;
  const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = cutoff; f.Q.value = 0.3;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, start); g.gain.linearRampToValueAtTime(gain, start + attack);
  g.gain.setValueAtTime(gain, start + Math.max(attack, dur - release)); g.gain.linearRampToValueAtTime(0, start + dur);
  o.connect(f); f.connect(g); g.connect(dry);
  const s = ctx.createGain(); s.gain.value = 0.6; g.connect(s); s.connect(wet.input);
  o.start(start); o.stop(start + dur + 0.1);
}
function bell(freq, start, gain = 0.028) {
  [1, 2.76, 5.4].forEach((r, i) => {
    const o = ctx.createOscillator(); o.frequency.value = freq * r;
    const g = ctx.createGain(); const a = gain / (i * 2.2 + 1);
    g.gain.setValueAtTime(0, start); g.gain.linearRampToValueAtTime(a, start + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, start + 4.5 - i);
    o.connect(g); g.connect(wet.input); const d = ctx.createGain(); d.gain.value = 0.25; g.connect(d); d.connect(dry);
    o.start(start); o.stop(start + 5);
  });
}
function schedule() {
  while (nextAt < ctx.currentTime + 1.5) {
    const t = nextAt, dur = 10.5;
    CHORDS[idx % 4].forEach((m, i) => voice(mtof(m), t, dur + 3, { type: i < 2 ? 'sine' : 'triangle', gain: i < 2 ? 0.055 : 0.022, attack: 3.2, release: 4.5, cutoff: 900 + i * 160 }));
    const bl = BELLS[idx % 4];
    for (let k = 0; k < 4; k++) if (Math.random() < 0.8) bell(mtof(bl[(Math.random() * bl.length) | 0]), t + 1.2 + k * 2.3 + Math.random() * 0.6);
    idx++; nextAt += dur;
  }
}
function fadeEl(to) {
  if (!el) return;
  const from = el.volume, t0 = performance.now();
  const step = (now) => { const k = Math.min(1, (now - t0) / 1800); el.volume = from + (to - from) * k; if (k < 1) requestAnimationFrame(step); else if (!to) el.pause(); };
  requestAnimationFrame(step);
}
function set(state) {
  on = state;
  if (on) {
    if (!ensure()) return;
    ctx.resume();
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(C.music?.src ? 1 : VOL, ctx.currentTime, 0.9);
    if (C.music?.src) {
      if (!el) { el = new Audio(C.music.src); el.loop = true; el.volume = 0; }
      el.play().catch(() => {}); fadeEl(VOL);
    } else if (!timer) { nextAt = ctx.currentTime + 0.1; schedule(); timer = setInterval(schedule, 500); }
  } else if (ctx) {
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(0, ctx.currentTime, 0.5);
    fadeEl(0);
  }
  listeners.forEach((fn) => fn(on));
}

function noise(dur) {
  const b = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const s = ctx.createBufferSource(); s.buffer = b; return s;
}
const SFX = {
  crack() {
    const t = ctx.currentTime;
    const n = noise(0.35), bp = ctx.createBiquadFilter(), g = ctx.createGain();
    bp.type = 'bandpass'; bp.frequency.value = 2200; bp.Q.value = 0.8;
    g.gain.setValueAtTime(0.55, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    n.connect(bp); bp.connect(g); g.connect(dry); g.connect(wet.input); n.start(t);
    const o = ctx.createOscillator(), og = ctx.createGain();
    o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(38, t + 0.25);
    og.gain.setValueAtTime(0.5, t); og.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    o.connect(og); og.connect(dry); o.start(t); o.stop(t + 0.35);
  },
  paper() {
    const t = ctx.currentTime;
    const n = noise(1.3), bp = ctx.createBiquadFilter(), g = ctx.createGain();
    bp.type = 'bandpass'; bp.frequency.setValueAtTime(700, t); bp.frequency.linearRampToValueAtTime(2400, t + 1.1); bp.Q.value = 0.6;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.12, t + 0.4); g.gain.linearRampToValueAtTime(0, t + 1.25);
    n.connect(bp); bp.connect(g); g.connect(dry); n.start(t);
  },
  chime() { const t = ctx.currentTime; [74, 81, 86, 90].forEach((m, i) => bell(mtof(m), t + i * 0.14, 0.05)); },
  whoosh() {
    const t = ctx.currentTime;
    const n = noise(1.6), lp = ctx.createBiquadFilter(), g = ctx.createGain();
    lp.type = 'lowpass'; lp.frequency.setValueAtTime(200, t); lp.frequency.exponentialRampToValueAtTime(3000, t + 0.9); lp.frequency.exponentialRampToValueAtTime(300, t + 1.5);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.18, t + 0.7); g.gain.linearRampToValueAtTime(0, t + 1.55);
    n.connect(lp); lp.connect(g); g.connect(dry); g.connect(wet.input); n.start(t);
  }
};

export const audio = {
  get on() { return on; },
  toggle() { set(!on); },
  sfx(name) { if (on && ctx && SFX[name]) { try { SFX[name](); } catch { /* ignore */ } } },
  subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }
};

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (!ctx || !on) return;
    if (document.hidden) { ctx.suspend(); el && el.pause(); } else { ctx.resume(); el && el.play().catch(() => {}); }
  });
}
