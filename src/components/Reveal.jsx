/* Scroll reveals.
   <Reveal>  — slow fade + rise when it enters.
   <Lines>   — SplitText masked line-by-line reveal (reverts after, so resizing stays clean). */
import { useRef } from 'react';
import { gsap, SplitText, useGSAP } from '../lib/gsap.js';
import { EASE } from '../lib/utils.js';

export function Reveal({ as: Tag = 'div', children, className = '', delay = 0, y = 42, start = 'top 90%', ...rest }) {
  const ref = useRef(null);
  useGSAP(() => {
    gsap.fromTo(ref.current, { opacity: 0, y }, { opacity: 1, y: 0, duration: 1.8, delay, ease: EASE, scrollTrigger: { trigger: ref.current, start, once: true } });
  }, { scope: ref });
  return <Tag ref={ref} className={className} {...rest}>{children}</Tag>;
}

export function Lines({ as: Tag = 'h2', children, className = '', delay = 0, start = 'top 88%', ...rest }) {
  const ref = useRef(null);
  useGSAP(() => {
    const split = SplitText.create(ref.current, { type: 'lines', mask: 'lines', linesClass: 'pb-[.08em] -mb-[.08em]' });
    gsap.from(split.lines, {
      yPercent: 115, duration: 1.8, stagger: 0.12, delay, ease: EASE,
      scrollTrigger: { trigger: ref.current, start, once: true },
      onComplete: () => split.revert()
    });
    return () => split.revert();
  }, { scope: ref });
  return <Tag ref={ref} className={className} {...rest}>{children}</Tag>;
}
