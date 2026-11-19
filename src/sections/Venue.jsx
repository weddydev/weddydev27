/* VENUE — an arched palace window opens (clip-path) onto the venue as you scroll,
   the name slides in at massive scale, then a dark, gold-framed map. */
import { useRef, useState } from 'react';
import C from '../config.js';
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap.js';
import { img, srcSet } from '../lib/utils.js';
import Button from '../components/Button.jsx';
import { Corners, Rich } from '../components/Ui.jsx';
import { Lines, Reveal } from '../components/Reveal.jsx';

export default function Venue() {
  const root = useRef(null);
  const [mapOn, setMapOn] = useState(false);
  const words = String(C.venue.name).split(' ');

  useGSAP(() => {
    gsap.timeline({ scrollTrigger: { trigger: '.venue-pin', start: 'top top', end: '+=130%', pin: true, scrub: 1.2, anticipatePin: 1 } })
      .fromTo('.venue-media', { clipPath: 'inset(16% 12% 12% 12% round 48vw 48vw 0vw 0vw)' }, { clipPath: 'inset(0% 0% 0% 0% round 0vw 0vw 0vw 0vw)', ease: 'power2.inOut', duration: 1 }, 0)
      .fromTo('.venue-media img', { scale: 1.3 }, { scale: 1, ease: 'none', duration: 1.2 }, 0)
      .fromTo('.vn-0', { xPercent: -24 }, { xPercent: 0, ease: 'none', duration: 1.2 }, 0)
      .fromTo('.vn-1', { xPercent: 24 }, { xPercent: 0, ease: 'none', duration: 1.2 }, 0)
      .fromTo('.venue-kicker', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.4 }, 0.55);
    ScrollTrigger.create({ trigger: '.venue-body', start: 'top bottom+=600', once: true, onEnter: () => setMapOn(true) });
  }, { scope: root });

  return (
    <section id="venue" ref={root} className="relative bg-obsidian pb-[clamp(110px,22vw,200px)]">
      <div className="venue-pin relative grid h-screen-s min-h-[560px] place-items-center overflow-hidden">
        <div className="venue-media absolute inset-0 will-change-[clip-path]">
          <img src={img(C.venue.image, 1600)} srcSet={srcSet(C.venue.image)} sizes="100vw" alt="" loading="lazy" className="grade size-full object-cover will-change-transform" />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(11,10,9,.4),transparent_30%,transparent_60%,var(--color-obsidian))]" />
        <div className="relative z-[2] px-3 text-center">
          <p className="venue-kicker eyebrow text-gold">{C.venue.pre}</p>
          <h2 className="font-display mt-3.5 mb-[22px] text-[clamp(4.6rem,25vw,17rem)] leading-[.84] font-normal tracking-[-.04em] whitespace-nowrap desk:text-[15vw]" aria-label={`${C.venue.pre} ${C.venue.name.replace(/[*~]/g, '')}`}>
            {words.map((w, i) => (
              <span key={i} className={`vn-${i} block will-change-transform desk:mx-[.08em] desk:inline-block ${i === 0 ? 'text-outline text-ivory' : ''}`} aria-hidden="true"><Rich text={w} /></span>
            ))}
          </h2>
          <p className="eyebrow text-ivory">{C.city} · {C.region}</p>
        </div>
      </div>

      <div className="venue-body px-gutter mx-auto max-w-[780px] text-center">
        <Lines as="p" className="font-display mt-[clamp(60px,12vw,110px)] mb-7 text-[clamp(1.55rem,6.4vw,2.7rem)] leading-[1.22] tracking-[-.01em]">{C.venue.description}</Lines>
        <Reveal as="p" className="eyebrow leading-[2] text-ivory/58">{C.venue.address}</Reveal>
        <Reveal className="relative mt-[46px] mb-10 border border-gold/28 p-2.5">
          <Corners size={40} />
          {mapOn
            ? <iframe title="Map to the venue" src={`https://maps.google.com/maps?q=${encodeURIComponent(C.venue.mapQuery)}&z=15&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="map-dark block h-[clamp(300px,82vw,440px)] w-full border-0 bg-[#151210]" />
            : <div className="h-[clamp(300px,82vw,440px)] w-full bg-[#151210]" />}
        </Reveal>
        <Button as="a" href={C.venue.directionsUrl} target="_blank" rel="noopener" cursor="Go">Get directions</Button>
      </div>
    </section>
  );
}
