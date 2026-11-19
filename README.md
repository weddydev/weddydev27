# Aarav & Ishani — Shubh Vivah (The Private Screening, Hindu wedding edition)

A cinematic Hindu wedding invitation built with **React 19 + Tailwind CSS v4 + GSAP 3** (ScrollTrigger, SplitText, `@gsap/react`) and **Lenis** smooth scrolling.

It uses the same design as *The Private Screening* (palace doors, sealed envelope, VIP passes, pinned story film). The content and photography are written for a Hindu wedding:

- The **॥ श्री गणेशाय नमः ॥** invocation on the invitation card and the prologue.
- The rituals: **Ganesh Puja → Mehendi & Sangeet → Haldi → Shubh Vivah (Baraat · Varmala · Pheras) → Reception (Ashirwad Samaroh)**.
- A countdown to the **shubh muhurat**.
- A love story told through Mumbai, the *roka* in Jaipur and the *saat phere* in Udaipur.
- Satvik and Jain dietary options.

```
npm install
npm run dev        # local development, http://localhost:5173
npm run build      # → dist/index.html + dist/generator.html (single-file, open by double-click)
```

---

## 1 · Edit everything in `src/config.js`

One file holds the names, initials (monogram + wax seal), invocation, the muhurat date, city, hashtag, colours, every ceremony, the venue, gallery, travel notes, concierge, RSVP, music and all section headings (`labels`).

- **Formatting in titles:** `*word*` = gold italic, `~word~` = outlined. Example: `"Shubh *Vivah*"`.
- **Dates:** ISO with the venue's offset, e.g. `"2026-12-12T17:00:00+05:30"`. The main `date` is the muhurat; guests always see venue-local times.
- **Invocation:** `invocation.devanagari` and `invocation.latin`. Change it to suit the family's tradition, e.g. a different deity's mantra.
- **Ceremony colour:** an event with `style: "accent"` is printed on a sindoor-burgundy pass (the Shubh Vivah pass is).
- **Headings:** `labels` controls the countdown, celebrations and RSVP headings.

## 2 · Photos

All photos are free under the [Unsplash License](https://unsplash.com/license): the veiled bride, the havan fire, kanyadaan, mehendi, the mandap, sherwani & safa, diyas with marigolds and more. To use the couple's own photos, put them in `public/photos/` and reference them as `"photos/hero.jpg"`. Every image is colour-graded by CSS, so mixed photography still looks like one film.

## 3 · RSVP: `config.rsvp.method`

| method | what happens | setup |
|---|---|---|
| `"whatsapp"` (default) | Opens WhatsApp with a formatted reply | Set `rsvp.whatsapp` to the receiving number, digits only with country code |
| `"formspree"` | Posts JSON to your Formspree inbox | Create a form at formspree.io and paste `https://formspree.io/f/xxxx` into `endpoint` |
| `"google"` | Posts into a Google Form / Sheet | Paste the form's `…/formResponse` URL into `googleForm.action`, plus each field's `entry.123456` id |
| `"demo"` | No network, just the celebration | — |

## 4 · Personal guest links

Open **`generator.html`**, paste guest names (optionally `Name | 919812345678`), then copy the links or send them straight to WhatsApp. The default message opens with the Ganesh invocation.

Links look like `index.html?guest=Mr.%20and%20Mrs.%20Khanna`. The guest's name then appears on:
- the envelope
- the hero
- the prologue
- every pass
- the RSVP
- the concierge message

## 5 · Music

Muted until the guest taps the gold button. Drop an mp3 (a shehnai track works beautifully) at `public/assets/audio/` and set `music.src`. Leave it empty for the built-in ambient score.

## 6 · Deploy

`npm run build`, then upload `dist/` to Netlify (drag and drop) or Vercel (build `npm run build`, output `dist`).

After deploying, set `og:image` / `twitter:image` in `index.html` to absolute URLs, e.g. `https://your-site.netlify.app/og-image.jpg`, and put the live URL in `config.siteUrl`.

## Performance work in this edition

Measured with Chrome tracing on a phone viewport (4× CPU throttle), scrolling every section:

| | Before | After |
|---|---|---|
| Rendering work per frame (all sections) | 17.3–19.8 ms | 9.0–9.9 ms |
| Janky frames (slower than 30 fps) | 39.9 % | 17.6 % |
| Events section style recalculation | 1,983 ms | 480 ms |

What changed (design and animations unchanged):

- **Pass shine.** The `--mx/--my` variables live on the shine layer, not the whole card, and are registered as non-inheriting with `@property`.
- **Gyroscope light.** Updates only on-screen cards, and only when the tilt actually moves.
- **Gold shimmer.** Paused while off-screen; drawn at 30 fps on-screen. It's a slow drift, so it looks identical.
- **GPU layers.** Added for the stacked passes, the pass dimming, the hero text, the venue title and the gallery photos.
- **Countdown glow.** A GPU-faded layer instead of a box-shadow repaint.
- **Film grain.** A 140% layer instead of 200%, which halves its GPU memory on phones.

Glitches fixed:

- **Countdown digits** are true odometers: 00 → 59 rolls one notch instead of spinning backwards, and the tick is aligned to real seconds.
- **Story chapters** swap text sequentially, so the outgoing and incoming chapters never overlap mid-scroll.
- **Prologue punctuation** after an italic phrase stays attached (no stray comma at a line start).

## Structure

```
src/config.js            ← the only file most edits need
src/index.css            Tailwind v4 theme tokens + art-directed components
src/App.jsx              stage machine: title → doors → envelope → film
src/intro/               Preloader (monogram, doors) · Envelope (seal, flap, card with invocation)
src/sections/            Hero · Prologue · Story · Countdown · Events · Venue · Gallery · Travel · Rsvp · Finale
src/components/          Monogram, WaxSeal, Button, Reveal/Lines (SplitText), Chrome (cursor, menu, sound), hooks
src/lib/                 gsap setup, Lenis + curtain nav, audio engine, canvas FX, .ics calendar, utils
src/generator/           guest-link atelier
public/                  favicon, apple-touch-icon, og-image (1200×630)
```
