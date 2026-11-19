/* ==========================================================================
   Scroll — Lenis inertial scrolling wired into GSAP's ticker + ScrollTrigger,
   and the curtain-wipe navigation used by the menu.
   ========================================================================== */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { env } from './utils.js';
import { audio } from './audio.js';

export const scroll = { lenis: null };

export function initLenis() {
  if (env.reduced || scroll.lenis) return scroll.lenis;
  const lenis = new Lenis({ duration: 1.5, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true, wheelMultiplier: 0.9 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();
  scroll.lenis = lenis;
  return lenis;
}
export const lockScroll = () => scroll.lenis && scroll.lenis.stop();
export const unlockScroll = () => scroll.lenis && scroll.lenis.start();

/* Fade-through-black curtain, jump, reveal */
export function navigate(hash) {
  const target = document.querySelector(hash);
  if (!target) return;
  const jump = () => {
    if (scroll.lenis) scroll.lenis.scrollTo(target, { immediate: true, force: true });
    else target.scrollIntoView();
    ScrollTrigger.update();
  };
  const c = document.getElementById('curtain');
  if (env.reduced || !c) return jump();
  audio.sfx('whoosh');
  gsap.timeline()
    .set(c, { yPercent: 101 })
    .to(c, { yPercent: 0, duration: 0.95, ease: 'power3.inOut' })
    .add(jump)
    .to(c, { yPercent: -101, duration: 1.1, ease: 'power3.inOut', delay: 0.15 })
    .set(c, { yPercent: 101 });
}
