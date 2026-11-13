/* =====================================================================
   PERFORMANCE CHECK — multi-step assessment (mounted into [data-check])
   Submission: PM_CONFIG.formEndpoint (JSON POST) → or mailto (contactEmail) → or setup notice.
   No fake evaluation: answers are collected for a personal review by the coach.
   ===================================================================== */
(function () {
  "use strict";
  const C = window.PM_CONFIG || {};
  const ARROW = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7"/></svg>';

  const QUESTIONS = [
    { id: "goal", label: "Ziel", q: "Was ist dein wichtigstes Ziel in den nächsten sechs Monaten?", hint: "Wähle das, was dir aktuell am meisten bedeutet.", type: "single", options: [
      { v: "Muskeln aufbauen", s: "Sichtbar athletischer und kräftiger werden" },
      { v: "Körperfett reduzieren", s: "Definierter werden, ohne Muskeln zu verlieren" },
      { v: "Beides: Fett runter, Muskeln rauf", s: "Körperkomposition nachhaltig verändern" },
      { v: "Leistungsfähigkeit & Energie", s: "Mehr Kraft im Training, mehr Energie im Alltag" } ] },
    { id: "training", label: "Training", q: "Wie trainierst du aktuell?", hint: "Ehrlich ist hilfreicher als ambitioniert.", type: "single", options: [
      { v: "Aktuell gar nicht", s: "Oder nur sehr sporadisch" },
      { v: "Unregelmäßig", s: "1–2× pro Woche, mit längeren Pausen" },
      { v: "Regelmäßig", s: "2–3× pro Woche, aber ohne klaren Plan" },
      { v: "Strukturiert", s: "3× oder öfter nach einem festen Programm" } ] },
    { id: "experience", label: "Erfahrung", q: "Wie viel Trainingserfahrung bringst du mit?", type: "single", options: [
      { v: "Einsteiger", s: "Weniger als ein Jahr Krafttraining" },
      { v: "Fortgeschritten", s: "Ein bis drei Jahre Erfahrung" },
      { v: "Erfahren", s: "Mehr als drei Jahre, kenne die Grundlagen" },
      { v: "Früher aktiv, lange Pause", s: "Habe mal gut trainiert, bin raus" } ] },
    { id: "work", label: "Alltag", q: "Wie sieht dein beruflicher Alltag aus?", hint: "Damit das System zu deinem Kalender passt.", type: "single", options: [
      { v: "Unternehmer / Selbstständig", s: "Volle Verantwortung, unvorhersehbare Tage" },
      { v: "Führungskraft / Manager", s: "Viele Termine, Team, Reisen" },
      { v: "Angestellt, Vollzeit", s: "Feste Struktur, lange Tage" },
      { v: "Viel unterwegs / Schicht", s: "Wechselnde Orte und Zeiten" } ] },
    { id: "obstacles", label: "Hürden", q: "Was hat dich bisher am meisten ausgebremst?", hint: "Mehrfachauswahl möglich.", type: "multi", options: [
      { v: "Zeit & Termine" }, { v: "Konsistenz" }, { v: "Ernährung" },
      { v: "Wissen, was wirklich wirkt" }, { v: "Verbindlichkeit & Feedback" }, { v: "Stress & Regeneration" } ] },
    { id: "timeline", label: "Zeitrahmen", q: "In welchem Zeitrahmen willst du sichtbare Veränderung?", type: "single", options: [
      { v: "So schnell wie möglich" }, { v: "In 3–6 Monaten" }, { v: "In 6–12 Monaten" }, { v: "Langfristig, ohne Druck" } ] },
    { id: "commitment", label: "Verbindlichkeit", q: "Wie lange bist du bereit, verbindlich dranzubleiben?", hint: "Das Coaching läuft 16 Wochen – nachhaltige Veränderung braucht diesen Rahmen.", type: "single", options: [
      { v: "4–8 Wochen", s: "Ich will vor allem schnell erste Ergebnisse" },
      { v: "12–16 Wochen", s: "Ein kompletter Programmzyklus" },
      { v: "6 Monate und länger", s: "Ich denke langfristig" },
      { v: "Weiß ich noch nicht", s: "Hängt vom Konzept ab" } ] },
    { id: "readiness", label: "Bereitschaft", q: "Wie bereit bist du, jetzt in ein Coaching zu investieren?", hint: "Es gibt keine falsche Antwort – nur eine ehrliche.", type: "single", options: [
      { v: "Ich bin bereit, sofort zu starten" }, { v: "In den nächsten 4–8 Wochen" }, { v: "Ich informiere mich zunächst" }, { v: "Ich will erst verstehen, ob es passt" } ] }
  ];

  const KEYS = ["1", "2", "3", "4", "5", "6"];

  // Transparent, rule-based first assessment (lead-scoring model from the growth strategy).
  // It is an orientation for the prospect and a CRM signal – the personal review by the coach follows.
  const FOCUS = {
    "Zeit & Termine": "Struktur und Mindeststandards für volle Wochen (Architect & Execute)",
    "Konsistenz": "Ein Wochenrhythmus, der deine Realität aushält (Execute)",
    "Ernährung": "Ein flexibles Ernährungs-Framework statt Diätplan (Architect)",
    "Wissen, was wirklich wirkt": "Klare Prioritäten und Wissenstransfer (Assess & Sustain)",
    "Verbindlichkeit & Feedback": "Wöchentliche Check-ins und persönliche Rückmeldung (Execute)",
    "Stress & Regeneration": "Belastungssteuerung, Schlaf und Regeneration (Optimise)"
  };
  function evaluate(a) {
    let s = 0;
    if (a.commitment === "12–16 Wochen" || a.commitment === "6 Monate und länger") s += 15;
    if (a.commitment === "4–8 Wochen") s -= 10;
    if (a.training === "Regelmäßig" || a.training === "Strukturiert") s += 10;
    if (a.experience === "Fortgeschritten" || a.experience === "Erfahren") s += 5;
    if (a.timeline === "So schnell wie möglich" || a.timeline === "In 3–6 Monaten") s += 15;
    if (a.work === "Unternehmer / Selbstständig" || a.work === "Führungskraft / Manager" || a.work === "Angestellt, Vollzeit") s += 15;
    if (a.work === "Viel unterwegs / Schicht") s += 10;
    if (a.readiness === "Ich bin bereit, sofort zu starten") s += 20;
    else if (a.readiness === "In den nächsten 4–8 Wochen") s += 15;
    else if (a.readiness) s += 5;
    s += 15; // completed the full check
    const fit = s >= 70 ? "strong" : s >= 45 ? "good" : "later";
    const focus = (Array.isArray(a.obstacles) ? a.obstacles : []).map((o) => FOCUS[o]).filter(Boolean).slice(0, 2);
    return { score: s, fit, focus };
  }
  const FIT_TEXT = {
    strong: { title: "Starke Passung", text: "Ziel, Alltag und Bereitschaft sprechen klar für ein strukturiertes Coaching. Deine Antworten werden jetzt persönlich geprüft – das Strategiegespräch ist der logische nächste Schritt." },
    good: { title: "Gute Passung – Details klären wir im Gespräch", text: "Die Grundlage passt. Offen sind vor allem Zeitrahmen oder Verbindlichkeit – genau das klären wir ehrlich, bevor du dich entscheidest." },
    later: { title: "Vermutlich nicht der richtige Zeitpunkt", text: "Nach deinen Antworten fehlt aktuell der Rahmen, den ein 16-Wochen-Coaching braucht. Wir melden uns trotzdem persönlich – mit einer ehrlichen Empfehlung, wie du jetzt sinnvoll startest." }
  };
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function mount(root) {
    const total = QUESTIONS.length + 2; // + contact + review
    const state = { step: 0, answers: {}, contact: { name: "", email: "", phone: "", message: "", consent: false } };
    try { const d = JSON.parse(localStorage.getItem("pm_check_draft") || "null"); if (d && d.answers) { state.answers = d.answers; state.contact = Object.assign(state.contact, d.contact || {}); } } catch (e) {}
    const save = () => { try { localStorage.setItem("pm_check_draft", JSON.stringify({ answers: state.answers, contact: state.contact })); } catch (e) {} };

    root.innerHTML = `
      <div class="check__shell" data-lenis-prevent>
        <div class="check__top"><span class="check__step-label" data-step-label>Frage 1 von ${QUESTIONS.length}</span><span data-step-name>${esc(QUESTIONS[0].label)}</span></div>
        <div class="check__progress"><div class="check__progress-bar" data-bar></div></div>
        <div class="check__body" data-body aria-live="polite"></div>
        <div class="check__nav">
          <button type="button" class="check__back" data-back disabled>${ARROW}<span>Zurück</span></button>
          <button type="button" class="btn btn--primary" data-next><span class="btn__fill" aria-hidden="true"></span><span class="btn__mask" aria-hidden="true">Weiter</span><span class="btn__label">Weiter</span><span class="btn__icon" aria-hidden="true"><svg class="arrow-exit" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7"/></svg><svg class="arrow-enter" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7"/></svg></span></button>
        </div>
      </div>`;
    const body = root.querySelector("[data-body]"), bar = root.querySelector("[data-bar]"), back = root.querySelector("[data-back]"), next = root.querySelector("[data-next]");
    const nextLabels = next.querySelectorAll(".btn__label, .btn__mask");
    const stepLabel = root.querySelector("[data-step-label]"), stepName = root.querySelector("[data-step-name]");
    const gsapOk = () => window.gsap && !(window.PM && window.PM.reduced);

    function renderQuestion(q) {
      const multi = q.type === "multi";
      const sel = state.answers[q.id];
      const isSel = (v) => multi ? Array.isArray(sel) && sel.includes(v) : sel === v;
      return `<div class="check__step is-active" data-qid="${q.id}">
        <h3 class="check__q">${esc(q.q)}</h3>
        <p class="check__hint">${esc(q.hint || (multi ? "Mehrfachauswahl möglich." : "Wähle eine Antwort – oder drücke die Zahl auf der Tastatur."))}</p>
        <div class="check__options ${q.options.length > 4 ? "check__options--3" : ""}" role="${multi ? "group" : "radiogroup"}">
          ${q.options.map((o, i) => `<button type="button" class="opt ${multi ? "opt--multi" : ""} ${isSel(o.v) ? "is-selected" : ""}" role="${multi ? "checkbox" : "radio"}" aria-checked="${isSel(o.v)}" data-value="${esc(o.v)}">
            <span class="opt__mark" aria-hidden="true"></span>
            <span class="opt__text"><span class="opt__title">${esc(o.v)}</span>${o.s ? `<span class="opt__sub">${esc(o.s)}</span>` : ""}</span>
            <span class="opt__key hide-mobile" aria-hidden="true">${KEYS[i]}</span>
          </button>`).join("")}
        </div>
        <p class="check__error" data-error></p>
      </div>`;
    }
    function renderContact() {
      const c = state.contact;
      return `<div class="check__step is-active" data-qid="contact">
        <h3 class="check__q">Wohin darf die persönliche Einschätzung gehen?</h3>
        <p class="check__hint">Deine Antworten werden vom Coach persönlich gelesen. Keine Newsletter, keine automatisierten Verkaufsmails.</p>
        <div class="fields fields--2">
          <div class="field"><label for="pc-name">Vorname *</label><input id="pc-name" name="name" type="text" autocomplete="given-name" value="${esc(c.name)}" placeholder="Dein Vorname" required><span class="field__error">Bitte gib deinen Vornamen an.</span></div>
          <div class="field"><label for="pc-email">E-Mail *</label><input id="pc-email" name="email" type="email" autocomplete="email" inputmode="email" value="${esc(c.email)}" placeholder="name@beispiel.de" required><span class="field__error">Bitte gib eine gültige E-Mail-Adresse an.</span></div>
          <div class="field"><label for="pc-phone">Telefon / WhatsApp (optional)</label><input id="pc-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" value="${esc(c.phone)}" placeholder="+49 …"></div>
          <div class="field"><label for="pc-msg">Gibt es etwas, das wir wissen sollten? (optional)</label><input id="pc-msg" name="message" type="text" value="${esc(c.message)}" placeholder="Verletzungen, Besonderheiten, Fragen"></div>
          <div class="field field--full">
            <label class="consent"><input type="checkbox" name="consent" ${c.consent ? "checked" : ""}> <span>Ich stimme zu, dass meine Angaben zur Bearbeitung meiner Anfrage gespeichert und verarbeitet werden. Details in der <a href="/datenschutz/" target="_blank" rel="noopener">Datenschutzerklärung</a>. *</span></label>
            <span class="field__error">Bitte bestätige die Datenschutzerklärung.</span>
          </div>
          <div class="field" style="position:absolute;left:-9999px" aria-hidden="true"><label for="pc-company">Firma</label><input id="pc-company" name="company" type="text" tabindex="-1" autocomplete="off"></div>
        </div>
        <p class="check__error" data-error></p>
      </div>`;
    }
    function summaryRows() {
      return QUESTIONS.map((q, i) => { const a = state.answers[q.id]; const val = Array.isArray(a) ? a.join(", ") : (a || "–"); return `<div class="check__summary-row"><dt>${esc(q.label)}</dt><dd>${esc(val)} <button type="button" class="link-underline small muted" data-goto="${i}" style="margin-left:.5rem">Ändern</button></dd></div>`; }).join("")
        + `<div class="check__summary-row"><dt>Kontakt</dt><dd>${esc(state.contact.name)} · ${esc(state.contact.email)}${state.contact.phone ? " · " + esc(state.contact.phone) : ""} <button type="button" class="link-underline small muted" data-goto="${QUESTIONS.length}" style="margin-left:.5rem">Ändern</button></dd></div>`;
    }
    function renderReview() {
      return `<div class="check__step is-active" data-qid="review">
        <h3 class="check__q">Kurz prüfen, dann abschicken.</h3>
        <p class="check__hint">So sieht deine Anfrage aus. Nach dem Absenden meldet sich der Coach persönlich bei dir.</p>
        <dl class="check__summary">${summaryRows()}</dl>
        <div class="check__meta"><span>Kostenlos & unverbindlich</span><span>Persönliche Auswertung</span><span>Vertraulich</span></div>
        <p class="check__error" data-error></p>
      </div>`;
    }
    function plainSummary() {
      const lines = QUESTIONS.map((q) => { const a = state.answers[q.id]; return q.label + ": " + (Array.isArray(a) ? a.join(", ") : (a || "–")); });
      lines.push("", "Vorname: " + state.contact.name, "E-Mail: " + state.contact.email, "Telefon: " + (state.contact.phone || "–"), "Hinweis: " + (state.contact.message || "–"));
      const r = evaluate(state.answers);
      lines.push("", "Lead-Score: " + r.score + " (" + FIT_TEXT[r.fit].title + ")");
      return lines.join("\n");
    }
    function renderResult() {
      const r = evaluate(state.answers);
      const t = FIT_TEXT[r.fit];
      const booking = C.bookingUrl ? `<a class="btn btn--primary" href="${esc(C.bookingUrl)}" target="_blank" rel="noopener"><span class="btn__fill" aria-hidden="true"></span><span class="btn__mask" aria-hidden="true">Strategiegespräch buchen</span><span class="btn__label">Strategiegespräch buchen</span><span class="btn__icon" aria-hidden="true"><svg class="arrow-exit" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7"/></svg><svg class="arrow-enter" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7"/></svg></span></a>` : "";
      return `<div class="check__result">
        <p class="check__result-label">Deine erste Einschätzung</p>
        <p class="check__result-title">${esc(t.title)}</p>
        <p class="check__hint">${esc(t.text)}</p>
        ${r.focus.length ? `<p class="check__result-label">Wahrscheinlicher Fokus im Coaching</p><ul class="check__result-focus">${r.focus.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>` : ""}
        <p class="check__result-note">Diese Einschätzung basiert auf festen Regeln aus deinen Antworten und ersetzt nicht die persönliche Auswertung durch den Coach.</p>
        ${booking}
      </div>`;
    }
    function renderDone(mode) {
      const summary = plainSummary();
      let extra = mode === "error" ? "" : renderResult();
      if (mode === "mailto") extra += `<p class="check__hint">Dein E-Mail-Programm wurde mit einer vorbereiteten Nachricht geöffnet. Falls nicht, kannst du den Text unten kopieren und an <strong>${esc(C.contactEmail)}</strong> senden.</p><textarea class="check__raw" readonly>${esc(summary)}</textarea>`;
      if (mode === "setup") extra += `<div class="check__setup"><strong>Hinweis für den Website-Betreiber:</strong> Die Übermittlung ist noch nicht konfiguriert. Trage in <code>assets/js/config.js</code> entweder <code>formEndpoint</code> (JSON-Webhook / CRM) oder <code>contactEmail</code> ein. Bis dahin können Interessenten ihre Antworten unten kopieren.</div><textarea class="check__raw" readonly>${esc(summary)}</textarea><button type="button" class="btn btn--outline btn--sm check__copy" data-copy><span class="btn__label">Antworten kopieren</span></button>`;
      if (mode === "error") extra = `<p class="check__hint">Die Übermittlung hat leider nicht funktioniert. Bitte versuche es später erneut${C.contactEmail ? ` oder schreibe direkt an <strong>${esc(C.contactEmail)}</strong>` : ""}.</p><textarea class="check__raw" readonly>${esc(summary)}</textarea>`;
      const headline = mode === "ok" || mode === "mailto" ? "Danke – dein Performance-Check ist unterwegs." : mode === "error" ? "Das hat leider nicht geklappt." : "Danke für deine Antworten.";
      const sub = mode === "ok" ? `Du erhältst innerhalb weniger Werktage eine persönliche Einschätzung an <strong>${esc(state.contact.email)}</strong>. Prüfe bitte auch deinen Spam-Ordner.` : "";
      return `<div class="check__step is-active" data-qid="done"><div class="check__done">
        <div class="check__done-icon" aria-hidden="true">${mode === "error" ? "!" : '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>'}</div>
        <h3 class="check__q">${headline}</h3>${sub ? `<p class="check__hint">${sub}</p>` : ""}${extra}
        <a class="btn btn--ghost" href="/wissen/"><span class="btn__fill" aria-hidden="true"></span><span class="btn__mask" aria-hidden="true">In der Zwischenzeit: Knowledge Hub</span><span class="btn__label">In der Zwischenzeit: Knowledge Hub</span><span class="btn__icon" aria-hidden="true"><svg class="arrow-exit" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7"/></svg><svg class="arrow-enter" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7"/></svg></span></a>
      </div></div>`;
    }

    function updateChrome() {
      const i = state.step;
      const pct = Math.min(100, Math.round((i / total) * 100));
      bar.style.width = (i === 0 ? 4 : pct) + "%";
      if (i < QUESTIONS.length) { stepLabel.textContent = `Frage ${i + 1} von ${QUESTIONS.length}`; stepName.textContent = QUESTIONS[i].label; }
      else if (i === QUESTIONS.length) { stepLabel.textContent = "Fast geschafft"; stepName.textContent = "Kontakt"; }
      else { stepLabel.textContent = "Zusammenfassung"; stepName.textContent = "Prüfen & absenden"; }
      back.disabled = i === 0;
      nextLabels.forEach((label) => { label.textContent = i === QUESTIONS.length + 1 ? "Performance-Check absenden" : "Weiter"; });
      next.hidden = false;
    }

    function render(dir) {
      const i = state.step;
      const html = i < QUESTIONS.length ? renderQuestion(QUESTIONS[i]) : i === QUESTIONS.length ? renderContact() : renderReview();
      const swap = () => {
        body.innerHTML = html; updateChrome(); bind();
        if (gsapOk()) gsap.fromTo(body.firstElementChild, { opacity: 0, x: dir >= 0 ? 36 : -36 }, { opacity: 1, x: 0, duration: 0.7, ease: "expo.out" });
        if (window.ScrollTrigger) window.ScrollTrigger.refresh();
      };
      if (gsapOk() && body.firstElementChild) gsap.to(body.firstElementChild, { opacity: 0, x: dir >= 0 ? -30 : 30, duration: 0.25, ease: "power2.in", onComplete: swap });
      else swap();
    }

    function bind() {
      const step = body.firstElementChild; const qid = step.dataset.qid;
      if (qid === "contact") {
        step.querySelectorAll("input").forEach((inp) => inp.addEventListener("input", () => {
          if (inp.name === "consent") state.contact.consent = inp.checked; else if (inp.name !== "company") state.contact[inp.name] = inp.value.trim();
          inp.closest(".field").classList.remove("field--error"); save();
        }));
        return;
      }
      if (qid === "review") { step.querySelectorAll("[data-goto]").forEach((b) => b.addEventListener("click", () => { state.step = parseInt(b.dataset.goto, 10); render(-1); })); return; }
      const q = QUESTIONS.find((x) => x.id === qid); if (!q) return;
      step.querySelectorAll(".opt").forEach((opt) => opt.addEventListener("click", () => choose(q, opt.dataset.value, step)));
    }
    function choose(q, v, step) {
      if (q.type === "multi") {
        const arr = Array.isArray(state.answers[q.id]) ? state.answers[q.id].slice() : [];
        const k = arr.indexOf(v); if (k >= 0) arr.splice(k, 1); else arr.push(v);
        state.answers[q.id] = arr;
        step.querySelectorAll(".opt").forEach((o) => { const on = arr.includes(o.dataset.value); o.classList.toggle("is-selected", on); o.setAttribute("aria-checked", String(on)); });
        save(); return;
      }
      state.answers[q.id] = v;
      step.querySelectorAll(".opt").forEach((o) => { const on = o.dataset.value === v; o.classList.toggle("is-selected", on); o.setAttribute("aria-checked", String(on)); });
      step.querySelector("[data-error]").textContent = ""; save();
      clearTimeout(choose._t); choose._t = setTimeout(() => { if (state.step < QUESTIONS.length && QUESTIONS[state.step].id === q.id) advance(); }, 420);
    }
    function validate() {
      const i = state.step, step = body.firstElementChild, err = step.querySelector("[data-error]");
      if (i < QUESTIONS.length) {
        const q = QUESTIONS[i], a = state.answers[q.id];
        const ok = q.type === "multi" ? Array.isArray(a) && a.length > 0 : !!a;
        if (!ok) { err.textContent = q.type === "multi" ? "Bitte wähle mindestens eine Option." : "Bitte wähle eine Antwort aus."; return false; }
        return true;
      }
      if (i === QUESTIONS.length) {
        let ok = true;
        const f = (sel) => step.querySelector(sel).closest(".field");
        if (!state.contact.name) { f("#pc-name").classList.add("field--error"); ok = false; }
        if (!EMAIL_RE.test(state.contact.email)) { f("#pc-email").classList.add("field--error"); ok = false; }
        if (!state.contact.consent) { step.querySelector('input[name="consent"]').closest(".field").classList.add("field--error"); ok = false; }
        if (!ok) err.textContent = "Bitte prüfe die markierten Felder.";
        return ok;
      }
      return true;
    }
    function advance() { if (!validate()) return; if (state.step === total - 1) return submit(); state.step++; render(1); }
    function goBack() { if (state.step === 0) return; state.step--; render(-1); }

    function track(name) {
      try { if (window.plausible) window.plausible(name); if (window.gtag) window.gtag("event", name.toLowerCase().replace(/\s+/g, "_")); window.dataLayer && window.dataLayer.push({ event: name }); } catch (e) {}
    }
    function finish(mode) {
      next.hidden = true; back.disabled = true; bar.style.width = "100%";
      stepLabel.textContent = mode === "error" ? "Fehler" : "Abgeschlossen"; stepName.textContent = "";
      body.innerHTML = renderDone(mode);
      const copy = body.querySelector("[data-copy]");
      if (copy) copy.addEventListener("click", () => { const ta = body.querySelector(".check__raw"); ta.select(); try { navigator.clipboard.writeText(ta.value); copy.querySelector(".btn__label").textContent = "Kopiert"; } catch (e) { document.execCommand("copy"); } });
      if (gsapOk()) gsap.fromTo(body.firstElementChild, { opacity: 0, scale: 0.98 }, { opacity: 1, scale: 1, duration: 0.8, ease: "expo.out" });
      if (mode !== "error") { try { localStorage.removeItem("pm_check_draft"); } catch (e) {} track("Performance Check Submitted"); }
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    }
    async function submit() {
      if (root.querySelector("#pc-company") && root.querySelector("#pc-company").value) return finish("ok"); // honeypot: silently drop
      let attribution = null; try { attribution = JSON.parse(sessionStorage.getItem("pm_attribution") || "null"); } catch (e) {}
      const payload = {
        type: "performance-check", source: root.dataset.checkSource || "website", page: location.href, submittedAt: new Date().toISOString(),
        answers: QUESTIONS.reduce((acc, q) => { acc[q.id] = { question: q.q, answer: state.answers[q.id] }; return acc; }, {}),
        contact: { name: state.contact.name, email: state.contact.email, phone: state.contact.phone, message: state.contact.message, consent: state.contact.consent, consentAt: new Date().toISOString() },
        assessment: evaluate(state.answers),
        attribution, summary: plainSummary()
      };
      next.setAttribute("aria-disabled", "true"); nextLabels.forEach((label) => { label.textContent = "Wird gesendet …"; });
      if (C.formEndpoint) {
        try {
          const res = await fetch(C.formEndpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(payload) });
          if (!res.ok) throw new Error("HTTP " + res.status);
          finish("ok");
        } catch (e) { next.removeAttribute("aria-disabled"); finish("error"); }
        return;
      }
      if (C.contactEmail) {
        const subject = encodeURIComponent("Performance-Check: " + state.contact.name);
        const bodyTxt = encodeURIComponent(plainSummary() + "\n\nQuelle: " + location.href);
        window.location.href = `mailto:${C.contactEmail}?subject=${subject}&body=${bodyTxt}`;
        finish("mailto"); return;
      }
      finish("setup");
    }

    next.addEventListener("click", advance);
    back.addEventListener("click", goBack);
    root.addEventListener("keydown", (e) => {
      const tag = (e.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea") { if (e.key === "Enter" && tag === "input" && e.target.type !== "checkbox") { e.preventDefault(); advance(); } return; }
      if (state.step < QUESTIONS.length && KEYS.includes(e.key)) {
        const q = QUESTIONS[state.step]; const idx = KEYS.indexOf(e.key);
        if (q.options[idx]) { e.preventDefault(); choose(q, q.options[idx].v, body.firstElementChild); }
      }
      if (e.key === "Enter" && state.step >= QUESTIONS.length) { e.preventDefault(); advance(); }
    });
    // make the shell focusable for keyboard shortcuts when scrolled into view
    root.querySelector(".check__shell").setAttribute("tabindex", "-1");
    root.addEventListener("click", () => root.querySelector(".check__shell").focus({ preventScroll: true }));
    render(1);
  }

  function boot() { document.querySelectorAll("[data-check]").forEach(mount); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
