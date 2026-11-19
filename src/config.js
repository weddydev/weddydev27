/* ==========================================================================
   WEDDING CONFIG — the only file you need to edit to re-brand the site.
   --------------------------------------------------------------------------
   Text formatting inside titles:
     *word*  → italic (gold)        e.g. "Shubh *Vivah*"
     ~word~  → outlined letters     e.g. "~Forever~"
   Dates: ISO format WITH the venue's UTC offset, e.g. "2026-12-12T17:00:00+05:30".
   Times are always displayed in the venue's local time, wherever the guest is.
   The main `date` is the shubh muhurat (auspicious time) of the pheras.
   ========================================================================== */

const WEDDING = {

  /* ---------------------------------------------------------------- Couple */
  couple: {
    partner1: "Aarav",
    partner2: "Ishani",
    initials: ["A", "I"],                  // monogram crest + wax seal letters
    signature: "Aarav & Ishani",           // drawn in script in the finale
    families: "With the blessings of our elders, the Malhotra & Kapoor families",
    request: "invite you to grace the wedding of their children"
  },

  /* Invocation printed at the top of the invitation, as on a traditional Hindu card */
  invocation: {
    devanagari: "॥ श्री गणेशाय नमः ॥",
    latin: "Shri Ganeshaya Namah"
  },

  /* ------------------------------------------- The shubh muhurat (countdown) */
  date: "2026-12-12T17:00:00+05:30",
  timezoneLabel: "IST",
  city: "Udaipur",
  region: "Rajasthan, India",
  hashtag: "#AaravWedsIshani",
  rsvpDeadline: "15 November 2026",

  /* --------------------------------------------------------- Brand colours */
  theme: {
    obsidian: "#0b0a09",
    ivory:    "#f4ede1",
    gold:     "#d4af6a",
    accent:   "#5a0f1f",                   // deep sindoor-red burgundy
    accentDeep: "#22050c"
  },

  /* ----------------------------------------------------------------- Sound
     src: an mp3 placed in /public/assets/audio, e.g. "assets/audio/shehnai.mp3".
     Leave empty to use the built-in generative ambient score.             */
  music: { src: "", volume: 0.55 },

  /* --------------------------------------------- Greeting (?guest=Name links) */
  greeting: {
    envelopeLabel: "With the blessings of Shri Ganesh, an invitation for",
    genericName: "Our dearest guest",
    prologueWithGuest: "Dear {guest},",
    prologueGeneric: "Dear friend,"
  },

  /* ------------------------------------------------- Section headings */
  labels: {
    countdownKicker: "The countdown to the shubh muhurat",
    countdownTitle: "Until the *saat phere*",
    eventsKicker: "The celebrations",
    eventsTitle: "Three days. *Seven vows.*",
    eventsSub: "Your passes to every ritual and every celebration. Keep them close. Tilt them toward the light.",
    rsvpKicker: "Your presence, our blessing",
    rsvpTitle: "Kindly *reply*"
  },

  /* ------------------------------------------------------------------ Hero */
  hero: {
    eyebrow: "Shubh Vivah · The wedding of",
    image: "https://images.unsplash.com/photo-1732508529169-8f825220e13a"
  },

  /* -------------------------------------------------------------- Prologue */
  prologue: {
    text: "With the blessings of Lord Ganesha and our elders, two families become one. Ours is a bond *written in the stars*, to be sealed by seven vows around the sacred fire. This December, in the City of Lakes, we begin our forever. Your presence would be our greatest blessing.",
    signoff: "With love, the Malhotra & Kapoor families"
  },

  /* ----------------------------------------------- Story (pinned scroll film) */
  story: [
    {
      year: "2019", place: "Mumbai",
      title: "A borrowed *umbrella.*",
      text: "The first monsoon rain on Marine Drive. One umbrella, two strangers, and a cutting chai neither meant to share. They talked until the café pulled down its shutters.",
      imageBack:  "https://images.unsplash.com/photo-1756190564669-215843660e93",
      imageFront: "https://images.unsplash.com/photo-1756376748107-12c98ec6b969"
    },
    {
      year: "2023", place: "Jaipur",
      title: "The *roka.*",
      text: "Two families around one table, sweets passed hand to hand, and a blessing from every elder. That evening, under the lamps of the Pink City, a yes became a promise.",
      imageBack:  "https://images.unsplash.com/photo-1754782915842-aa4fca6c203a",
      imageFront: "https://images.unsplash.com/photo-1597157639073-69284dc0fdaf"
    },
    {
      year: "2026", place: "Udaipur",
      title: "Saat *phere.*",
      text: "Seven steps around the sacred fire, seven promises for seven lifetimes. In the City of Lakes we begin forever, and it would not be complete without you.",
      imageBack:  "https://images.unsplash.com/photo-1630764883473-e8c2056f0589",
      imageFront: "https://images.unsplash.com/photo-1742891603263-a32036d63f3b"
    }
  ],

  /* ---------------------------------------------- Events (rendered as VIP passes)
     style: "black" | "accent"  — the accent pass is printed in sindoor burgundy. */
  events: [
    {
      title: "The Ganesh *Puja*",
      kind: "Invoking Blessings",
      start: "2026-12-10T10:00:00+05:30",
      end:   "2026-12-10T12:30:00+05:30",
      venue: "Shiv Niwas Palace Courtyard",
      address: "City Palace Complex, Udaipur",
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Shiv+Niwas+Palace+Udaipur",
      dress: "Pastel Traditional",
      note: "As every auspicious journey begins, we seek Lord Ganesha's blessings. Prasad and brunch follow.",
      style: "black"
    },
    {
      title: "Mehendi & *Sangeet*",
      kind: "Henna · Music · Dance",
      start: "2026-12-10T16:00:00+05:30",
      end:   "2026-12-10T23:30:00+05:30",
      venue: "Fateh Prakash Gardens",
      address: "City Palace Complex, Udaipur",
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Fateh+Prakash+Palace+Udaipur",
      dress: "Jewel Tones",
      note: "Henna at golden hour, folk musicians from Mewar, and a night of songs and dances from both families.",
      style: "black"
    },
    {
      title: "The *Haldi*",
      kind: "Turmeric Blessing",
      start: "2026-12-11T10:00:00+05:30",
      end:   "2026-12-11T13:00:00+05:30",
      venue: "The Lakeside Lawns",
      address: "Shiv Niwas Palace, Udaipur",
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Shiv+Niwas+Palace+Udaipur",
      dress: "Shades of Yellow",
      note: "Turmeric, marigolds and a great deal of laughter. Wear something you don't mind turning golden.",
      style: "black"
    },
    {
      title: "Shubh *Vivah*",
      kind: "Baraat · Varmala · Pheras",
      start: "2026-12-12T17:00:00+05:30",
      end:   "2026-12-12T20:30:00+05:30",
      venue: "Manak Chowk, The City Palace",
      address: "City Palace, Udaipur",
      mapUrl: "https://www.google.com/maps/search/?api=1&query=City+Palace+Udaipur",
      dress: "Traditional Royal",
      note: "The baraat arrives at 4:30 PM. Varmala at sunset, then the saat phere around the sacred fire at the shubh muhurat.",
      style: "accent"
    },
    {
      title: "The Grand *Reception*",
      kind: "Ashirwad Samaroh",
      start: "2026-12-12T21:00:00+05:30",
      end:   "2026-12-13T00:30:00+05:30",
      venue: "Durbar Hall",
      address: "Fateh Prakash Palace, Udaipur",
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Durbar+Hall+Fateh+Prakash+Palace+Udaipur",
      dress: "Indo-Western Glamour",
      note: "A royal dinner under the chandeliers, music, and the newlyweds' first dance. Come bless the couple.",
      style: "black"
    }
  ],

  /* ----------------------------------------------------------------- Venue */
  venue: {
    pre: "The",
    name: "City *Palace*",
    address: "City Palace Complex, Old City, Udaipur, Rajasthan 313001",
    description: "Four centuries of marble and mirror-work rising out of Lake Pichola, home of the Mewar dynasty. For three days it is ours, and for three days it is yours.",
    image: "https://images.unsplash.com/photo-1615836245337-f5b9b2303f10",
    mapQuery: "City Palace, Udaipur",
    directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=City+Palace+Udaipur"
  },

  /* --------------------------------------------------------------- Gallery */
  gallery: [
    { src: "https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2", caption: "The mandap",            place: "Shubh Vivah" },
    { src: "https://images.unsplash.com/photo-1697347815876-924f6a358ee2", caption: "Solah shringaar",       place: "The bride" },
    { src: "https://images.unsplash.com/photo-1770346279037-89853a3e8c60", caption: "Mehendi",               place: "Sangeet night" },
    { src: "https://images.unsplash.com/photo-1774020039312-f1965e1b6ef0", caption: "Kanyadaan",             place: "The pheras" },
    { src: "https://images.unsplash.com/photo-1760080838961-4208536db385", caption: "Sherwani & safa",       place: "The groom" },
    { src: "https://images.unsplash.com/photo-1587271636175-90d58cdad458", caption: "Under the flowers",     place: "The ceremony" },
    { src: "https://images.unsplash.com/photo-1675507324104-19488fba67ff", caption: "A thousand diyas",      place: "Udaipur" },
    { src: "https://images.unsplash.com/photo-1654156577076-e0350ba86cc1", caption: "Before the sacred fire", place: "Saat phere" }
  ],
  marquee: ["Aarav & Ishani", "Shubh Vivah", "Udaipur", "Saat Phere"],

  /* ------------------------------------------------------ Travel & concierge */
  travel: [
    {
      title: "Arrival",
      meta: "UDR · 35 minutes to the palace",
      text: "Fly into Maharana Pratap Airport, Udaipur. You will be welcomed with a tilak and marigold garland as you land, and private aviation slots can be coordinated."
    },
    {
      title: "Residence",
      meta: "Room blocks held until 1 November",
      text: "Suites are reserved for you at The Oberoi Udaivilas, Taj Lake Palace and The Leela Palace. Quote “AI1212” or simply message your concierge."
    },
    {
      title: "Chauffeur",
      meta: "Door to door, every ritual",
      text: "Chauffeured cars and palace boats will carry you between every celebration. Your driver’s details arrive 48 hours before you do."
    },
    {
      title: "Attire & Rituals",
      meta: "On call throughout",
      text: "Saree draping, safa tying, mehendi artists on call, and a pandit-ji happy to explain the meaning of every ritual. Ask for anything, however small."
    }
  ],
  concierge: {
    name: "Ananya Rao",
    role: "Your personal concierge",
    hours: "Available 24 hours, 8–14 December",
    whatsapp: "919800012345",              // international format, digits only
    message: "Namaste Ananya, this is {guest}. I have a question about Aarav & Ishani's wedding."
  },

  /* ----------------------------------------------------------------- RSVP
     method:
       "whatsapp"  → opens WhatsApp with a beautifully formatted reply (works instantly)
       "formspree" → POST to endpoint, e.g. "https://formspree.io/f/xxxxxxx"
       "google"    → posts into a Google Form (fill googleForm below)
       "demo"      → no network, just the celebration animation               */
  rsvp: {
    method: "whatsapp",
    whatsapp: "919800012345",
    endpoint: "",
    googleForm: {
      action: "",                          // https://docs.google.com/forms/d/e/XXXX/formResponse
      fields: { name: "", attendance: "", guests: "", dietary: "", note: "" }  // "entry.123456"
    },
    maxGuests: 4,
    dietary: ["No restrictions", "Vegetarian", "Jain", "Satvik (no onion, no garlic)", "Vegan", "Gluten-free"],
    backgroundImage: "https://images.unsplash.com/photo-1675507324104-19488fba67ff"
  },

  /* ---------------------------------------------------------------- Finale */
  finale: {
    line: "Seven vows. *Seven lifetimes.*",
    footnote: "Shubh Vivah · Udaipur · 12.12.2026"
  },

  /* ------------------------------------------------------------------ Meta
     The live URL of the site, used by generator.html to build guest links.
     Also update the <meta property="og:*"> tags at the top of index.html.
     (generator.html also lets you type the URL by hand.)  */
  siteUrl: ""
};

export default WEDDING;
