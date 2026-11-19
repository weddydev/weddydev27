/* TRAVEL & CONCIERGE — an editorial index of arrangements and a black-card
   personal concierge with WhatsApp click-to-chat. */
import { useRef } from 'react';
import C from '../config.js';
import { gsap, useGSAP } from '../lib/gsap.js';
import { roman, fill, guest } from '../lib/utils.js';
import { useTilt } from '../components/hooks.js';
import Monogram from '../components/Monogram.jsx';
import Button from '../components/Button.jsx';
import { Kicker, Rich } from '../components/Ui.jsx';
import { Lines, Reveal } from '../components/Reveal.jsx';

export default function Travel() {
  const card = useRef(null);
  const root = useRef(null);
  useTilt(card);
  useGSAP(() => {
    gsap.fromTo(card.current.querySelector('.pass-shine'), { '--mx': '-30%', '--my': '10%' }, { '--mx': '130%', '--my': '60%', duration: 2.6, ease: 'power2.inOut', scrollTrigger: { trigger: card.current, start: 'top 75%', once: true } });
  }, { scope: root });
  const cc = C.concierge;

  return (
    <section id="travel" ref={root} className="px-gutter relative bg-[linear-gradient(180deg,var(--color-obsidian),#100d0b)] py-[clamp(96px,22vw,200px)]">
      <header className="mx-auto mb-[clamp(56px,12vw,120px)] max-w-[1100px]">
        <Reveal><Kicker className="mb-[26px] text-gold">Travel &amp; concierge</Kicker></Reveal>
        <Lines className="font-display text-[clamp(2.9rem,13.5vw,8.2rem)] leading-[.96] font-normal tracking-[-.02em]">Every detail, <em className="gold-text">arranged.</em></Lines>
        <Reveal as="p" className="mt-7 max-w-[30ch] text-[1.08em] text-ivory/58 italic">From the moment you land to the last dance, you will be looked after. Please never hesitate to ask.</Reveal>
      </header>

      <ol className="mx-auto max-w-[1100px] p-0">
        {C.travel.map((t, i) => (
          <Reveal as="li" key={i} className="group grid grid-cols-[46px_1fr] gap-x-3.5 border-t border-gold/28 pt-[34px] pb-9 last:border-b desk:grid-cols-[90px_1.1fr_1fr] desk:py-12">
            <span className="font-display pt-[.5em] text-[1.15rem] text-gold italic">{roman(i + 1)}.</span>
            <div>
              <h3 className="font-display m-0 text-[clamp(2.1rem,9.4vw,3.8rem)] leading-none font-normal tracking-[-.02em] transition-transform duration-[1100ms] ease-lux group-hover:translate-x-2.5"><Rich text={t.title} /></h3>
              <p className="eyebrow mt-3 text-[9px] text-ivory/58">{t.meta}</p>
            </div>
            <p className="col-start-2 mt-4 mb-0 max-w-[44ch] text-ivory/58 desk:col-start-3 desk:mt-0">{t.text}</p>
          </Reveal>
        ))}
      </ol>

      <Reveal className="mx-auto mt-[clamp(80px,16vw,130px)] max-w-[560px]">
        <article ref={card} className="pass pass-concierge px-7 py-[30px]">
          <div className="pass-shine" />
          <div className="flex items-center justify-between">
            <span className="w-[42px]"><Monogram variant="mini" /></span>
            <span className="eyebrow text-gold">Personal concierge</span>
          </div>
          <p className="font-display mt-[46px] mb-2.5 text-[clamp(2.2rem,10vw,3.2rem)] leading-none tracking-[-.02em]">
            {cc.name}
            <em className="gold-text mt-3 block text-[.42em] tracking-normal">{cc.role}</em>
          </p>
          <p className="eyebrow text-[9px] text-ivory/58">{cc.hours}</p>
          <div className="relative z-[5] mt-[30px] flex flex-wrap gap-2.5">
            <Button as="a" cursor="Chat" target="_blank" rel="noopener" href={`https://wa.me/${cc.whatsapp}?text=${encodeURIComponent(fill(cc.message, guest || 'a guest'))}`}>Message on WhatsApp</Button>
            <Button as="a" variant="ghost" cursor="Call" href={`tel:+${cc.whatsapp}`}>Call</Button>
          </div>
        </article>
      </Reveal>
    </section>
  );
}
