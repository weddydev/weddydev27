/* COUNTDOWN — huge rolling digits in an ornamental gold frame that glows each second.
   Digits are true odometers: they always roll forward one notch (59 → 00 never rolls
   backwards through every number), and the glow is a GPU-faded layer, not a repaint. */
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import C from '../config.js';
import { env, fmt } from '../lib/utils.js';
import { Corners, Kicker, Rich } from '../components/Ui.jsx';
import { Lines, Reveal } from '../components/Reveal.jsx';

const UNITS = [['Days', 864e5], ['Hours', 36e5], ['Minutes', 6e4], ['Seconds', 1e3]];
const target = new Date(C.date).getTime();
const calc = () => {
  let diff = target - Date.now();
  if (diff <= 0) return null;
  return UNITS.map(([, ms]) => { const v = Math.floor(diff / ms); diff -= v * ms; return v; });
};

/* numeric base of each digit column: tens of hours 0–2, tens of minutes/seconds 0–5 */
const baseFor = (unit, j, len) => {
  if (unit === 0 || j === len - 1) return 10;
  return unit === 1 ? 3 : 6;
};

/* One odometer column. The strip holds the digits twice; we live in the second copy so a
   decrement can always move one step down, then silently re-centre after a wrap. */
function Digit({ value, base, fast }) {
  const strip = useRef(null);
  const pos = useRef(base + value);
  const prev = useRef(value);
  const step = 100 / (base * 2);
  const place = (el, p, animate) => {
    el.style.transition = animate ? '' : 'none';
    el.style.transform = `translateY(${-p * step}%)`;
    if (!animate) { void el.offsetHeight; el.style.transition = ''; }
  };
  useLayoutEffect(() => {
    const el = strip.current;
    if (!el || value === prev.current) return;
    if (pos.current < base) { pos.current += base; place(el, pos.current, false); }   // finish any pending wrap
    const steps = (prev.current - value + base) % base || base;
    prev.current = value;
    pos.current -= steps;
    place(el, pos.current, true);
    if (pos.current < base) {
      const settle = () => { el.removeEventListener('transitionend', settle); if (pos.current < base) { pos.current += base; place(el, pos.current, false); } };
      el.addEventListener('transitionend', settle);
    }
  }, [value, base]); // eslint-disable-line react-hooks/exhaustive-deps

  const digits = Array.from({ length: base * 2 }, (_, i) => i % base);
  return (
    <span className="roll w-[.64em]">
      <span ref={strip} className={`roll-strip transition-transform ease-lux will-change-transform ${fast ? 'duration-[850ms]' : 'duration-[1250ms]'}`}
        style={{ transform: `translateY(${-(base + value) * step}%)` }}>
        {digits.map((d, i) => <span key={i}>{d}</span>)}
      </span>
    </span>
  );
}

export default function Countdown() {
  const [vals, setVals] = useState(calc);
  const frame = useRef(null), glow = useRef(null), aura = useRef(null), visible = useRef(false);

  useEffect(() => {
    // tick exactly on each real second boundary (not whenever the page happened to load)
    let id;
    const tick = () => {
      setVals(calc());
      const rem = (target - Date.now()) % 1000;
      id = setTimeout(tick, (rem > 0 ? rem : 1000) + 20);
    };
    id = setTimeout(tick, Math.max(0, (target - Date.now()) % 1000) + 20);
    const io = new IntersectionObserver(([e]) => { visible.current = e.isIntersecting; });
    io.observe(frame.current);
    return () => { clearTimeout(id); io.disconnect(); };
  }, []);

  // the frame breathes light once per second (opacity only: composited, no repaint)
  useEffect(() => {
    if (!vals || !visible.current || env.reduced || !glow.current || !glow.current.animate) return;
    glow.current.animate([{ opacity: 0 }, { opacity: 1, offset: 0.18 }, { opacity: 0 }], { duration: 1000, easing: 'ease-out' });
    aura.current.animate([{ opacity: 0.55 }, { opacity: 1, offset: 0.2 }, { opacity: 0.55 }], { duration: 1000, easing: 'ease-out' });
  }, [vals]);

  return (
    <section id="countdown" className="px-gutter relative overflow-hidden bg-obsidian py-[clamp(96px,22vw,200px)] text-center bg-[radial-gradient(70%_50%_at_50%_58%,rgba(90,15,31,.34),transparent_70%)]">
      <div ref={aura} className="pointer-events-none absolute top-[58%] left-1/2 h-[70vmin] w-[120vmin] -translate-1/2 bg-[radial-gradient(closest-side,rgba(212,175,106,.16),transparent)] opacity-55 will-change-[opacity]" aria-hidden="true" />
      <header className="relative mx-auto mb-[clamp(56px,12vw,120px)] max-w-[1100px]">
        <Reveal><Kicker center className="mb-[26px] text-gold">{C.labels.countdownKicker}</Kicker></Reveal>
        <Lines className="font-display text-[clamp(2.9rem,13.5vw,8.2rem)] leading-[.96] font-normal tracking-[-.02em]"><Rich text={C.labels.countdownTitle} /></Lines>
      </header>

      <Reveal className="relative mx-auto max-w-[1000px]">
        <div ref={frame} className="relative border border-gold/28 px-[clamp(10px,4vw,64px)] pt-[clamp(46px,11vw,96px)] pb-[clamp(40px,9vw,84px)]">
          <div ref={glow} className="pointer-events-none absolute inset-0 opacity-0 will-change-[opacity] shadow-[0_0_80px_-12px_rgba(212,175,106,.32),inset_0_0_60px_-24px_rgba(212,175,106,.35)]" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-[9px] border border-gold/10" />
          <Corners />
          {vals ? (
            <div className="flex items-start justify-center gap-[clamp(6px,2.6vw,44px)]" role="timer" aria-label={`${vals[0]} days, ${vals[1]} hours, ${vals[2]} minutes until the shubh muhurat`}>
              {UNITS.map(([label], i) => {
                const s = String(vals[i]).padStart(2, '0');
                return (
                  <div key={label} className="contents">
                    {i > 0 && <span className="-mt-[1.6em] size-1.5 flex-none rotate-45 self-center bg-gold opacity-60" aria-hidden="true" />}
                    <div className="flex flex-col items-center">
                      <div className={`font-display flex text-[clamp(3rem,13.4vw,9.6rem)] leading-none tracking-[-.02em] tabular-nums [text-shadow:0_0_40px_rgba(212,175,106,.25)] ${i === 3 ? 'italic' : ''}`} aria-hidden="true">
                        {Array.from(s).map((d, j) => <Digit key={`${s.length}-${j}`} value={+d} base={baseFor(i, j, s.length)} fast={i === 3} />)}
                      </div>
                      <p className="eyebrow mt-4 text-[9px] text-ivory/58">{label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="font-display text-[clamp(2.4rem,10vw,6rem)]">Today, <em className="gold-text">forever begins.</em></p>
          )}
        </div>
      </Reveal>
      <Reveal as="p" className="eyebrow relative mx-auto mt-[46px] max-w-[34em] leading-[2.2] text-ivory/58">
        {fmt.long(C.date)} {C.timezoneLabel}
      </Reveal>
    </section>
  );
}
