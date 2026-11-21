/* PROLOGUE — an ivory letter whose words fill with ink as you read */
import { useRef } from 'react';
import C from '../config.js';
import { gsap, useGSAP } from '../lib/gsap.js';
import { guest } from '../lib/utils.js';
import { useCurtain } from '../components/hooks.js';
import Monogram from '../components/Monogram.jsx';
import { Kicker } from '../components/Ui.jsx';

const words = String(C.prologue.text).split(/(\*[^*]+\*)/).flatMap((part) => {
  const em = /^\*.*\*$/.test(part);
  return part.replace(/\*/g, '').split(/\s+/).filter(Boolean).map((w) => ({ w, em }));
});

export default function Prologue() {
  const root = useRef(null);
  useCurtain(root);
  useGSAP(() => {
    const ink = getComputedStyle(document.documentElement).getPropertyValue('--color-obsidian').trim() || '#0b0a09';
    const tl = gsap.timeline({ scrollTrigger: { trigger: '.pro-text', start: 'top 82%', end: 'bottom 52%', scrub: 1 } });
    gsap.utils.toArray('.pro-w', root.current).forEach((w, i) => tl.to(w, { color: w.dataset.em ? '#9a7430' : ink, duration: 0.5, ease: 'none' }, i * 0.14));
  }, { scope: root });

  const greet = guest ? C.greeting.prologueWithGuest.replace('{guest}', guest) : C.greeting.prologueGeneric;

  return (
    <section id="prologue" ref={root} className="px-gutter relative bg-ivory py-[clamp(130px,30vw,260px)] text-obsidian">
      <div className="mx-auto max-w-[1060px]">
        <div className="mb-11 w-[58px] text-gold-deep"><Monogram variant="mini" mono /></div>
        <p className="font-deva mb-7 text-[clamp(1.25rem,5vw,1.7rem)] leading-none text-[#9a3b28]" lang="sa">{C.invocation.devanagari} <span className="eyebrow ml-2 align-middle text-[9px] text-gold-deep">{C.invocation.latin}</span></p>
        <Kicker className="text-gold-deep">Prologue</Kicker>
        <p className="font-display mt-7 mb-[22px] text-[clamp(1.4rem,5.6vw,2.1rem)] text-gold-deep italic">{greet}</p>
        <p className="pro-text font-display m-0 text-[clamp(1.95rem,8.6vw,4.7rem)] leading-[1.12] tracking-[-.018em]">
          {words.map(({ w, em }, i) => (
            <span key={i}><span className={`pro-w text-obsidian/15 ${em ? 'italic' : ''}`} data-em={em ? '1' : undefined}>{w}</span>{' '}</span>
          ))}
        </p>
        <p className="eyebrow kicker mt-14 text-gold-deep">{C.prologue.signoff}</p>
      </div>
    </section>
  );
}
