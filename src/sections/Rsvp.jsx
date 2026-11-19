/* RSVP — a private-club reply: big typography, one question at a time,
   per-event attendance, party size, dietary wishes, a note to the couple.
   Delivery is configurable (WhatsApp / Formspree / Google Forms / demo). */
import { useRef, useState } from 'react';
import C from '../config.js';
import { gsap, SplitText, useGSAP } from '../lib/gsap.js';
import { EASE, guest, fmt, time, plain, buzz, clamp, wait, img } from '../lib/utils.js';
import { confetti } from '../lib/fx.js';
import { audio } from '../lib/audio.js';
import { scroll } from '../lib/scroll.js';
import Monogram, { drawCrest } from '../components/Monogram.jsx';
import Button from '../components/Button.jsx';
import { Kicker, Rich, Squiggle } from '../components/Ui.jsx';
import { Lines, Reveal } from '../components/Reveal.jsx';

const R = C.rsvp;
const MAX = R.maxGuests || 4;

function Question({ children, id }) {
  return <h3 id={id} className="font-display mb-[30px] overflow-hidden pb-[.08em] text-[clamp(2.2rem,9.8vw,3.9rem)] leading-none font-normal tracking-[-.02em]"><span className="step-q block">{children}</span></h3>;
}

export default function Rsvp() {
  const root = useRef(null), stepRef = useRef(null), formRef = useRef(null), dir = useRef(1), first = useRef(true);
  const [step, setStep] = useState(0);
  const [s, setS] = useState({ name: guest, att: {}, guests: 1, diet: [], dietOther: '', note: '' });
  const [err, setErr] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(null);
  const set = (patch) => setS((o) => ({ ...o, ...patch }));

  const answered = Object.keys(s.att).length;
  const anyYes = Object.values(s.att).includes('yes');
  const flow = anyYes || answered < C.events.length ? [0, 1, 2, 3, 4] : [0, 1, 4];
  const pos = Math.max(0, flow.indexOf(step));
  const last = pos === flow.length - 1;

  const { contextSafe } = useGSAP(() => {}, { scope: root });

  /* each new question rises out of its mask */
  useGSAP(() => {
    if (first.current) { first.current = false; return; }
    gsap.from('.step-q', { yPercent: 110, duration: 1.4, ease: EASE });
    gsap.from(Array.from(stepRef.current.children).slice(1), { opacity: 0, y: 24 * dir.current, duration: 1.3, stagger: 0.06, ease: EASE, delay: 0.15 });
    if (formRef.current && formRef.current.getBoundingClientRect().top < 0 && scroll.lenis) scroll.lenis.scrollTo(formRef.current, { offset: -90, duration: 1.4 });
  }, { scope: root, dependencies: [step] });

  const goTo = contextSafe((next, d) => {
    dir.current = d;
    gsap.to(stepRef.current.children, { opacity: 0, y: -18 * d, duration: 0.5, stagger: 0.03, ease: 'power2.in', onComplete: () => setStep(next) });
  });

  const shake = (m) => { setErr(m); buzz(30); gsap.fromTo('.rsvp-err', { x: -6 }, { x: 0, duration: 0.6, ease: 'elastic.out(1,.4)' }); };
  const onNext = () => {
    if (step === 0 && s.name.trim().length < 2) return shake('Please tell us your name.');
    if (step === 1 && answered < C.events.length) return shake('Please let us know for each celebration.');
    setErr('');
    if (last) submit(); else goTo(flow[pos + 1], 1);
  };
  const onBack = () => { setErr(''); if (pos > 0) goTo(flow[pos - 1], -1); };

  /* ---------- delivery ---------- */
  const summary = () => {
    const yes = C.events.filter((_, i) => s.att[i] === 'yes').map((e) => plain(e.title));
    const no = C.events.filter((_, i) => s.att[i] === 'no').map((e) => plain(e.title));
    const diet = [...s.diet, ...(s.dietOther.trim() ? [s.dietOther.trim()] : [])].join(', ');
    return { name: s.name.trim(), attending: yes.join(', ') || 'None', declining: no.join(', ') || 'None', guests: anyYes ? s.guests : 0, dietary: diet || '—', note: s.note.trim() || '—', link: guest || '', sent: new Date().toISOString() };
  };
  const message = (d) => [
    `✦ RSVP · ${C.couple.partner1} & ${C.couple.partner2} ✦`, '', `Name: ${d.name}`, '',
    ...C.events.map((e, i) => `${s.att[i] === 'yes' ? '✓' : '✗'} ${plain(e.title)} — ${s.att[i] === 'yes' ? 'Joyfully accepts' : 'Regretfully declines'}`), '',
    ...(anyYes ? [`Party of ${d.guests}`, `Dietary: ${d.dietary}`] : []), `Note: ${d.note}`
  ].join('\n');

  async function submit() {
    if (sending) return;
    const d = summary();
    setSending(true);
    try {
      if (R.method === 'whatsapp') {
        window.open(`https://wa.me/${R.whatsapp}?text=${encodeURIComponent(message(d))}`, '_blank', 'noopener');
      } else if (R.method === 'formspree' && R.endpoint) {
        const res = await fetch(R.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(d) });
        if (!res.ok) throw new Error('send failed');
      } else if (R.method === 'google' && R.googleForm?.action) {
        const f = R.googleForm.fields || {}, body = new URLSearchParams();
        const put = (k, v) => f[k] && body.append(f[k], v);
        put('name', d.name); put('attendance', `Attending: ${d.attending} | Declining: ${d.declining}`); put('guests', String(d.guests)); put('dietary', d.dietary); put('note', d.note);
        await fetch(R.googleForm.action, { method: 'POST', mode: 'no-cors', body });
      } else {
        await wait(900); // demo
      }
      gsap.to(formRef.current, { opacity: 0, y: -20, duration: 0.8, ease: 'power2.in', onComplete: () => setDone(anyYes ? 'yes' : 'no') });
    } catch {
      setSending(false);
      setErr('We couldn’t send your reply just now. Please try again, or message your concierge.');
    }
  }

  /* ---------- success ---------- */
  useGSAP(() => {
    if (!done) return;
    const box = root.current.querySelector('.rs-box');
    const split = SplitText.create(box.querySelector('.rs-title'), { type: 'lines', mask: 'lines' });
    gsap.timeline({ defaults: { ease: EASE } })
      .add(drawCrest(gsap, box, 0.8), 0)
      .from(split.lines, { yPercent: 115, duration: 2, stagger: 0.14 }, 0.5)
      .from('.rs-sub', { opacity: 0, y: 16, duration: 1.6 }, 1.4);
    if (done === 'yes') { confetti(document.getElementById('confetti')); audio.sfx('chime'); }
    buzz(done === 'yes' ? [20, 60, 20, 60, 40] : 20);
    scroll.lenis && scroll.lenis.scrollTo('#rsvp', { offset: 40, duration: 1.6 });
  }, { scope: root, dependencies: [done] });

  return (
    <section id="rsvp" ref={root} className="px-gutter relative overflow-hidden py-[clamp(96px,22vw,200px)] bg-[radial-gradient(90%_55%_at_50%_0%,rgba(90,15,31,.6),transparent_70%),linear-gradient(180deg,#0f0b0a,#1b0710_60%,var(--color-obsidian))]">
      <div className="pointer-events-none absolute inset-0 opacity-20 [mask-image:linear-gradient(180deg,#000,transparent_70%)]" aria-hidden="true">
        <img src={img(R.backgroundImage, 1400, 60)} alt="" loading="lazy" decoding="async" className="size-full object-cover saturate-70" />
      </div>
      <header className="relative mx-auto mb-[clamp(56px,12vw,120px)] max-w-[1100px] text-center">
        <Reveal><Kicker center className="mb-[26px] text-gold">{C.labels.rsvpKicker}</Kicker></Reveal>
        <Lines className="font-display text-[clamp(2.9rem,13.5vw,8.2rem)] leading-[.96] font-normal tracking-[-.02em]"><Rich text={C.labels.rsvpTitle} /></Lines>
        <Reveal as="p" className="mx-auto mt-7 max-w-[30ch] text-[1.08em] text-ivory/58 italic">by {C.rsvpDeadline}</Reveal>
      </header>

      <Reveal className="relative mx-auto max-w-[740px]">
        {!done ? (
          <form ref={formRef} noValidate onSubmit={(e) => e.preventDefault()} className="relative rounded-md border border-gold/28 bg-obsidian/60 p-[clamp(24px,6vw,56px)]">
            <div className="mb-9 flex items-center gap-4">
              <span className="eyebrow text-gold">{String(pos + 1).padStart(2, '0')} / {String(flow.length).padStart(2, '0')}</span>
              <span className="relative h-px flex-1 bg-gold/28"><i className="absolute inset-0 origin-left bg-gold transition-transform duration-[1200ms] ease-lux" style={{ transform: `scaleX(${(pos + 1) / flow.length})` }} /></span>
            </div>

            <div ref={stepRef} key={step} className="min-h-[300px]" role="group" aria-labelledby={`rq${step}`}>
              {step === 0 && <>
                <Question id="rq0">May we have <em className="gold-text">your name?</em></Question>
                <input className="big-input" value={s.name} onChange={(e) => set({ name: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), onNext())} autoComplete="name" maxLength={90} placeholder="Your full name" aria-labelledby="rq0" />
                <p className="mt-4 text-[.95em] text-ivory/58 italic">Exactly as it should appear on your place card.</p>
              </>}
              {step === 1 && <>
                <Question id="rq1">Will you be <em className="gold-text">joining us?</em></Question>
                <button type="button" className="link-draw -mt-2 mb-[18px]" onClick={() => { set({ att: Object.fromEntries(C.events.map((_, i) => [i, 'yes'])) }); setErr(''); buzz([8, 30, 8]); }}>
                  Joyfully accept every invitation<Squiggle />
                </button>
                {C.events.map((e, i) => (
                  <div key={i} className="grid gap-3 border-t border-gold/15 py-[18px] sm:grid-cols-[1fr_auto] sm:items-center">
                    <div>
                      <p className="font-display m-0 text-[1.4rem] leading-[1.1]"><Rich text={e.title} /></p>
                      <span className="eyebrow mt-1.5 block text-[8.5px] text-ivory/58">{fmt.dayMonth(e.start)} · {time(e.start)}</span>
                    </div>
                    <div className="flex gap-2" role="radiogroup" aria-label={plain(e.title)}>
                      {[['yes', 'Accept'], ['no', 'Decline']].map(([v, label]) => (
                        <label key={v} className={`opt relative ${v === 'no' ? 'opt-decline' : ''}`}>
                          <input type="radio" name={`ev${i}`} value={v} checked={s.att[i] === v} onChange={() => { set({ att: { ...s.att, [i]: v } }); buzz(6); }} />
                          <span>{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </>}
              {step === 2 && <>
                <Question id="rq2">How many in <em className="gold-text">your party?</em></Question>
                <div className="flex items-center justify-center gap-[clamp(20px,8vw,50px)]">
                  {[-1, 1].map((d) => (
                    <button key={d} type="button" aria-label={d < 0 ? 'Fewer guests' : 'More guests'} onClick={() => { set({ guests: clamp(s.guests + d, 1, MAX) }); buzz(6); }}
                      className={`font-display size-[62px] rounded-full border border-gold/40 text-[1.8rem] leading-none text-gold transition duration-[600ms] ease-lux hover:bg-gold hover:text-obsidian active:scale-92 ${d > 0 ? 'order-3' : ''}`}>{d < 0 ? '−' : '+'}</button>
                  ))}
                  <output key={s.guests} className="font-display order-2 min-w-[1em] text-center text-[clamp(6rem,30vw,10rem)] leading-none italic" aria-live="polite">{s.guests}</output>
                </div>
                <p className="mt-4 text-center text-[.95em] text-ivory/58 italic">Including yourself · up to {MAX}</p>
              </>}
              {step === 3 && <>
                <Question id="rq3">Any dietary <em className="gold-text">wishes?</em></Question>
                <div className="flex flex-wrap gap-2.5">
                  {R.dietary.map((d) => (
                    <label key={d} className="opt relative">
                      <input type="checkbox" checked={s.diet.includes(d)} onChange={(e) => { set({ diet: e.target.checked ? [...s.diet, d] : s.diet.filter((x) => x !== d) }); buzz(6); }} />
                      <span>{d}</span>
                    </label>
                  ))}
                </div>
                <input className="big-input mt-[26px] !text-[1.3rem]" value={s.dietOther} onChange={(e) => set({ dietOther: e.target.value })} maxLength={140} placeholder="Anything else our chefs should know" aria-label="Other dietary notes" />
              </>}
              {step === 4 && <>
                <Question id="rq4">A note for <em className="gold-text">{C.couple.partner1} &amp; {C.couple.partner2}</em></Question>
                <textarea data-lenis-prevent className="big-input min-h-[150px] resize-y !font-serif !text-[clamp(1.25rem,5vw,1.7rem)] leading-[1.4] !not-italic" rows={4} maxLength={800} value={s.note} onChange={(e) => set({ note: e.target.value })} placeholder="A wish, a memory, a song you’ll want to hear…" aria-labelledby="rq4" />
              </>}
            </div>

            <p className="rsvp-err mt-[18px] min-h-[1.4em] text-[#e8b4a6] italic" role="alert">{err}</p>
            <div className="mt-[18px] flex items-center justify-between">
              <button type="button" onClick={onBack} data-cursor="Back" className={`eyebrow px-1 py-[18px] text-ivory/58 ${pos ? '' : 'invisible'}`}>Back</button>
              <Button cursor="Next" onClick={onNext}>{sending ? 'Sending…' : last ? 'Send my reply' : 'Continue'}</Button>
            </div>
          </form>
        ) : (
          <div className="rs-box py-[30px] text-center">
            <div className="mx-auto mb-[30px] w-[130px]"><Monogram variant="draw" /></div>
            <h3 className="rs-title font-display text-[clamp(2.5rem,11vw,5rem)] leading-[.96] font-normal tracking-[-.02em]">
              {done === 'yes' ? <>We can’t wait to <em className="gold-text">celebrate</em> with you.</> : <>You will be <em className="gold-text">missed.</em></>}
            </h3>
            <p className="rs-sub mx-auto mt-[22px] max-w-[32ch] text-ivory/58 italic">
              {done === 'yes' ? 'Your reply has reached us. Your concierge will be in touch with the finer details.' : 'Thank you for letting us know. You will be in our thoughts on the day.'}
            </p>
          </div>
        )}
      </Reveal>
    </section>
  );
}
