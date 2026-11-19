/* Global chrome: grain + vignette, custom cursor, top bar + menu, curtain, sound toggle */
import { useEffect, useRef, useState } from 'react';
import C from '../config.js';
import { gsap, useGSAP } from '../lib/gsap.js';
import { env, fmt, buzz, EASE } from '../lib/utils.js';
import { navigate, lockScroll, unlockScroll } from '../lib/scroll.js';
import { audio } from '../lib/audio.js';
import Monogram from './Monogram.jsx';

export function Atmosphere() {
  return (
    <>
      <div className="grain" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />
    </>
  );
}

/* Gold dot + trailing ring that morphs into a label over [data-cursor] */
export function Cursor() {
  const wrap = useRef(null), dot = useRef(null), ring = useRef(null);
  const [label, setLabel] = useState('');
  useEffect(() => {
    if (!env.finePointer || env.reduced) return;
    document.documentElement.classList.add('has-cursor');
    let mx = -100, my = -100, rx = -100, ry = -100, raf;
    const move = (e) => { mx = e.clientX; my = e.clientY; dot.current.style.transform = `translate3d(${mx}px,${my}px,0)`; wrap.current.classList.remove('is-hidden'); };
    const over = (e) => { const t = e.target.closest && e.target.closest('[data-cursor]'); setLabel(t ? t.dataset.cursor : ''); };
    const leave = () => wrap.current.classList.add('is-hidden');
    const loop = () => { rx += (mx - rx) * 0.14; ry += (my - ry) * 0.14; ring.current.style.transform = `translate3d(${rx}px,${ry}px,0)`; raf = requestAnimationFrame(loop); };
    loop();
    window.addEventListener('mousemove', move, { passive: true });
    document.addEventListener('mouseover', over);
    document.addEventListener('mouseleave', leave);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('mousemove', move); document.removeEventListener('mouseover', over); document.removeEventListener('mouseleave', leave); };
  }, []);
  return (
    <div ref={wrap} className={`cursor ${label ? 'is-label' : ''}`} aria-hidden="true">
      <div ref={ring} className="cursor-ring"><span className="cursor-label">{label}</span></div>
      <div ref={dot} className="cursor-dot" />
    </div>
  );
}

export function Curtain() {
  return (
    <div id="curtain" className="pointer-events-none fixed inset-0 z-[850] translate-y-[101%] bg-obsidian" aria-hidden="true">
      <i className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--color-gold),transparent)]" />
    </div>
  );
}

export function SoundToggle({ visible }) {
  const [on, setOn] = useState(audio.on);
  useEffect(() => audio.subscribe(setOn), []);
  return (
    <button
      onClick={() => { audio.toggle(); buzz(8); }}
      aria-pressed={on} aria-label={on ? 'Mute music' : 'Play music'} data-cursor="Sound"
      className={`fixed right-[max(16px,calc(5.6vw-6px))] bottom-[calc(18px+env(safe-area-inset-bottom))] z-[990] grid size-[50px] place-items-center rounded-full border border-gold/40 bg-obsidian/55 backdrop-blur-md transition duration-[1200ms] ease-lux ${visible ? 'scale-100 opacity-100' : 'pointer-events-none scale-60 opacity-0'} ${on ? 'sound-on' : ''}`}
    >
      <span className="sound-bars flex h-4 items-center gap-[3px]"><i /><i /><i /><i /></span>
    </button>
  );
}

const LINKS = [['#story', 'I', <>Our <em className="text-gold">Story</em></>], ['#countdown', 'II', <>The <em className="text-gold">Hour</em></>], ['#events', 'III', 'Celebrations'], ['#venue', 'IV', <>The <em className="text-gold">Venue</em></>], ['#gallery', 'V', 'Gallery'], ['#travel', 'VI', 'Concierge'], ['#rsvp', 'VII', <em className="text-gold">RSVP</em>]];

export function TopBar({ visible }) {
  const [open, setOpen] = useState(false);
  const menu = useRef(null);
  const tl = useRef(null);

  useGSAP(() => {
    tl.current = gsap.timeline({ paused: true })
      .set(menu.current, { visibility: 'visible' })
      .fromTo('.menu-bg', { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.15, ease: 'power3.inOut' })
      .fromTo('.menu-anim', { yPercent: 120 }, { yPercent: 0, duration: 1.3, ease: EASE, stagger: 0.05 }, '-=.55')
      .fromTo('.menu-foot', { opacity: 0 }, { opacity: 1, duration: 1 }, '-=.9');
  }, { scope: menu });

  useEffect(() => {
    if (!tl.current) return;
    if (open) { tl.current.timeScale(1).play(); lockScroll(); } else { tl.current.timeScale(1.6).reverse(); unlockScroll(); }
  }, [open]);
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', k); return () => document.removeEventListener('keydown', k);
  }, []);

  const go = (e, hash) => {
    e.preventDefault();
    if (open) { setOpen(false); setTimeout(() => navigate(hash), 350); } else navigate(hash);
  };

  return (
    <>
      <header className={`gutter-x pointer-events-none fixed inset-x-0 top-0 z-[800] flex items-center justify-between pt-[max(14px,env(safe-area-inset-top))] pb-3.5 mix-blend-difference transition duration-[1400ms] ease-lux ${visible ? 'translate-y-0 opacity-100' : '-translate-y-5 opacity-0'}`}>
        <a href="#hero" onClick={(e) => go(e, '#hero')} className="pointer-events-auto block size-[46px] text-ivory" aria-label="Back to top"><Monogram variant="mini" mono /></a>
        <button onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="menu" data-cursor="Menu" className="pointer-events-auto flex items-center gap-3.5 py-3 pl-3 text-ivory">
          <span className="eyebrow text-[10px]">{open ? 'Close' : 'Menu'}</span>
          <span className="relative block h-[9px] w-[26px]">
            <i className={`absolute inset-x-0 top-0 h-px bg-current transition duration-900 ease-lux ${open ? 'translate-y-1 rotate-[20deg]' : ''}`} />
            <i className={`absolute right-0 bottom-0 h-px bg-current transition-all duration-900 ease-lux ${open ? 'w-full -translate-y-1 -rotate-[20deg]' : 'w-[62%]'}`} />
          </span>
        </button>
      </header>

      <nav id="menu" ref={menu} aria-hidden={!open} className="gutter-x invisible fixed inset-0 z-[790] flex flex-col justify-center pt-24 pb-[calc(40px+env(safe-area-inset-bottom))]">
        <div className="menu-bg absolute inset-0 bg-obsidian">
          <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_80%_10%,color-mix(in_srgb,var(--color-burgundy)_45%,transparent),transparent_70%)]" />
        </div>
        <ol className="relative">
          {LINKS.map(([href, n, label]) => (
            <li key={href} className="overflow-hidden border-b border-gold/15">
              <a href={href} onClick={(e) => go(e, href)} className="group flex items-baseline gap-[18px] pt-2.5 pb-3" tabIndex={open ? 0 : -1}>
                <span className="menu-anim eyebrow inline-block w-[34px] flex-none text-[10px] text-gold">{n}</span>
                <span className="menu-anim font-display inline-block text-[clamp(2.1rem,9.6vw,5rem)] leading-[1.04] tracking-[-.015em] transition-transform duration-1000 ease-lux group-hover:translate-x-3.5">{label}</span>
              </a>
            </li>
          ))}
        </ol>
        <div className="menu-foot eyebrow relative mt-9 flex justify-between text-ivory/55">
          <span>{fmt.dots(C.date)} · {C.city}</span><span>{C.hashtag}</span>
        </div>
      </nav>
    </>
  );
}
