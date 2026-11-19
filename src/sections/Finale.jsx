/* GRAND FINALE — full black, the couple's signature writes itself in gold script,
   "Forever begins here.", the hashtag, falling rose petals and rising embers. */
import { useEffect, useRef } from 'react';
import C from '../config.js';
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap.js';
import { EASE, store } from '../lib/utils.js';
import { petalsAndEmbers } from '../lib/fx.js';
import { navigate } from '../lib/scroll.js';
import { Rich, Squiggle } from '../components/Ui.jsx';

export default function Finale() {
  const root = useRef(null), fx = useRef(null);

  useGSAP(() => {
    const sig = root.current.querySelector('.sig-text');
    try { const len = sig.getComputedTextLength(); if (len > 940) sig.style.fontSize = `${Math.floor((260 * 940) / len)}px`; } catch { /* not laid out */ }
    gsap.set(sig, { fillOpacity: 0, strokeDasharray: 5000, strokeDashoffset: 5000 });
    gsap.set('.sig-wipe', { attr: { x: -1900 } });
    gsap.set('.fin-fade', { opacity: 0, y: 26 });
    ScrollTrigger.create({
      trigger: root.current, start: 'top 55%', once: true,
      onEnter: () => gsap.timeline({ defaults: { ease: EASE } })
        .to('.sig-wipe', { attr: { x: -300 }, duration: 5, ease: 'power1.inOut' }, 0)
        .to(sig, { strokeDashoffset: 0, duration: 5.2, ease: 'power1.inOut' }, 0)
        .to(sig, { fillOpacity: 1, duration: 2.4, ease: 'power1.inOut' }, 3.4)
        .to('.fin-fade', { opacity: 1, y: 0, duration: 2.2, stagger: 0.35 }, 3.6)
    });
  }, { scope: root });

  useEffect(() => { const s = petalsAndEmbers(fx.current); return () => s && s.destroy(); }, []);

  return (
    <section id="finale" ref={root} className="relative grid min-h-screen place-items-center overflow-hidden bg-black pt-[clamp(96px,22vw,200px)] pb-[calc(120px+env(safe-area-inset-bottom))] text-center [min-height:100svh]">
      <canvas ref={fx} className="pointer-events-none absolute inset-0 size-full" aria-hidden="true" />
      <div className="px-gutter relative z-[2] w-full">
        <svg className="mx-auto block h-auto w-[min(94vw,980px)] overflow-visible" viewBox="0 0 1000 300" role="img" aria-label={C.couple.signature}>
          <defs>
            <linearGradient id="sigFade" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stopColor="#fff" /><stop offset=".86" stopColor="#fff" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
            <mask id="sigMask" maskUnits="userSpaceOnUse" x="-300" y="-100" width="1600" height="500"><rect className="sig-wipe" x="-300" y="-100" width="1600" height="500" fill="url(#sigFade)" /></mask>
          </defs>
          <text className="sig-text font-script" x="500" y="190" textAnchor="middle" fontSize="260" fill="url(#g-gold)" stroke="url(#g-gold)" strokeWidth="1.1" mask="url(#sigMask)">{C.couple.signature}</text>
        </svg>
        <p className="fin-fade font-display mt-1.5 mb-[30px] text-[clamp(2.3rem,9.6vw,6.4rem)] leading-[1.02] text-balance tracking-[-.02em]"><Rich text={C.finale.line} /></p>
        <p className="fin-fade font-display m-0 text-[clamp(1.3rem,5vw,2rem)] italic"><span className="gold-text">{C.hashtag}</span></p>
        <p className="fin-fade eyebrow mt-[34px] text-ivory/58">{C.finale.footnote}</p>
        <div className="fin-fade mt-[70px] flex flex-col items-center gap-2">
          <a href="#hero" className="link-draw" onClick={(e) => { e.preventDefault(); navigate('#hero'); }}>Return to the beginning<Squiggle /></a>
          <button type="button" className="link-draw" onClick={() => { store.del('lux-opened'); window.scrollTo(0, 0); window.location.reload(); }}>Replay the invitation<Squiggle /></button>
        </div>
      </div>
    </section>
  );
}
