/* COUNTDOWN — huge rolling digits in an ornamental gold frame that glows each second */
import { useEffect, useRef, useState } from 'react';
import C from '../config.js';
import { env, fmt } from '../lib/utils.js';
import { Corners, Kicker } from '../components/Ui.jsx';
import { Lines, Reveal } from '../components/Reveal.jsx';

const UNITS = [['Days', 864e5], ['Hours', 36e5], ['Minutes', 6e4], ['Seconds', 1e3]];
const target = new Date(C.date).getTime();
const calc = () => {
  let diff = target - Date.now();
  if (diff <= 0) return null;
  return UNITS.map(([, ms]) => { const v = Math.floor(diff / ms); diff -= v * ms; return v; });
};

function Digit({ value, fast }) {
  return (
    <span className="roll w-[.64em]">
      <span className={`roll-strip transition-transform ease-lux ${fast ? 'duration-[850ms]' : 'duration-[1250ms]'}`} style={{ transform: `translateY(${-value * 10}%)` }}>
        {'0123456789'.split('').map((d) => <span key={d}>{d}</span>)}
      </span>
    </span>
  );
}

export default function Countdown() {
  const [vals, setVals] = useState(calc);
  const frame = useRef(null), aura = useRef(null), visible = useRef(false);

  useEffect(() => {
    const id = setInterval(() => setVals(calc()), 1000);
    const io = new IntersectionObserver(([e]) => { visible.current = e.isIntersecting; });
    io.observe(frame.current);
    return () => { clearInterval(id); io.disconnect(); };
  }, []);

  // the frame breathes light once per second
  useEffect(() => {
    if (!vals || !visible.current || env.reduced || !frame.current.animate) return;
    frame.current.animate([
      { boxShadow: '0 0 0 0 rgba(212,175,106,0), inset 0 0 0 0 rgba(212,175,106,0)' },
      { boxShadow: '0 0 80px -12px rgba(212,175,106,.32), inset 0 0 60px -24px rgba(212,175,106,.35)', offset: 0.18 },
      { boxShadow: '0 0 0 0 rgba(212,175,106,0), inset 0 0 0 0 rgba(212,175,106,0)' }
    ], { duration: 1000, easing: 'ease-out' });
    aura.current.animate([{ opacity: 0.55 }, { opacity: 1, offset: 0.2 }, { opacity: 0.55 }], { duration: 1000, easing: 'ease-out' });
  }, [vals]);

  return (
    <section id="countdown" className="px-gutter relative overflow-hidden bg-obsidian py-[clamp(96px,22vw,200px)] text-center bg-[radial-gradient(70%_50%_at_50%_58%,rgba(90,15,31,.34),transparent_70%)]">
      <div ref={aura} className="pointer-events-none absolute top-[58%] left-1/2 h-[70vmin] w-[120vmin] -translate-1/2 bg-[radial-gradient(closest-side,rgba(212,175,106,.16),transparent)] opacity-55" aria-hidden="true" />
      <header className="relative mx-auto mb-[clamp(56px,12vw,120px)] max-w-[1100px]">
        <Reveal><Kicker center className="mb-[26px] text-gold">The countdown</Kicker></Reveal>
        <Lines className="font-display text-[clamp(2.9rem,13.5vw,8.2rem)] leading-[.96] font-normal tracking-[-.02em]">Until we say <em className="gold-text">forever</em></Lines>
      </header>

      <Reveal className="relative mx-auto max-w-[1000px]">
        <div ref={frame} className="relative border border-gold/28 px-[clamp(10px,4vw,64px)] pt-[clamp(46px,11vw,96px)] pb-[clamp(40px,9vw,84px)]">
          <div className="pointer-events-none absolute inset-[9px] border border-gold/10" />
          <Corners />
          {vals ? (
            <div className="flex items-start justify-center gap-[clamp(6px,2.6vw,44px)]" role="timer" aria-label={`${vals[0]} days, ${vals[1]} hours, ${vals[2]} minutes until the ceremony`}>
              {UNITS.map(([label], i) => {
                const s = String(vals[i]).padStart(2, '0');
                return (
                  <div key={label} className="contents">
                    {i > 0 && <span className="-mt-[1.6em] size-1.5 flex-none rotate-45 self-center bg-gold opacity-60" aria-hidden="true" />}
                    <div className="flex flex-col items-center">
                      <div className={`font-display flex text-[clamp(3rem,13.4vw,9.6rem)] leading-none tracking-[-.02em] tabular-nums [text-shadow:0_0_40px_rgba(212,175,106,.25)] ${i === 3 ? 'italic' : ''}`} aria-hidden="true">
                        {Array.from(s).map((d, j) => <Digit key={`${s.length}-${j}`} value={+d} fast={i === 3} />)}
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
