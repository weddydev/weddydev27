/* Title sequence: the monogram draws itself, a gold line fills with REAL loading
   progress, "An invitation, for you." fades in — then the palace doors open. */
import { useEffect, useRef } from 'react';
import { gsap, useGSAP } from '../lib/gsap.js';
import { EASE, wait } from '../lib/utils.js';
import { audio } from '../lib/audio.js';
import Monogram, { drawCrest } from '../components/Monogram.jsx';

export default function Preloader({ progress, loaded, quick, onOpen, onGone }) {
  const root = useRef(null);
  const minDone = useRef(false);
  const opened = useRef(false);
  const isLoaded = useRef(loaded);
  isLoaded.current = loaded;
  const k = quick ? 0.45 : 1;

  useGSAP(() => {
    drawCrest(gsap, root.current.querySelector('.pre-crest'), k);
    gsap.fromTo('.pre-word', { opacity: 0, y: 14, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.6 * k, stagger: 0.45 * k, ease: EASE, delay: 1.9 * k });
  }, { scope: root });

  // the gold line follows real loading progress
  useEffect(() => { gsap.to('.pre-fill', { scaleX: progress * 0.85, duration: 1.2, ease: 'power2.out' }); }, [progress]);

  useEffect(() => { wait((quick ? 1.6 : 4.4) * 1000).then(() => { minDone.current = true; tryOpen(); }); }, []); // eslint-disable-line
  useEffect(() => { tryOpen(); }, [loaded]); // eslint-disable-line

  function tryOpen() {
    if (!isLoaded.current || !minDone.current || opened.current) return;
    opened.current = true;
    const q = (s) => root.current.querySelectorAll(s);
    gsap.timeline({ defaults: { ease: 'power3.inOut' }, onComplete: onGone })
      .to(q('.pre-fill'), { scaleX: 1, duration: 0.8, ease: 'power2.out' })
      .to(q('.pre-center'), { opacity: 0, scale: 1.04, filter: 'blur(6px)', duration: 1.1, ease: 'power2.in' }, '+=.25')
      .to(q('.door-light'), { opacity: 1, duration: 0.6, ease: 'power2.out' }, '-=.3')
      .add(() => audio.sfx('whoosh'))
      .to(q('.door-l'), { rotateY: 78, xPercent: -6, duration: 2.6 }, '-=.1')
      .to(q('.door-r'), { rotateY: -78, xPercent: 6, duration: 2.6 }, '<')
      .to(q('.door-light'), { scaleX: 260, opacity: 0, duration: 2.2, ease: 'power2.out' }, '<.1')
      .add(onOpen, '-=1.9');
  }

  return (
    <div ref={root} className="fixed inset-0 z-[1000] overflow-hidden [perspective:2200px]" aria-live="polite">
      <div className="door door-l"><div className="door-panel" /></div>
      <div className="door door-r"><div className="door-panel" /></div>
      <div className="door-light absolute inset-y-0 left-1/2 -ml-px w-0.5 opacity-0 blur-[6px] bg-[radial-gradient(closest-side,rgba(255,240,200,.9),rgba(212,175,106,.35)_40%,transparent)]" aria-hidden="true" />
      <div className="pre-center gutter-x absolute inset-0 flex flex-col items-center justify-center text-center">
        <div className="pre-crest aspect-square w-[clamp(118px,34vw,170px)]"><Monogram variant="draw" /></div>
        <div className="mt-[38px] mb-[26px] h-px w-[min(200px,50vw)] overflow-hidden bg-gold/15">
          <i className="pre-fill block h-full origin-left scale-x-0 bg-[linear-gradient(90deg,transparent,var(--color-gold),#fff3cf)]" />
        </div>
        <p className="font-display m-0 text-[clamp(1.25rem,5.4vw,1.9rem)] tracking-[.01em]">
          <span className="pre-word inline-block opacity-0">An invitation,</span>{' '}
          <em className="pre-word inline-block text-gold opacity-0">for you.</em>
        </p>
      </div>
    </div>
  );
}
