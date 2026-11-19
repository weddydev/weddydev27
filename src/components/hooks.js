/* Interaction hooks: magnetic pull and 3D tilt with light that follows the finger */
import { useEffect } from 'react';
import { gsap, useGSAP } from '../lib/gsap.js';
import { env, clamp, EASE } from '../lib/utils.js';

/* Ivory scenes open like a curtain as they arrive */
export function useCurtain(ref) {
  useGSAP(() => {
    gsap.fromTo(ref.current, { clipPath: 'inset(7% 5% 0% 5% round 32px 32px 0px 0px)' }, {
      clipPath: 'inset(0% 0% 0% 0% round 0px 0px 0px 0px)', ease: 'none',
      scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'top 25%', scrub: true }
    });
  }, { scope: ref });
}

export function useMagnetic(ref, strength = 0.32) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !env.finePointer || env.reduced) return;
    const move = (e) => {
      const r = el.getBoundingClientRect();
      gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * strength, y: (e.clientY - r.top - r.height / 2) * strength, duration: 1.1, ease: EASE });
    };
    const leave = () => gsap.to(el, { x: 0, y: 0, duration: 1.6, ease: EASE });
    el.addEventListener('mousemove', move); el.addEventListener('mouseleave', leave);
    return () => { el.removeEventListener('mousemove', move); el.removeEventListener('mouseleave', leave); };
  }, [ref, strength]);
}

export function useTilt(ref) {
  useEffect(() => {
    const card = ref.current;
    if (!card || env.reduced) return;
    const shine = card.querySelector('.pass-shine') || card;
    const set = (cx, cy, rotate) => {
      const r = card.getBoundingClientRect();
      const px = clamp((cx - r.left) / r.width, 0, 1), py = clamp((cy - r.top) / r.height, 0, 1);
      shine.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
      shine.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
      if (rotate) gsap.to(card, { rotateY: (px - 0.5) * 12, rotateX: -(py - 0.5) * 10, transformPerspective: 1200, duration: 1.2, ease: EASE });
    };
    const reset = () => gsap.to(card, { rotateX: 0, rotateY: 0, duration: 1.8, ease: EASE });
    const pm = (e) => e.pointerType === 'mouse' && set(e.clientX, e.clientY, true);
    const pl = (e) => e.pointerType === 'mouse' && reset();
    const ts = (e) => set(e.touches[0].clientX, e.touches[0].clientY, true);
    const tm = (e) => set(e.touches[0].clientX, e.touches[0].clientY, false);
    card.addEventListener('pointermove', pm); card.addEventListener('pointerleave', pl);
    card.addEventListener('touchstart', ts, { passive: true }); card.addEventListener('touchmove', tm, { passive: true }); card.addEventListener('touchend', reset, { passive: true });
    return () => {
      card.removeEventListener('pointermove', pm); card.removeEventListener('pointerleave', pl);
      card.removeEventListener('touchstart', ts); card.removeEventListener('touchmove', tm); card.removeEventListener('touchend', reset);
    };
  }, [ref]);
}
