/* GALLERY — asymmetric editorial grid on ivory, marquee strips that speed up with
   scroll velocity, magnetic frames, and a fullscreen lightbox that morphs from
   the thumbnail (FLIP) with swipe + keyboard. */
import { useEffect, useRef, useState } from 'react';
import C from '../config.js';
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap.js';
import { EASE, env, img } from '../lib/utils.js';
import { scroll } from '../lib/scroll.js';
import { useCurtain, useMagnetic } from '../components/hooks.js';
import { Kicker } from '../components/Ui.jsx';
import { Lines, Reveal } from '../components/Reveal.jsx';

/* mobile: 2-col editorial rhythm · desktop: 12-col magazine spread */
const LAYOUT = [
  { item: 'col-span-2 desk:col-[1/8]', frame: 'aspect-[16/11]' },
  { item: 'desk:col-[9/13] desk:mt-[12vw]', frame: 'aspect-[3/4]' },
  { item: 'mt-[22vw] desk:col-[2/6] desk:-mt-[2vw]', frame: 'aspect-[3/4]' },
  { item: 'col-span-2 w-4/5 justify-self-end desk:col-[7/12] desk:mt-[8vw] desk:w-auto desk:justify-self-stretch', frame: 'aspect-[4/3]' },
  { item: 'desk:col-[1/5]', frame: 'aspect-[4/5]' },
  { item: 'mt-[14vw] desk:col-[6/9] desk:mt-[10vw]', frame: 'aspect-[4/5]' },
  { item: 'col-span-2 w-[70%] desk:col-[10/13] desk:-mt-[2vw] desk:w-auto', frame: 'aspect-square' },
  { item: 'col-span-2 desk:col-[3/11] desk:mt-[2vw]', frame: 'aspect-[16/10]' }
];

function Marquee({ dir = 1, outline = false }) {
  const seq = C.marquee.flatMap((w, i) => [
    <span key={`w${i}`} className={`px-[.28em] ${i % 2 ? 'italic' : ''} ${outline ? 'text-outline' : ''}`}>{w}</span>,
    <span key={`s${i}`} className="px-[.4em] text-[.3em] text-[#a07b35]">✦</span>
  ]);
  return (
    <div className="marquee overflow-hidden border-y border-obsidian/12 py-[22px] whitespace-nowrap" data-dir={dir}>
      <div className="marquee-track font-display inline-flex items-center text-[clamp(3rem,14vw,9rem)] leading-none tracking-[-.02em] will-change-transform">
        {[0, 1, 2, 3].map((k) => <span key={k} className="contents">{seq}</span>)}
      </div>
    </div>
  );
}

function Item({ g, i, onOpen }) {
  const ref = useRef(null);
  useMagnetic(ref, 0.06);
  const L = LAYOUT[i % LAYOUT.length];
  return (
    <figure ref={ref} className={`g-item group relative m-0 cursor-pointer desk:mb-[6vw] ${L.item}`} data-cursor="View" tabIndex={0} role="button" aria-label={`Open photo: ${g.caption}`}
      onClick={() => onOpen(i)} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onOpen(i))}>
      <div className={`g-frame relative overflow-hidden bg-[#d8ccb7] ${L.frame}`}>
        <div className="absolute inset-0 transition-transform duration-[1400ms] ease-lux group-hover:scale-105">
          <img src={img(g.src, env.isMobile ? 800 : 1200)} data-full={img(g.src, 2000)} alt={g.caption} loading="lazy" className="grade-ivory absolute -top-[10%] left-0 h-[120%] w-full object-cover will-change-transform transition-[filter] duration-[1200ms] ease-lux group-hover:filter-none" />
        </div>
      </div>
      <figcaption className="mt-3 flex flex-col gap-1 desk:flex-row desk:items-baseline desk:justify-between desk:gap-2.5">
        <span className="font-display text-[1.05rem] leading-[1.1] italic">{g.caption}</span>
        <span className="eyebrow text-[8.5px] tracking-[.3em] text-gold-deep desk:whitespace-nowrap">Nº {String(i + 1).padStart(2, '0')} — {g.place}</span>
      </figcaption>
    </figure>
  );
}

