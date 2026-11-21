/* STORY — a pinned, scroll-scrubbed film: parallax photo layers wipe between
   chapters, text reveals line by line, and the year numerals roll 2019 → 2026. */
import { useRef } from 'react';
import C from '../config.js';
import { gsap, SplitText, useGSAP } from '../lib/gsap.js';
import { EASE, env, img, roman } from '../lib/utils.js';
import { Rich } from '../components/Ui.jsx';

const DIGITS = '0123456789'.split('');

export default function Story() {
  const root = useRef(null);
  const ch = C.story;
  const n = ch.length;

  useGSAP(() => {
    const q = (s) => gsap.utils.toArray(s, root.current);
    const backs = q('.sp-back'), fronts = q('.sp-front'), arts = q('.st'), strips = q('.roll-strip');
    const cur = root.current.querySelector('.sc-cur');
    const digitsOf = (i) => Array.from(String(ch[i].year)).map(Number);

    const linesOf = arts.map((a) => SplitText.create(a.querySelectorAll('.st-split'), { type: 'lines', mask: 'lines' }).lines);
    digitsOf(0).forEach((d, j) => strips[j] && gsap.set(strips[j], { yPercent: -d * 10 }));
    backs.forEach((b, i) => gsap.set(b, { clipPath: i ? 'inset(100% 0% 0% 0%)' : 'inset(0% 0% 0% 0%)' }));
    fronts.forEach((f, i) => gsap.set(f, { clipPath: i ? 'inset(100% 0% 0% 0%)' : 'inset(0% 0% 0% 0%)' }));
    linesOf.forEach((ls, i) => i && gsap.set(ls, { yPercent: 115 }));

    gsap.from(linesOf[0], { yPercent: 115, duration: 1.8, stagger: 0.1, ease: EASE, scrollTrigger: { trigger: root.current, start: 'top 55%', once: true } });
    gsap.from('.story-year', { opacity: 0, y: 60, duration: 2.2, ease: EASE, scrollTrigger: { trigger: root.current, start: 'top 60%', once: true } });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: root.current, start: 'top top', end: () => `+=${n * 105}%`,
        pin: '.story-stage', scrub: 1.2, anticipatePin: 1,
        onUpdate: () => {
          const t = tl.time();
          let idx = 0; for (let i = 1; i < n; i++) if (t >= i - 1 + 0.55) idx = i;
          const r = roman(idx + 1);
          if (cur.textContent !== r) cur.textContent = r;
        }
      }
    });
    const IR = { immediateRender: false };
    for (let i = 1; i < n; i++) {
      const at = i - 1 + 0.3;
      tl.fromTo(linesOf[i - 1], { yPercent: 0 }, { yPercent: -115, duration: 0.35, stagger: 0.025, ease: 'power2.in', ...IR }, at)
        .fromTo(backs[i - 1], { clipPath: 'inset(0% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.6, ease: 'power2.inOut', ...IR }, at)
        .fromTo(backs[i], { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6, ease: 'power2.inOut', ...IR }, at)
        .fromTo(backs[i].querySelector('img'), { scale: 1.35 }, { scale: 1.05, duration: 1, ease: 'none', ...IR }, at)
        .fromTo(fronts[i - 1], { clipPath: 'inset(0% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.55, ease: 'power2.inOut', ...IR }, at + 0.1)
        .fromTo(fronts[i], { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.55, ease: 'power2.inOut', ...IR }, at + 0.16)
        .fromTo(fronts[i].querySelector('img'), { scale: 1.3 }, { scale: 1, duration: 0.8, ease: 'none', ...IR }, at + 0.16);
      const from = digitsOf(i - 1), to = digitsOf(i);
      to.forEach((d, j) => {
        if (strips[j] && d !== from[j]) tl.fromTo(strips[j], { yPercent: -from[j] * 10 }, { yPercent: -d * 10, duration: 0.6, ease: 'power3.inOut', ...IR }, at + 0.05 + j * 0.04);
      });
      tl.fromTo(linesOf[i], { yPercent: 115 }, { yPercent: 0, duration: 0.5, stagger: 0.05, ease: 'power3.out', ...IR }, at + 0.32);
    }
    tl.to({}, { duration: 0.5 });
    const total = tl.duration();
    if (!env.reduced) {
      tl.fromTo(fronts, { yPercent: 8 }, { yPercent: -10, duration: total, ease: 'none' }, 0)
        .fromTo(q('.sp-back img'), { yPercent: -4 }, { yPercent: 4, duration: total, ease: 'none' }, 0);
    }
    tl.fromTo('.story-bar', { scaleX: 0 }, { scaleX: 1, duration: total, ease: 'none' }, 0);
  }, { scope: root });

  return (
    <section id="story" ref={root} className="relative bg-obsidian">
      <div className="story-stage relative h-screen-s min-h-[600px] overflow-hidden bg-[radial-gradient(90%_60%_at_70%_30%,#1a1512,var(--color-obsidian)_70%)]">
        <header className="absolute inset-x-gutter top-[calc(84px+env(safe-area-inset-top))] z-[6] flex items-center justify-between">
          <p className="eyebrow text-gold">How it began</p>
          <p className="eyebrow flex items-center gap-2.5 text-ivory"><span className="sc-cur">I</span><i className="h-px w-7 bg-gold/40" /><span>{roman(n)}</span></p>
        </header>

        <div className="story-year font-display year-outline pointer-events-none absolute inset-x-0 top-[14%] z-[3] flex justify-center text-[clamp(7rem,33vw,24rem)] leading-none tracking-[-.045em] desk:inset-x-auto desk:top-auto desk:bottom-[8%] desk:left-gutter desk:z-[1] desk:text-[21vw]" aria-hidden="true">
          {Array.from(String(ch[0].year)).map((_, j) => (
            <span key={j} className="roll"><span className="roll-strip will-change-transform">{DIGITS.map((d) => <span key={d}>{d}</span>)}</span></span>
          ))}
        </div>

        <div className="absolute inset-0 z-[2]">
          {ch.map((s, i) => (
            <div key={i}>
              <figure className="sp-back absolute top-[21%] right-[16%] left-gutter m-0 h-[37%] overflow-hidden max-desk:[@media(max-height:720px)]:top-[19%] max-desk:[@media(max-height:720px)]:h-[32%] desk:top-[15%] desk:right-gutter desk:left-[46%] desk:h-[66%]">
                <img src={img(s.imageBack, env.isMobile ? 900 : 1600)} alt="" loading={i ? 'lazy' : 'eager'} className="grade size-full object-cover will-change-transform" />
              </figure>
              <figure className="sp-front absolute top-[37%] right-gutter z-[4] m-0 aspect-[4/5] w-[37%] overflow-hidden shadow-[0_40px_70px_-20px_rgba(0,0,0,.9)] outline outline-offset-[6px] outline-gold/50 max-desk:[@media(max-height:720px)]:top-[31%] max-desk:[@media(max-height:720px)]:w-[31%] desk:top-[48%] desk:right-auto desk:left-[35%] desk:w-[17vw]">
                <img src={img(s.imageFront, 700)} alt="" loading={i ? 'lazy' : 'eager'} className="grade-soft size-full object-cover will-change-transform" />
              </figure>
            </div>
          ))}
        </div>

        <div className="absolute inset-x-gutter bottom-[calc(64px+env(safe-area-inset-bottom))] z-[5] h-[34%] desk:top-[24%] desk:right-auto desk:bottom-auto desk:h-[46%] desk:w-[32%]">
          {ch.map((s, i) => (
            <article key={i} className="st absolute inset-x-0 bottom-0 desk:top-0 desk:bottom-auto">
              <p className="st-split eyebrow text-gold">{s.place} · {s.year}</p>
              <h3 className="st-split font-display mt-3 mb-3.5 text-[clamp(2.3rem,10.6vw,5.6rem)] leading-none font-normal tracking-[-.02em]"><Rich text={s.title} /></h3>
              <p className="st-split m-0 max-w-[36ch] leading-[1.5] text-ivory/58 max-desk:[@media(max-height:720px)]:text-[.95em]">{s.text}</p>
            </article>
          ))}
        </div>

        <div className="absolute inset-x-gutter bottom-[calc(30px+env(safe-area-inset-bottom))] z-[6] h-px bg-gold/15">
          <i className="story-bar absolute inset-0 origin-left scale-x-0 bg-gold" />
        </div>
      </div>
    </section>
  );
}
