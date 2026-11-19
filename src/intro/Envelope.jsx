/* The sealed envelope. Tap the wax seal: it cracks (screen shake + haptics +
   optional sound), the flap opens, the card rises and expands into the site. */
import { useRef } from 'react';
import C from '../config.js';
import { gsap, SplitText, useGSAP } from '../lib/gsap.js';
import { EASE, guest, fmt, buzz, store } from '../lib/utils.js';
import { audio } from '../lib/audio.js';
import { enableGyro } from '../lib/fx.js';
import Monogram from '../components/Monogram.jsx';
import WaxSeal from '../components/WaxSeal.jsx';

export default function Envelope({ active, onEnter, onGone }) {
  const root = useRef(null);
  const busy = useRef(false);
  const { contextSafe } = useGSAP(() => {
    gsap.set('.env-label, .env-hint', { opacity: 0, y: 16 });
    gsap.set('.env-shell', { opacity: 0, y: 70 });
    gsap.set('.env-guest', { opacity: 0 });
  }, { scope: root });

  /* Arrival, once the palace doors open */
  useGSAP(() => {
    if (!active) return;
    gsap.set('.env-guest', { opacity: 1 });
    const split = SplitText.create('.env-guest', { type: 'chars,words', mask: 'chars' });
    gsap.timeline({ defaults: { ease: EASE } })
      .to('.env-label', { opacity: 1, y: 0, duration: 1.6 })
      .from(split.chars, { yPercent: 110, duration: 1.6, stagger: 0.028 }, '-=1.3')
      .to('.env-shell', { opacity: 1, y: 0, duration: 2.2 }, '-=1.4')
      .to('.env-hint', { opacity: 1, y: 0, duration: 1.4 }, '-=1.2');
  }, { scope: root, dependencies: [active] });

  const open = contextSafe(() => {
    if (busy.current || !active) return;
    busy.current = true;
    enableGyro();
    buzz([14, 50, 28]);
    audio.sfx('crack');
    const envl = root.current.querySelector('.envelope');
    const card = root.current.querySelector('.env-card');
    envl.classList.remove('animate-float');
    gsap.to(envl, { y: 0, rotate: 0, duration: 1, ease: EASE });

    const shake = () => gsap.fromTo(root.current, { x: 0, y: 0 }, { keyframes: [{ x: -7, y: 2 }, { x: 6, y: -2 }, { x: -4, y: 1 }, { x: 3, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 0 }], duration: 0.42, ease: 'none' });
    const crumbs = () => {
      for (let i = 0; i < 14; i++) {
        const c = document.createElement('span'); c.className = 'wax-crumb'; envl.appendChild(c);
        const a = Math.random() * Math.PI * 2, d = 30 + Math.random() * 70;
        gsap.fromTo(c, { x: 0, y: 0, scale: 0.4 + Math.random() }, { x: Math.cos(a) * d, y: Math.sin(a) * d * 0.6 + 60 + Math.random() * 80, rotate: Math.random() * 360, opacity: 0, duration: 1.1 + Math.random() * 0.6, ease: 'power2.out', onComplete: () => c.remove() });
      }
    };

    gsap.timeline({ defaults: { ease: 'power3.inOut' } })
      .to('.seal-ring', { opacity: 0, duration: 0.3 }, 0)
      .to('.env-seal', { scale: 0.9, duration: 0.14, ease: 'power2.in' }, 0)
      .to('.seal-crack path', { strokeDashoffset: 0, duration: 0.32, ease: 'power2.out' })
      .add(shake, '<.05')
      .to('.env-seal', { scale: 1, duration: 0.5, ease: EASE })
      .add(crumbs, '<')
      .to('.seal-l', { x: -34, y: 90, rotate: -42, opacity: 0, duration: 1.4, ease: 'power2.in' }, '+=.08')
      .to('.seal-r', { x: 38, y: 100, rotate: 46, opacity: 0, duration: 1.4, ease: 'power2.in' }, '<.05')
      .to('.seal-crack', { opacity: 0, duration: 0.4 }, '<')
      .to('.env-hint', { opacity: 0, y: 10, duration: 0.8 }, '<')
      .add(() => audio.sfx('paper'), '-=.7')
      .to('.env-flap', { rotateX: 180, duration: 1.6 }, '-=.75')
      .set('.env-flap', { zIndex: 1 }, '-=.8')
      .add(() => audio.sfx('chime'), '-=.2')
      .to(card, { yPercent: -60, duration: 1.9 }, '-=.15')
      .to('.env-greet', { opacity: 0, y: -30, duration: 1.2 }, '<')
      .add(expand, '+=.15');

    /* The card becomes the site */
    function expand() {
      const r = card.getBoundingClientRect();
      const vw = window.innerWidth, vh = window.innerHeight;
      const s = Math.max(vw / r.width, vh / r.height) * 1.08;
      gsap.timeline({ defaults: { ease: 'power3.inOut' } })
        .to('.env-back, .env-pocket, .env-flap', { y: vh * 0.7, opacity: 0, duration: 1.4, ease: 'power3.in' }, 0)
        .to(card, { x: vw / 2 - (r.left + r.width / 2), y: vh / 2 - (r.top + r.height / 2), duration: 1.5 }, 0.1)
        .to('.card-inner', { opacity: 0, scale: 0.96, duration: 0.7, ease: 'power2.in' }, 0.9)
        .to(card, { scale: s, borderRadius: 0, duration: 1.7 }, 0.9)
        .add(() => { store.set('lux-opened', '1'); onEnter(); }, 2.3)
        .to(root.current, { opacity: 0, duration: 1.6, ease: 'power2.inOut', onComplete: onGone }, 2.3);
    }
  });

  return (
    <div ref={root} className="gutter-x fixed inset-0 z-[970] flex flex-col items-center justify-center overflow-hidden pt-[60px] pb-[calc(40px+env(safe-area-inset-bottom))] text-center bg-[radial-gradient(70%_45%_at_50%_62%,rgba(90,15,31,.42),transparent_70%),radial-gradient(120%_80%_at_50%_0%,#17130f,var(--color-obsidian)_70%)]" aria-label="Your invitation envelope">
      <div className="animate-breathe pointer-events-none absolute top-[58%] left-1/2 -mt-[70vmax] -ml-[70vmax] size-[140vmax] bg-[radial-gradient(closest-side,rgba(212,175,106,.12),transparent_60%)]" aria-hidden="true" />

      <div className="env-greet relative max-w-[640px]">
        <p className="env-label eyebrow text-ivory/55 [@media(max-height:560px)]:hidden">{C.greeting.envelopeLabel}</p>
        <p className="env-guest font-display mt-3.5 text-[clamp(2rem,9.4vw,4.2rem)] leading-[1.04] tracking-[-.01em] text-balance italic">
          {guest || C.greeting.genericName}
        </p>
      </div>

      <div className="env-shell my-[clamp(36px,7vh,64px)]">
      <div className="envelope animate-float" onClick={open}>
        <div className="env-back liner" />
        <div className="env-card">
          <div className="card-inner p-[6cqw]">
            <p className="font-deva m-0 mb-[1.8cqw] text-[3.1cqw] leading-none text-[#a0402c]" lang="sa">{C.invocation.devanagari}</p>
            <div className="mx-auto mb-[2.4cqw] w-[13cqw]"><Monogram /></div>
            <p className="m-0 font-sans text-[2cqw] tracking-[.32em] text-gold-deep uppercase">{C.couple.families}</p>
            <p className="font-display mt-[2.2cqw] mb-[1.6cqw] text-[9.6cqw] leading-[1.05] tracking-[-.01em]">
              {C.couple.partner1} <em className="text-[#a07b35]">&amp;</em> {C.couple.partner2}
            </p>
            <p className="m-0 mb-[2.6cqw] text-[3.5cqw] text-obsidian/70 italic">{C.couple.request}</p>
            <p className="m-0 font-sans text-[1.9cqw] tracking-[.4em] text-gold-deep uppercase">{fmt.short(C.date)} · {C.city}</p>
          </div>
        </div>
        <div className="env-pocket paper">
          <svg className="env-lines" viewBox="0 0 100 66" preserveAspectRatio="none" aria-hidden="true"><path d="M0 0 L50 35 L100 0" /><path className="fold" d="M0 66 L42 30 M100 66 L58 30" /></svg>
        </div>
        <div className="env-flap">
          <div className="flap-face flap-front paper"><svg className="env-lines" viewBox="0 0 100 58" preserveAspectRatio="none" aria-hidden="true"><path d="M0 0 L50 58 L100 0" /></svg></div>
          <div className="flap-face flap-back liner" />
        </div>
        <button className="env-seal" aria-label="Break the seal and open your invitation" data-cursor="Open">
          <span className="seal-half seal-l"><WaxSeal /></span>
          <span className="seal-half seal-r"><WaxSeal /></span>
          <svg className="seal-crack" viewBox="0 0 100 100" aria-hidden="true"><path pathLength="1" d="M52 2 L46 22 L55 41 L47 63 L54 80 L49 98" /></svg>
          <span className="seal-ring" aria-hidden="true" />
        </button>
      </div>
      </div>

      <p className="env-hint eyebrow text-ivory/55"><span className="animate-hint inline-block">Touch the seal</span></p>
    </div>
  );
}
