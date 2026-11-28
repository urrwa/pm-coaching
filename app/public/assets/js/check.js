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
    { id: "goal", label: "Ziel", q: "Was möchtest du in den nächsten Monaten vor allem erreichen?", type: "single", options: [
      { v: "Muskeln aufbauen", s: "An Kraft und Muskelmasse arbeiten" },
      { v: "Körperfett reduzieren", s: "Körperfett senken und deine Kraft erhalten" },
      { v: "Beides: Fett runter, Muskeln rauf", s: "An Muskelaufbau und Körperfett arbeiten" },
      { v: "Leistungsfähigkeit & Energie", s: "Deine Fitness im Training und Alltag verbessern" } ] },
    { id: "training", label: "Training", q: "Wie regelmäßig trainierst du zurzeit?", type: "single", options: [
      { v: "Aktuell gar nicht", s: "Zurzeit ohne feste Trainingsroutine" },
      { v: "Unregelmäßig", s: "Einzelne Einheiten, dazwischen längere Pausen" },
      { v: "Regelmäßig", s: "Mehrmals pro Woche, noch ohne festen Aufbau" },
      { v: "Strukturiert", s: "Nach einem festen Trainingsprogramm" } ] },
    { id: "experience", label: "Erfahrung", q: "Wie lange beschäftigst du dich schon mit Krafttraining?", type: "single", options: [
      { v: "Einsteiger", s: "Weniger als ein Jahr Krafttraining" },
      { v: "Fortgeschritten", s: "Ein bis drei Jahre Erfahrung" },
      { v: "Erfahren", s: "Mehr als drei Jahre Trainingserfahrung" },
      { v: "Früher aktiv, lange Pause", s: "Früher regelmäßig trainiert, länger pausiert" } ] },
    { id: "work", label: "Alltag", q: "Welche Beschreibung passt am besten zu deinem Berufsalltag?", type: "single", options: [
      { v: "Unternehmer / Selbstständig", s: "Oft wechselnde Aufgaben und Arbeitszeiten" },
      { v: "Führungskraft / Manager", s: "Viele Termine und Verantwortung für ein Team" },
      { v: "Angestellt, Vollzeit", s: "Überwiegend feste Arbeitszeiten" },
      { v: "Viel unterwegs / Schicht", s: "Wechselnde Arbeitsorte oder Schichten" } ] },
    { id: "obstacles", label: "Hürden", q: "Was macht es dir bisher schwer, dranzubleiben?", hint: "Mehrfachauswahl möglich.", type: "multi", options: [
      { v: "Zeit & Termine" }, { v: "Konsistenz" }, { v: "Ernährung" },
      { v: "Wissen, was wirklich wirkt" }, { v: "Verbindlichkeit & Feedback" }, { v: "Stress & Regeneration" } ] },
    { id: "timeline", label: "Zeitrahmen", q: "Welchen Zeitrahmen hast du für dein Ziel im Kopf?", type: "single", options: [
      { v: "So schnell wie möglich" }, { v: "In 3–6 Monaten" }, { v: "In 6–12 Monaten" }, { v: "Langfristig, ohne Druck" } ] },
    { id: "commitment", label: "Verbindlichkeit", q: "Über welchen Zeitraum möchtest du an deinem Ziel arbeiten?", type: "single", options: [
      { v: "4–8 Wochen", s: "Ich möchte zunächst einen kurzen Zeitraum planen" },
      { v: "12–16 Wochen", s: "Ich möchte zunächst drei bis vier Monate planen" },
      { v: "6 Monate und länger", s: "Das passt zur sechsmonatigen Begleitung" },
      { v: "Weiß ich noch nicht", s: "Das möchte ich im Gespräch klären" } ] },
    { id: "readiness", label: "Bereitschaft", q: "Wann könntest du dir einen Coaching-Start vorstellen?", type: "single", options: [
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
    later: { title: "Vermutlich nicht der richtige Zeitpunkt", text: "Nach deinen Antworten fehlt aktuell der Rahmen, den ein sechsmonatiges Coaching braucht. Wir melden uns trotzdem persönlich – mit einer ehrlichen Empfehlung, wie du jetzt sinnvoll startest." }
  };
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function mount(root) {
    const total = QUESTIONS.length + 2; // + contact + review
    const state = { step: 0, answers: {}, contact: { name: "", email: "", phone: "", message: "", consent: false } };
    let sending = false, terminal = false;
    try { const d = JSON.parse(localStorage.getItem("pm_check_draft") || "null"); if (d && d.answers) { state.answers = d.answers; state.contact = Object.assign(state.contact, d.contact || {}); } } catch (e) {}
    const save = () => { try { localStorage.setItem("pm_check_draft", JSON.stringify({ answers: state.answers, contact: state.contact })); } catch (e) {} };

    root.innerHTML = `
      <div class="check__shell" data-lenis-prevent>
        <div class="check__top"><span class="check__step-label" data-step-label>Frage 1 von ${QUESTIONS.length}</span><span data-step-name>${esc(QUESTIONS[0].label)}</span></div>
        <div class="check__progress"><div class="check__progress-bar" data-bar></div></div>
        <div class="check__body" data-body aria-live="polite"></div>
        <div class="check__nav">
          <button type="button" class="check__back" data-back disabled>${ARROW}<span>Zurück</span></button>
          <button type="button" class="btn btn--primary" data-next><span class="btn__fill" aria-hidden="true"></span><span class="btn__label">Weiter</span><span class="btn__icon" aria-hidden="true"><svg class="arrow-exit" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7"/></svg><svg class="arrow-enter" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7"/></svg></span></button>
        </div>
      </div>`;
    const body = root.querySelector("[data-body]"), bar = root.querySelector("[data-bar]"), back = root.querySelector("[data-back]"), next = root.querySelector("[data-next]");
    const nextLabel = next.querySelector(".btn__label");
    const stepLabel = root.querySelector("[data-step-label]"), stepName = root.querySelector("[data-step-name]");
    const gsapOk = () => window.gsap && !(window.PM && window.PM.reduced);

    function renderQuestion(q) {
      const multi = q.type === "multi";
      const sel = state.answers[q.id];
      const isSel = (v) => multi ? Array.isArray(sel) && sel.includes(v) : sel === v;
      return `<div class="check__step is-active" data-qid="${q.id}">
        <h3 class="check__q" id="pc-question" tabindex="-1">${esc(q.q)}</h3>
        ${multi ? '<p class="check__hint">Mehrfachauswahl möglich.</p>' : ''}
        <div class="check__options ${q.options.length > 4 ? "check__options--3" : ""}" role="${multi ? "group" : "radiogroup"}" aria-labelledby="pc-question" aria-describedby="pc-error">
          ${q.options.map((o, i) => `<button type="button" class="opt ${multi ? "opt--multi" : ""} ${isSel(o.v) ? "is-selected" : ""}" role="${multi ? "checkbox" : "radio"}" aria-checked="${isSel(o.v)}" data-value="${esc(o.v)}">
            <span class="opt__mark" aria-hidden="true"></span>
            <span class="opt__text"><span class="opt__title">${esc(o.v)}</span>${o.s ? `<span class="opt__sub">${esc(o.s)}</span>` : ""}</span>
            <span class="opt__key hide-mobile" aria-hidden="true">${KEYS[i]}</span>
          </button>`).join("")}
        </div>
        <p class="check__error" id="pc-error" role="alert" data-error></p>
      </div>`;
    }
    function renderContact() {
      const c = state.contact;
      return `<div class="check__step is-active" data-qid="contact">
        <h3 class="check__q" tabindex="-1">Wie kann ich dich erreichen?</h3>
        <p class="check__hint">Ich nutze deine Kontaktdaten, um deine Anfrage persönlich zu beantworten.</p>
        <div class="fields fields--2">
          <div class="field"><label for="pc-name">Vorname *</label><input id="pc-name" name="name" type="text" autocomplete="given-name" value="${esc(c.name)}" placeholder="Dein Vorname" required><span class="field__error">Bitte gib deinen Vornamen an.</span></div>
          <div class="field"><label for="pc-email">E-Mail *</label><input id="pc-email" name="email" type="email" autocomplete="email" inputmode="email" value="${esc(c.email)}" placeholder="name@beispiel.de" required><span class="field__error">Bitte gib eine gültige E-Mail-Adresse an.</span></div>
          <div class="field"><label for="pc-phone">Telefon (optional)</label><input id="pc-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" value="${esc(c.phone)}" placeholder="+49 …"></div>
          <div class="field"><label for="pc-msg">Hast du noch eine Frage? (optional)</label><input id="pc-msg" name="message" type="text" value="${esc(c.message)}" placeholder="Deine Frage zum Coaching"></div>
          <div class="field field--full">
            <label class="consent"><input type="checkbox" name="consent" ${c.consent ? "checked" : ""}> <span>Ich stimme zu, dass meine Angaben zur Bearbeitung meiner Anfrage gespeichert und verarbeitet werden. Details in der <a href="/datenschutz/" rel="noopener">Datenschutzerklärung</a>. *</span></label>
            <span class="field__error">Bitte bestätige die Datenschutzerklärung.</span>
          </div>
          <div class="field" style="position:absolute;left:-9999px" aria-hidden="true"><label for="pc-company">Firma</label><input id="pc-company" name="company" type="text" tabindex="-1" autocomplete="off"></div>
        </div>
        <p class="check__error" data-error></p>
      </div>`;
    }
    function summaryRows() {
      return QUESTIONS.map((q, i) => { const a = state.answers[q.id]; const val = Array.isArray(a) ? a.join(", ") : (a || "–"); return `<div class="check__summary-row"><dt>${esc(q.label)}</dt><dd>${esc(val)} <button type="button" class="link-underline small muted" data-goto="${i}" style="margin-left:.5rem">Ändern</button></dd></div>`; }).join("")
        + `<div class="check__summary-row"><dt>Kontakt</dt><dd>${esc(state.contact.name)} · ${esc(state.contact.email)}${state.contact.phone ? " · " + esc(state.contact.phone) : ""} <button type="button" class="link-underline small muted" data-goto="${QUESTIONS.length}" style="margin-left:.5rem">Ändern</button></dd></div>`
        + (state.contact.message ? `<div class="check__summary-row"><dt>Dein Hinweis</dt><dd>${esc(state.contact.message)}</dd></div>` : "");
    }
    function renderReview() {
      return `<div class="check__step is-active" data-qid="review">
        <h3 class="check__q">Deine Angaben im Überblick.</h3>
        <p class="check__hint">${C.formEndpoint ? "Prüfe deine Angaben. Mit dem nächsten Schritt sendest du deine Anfrage ab." : C.contactEmail ? "Prüfe deine Angaben. Im nächsten Schritt öffnet sich dein E-Mail-Programm. Sende deine Anfrage dort ab." : "Prüfe deine Angaben. Du kannst deine Antworten anschließend kopieren und später senden."}</p>
        <dl class="check__summary">${summaryRows()}</dl>
        <p class="check__error" data-error></p>
      </div>`;
    }
    function plainSummary() {
      const lines = QUESTIONS.map((q) => { const a = state.answers[q.id]; return q.label + ": " + (Array.isArray(a) ? a.join(", ") : (a || "–")); });
      lines.push("", "Vorname: " + state.contact.name, "E-Mail: " + state.contact.email, "Telefon: " + (state.contact.phone || "–"), "Hinweis: " + (state.contact.message || "–"));
      return lines.join("\n");
    }
    function renderResult() {
      return `<div class="check__result"><p class="check__result-label">So geht es weiter</p><p class="check__hint">Ich lese deine Antworten persönlich und melde mich über die angegebene Kontaktadresse. Gemeinsam klären wir, ob das Coaching zu deinem Ziel und deinem Alltag passt.</p></div>`;
    }
    function renderDone(mode) {
      const summary = plainSummary();
      let extra = mode === "ok" ? renderResult() : "";
      if (mode === "mailto") extra += `<p class="check__hint">Sende die E-Mail ab, damit ich deine Anfrage erhalte. Falls sich dein E-Mail-Programm nicht öffnet, kopiere deine Antworten und schreibe an <strong>${esc(C.contactEmail)}</strong>.</p><textarea class="check__raw" readonly aria-label="Deine Antworten">${esc(summary)}</textarea>`;
      if (mode === "setup") extra += `<p class="check__hint">Deine Antworten wurden noch nicht gesendet. Der direkte Versand ist momentan nicht verfügbar. Deine Angaben bleiben erhalten; du kannst sie unten kopieren.</p><textarea class="check__raw" readonly aria-label="Deine Antworten">${esc(summary)}</textarea>`;
      if (mode === "error") extra = `<p class="check__hint">Deine Anfrage konnte nicht übermittelt werden. Deine Antworten stehen unten zum Kopieren bereit. Versuche es erneut${C.contactEmail ? ` oder schreibe direkt an <strong>${esc(C.contactEmail)}</strong>` : ""}.</p><textarea class="check__raw" readonly>${esc(summary)}</textarea>`;
      if (mode !== "ok") extra += `<button type="button" class="btn btn--outline btn--sm check__copy" data-copy><span class="btn__label">Antworten kopieren</span></button><button type="button" class="link-underline" data-retry>Zurück zur Zusammenfassung</button>`;
      const headline = mode === "ok" ? "Danke, deine Anfrage wurde übermittelt." : mode === "mailto" ? "Sende jetzt deine Anfrage per E-Mail." : "Noch nicht gesendet.";
      const sub = mode === "ok" ? `Kontaktadresse: <strong>${esc(state.contact.email)}</strong>.` : "";
      return `<div class="check__step is-active" data-qid="done"><div class="check__done">
        <div class="check__done-icon" aria-hidden="true">${mode === "error" ? "!" : '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>'}</div>
        <h3 class="check__q" tabindex="-1">${headline}</h3>${sub ? `<p class="check__hint">${sub}</p>` : ""}${extra}
        <a class="btn btn--ghost" href="#faq"><span class="btn__fill" aria-hidden="true"></span><span class="btn__label">Antworten auf häufige Fragen</span><span class="btn__icon" aria-hidden="true"><svg class="arrow-exit" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7"/></svg><svg class="arrow-enter" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7"/></svg></span></a>
      </div></div>`;
    }

    function updateChrome() {
      const i = state.step;
      const pct = Math.min(100, Math.round((i / total) * 100));
      bar.style.width = (i === 0 ? 4 : pct) + "%";
      if (i < QUESTIONS.length) { stepLabel.textContent = `Frage ${i + 1} von ${QUESTIONS.length}`; stepName.textContent = QUESTIONS[i].label; }
      else if (i === QUESTIONS.length) { stepLabel.textContent = "Fast geschafft"; stepName.textContent = "Kontakt"; }
      else { stepLabel.textContent = "Zusammenfassung"; stepName.textContent = "Prüfen & weiter"; }
      back.disabled = i === 0;
      nextLabel.textContent = i === QUESTIONS.length + 1 ? (C.formEndpoint ? "Anfrage senden" : C.contactEmail ? "E-Mail öffnen" : "Antworten anzeigen") : "Weiter";
      next.hidden = false;
    }

    function render(dir) {
      terminal = false;
      const i = state.step;
      const html = i < QUESTIONS.length ? renderQuestion(QUESTIONS[i]) : i === QUESTIONS.length ? renderContact() : renderReview();
      if (window.gsap && body.firstElementChild) gsap.killTweensOf(body.firstElementChild);
      body.innerHTML = html; updateChrome(); bind();
      if (gsapOk()) gsap.fromTo(body.firstElementChild, { opacity: 0, x: dir >= 0 ? 18 : -18 }, { opacity: 1, x: 0, duration: 0.2, ease: "power2.out" });
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
      if (dir !== undefined) focusStep();
    }
    function focusStep() {
      const heading = body.querySelector(".check__q");
      if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
      const shell = root.querySelector(".check__shell");
      const top = shell.getBoundingClientRect().top;
      if (top < 100 || top > innerHeight / 2) {
        if (window.PM && PM.scrollTo) PM.scrollTo(shell, { offset: -100, duration: .45 });
        else shell.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    function bind() {
      const step = body.firstElementChild; const qid = step.dataset.qid;
      if (qid === "contact") {
        step.querySelectorAll("input").forEach((inp) => inp.addEventListener("input", () => {
          if (inp.name === "consent") state.contact.consent = inp.checked; else if (inp.name !== "company") state.contact[inp.name] = inp.value.trim();
          inp.closest(".field").classList.remove("field--error"); save();
          inp.removeAttribute("aria-invalid");
          step.querySelector("[data-error]").textContent = "";
        }));
        return;
      }
      if (qid === "review") { step.querySelectorAll("[data-goto]").forEach((b) => b.addEventListener("click", () => { if (sending) return; state.step = parseInt(b.dataset.goto, 10); render(-1); })); return; }
      const q = QUESTIONS.find((x) => x.id === qid); if (!q) return;
      step.querySelectorAll(".opt").forEach((opt) => opt.addEventListener("click", () => choose(q, opt.dataset.value, step)));
    }
    function choose(q, v, step) {
      if (q.type === "multi") {
        const arr = Array.isArray(state.answers[q.id]) ? state.answers[q.id].slice() : [];
        const k = arr.indexOf(v); if (k >= 0) arr.splice(k, 1); else arr.push(v);
        state.answers[q.id] = arr;
        step.querySelectorAll(".opt").forEach((o) => { const on = arr.includes(o.dataset.value); o.classList.toggle("is-selected", on); o.setAttribute("aria-checked", String(on)); });
        step.querySelector("[data-error]").textContent = "";
        save(); return;
      }
      state.answers[q.id] = v;
      step.querySelectorAll(".opt").forEach((o) => { const on = o.dataset.value === v; o.classList.toggle("is-selected", on); o.setAttribute("aria-checked", String(on)); });
      step.querySelector("[data-error]").textContent = ""; save();
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
        const bad = [];
        [["#pc-name", !!state.contact.name], ["#pc-email", EMAIL_RE.test(state.contact.email)], ['input[name="consent"]', state.contact.consent]].forEach(([selector, ok]) => {
          const input = step.querySelector(selector);
          input.closest(".field").classList.toggle("field--error", !ok);
          if (ok) input.removeAttribute("aria-invalid");
          else { input.setAttribute("aria-invalid", "true"); bad.push(input); }
        });
        if (bad.length) { err.textContent = "Bitte prüfe die markierten Felder."; bad[0].focus(); }
        return !bad.length;
      }
      return true;
    }
    function advance() { if (terminal || sending || !validate()) return; if (state.step === total - 1) return submit(); state.step++; render(1); }
    function goBack() { if (terminal || sending || state.step === 0) return; state.step--; render(-1); }

    function track(name) {
      try { if (window.plausible) window.plausible(name); if (window.gtag) window.gtag("event", name.toLowerCase().replace(/\s+/g, "_")); window.dataLayer && window.dataLayer.push({ event: name }); } catch (e) {}
    }
    function finish(mode) {
      terminal = true;
      sending = false;
      next.disabled = false; next.removeAttribute("aria-disabled"); root.removeAttribute("aria-busy");
      next.hidden = true; back.disabled = true; bar.style.width = "100%";
      stepLabel.textContent = mode === "ok" ? "Übermittelt" : mode === "mailto" ? "E-Mail" : "Noch nicht gesendet"; stepName.textContent = "";
      body.innerHTML = renderDone(mode);
      const copy = body.querySelector("[data-copy]");
      if (copy) copy.addEventListener("click", async () => {
        const ta = body.querySelector(".check__raw");
        try { await navigator.clipboard.writeText(ta.value); }
        catch (e) { ta.select(); if (!document.execCommand("copy")) return; }
        copy.querySelector(".btn__label").textContent = "Kopiert";
      });
      const retry = body.querySelector("[data-retry]");
      if (retry) retry.addEventListener("click", () => { state.step = total - 1; render(-1); });
      if (gsapOk()) gsap.fromTo(body.firstElementChild, { opacity: 0, scale: 0.98 }, { opacity: 1, scale: 1, duration: 0.8, ease: "expo.out" });
      if (mode === "ok") { try { localStorage.removeItem("pm_check_draft"); } catch (e) {} track("Performance Check Submitted"); }
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
      focusStep();
    }
    async function submit() {
      if (terminal || sending) return;
      sending = true;
      if (root.querySelector("#pc-company") && root.querySelector("#pc-company").value) return finish("ok"); // honeypot: silently drop
      let attribution = null; try { attribution = JSON.parse(sessionStorage.getItem("pm_attribution") || "null"); } catch (e) {}
      const payload = {
        type: "performance-check", source: root.dataset.checkSource || "website", page: location.href, submittedAt: new Date().toISOString(),
        answers: QUESTIONS.reduce((acc, q) => { acc[q.id] = { question: q.q, answer: state.answers[q.id] }; return acc; }, {}),
        contact: { name: state.contact.name, email: state.contact.email, phone: state.contact.phone, message: state.contact.message, consent: state.contact.consent, consentAt: new Date().toISOString() },
        assessment: evaluate(state.answers),
        attribution, summary: plainSummary()
      };
      next.disabled = true; back.disabled = true;
      root.setAttribute("aria-busy", "true");
      next.setAttribute("aria-disabled", "true"); nextLabel.textContent = C.formEndpoint ? "Wird gesendet …" : "Entwurf wird vorbereitet …";
      if (C.formEndpoint) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 20000);
        try {
          const res = await fetch(C.formEndpoint, { method: "POST", signal: controller.signal, headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(payload) });
          if (!res.ok) throw new Error("HTTP " + res.status);
          const response = await res.json().catch(() => null);
          if (response && (response.success === false || response.success === "false" || response.ok === false)) throw new Error("Submission rejected");
          finish("ok");
        } catch (e) { next.removeAttribute("aria-disabled"); finish("error"); }
        finally { clearTimeout(timeout); }
        return;
      }
      if (C.contactEmail) {
        const subject = encodeURIComponent("Fitness-Check: " + state.contact.name);
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
      if (e.key === "Enter" && state.step >= QUESTIONS.length && !e.target.closest("button,a,input,select,textarea")) { e.preventDefault(); advance(); }
    });
    // Keyboard shortcuts bubble from the controls without taking focus from inputs.
    root.querySelector(".check__shell").setAttribute("tabindex", "-1");
    render();
  }

  function boot() { document.querySelectorAll("[data-check]").forEach(mount); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();