function Lightbox({ index, onClose, setIndex }) {
  const root = useRef(null), stage = useRef(null), imgEl = useRef(null);
  const busy = useRef(false);
  const G = C.gallery;

  const fit = (nw, nh) => {
    const vw = window.innerWidth, vh = window.innerHeight, m = vw < 900;
    const s = Math.min((m ? vw : vw - 220) / nw, (m ? vh - 230 : vh - 170) / nh);
    const w = nw * s, h = nh * s;
    return { left: (vw - w) / 2, top: (vh - h) / 2 - (m ? 30 : 0), width: w, height: h };
  };
  const frameOf = (i) => document.querySelectorAll('.g-frame')[i];
  const rectOf = (i) => { const r = frameOf(i).getBoundingClientRect(); return { left: r.left, top: r.top, width: r.width, height: r.height }; };
  const makeImg = (i) => {
    const thumb = frameOf(i).querySelector('img');
    const el = document.createElement('img');
    el.className = 'fixed left-0 top-0 object-cover will-change-transform shadow-[0_40px_120px_-30px_rgba(0,0,0,.9)]';
    el.alt = G[i].caption; el.src = thumb.currentSrc || thumb.src;
    const hi = new Image(); hi.onload = () => { el.src = hi.src; }; hi.src = thumb.dataset.full;
    return { el, target: fit(thumb.naturalWidth || 3, thumb.naturalHeight || 4) };
  };

  // open: morph from the thumbnail
  useGSAP(() => {
    busy.current = true;
    scroll.lenis && scroll.lenis.stop();
    const { el, target } = makeImg(index);
    gsap.set(el, rectOf(index)); stage.current.appendChild(el); imgEl.current = el;
    frameOf(index).style.visibility = 'hidden';
    gsap.timeline({ onComplete: () => { busy.current = false; } })
      .to('.lb-bg', { opacity: 1, duration: 0.9, ease: 'power2.out' }, 0)
      .to(el, { ...target, duration: 1.25, ease: 'power3.inOut' }, 0)
      .to('.lb-ui', { opacity: 1, duration: 0.8 }, 0.7);
    root.current.querySelector('.lb-close').focus({ preventScroll: true });
  }, { scope: root });

  const close = () => {
    if (busy.current) return;
    busy.current = true;
    gsap.timeline({ onComplete: () => { frameOf(index).style.visibility = ''; scroll.lenis && scroll.lenis.start(); onClose(); } })
      .to(root.current.querySelector('.lb-ui'), { opacity: 0, duration: 0.4 }, 0)
      .to(imgEl.current, { ...rectOf(index), duration: 1.1, ease: 'power3.inOut' }, 0)
      .to(root.current.querySelector('.lb-bg'), { opacity: 0, duration: 0.9, ease: 'power2.in' }, 0.2);
  };
  const go = (dir) => {
    if (busy.current) return;
    busy.current = true;
    frameOf(index).style.visibility = '';
    const ni = (index + dir + G.length) % G.length;
    frameOf(ni).style.visibility = 'hidden';
    const old = imgEl.current;
    const { el, target } = makeImg(ni);
    gsap.set(el, { ...target, opacity: 0, x: dir * 60 });
    stage.current.appendChild(el); imgEl.current = el;
    setIndex(ni);
    gsap.timeline({ onComplete: () => { old.remove(); busy.current = false; } })
      .to(old, { opacity: 0, x: -dir * 60, duration: 0.9, ease: 'power3.inOut' }, 0)
      .to(el, { opacity: 1, x: 0, duration: 1.1, ease: EASE }, 0.25)
      .fromTo(root.current.querySelector('.lb-cap'), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.9, ease: EASE }, 0.3);
  };

  useEffect(() => {
    const k = (e) => { if (e.key === 'Escape') close(); if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); };
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  });
  const touch = useRef({ x: 0, y: 0 });

  return (
    <div ref={root} className="fixed inset-0 z-[995] text-ivory" role="dialog" aria-modal="true" aria-label="Photo viewer"
      onTouchStart={(e) => { touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0].clientX - touch.current.x, dy = e.changedTouches[0].clientY - touch.current.y;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1); else if (dy > 90) close();
      }}>
      <div className="lb-bg absolute inset-0 bg-[#060504]/97 opacity-0" onClick={close} />
      <div ref={stage} className="absolute inset-0" onClick={(e) => e.target === e.currentTarget && close()} />
      <div className="lb-ui pointer-events-none absolute inset-0 opacity-0 [&>*]:pointer-events-auto">
        <p className="lb-cap absolute bottom-[calc(26px+env(safe-area-inset-bottom))] left-gutter m-0 flex flex-col gap-1.5">
          <span className="eyebrow text-gold">Nº {String(index + 1).padStart(2, '0')} / {String(G.length).padStart(2, '0')} — {G[index].place}</span>
          <span className="font-display text-[1.6rem] leading-none italic">{G[index].caption}</span>
        </p>
        <button onClick={() => go(-1)} aria-label="Previous photo" data-cursor="Prev" className="absolute right-[calc(var(--spacing-gutter)+62px)] bottom-[calc(18px+env(safe-area-inset-bottom))] size-[52px] rounded-full border border-gold/40 text-gold">←</button>
        <button onClick={() => go(1)} aria-label="Next photo" data-cursor="Next" className="absolute right-gutter bottom-[calc(18px+env(safe-area-inset-bottom))] size-[52px] rounded-full border border-gold/40 text-gold">→</button>
        <button onClick={close} aria-label="Close" data-cursor="Close" className="lb-close absolute top-[max(16px,env(safe-area-inset-top))] right-gutter size-[52px]">
          <i className="absolute inset-x-3 top-1/2 h-px rotate-45 bg-ivory" /><i className="absolute inset-x-3 top-1/2 h-px -rotate-45 bg-ivory" />
        </button>
      </div>
    </div>
  );
}

