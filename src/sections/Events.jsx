/* EVENTS — each celebration is a VIP black-card pass: embossed type, foil shine
   that follows the finger/cursor/gyroscope, 3D tilt, stacking on scroll,
   personalised barcode, Add to Calendar (.ics / Google) and directions. */
import { useEffect, useRef, useState } from 'react';
import C from '../config.js';
import { gsap, useGSAP } from '../lib/gsap.js';
import { EASE, env, fmt, time, guest, plain, buzz, clamp } from '../lib/utils.js';
import { tilt } from '../lib/fx.js';
import { addToCalendar, addAllToCalendar } from '../lib/calendar.js';
import { useTilt } from '../components/hooks.js';
import Monogram from '../components/Monogram.jsx';
import Button from '../components/Button.jsx';
import { Kicker, Rich } from '../components/Ui.jsx';
import { Lines, Reveal } from '../components/Reveal.jsx';

/* deterministic barcode from the guest's name: every pass is theirs alone */
function Barcode({ seed }) {
  let h = 2166136261;
  for (const c of seed) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  const rnd = () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 1000) / 1000; };
  const bars = []; let x = 0;
  while (x < 118) { const w = 1 + Math.floor(rnd() * 3); if (rnd() > 0.35) bars.push(<rect key={x} x={x} y="0" width={w} height="34" />); x += w + 1 + Math.floor(rnd() * 2); }
  return <svg className="h-[34px] w-24 flex-none fill-[#e8c97f]/70 desk:h-[46px] desk:w-full" viewBox="0 0 120 34" preserveAspectRatio="none" aria-hidden="true">{bars}</svg>;
}

const DT = 'font-sans text-[8.5px] tracking-[.36em] uppercase text-ivory/45';

