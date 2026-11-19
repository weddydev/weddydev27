/* ==========================================================================
   THE PRIVATE SCREENING
   stage: "title" (preloader) → "envelope" → "site"
   The film (all sections) mounts once fonts are ready, underneath the intro,
   so every ScrollTrigger measures the final layout.
   ========================================================================== */
import { useEffect, useState } from 'react';
import C from './config.js';
import { ScrollTrigger } from './lib/gsap.js';
import { env, store, wait, img, applyTheme, makeGrain } from './lib/utils.js';
import { initLenis, unlockScroll, navigate } from './lib/scroll.js';
import { SvgDefs } from './components/Ui.jsx';
import { Atmosphere, Cursor, Curtain, SoundToggle, TopBar } from './components/Chrome.jsx';
import Preloader from './intro/Preloader.jsx';
import Envelope from './intro/Envelope.jsx';
import Hero from './sections/Hero.jsx';
import Prologue from './sections/Prologue.jsx';
import Story from './sections/Story.jsx';
import Countdown from './sections/Countdown.jsx';
import Events from './sections/Events.jsx';
import Venue from './sections/Venue.jsx';
import Gallery from './sections/Gallery.jsx';
import Travel from './sections/Travel.jsx';
import Rsvp from './sections/Rsvp.jsx';
import Finale from './sections/Finale.jsx';

const returning = store.get('lux-opened') === '1' || env.reduced;
const preload = (src) => new Promise((res) => { const i = new Image(); i.onload = i.onerror = res; i.src = src; });

export default function App() {
  const [stage, setStage] = useState('title');
  const [fontsReady, setFontsReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [preGone, setPreGone] = useState(false);
  const [envGone, setEnvGone] = useState(returning);

  /* boot: theme, grain, smooth scroll, real asset loading */
  useEffect(() => {
    applyTheme();
    makeGrain();
    initLenis();
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    const fonts = Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), wait(3500)]).then(() => setFontsReady(true));
    const jobs = [fonts, preload(img(C.hero.image, 1600)), preload(img(C.story[0].imageBack, env.isMobile ? 900 : 1600)), preload(img(C.story[0].imageFront, 700))];
    let done = 0;
    jobs.forEach((j) => j.then(() => setProgress(Math.min(1, ++done / jobs.length))));
    Promise.race([Promise.all(jobs), wait(7000)]).then(() => setLoaded(true));
  }, []);

  /* once the film is mounted, measure everything */
  useEffect(() => { if (fontsReady) requestAnimationFrame(() => ScrollTrigger.refresh()); }, [fontsReady]);

  /* the guest enters */
  useEffect(() => {
    if (stage !== 'site') return;
    document.documentElement.classList.remove('is-locked');
    window.scrollTo(0, 0);
    unlockScroll();
    ScrollTrigger.refresh();
    if (location.hash && document.querySelector(location.hash)) setTimeout(() => navigate(location.hash), 1600);
  }, [stage]);

  return (
    <>
      <SvgDefs />
      <Atmosphere />

      {fontsReady && (
        <main id="site">
          <Hero entered={stage === 'site'} />
          <Prologue />
          <Story />
          <Countdown />
          <Events />
          <Venue />
          <Gallery />
          <Travel />
          <Rsvp />
          <Finale />
        </main>
      )}

      <TopBar visible={stage === 'site'} />
      <Curtain />
      <SoundToggle visible={stage !== 'title'} />
      <Cursor />
      <canvas id="confetti" className="pointer-events-none fixed inset-0 z-[880] hidden size-full" aria-hidden="true" />

      {!envGone && (
        <Envelope active={stage === 'envelope'} onEnter={() => setStage('site')} onGone={() => setEnvGone(true)} />
      )}
      {!preGone && (
        <Preloader progress={progress} loaded={loaded} quick={returning}
          onOpen={() => setStage(returning ? 'site' : 'envelope')} onGone={() => setPreGone(true)} />
      )}
    </>
  );
}
