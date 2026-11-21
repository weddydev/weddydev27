/* ==========================================================================
   GUEST LINK ATELIER — type guest names, get personalised invitation links
   (index.html?guest=Name) and one-tap WhatsApp messages.
   Optional phone per line:  Mr. and Mrs. Khanna | 919812345678
   ========================================================================== */
import { StrictMode, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';
import C from '../config.js';
import { gsap, useGSAP } from '../lib/gsap.js';
import { applyTheme, fmt, EASE } from '../lib/utils.js';
import { SvgDefs } from '../components/Ui.jsx';
import Monogram from '../components/Monogram.jsx';

const LS = 'lux-generator-v1';
const load = () => { try { return JSON.parse(localStorage.getItem(LS)) || {}; } catch { return {}; } };
const save = (v) => { try { localStorage.setItem(LS, JSON.stringify(v)); } catch { /* private mode */ } };

const defaultBase = () => {
  if (C.siteUrl) return C.siteUrl.replace(/\/?$/, '/');
  const u = new URL(window.location.href); u.search = ''; u.hash = '';
  return u.href.replace(/generator\.html$/, '');
};
const defaultMsg = `Dear {guest},\n\nWith great joy, ${C.couple.partner1} & ${C.couple.partner2} invite you to celebrate with them in ${C.city}, ${fmt.short(C.date)}.\n\nYour personal invitation awaits:\n{link}`;

const linkFor = (base, name) => {
  const b = base.trim() || defaultBase();
  const page = /\.html$/.test(b) ? b : b.replace(/\/?$/, '/') + 'index.html';
  return `${page}?guest=${encodeURIComponent(name)}`;
};

function copy(text) {
  if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
  const t = document.createElement('textarea'); t.value = text; t.style.position = 'fixed'; t.style.opacity = '0';
  document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove();
  return Promise.resolve();
}

const field = 'w-full rounded-none border-0 border-b border-gold/40 bg-transparent py-3 text-ivory outline-none transition-colors duration-700 ease-lux placeholder:text-ivory/25 focus:border-gold';
const small = 'eyebrow inline-flex min-h-10 items-center rounded-full border border-gold/40 px-4 text-[9px] text-gold transition duration-700 ease-lux hover:bg-gold hover:text-obsidian';

function Generator() {
  const saved = load();
  const [base, setBase] = useState(saved.base || defaultBase());
  const [msg, setMsg] = useState(saved.msg || defaultMsg);
  const [list, setList] = useState(saved.list || 'Mr. and Mrs. Khanna\nThe Oberoi Family | 919800000000\nAnanya & Rohan');
  const [toast, setToast] = useState('');
  const root = useRef(null);
  useEffect(() => { applyTheme(); }, []);
  useEffect(() => save({ base, msg, list }), [base, msg, list]);

  const guests = useMemo(() => list.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
    const [name, phone = ''] = l.split('|').map((x) => x.trim());
    const link = linkFor(base, name);
    return { name, phone: phone.replace(/\D/g, ''), link, text: msg.replace(/\{guest\}/g, name).replace(/\{link\}/g, link) };
  }), [list, base, msg]);

  const flash = (t) => { setToast(t); gsap.fromTo('.toast', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: EASE }); gsap.to('.toast', { opacity: 0, duration: 0.6, delay: 1.8 }); };
  const csv = () => {
    const rows = [['Guest', 'Phone', 'Link', 'Message'], ...guests.map((g) => [g.name, g.phone, g.link, g.text])];
    const body = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([body], { type: 'text/csv' })); a.download = 'guest-links.csv'; a.click();
  };

  useGSAP(() => {
    gsap.from('.gen-in', { opacity: 0, y: 30, duration: 1.6, stagger: 0.08, ease: EASE });
  }, { scope: root });

  return (
    <div ref={root} className="px-gutter mx-auto max-w-[980px] pt-[clamp(48px,10vw,96px)] pb-32">
      <SvgDefs />
      <header className="gen-in mb-14 flex items-center gap-5">
        <div className="w-16 flex-none"><Monogram /></div>
        <div>
          <p className="eyebrow text-gold">Invitation atelier · private</p>
          <h1 className="font-display mt-2 text-[clamp(2.4rem,9vw,4.6rem)] leading-[.95] font-normal tracking-[-.02em]">Personal <em className="gold-text">invitations</em></h1>
        </div>
      </header>

      <section className="gen-in grid gap-10 desk:grid-cols-2">
        <label className="block">
          <span className="eyebrow text-ivory/58">Live site address</span>
          <input className={`${field} font-sans text-[15px]`} value={base} onChange={(e) => setBase(e.target.value)} placeholder="https://aarav-meher.netlify.app/" />
          <span className="mt-2 block text-[.9em] text-ivory/45 italic">Set it once you've deployed. Links work locally too.</span>
        </label>
        <label className="block">
          <span className="eyebrow text-ivory/58">Message · use {'{guest}'} and {'{link}'}</span>
          <textarea className={`${field} min-h-[150px] resize-y font-serif text-[1.05rem] leading-[1.45]`} value={msg} onChange={(e) => setMsg(e.target.value)} />
        </label>
      </section>

      <section className="gen-in mt-12">
        <label className="block">
          <span className="eyebrow text-ivory/58">Guests · one per line · optional “| phone with country code”</span>
          <textarea className={`${field} min-h-[180px] resize-y font-display text-[1.4rem] italic leading-[1.5]`} value={list} onChange={(e) => setList(e.target.value)} />
        </label>
        <div className="mt-6 flex flex-wrap gap-3">
          <button className="btn btn-gold" onClick={() => copy(guests.map((g) => `${g.name}\t${g.link}`).join('\n')).then(() => flash('All links copied'))}><span>Copy all links</span></button>
          <button className="btn btn-ghost" onClick={csv}><span>Export CSV</span></button>
        </div>
      </section>

      <ol className="gen-in mt-16 border-t border-gold/28">
        {guests.map((g, i) => (
          <li key={i} className="grid gap-4 border-b border-gold/28 py-7 desk:grid-cols-[1fr_auto] desk:items-center">
            <div className="min-w-0">
              <p className="font-display text-[1.6rem] leading-tight">{g.name}</p>
              <p className="mt-1 truncate font-sans text-[12px] tracking-wide text-ivory/45">{g.link}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a className={small} href={g.link} target="_blank" rel="noopener">Preview</a>
              <button className={small} onClick={() => copy(g.link).then(() => flash('Link copied'))}>Copy link</button>
              <button className={small} onClick={() => copy(g.text).then(() => flash('Message copied'))}>Copy message</button>
              <a className={`${small} border-gold bg-gold text-obsidian`} target="_blank" rel="noopener" href={`https://wa.me/${g.phone}?text=${encodeURIComponent(g.text)}`}>WhatsApp</a>
            </div>
          </li>
        ))}
        {!guests.length && <li className="py-10 text-ivory/45 italic">Add a guest above to begin.</li>}
      </ol>

      <div className="toast eyebrow pointer-events-none fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full border border-gold/40 bg-obsidian/90 px-6 py-3 text-gold opacity-0 backdrop-blur" role="status">{toast}</div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<StrictMode><Generator /></StrictMode>);