export default function Gallery() {
  const root = useRef(null);
  const [open, setOpen] = useState(null);
  useCurtain(root);

  useGSAP(() => {
    const tweens = gsap.utils.toArray('.marquee', root.current).map((m) => {
      const dir = +m.dataset.dir;
      return gsap.fromTo(m.querySelector('.marquee-track'), { xPercent: dir > 0 ? 0 : -50 }, { xPercent: dir > 0 ? -50 : 0, duration: env.isMobile ? 34 : 48, ease: 'none', repeat: -1 });
    });
    if (!env.reduced) {
      ScrollTrigger.create({
        trigger: root.current, start: 'top bottom', end: 'bottom top',
        onUpdate: (self) => {
          const v = Math.min(5, Math.abs(self.getVelocity()) / 350);
          tweens.forEach((t) => gsap.to(t, { timeScale: 1 + v, duration: 0.3, overwrite: true, onComplete: () => gsap.to(t, { timeScale: 1, duration: 1.6, ease: 'power2.out' }) }));
        }
      });
    }
    gsap.utils.toArray('.g-item', root.current).forEach((it) => {
      gsap.fromTo(it.querySelector('.g-frame'), { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.9, ease: 'power3.inOut', scrollTrigger: { trigger: it, start: 'top 92%', once: true } });
      gsap.fromTo(it.querySelector('figcaption'), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 1.4, delay: 0.6, ease: EASE, scrollTrigger: { trigger: it, start: 'top 92%', once: true } });
      if (!env.reduced) gsap.fromTo(it.querySelector('img'), { yPercent: -7 }, { yPercent: 7, ease: 'none', scrollTrigger: { trigger: it, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  }, { scope: root });

  return (
    <section id="gallery" ref={root} className="relative overflow-hidden bg-ivory py-[clamp(96px,22vw,200px)] text-obsidian">
      <Marquee dir={1} />
      <header className="px-gutter mx-auto mt-[clamp(90px,18vw,160px)] mb-[clamp(56px,12vw,120px)] max-w-[1100px] box-content">
        <Reveal><Kicker className="mb-[26px] text-gold-deep">Gallery</Kicker></Reveal>
        <Lines className="font-display text-[clamp(2.9rem,13.5vw,8.2rem)] leading-[.96] font-normal tracking-[-.02em]">Moments, <em className="gold-text brightness-[.82]">kept.</em></Lines>
      </header>
      <div className="px-gutter mb-[clamp(100px,20vw,180px)] grid grid-cols-2 items-start gap-x-3.5 gap-y-4 desk:grid-cols-12 desk:gap-x-[2.2vw] desk:gap-y-0">
        {C.gallery.map((g, i) => <Item key={i} g={g} i={i} onOpen={(n) => open === null && setOpen(n)} />)}
      </div>
      <Marquee dir={-1} outline />
      {open !== null && <Lightbox index={open} setIndex={setOpen} onClose={() => setOpen(null)} />}
    </section>
  );
}
