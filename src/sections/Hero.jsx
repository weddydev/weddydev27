/* HERO — slow Ken Burns, giant names revealed letter by letter through masks,
   tiny luxury meta. */
import { useRef } from 'react';
import C from '../config.js';
import { gsap, SplitText, useGSAP } from '../lib/gsap.js';
import { EASE, img, srcSet, fmt, guest } from '../lib/utils.js';

const MASK = '[&>*]:-mx-[.05em] [&>*]:-mb-[.12em] [&>*]:px-[.05em] [&>*]:pb-[.12em]';

export default function Hero({ entered }) {
  const root = useRef(null);
  const chars = useRef({ a: [], b: [] });

  useGSAP(() => {
    const a = SplitText.create('.hn-1', { type: 'chars', mask: 'chars' });
    const b = SplitText.create('.hn-2', { type: 'chars', mask: 'chars' });
    chars.current = { a: a.chars, b: b.chars };
    gsap.set([a.chars, b.chars], { yPercent: 118 });
    gsap.set('.hn-amp', { opacity: 0, scale: 0.7 });
    gsap.set('.hero-fade', { opacity: 0, y: 20 });
    gsap.set('.hero-media', { scale: 1.12 });

    // as you scroll away, the frame drifts and the titles dissolve
    gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true } })
      .to('.hero-media', { yPercent: 12, ease: 'none' }, 0)
      .to('.hero-inner', { yPercent: -18, opacity: 0, ease: 'none' }, 0);
  }, { scope: root });

  useGSAP(() => {
    if (!entered) return;
    gsap.timeline({ defaults: { ease: EASE } })
      .to('.hero-media', { scale: 1, duration: 3.6, ease: 'power3.out' }, 0)
      .to('.hero-eyebrow', { opacity: 1, y: 0, duration: 1.8 }, 0.3)
      .to(chars.current.a, { yPercent: 0, duration: 2.2, stagger: 0.07 }, 0.45)
      .to('.hn-amp', { opacity: 1, scale: 1, duration: 2.2 }, 1)
      .to(chars.current.b, { yPercent: 0, duration: 2.2, stagger: 0.07 }, 0.95)
      .to('.hero-meta', { opacity: 1, y: 0, duration: 1.8 }, 1.7)
      .to('.hero-for', { opacity: 1, y: 0, duration: 1.8 }, 1.95)
      .to('.scroll-cue', { opacity: 1, y: 0, duration: 1.8 }, 2.4);
  }, { scope: root, dependencies: [entered] });

  return (
    <section id="hero" ref={root} className="relative flex h-screen-s min-h-[560px] items-end overflow-hidden">
      <div className="hero-media absolute inset-0 overflow-hidden will-change-transform">
        <img
          src={img(C.hero.image, 1600)} srcSet={srcSet(C.hero.image)} sizes="100vw" alt="" fetchPriority="high"
          className="animate-kenburns size-full origin-[60%_40%] object-cover object-[50%_28%] brightness-60 contrast-108 saturate-82 sepia-16"
        />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,10,9,.75)_0%,rgba(11,10,9,0)_26%,rgba(11,10,9,0)_45%,rgba(11,10,9,.88)_82%,var(--color-obsidian)_100%),radial-gradient(80%_50%_at_15%_100%,rgba(90,15,31,.45),transparent_70%)]" />

      <div className="hero-inner px-gutter relative z-[2] will-change-transform w-full pb-[calc(118px+env(safe-area-inset-bottom))] text-center">
        <p className="hero-fade hero-eyebrow eyebrow text-ivory/70">{C.hero.eyebrow}</p>
        <h1 aria-label={`${C.couple.partner1} and ${C.couple.partner2}`} className="font-display mt-[22px] mb-[26px] flex flex-col items-center text-[clamp(5rem,27.5vw,16rem)] leading-[.86] font-normal tracking-[-.035em] desk:flex-row desk:items-baseline desk:justify-center desk:gap-[.14em] desk:text-[clamp(6rem,12.5vw,15rem)]">
          <span className={`hn-1 block ${MASK}`} aria-hidden="true">{C.couple.partner1}</span>
          <span className="hn-amp amp-lines my-[.08em] flex items-center gap-[.5em] text-[.38em] leading-none desk:text-[.62em]" aria-hidden="true"><em className="gold-text">&amp;</em></span>
          <span className={`hn-2 block italic ${MASK}`} aria-hidden="true">{C.couple.partner2}</span>
        </h1>
        <div className="hero-fade hero-meta eyebrow flex items-center justify-center gap-4 text-ivory">
          <span>{fmt.dots(C.date)}</span><i className="block h-px w-[42px] bg-gold" /><span>{C.city}</span>
        </div>
        <p className="hero-fade hero-for mt-5 min-h-[1.5em] text-ivory/58 italic">{guest ? `Reserved for ${guest}` : ''}</p>
      </div>

      <div className="hero-fade scroll-cue eyebrow absolute bottom-[calc(26px+env(safe-area-inset-bottom))] left-1/2 z-[2] flex -translate-x-1/2 flex-col items-center gap-2.5 text-[9px] text-ivory/58" aria-hidden="true">
        <span>Scroll</span>
        <i className="block h-[46px] w-px origin-top bg-[linear-gradient(var(--color-gold),transparent)] [animation:cue_2.6s_var(--ease-lux-io)_infinite]" />
      </div>
    </section>
  );
}
