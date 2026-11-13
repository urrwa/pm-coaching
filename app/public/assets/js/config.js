/*
 * PM Coaching – Laufzeit-Konfiguration
 * ------------------------------------
 * Trage hier deine echten Kontaktdaten und Integrationen ein.
 * Leere Felder blenden die zugehörigen Buttons/Links automatisch aus,
 * damit keine toten Links auf der Website erscheinen.
 */
window.PM_CONFIG = {
  brand: "PM Coaching",

  // Kontakt
  contactEmail: "",          // z. B. "hallo@deine-domain.de"
  whatsapp: "",              // internationale Nummer ohne "+", z. B. "4915112345678"

  // Social
  instagram: "",             // z. B. "https://www.instagram.com/deinprofil"
  youtube: "",               // z. B. "https://www.youtube.com/@deinkanal"

  // Terminbuchung (Strategiegespräch), z. B. Calendly / cal.com / TidyCal
  bookingUrl: "",

  // Performance-Check & Kontaktformular:
  // HTTP-Endpunkt, der ein JSON-POST entgegennimmt (Formspree, Make/Zapier-Webhook, eigenes Backend / CRM).
  // Ohne Endpunkt wird – falls contactEmail gesetzt ist – ein vorbereiteter E-Mail-Entwurf geöffnet.
  formEndpoint: "",

  // Analytics (optional) – nur eines davon ausfüllen. Ohne Eintrag wird nichts geladen.
  analytics: {
    plausibleDomain: "",     // z. B. "deine-domain.de"
    gtagId: ""               // z. B. "G-XXXXXXXXXX" (erfordert Cookie-Hinweis gemäß DSGVO)
  }
};