function Pass({ e, i, total, onCalendar }) {
  const card = useRef(null);
  useTilt(card);
  return (
    <div className="pass-wrap relative mb-[7vh] last:mb-0 [@media(min-height:700px)]:sticky [@media(min-height:700px)]:mb-[16vh] [@media(min-height:700px)]:last:mb-0 [@media(min-height:700px)]:top-[calc(88px+var(--i)*13px)]" style={{ '--i': i }}>
      <article ref={card} className={`pass ${e.style === 'accent' ? 'pass-accent' : ''} desk:grid desk:grid-cols-[1fr_auto_250px]`} aria-label={plain(e.title)}>
        <div className="pass-shine" />
        <div className="pass-dim pointer-events-none absolute inset-0 z-[4] rounded-[inherit] bg-black opacity-0 will-change-[opacity]" />
        <div className="px-6 pt-6 pb-1 desk:py-[34px] desk:pr-[34px] desk:pl-[38px]">
          <div className="flex items-center justify-between gap-3">
            <span className="w-[38px]"><Monogram variant="mini" /></span>
            <span className="eyebrow text-gold">Private pass</span>
            <span className="eyebrow text-ivory/58">Nº {String(i + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
          </div>
          <span className="eyebrow mt-[26px] block text-gold">{e.kind}</span>
          <h3 className="emboss font-display mt-3 mb-3.5 text-[clamp(2.3rem,10.6vw,3.5rem)] leading-[.98] font-normal tracking-[-.02em]"><Rich text={e.title} /></h3>
          <p className="font-display mb-1.5 text-[1.1rem] text-gold italic">{fmt.dayMonth(e.start)}</p>
          <p className="m-0 text-[.98em] leading-[1.45] text-ivory/58 italic">{e.note}</p>
          <dl className="mt-[22px] grid grid-cols-2 gap-x-[18px] gap-y-4">
            <div><dt className={DT}>Time</dt><dd className="font-display mt-1 text-[1.12rem] leading-[1.2]">{time(e.start)}</dd></div>
            <div><dt className={DT}>Dress</dt><dd className="font-display mt-1 text-[1.12rem] leading-[1.2]">{e.dress}</dd></div>
            <div className="col-span-2"><dt className={DT}>Venue</dt><dd className="font-display mt-1 text-[1.12rem] leading-[1.2]">{e.venue}</dd></div>
          </dl>
        </div>
        <div className="perf" aria-hidden="true" />
        <div className="px-6 pb-6 desk:flex desk:flex-col desk:justify-between desk:px-[30px] desk:py-[34px]">
          <dl className="flex items-end justify-between gap-4 desk:flex-col desk:items-start">
            <div><dt className={DT}>Admit</dt><dd className="font-display mt-1 text-[1.2rem] leading-[1.15] italic">{guest || 'Our honoured guest'}</dd></div>
            <Barcode seed={(guest || 'guest') + i + e.start} />
          </dl>
          <div className="relative z-[5] mt-5 flex flex-wrap gap-2.5 desk:flex-col">
            <Button size="sm" cursor="Save" className="desk:w-full" onClick={(ev) => onCalendar(ev, i)}>Add to calendar</Button>
            <Button as="a" variant="ghost" size="sm" cursor="Map" className="desk:w-full" href={e.mapUrl} target="_blank" rel="noopener">Directions</Button>
          </div>
        </div>
      </article>
    </div>
  );
}

export default function Events() {
  const root = useRef(null);
  const pop = useRef(null);
  const [cal, setCal] = useState(null); // { i, left, top }

  const openCal = (ev, i) => {
    ev.stopPropagation();
    if (cal && cal.i === i) return setCal(null);
    const r = ev.currentTarget.getBoundingClientRect();
    const top = r.bottom + 180 > window.innerHeight ? r.top - 180 : r.bottom + 10;
    setCal({ i, left: clamp(r.left, 12, window.innerWidth - 252), top, y0: window.scrollY });
    buzz(6);
  };
  useEffect(() => {
    if (!cal) return;
    gsap.fromTo(pop.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.7, ease: EASE });
    const close = (e) => { if (!pop.current?.contains(e.target)) setCal(null); };
    const onScroll = () => Math.abs(window.scrollY - cal.y0) > 60 && setCal(null);
    const onKey = (e) => e.key === 'Escape' && setCal(null);
    document.addEventListener('click', close); window.addEventListener('scroll', onScroll, { passive: true }); document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('click', close); window.removeEventListener('scroll', onScroll); document.removeEventListener('keydown', onKey); };
  }, [cal]);

  useGSAP(() => {
    const wraps = gsap.utils.toArray('.pass-wrap', root.current);
    // The sticky wrapper never gets a transform (sticky + transform flickers in mobile
    // Safari and Chrome): every animation runs on the card inside it.
    const cardOf = (w) => w.querySelector('.pass');
    wraps.forEach((w) => gsap.fromTo(cardOf(w), { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 1.8, ease: EASE, scrollTrigger: { trigger: w, start: 'top 95%', once: true } }));
    // foil glint sweeps across each pass as it arrives
    gsap.utils.toArray('.pass', root.current).forEach((p) => gsap.fromTo(p.querySelector('.pass-shine'), { '--mx': '-30%', '--my': '10%' }, { '--mx': '130%', '--my': '60%', duration: 2.6, ease: 'power2.inOut', scrollTrigger: { trigger: p, start: 'top 75%', once: true } }));
    // stacking: earlier passes recede as the next slides over them
    if (window.matchMedia('(min-height: 700px)').matches && !env.reduced) {
      wraps.forEach((w, i) => {
        const next = wraps[i + 1];
        if (!next) return;
        gsap.timeline({ scrollTrigger: { trigger: next, start: 'top bottom', end: `top ${88 + (i + 1) * 13}px`, scrub: true } })
          .to(cardOf(w), { scale: 0.92, ease: 'none' }, 0)
          .to(w.querySelector('.pass-dim'), { opacity: 0.5, ease: 'none' }, 0);
      });
    }
    // phone tilt moves the light across the cards
    // only cards on screen, cached once, and only when the tilt actually moved
    const shines = gsap.utils.toArray('.pass-shine', root.current);
    const onScreen = new Set();
    const io = new IntersectionObserver((ents) => ents.forEach((en) => (en.isIntersecting ? onScreen.add(en.target) : onScreen.delete(en.target))));
    shines.forEach((s) => io.observe(s));
    // Raw gyroscope readings jitter every frame (hand tremor + sensor noise), which made the
    // light shake and the passes flicker on phones. Smooth it, and only repaint when the
    // light has moved by a whole percent.
    let sx = 0, sy = 0, lx = '', ly = '';
    const tick = () => {
      if (!tilt.gyro || !onScreen.size) return;
      sx += (tilt.x - sx) * 0.06; sy += (tilt.y - sy) * 0.06;
      const mx = `${Math.round(50 + sx * 55)}%`, my = `${Math.round(35 + sy * 45)}%`;
      if (mx === lx && my === ly) return;
      lx = mx; ly = my;
      onScreen.forEach((s) => { s.style.setProperty('--mx', mx); s.style.setProperty('--my', my); });
    };
    gsap.ticker.add(tick);
    return () => { gsap.ticker.remove(tick); io.disconnect(); };
  }, { scope: root });

  return (
    <section id="events" ref={root} className="px-gutter relative bg-obsidian py-[clamp(96px,22vw,200px)]">
      <header className="mx-auto mb-[clamp(56px,12vw,120px)] max-w-[1100px]">
        <Reveal><Kicker className="mb-[26px] text-gold">{C.labels.eventsKicker}</Kicker></Reveal>
        <Lines className="font-display text-[clamp(2.9rem,13.5vw,8.2rem)] leading-[.96] font-normal tracking-[-.02em]"><Rich text={C.labels.eventsTitle} /></Lines>
        <Reveal as="p" className="mt-7 max-w-[30ch] text-[1.08em] text-ivory/58 italic">{C.labels.eventsSub}</Reveal>
      </header>

      <div className="mx-auto max-w-[560px] desk:max-w-[860px]">
        {C.events.map((e, i) => <Pass key={i} e={e} i={i} total={C.events.length} onCalendar={openCal} />)}
      </div>

      <Reveal className="mt-[clamp(70px,14vw,120px)] text-center">
        <Button variant="ghost" cursor="Save" onClick={addAllToCalendar}>Add every celebration to your calendar</Button>
      </Reveal>

      {cal && (
        <div ref={pop} className="fixed z-[920] w-60 rounded-[14px] border border-gold/40 bg-[#0e0c0a]/95 px-[18px] pt-[18px] pb-2.5 shadow-[0_30px_80px_-20px_rgba(0,0,0,.9)] backdrop-blur-md" style={{ left: cal.left, top: cal.top }}>
          <p className="eyebrow mb-2 text-ivory/58">Add to calendar</p>
          {[['ics', 'Apple · Outlook', '.ics'], ['google', 'Google Calendar', '']].map(([k, label, small]) => (
            <button key={k} type="button" onClick={() => { addToCalendar(cal.i, k); setCal(null); }} className="font-display flex w-full justify-between border-t border-gold/15 py-3.5 text-left text-[1.1rem] transition-all duration-[800ms] ease-lux hover:pl-1.5 hover:text-gold">
              {label}<small className="eyebrow self-center text-[9px] text-ivory/58">{small}</small>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
