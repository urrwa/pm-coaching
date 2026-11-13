/* =====================================================================
   KONTAKT — contact form (validation + submission)
   Submission strategy identical to check.js:
   PM_CONFIG.formEndpoint (JSON POST) → or mailto (contactEmail) → or setup notice.
   The success state is only shown when a request actually succeeded.
   ===================================================================== */
(function () {
  "use strict";
  const C = window.PM_CONFIG || {};
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const CHECK = '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 13l4 4L19 7"/></svg>';
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function init() {
    const form = document.querySelector("[data-kt-form]");
    if (!form) return;
    const result = document.querySelector("[data-kt-result]");
    const errBox = form.querySelector("[data-kt-error]");
    const submitBtn = form.querySelector("[data-kt-submit]");
    const submitLabel = submitBtn.querySelector(".btn__label");
    const defaultLabel = submitLabel.textContent;
    const gsapOk = () => window.gsap && !(window.PM && window.PM.reduced);
    const $ = (name) => form.elements[name];

    // clear field errors while typing
    form.querySelectorAll("input, select, textarea").forEach((el) => {
      const clear = () => { const f = el.closest(".field"); if (f) f.classList.remove("field--error"); el.removeAttribute("aria-invalid"); errBox.textContent = ""; };
      el.addEventListener("input", clear); el.addEventListener("change", clear);
    });

    function read() {
      return {
        name: $("name").value.trim(),
        email: $("email").value.trim(),
        topic: $("topic").value,
        message: $("message").value.trim(),
        consent: $("consent").checked,
        company: $("company") ? $("company").value : ""
      };
    }

    function mark(el, bad) {
      const f = el.closest(".field");
      if (f) f.classList.toggle("field--error", bad);
      if (bad) el.setAttribute("aria-invalid", "true"); else el.removeAttribute("aria-invalid");
    }

    function validate(d) {
      const bad = [];
      const check = (el, ok) => { mark(el, !ok); if (!ok) bad.push(el); };
      check($("name"), d.name.length >= 2);
      check($("email"), EMAIL_RE.test(d.email));
      check($("topic"), !!d.topic);
      check($("message"), d.message.length >= 10);
      check($("consent"), d.consent);
      if (bad.length) {
        errBox.textContent = bad.length === 1 ? "Bitte prüfe das markierte Feld." : "Bitte prüfe die markierten Felder.";
        bad[0].focus({ preventScroll: false });
        if (gsapOk()) gsap.fromTo(form, { x: -6 }, { x: 0, duration: 0.5, ease: "elastic.out(1, 0.35)" });
        return false;
      }
      errBox.textContent = "";
      return true;
    }

    function plain(d) {
      return ["Name: " + d.name, "E-Mail: " + d.email, "Anliegen: " + d.topic, "", "Nachricht:", d.message].join("\n");
    }

    function resultHTML(mode, d) {
      const raw = plain(d);
      const email = C.contactEmail ? esc(C.contactEmail) : "";
      let title, text, extra = "", actions = "", warn = false;
      if (mode === "ok") {
        title = "Danke – deine Nachricht ist angekommen.";
        text = `Du bekommst innerhalb weniger Werktage eine persönliche Antwort an <strong>${esc(d.email)}</strong>. Prüfe bitte auch deinen Spam-Ordner.`;
        actions = `<a class="btn btn--ghost" href="/wissen/"><span class="btn__fill" aria-hidden="true"></span><span class="btn__mask" aria-hidden="true">In der Zwischenzeit: Knowledge Hub</span><span class="btn__label">In der Zwischenzeit: Knowledge Hub</span><span class="btn__icon" aria-hidden="true"><svg class="arrow-exit" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7"/></svg><svg class="arrow-enter" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7"/></svg></span></a>`;
      } else if (mode === "mailto") {
        title = "Fast fertig – dein E-Mail-Programm übernimmt.";
        text = `Es wurde ein E-Mail-Entwurf mit deiner Nachricht geöffnet. Erst wenn du ihn dort abschickst, ist die Nachricht unterwegs. Falls sich nichts geöffnet hat, kopiere den Text unten und sende ihn an <strong>${email}</strong>.`;
        extra = `<textarea class="kt-result__raw" readonly aria-label="Deine Nachricht als Text">${esc(raw)}</textarea>`;
        actions = `<button type="button" class="btn btn--outline btn--sm" data-kt-copy><span class="btn__label">Nachricht kopieren</span></button><button type="button" class="link-underline small muted" data-kt-retry>Zurück zum Formular</button>`;
      } else if (mode === "setup") {
        warn = true;
        title = "Danke für deine Nachricht.";
        text = "Die Übermittlung über diese Website ist noch nicht eingerichtet – deine Nachricht wurde deshalb <strong>noch nicht gesendet</strong>. Du kannst den Text unten kopieren und auf anderem Weg schicken.";
        extra = `<div class="kt-result__setup"><strong>Hinweis für den Website-Betreiber:</strong> Trage in <code>assets/js/config.js</code> entweder <code>formEndpoint</code> (JSON-Webhook / Formular-Dienst / CRM) oder <code>contactEmail</code> ein. Bis dahin kann das Kontaktformular keine Nachrichten übermitteln.</div><textarea class="kt-result__raw" readonly aria-label="Deine Nachricht als Text">${esc(raw)}</textarea>`;
        actions = `<button type="button" class="btn btn--outline btn--sm" data-kt-copy><span class="btn__label">Nachricht kopieren</span></button><button type="button" class="link-underline small muted" data-kt-retry>Zurück zum Formular</button>`;
      } else {
        warn = true;
        title = "Das hat leider nicht geklappt.";
        text = `Die Übermittlung ist fehlgeschlagen – deine Nachricht wurde nicht gesendet. Bitte versuche es in ein paar Minuten erneut${email ? ` oder schreib direkt an <strong>${email}</strong>` : ""}. Dein Text bleibt erhalten.`;
        actions = `<button type="button" class="btn btn--outline btn--sm" data-kt-retry><span class="btn__label">Zurück zum Formular</span></button>`;
      }
      return `<div class="kt-result__icon ${warn ? "kt-result__icon--warn" : ""}" aria-hidden="true">${warn ? "!" : CHECK}</div>
        <h2 class="kt-result__title">${title}</h2>
        <p class="kt-result__text">${text}</p>${extra}
        <div class="kt-result__actions">${actions}</div>`;
    }

    function swap(fromEl, toEl, then) {
      const done = () => { fromEl.hidden = true; toEl.hidden = false; if (then) then(); if (window.ScrollTrigger) window.ScrollTrigger.refresh(); };
      if (!gsapOk()) { done(); return; }
      gsap.to(fromEl, { opacity: 0, y: -14, duration: 0.3, ease: "power2.in", onComplete: () => {
        gsap.set(fromEl, { clearProps: "all" });
        done();
        gsap.fromTo(toEl, { opacity: 0, y: 24, scale: 0.985 }, { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: "expo.out", clearProps: "transform" });
      } });
    }

    function show(mode, d) {
      result.innerHTML = resultHTML(mode, d);
      swap(form, result, () => {
        result.focus({ preventScroll: true });
        const copy = result.querySelector("[data-kt-copy]");
        if (copy) copy.addEventListener("click", () => {
          const ta = result.querySelector(".kt-result__raw"); if (!ta) return;
          ta.select();
          const ok = () => { copy.querySelector(".btn__label").textContent = "Kopiert"; };
          try { if (navigator.clipboard) navigator.clipboard.writeText(ta.value).then(ok, () => { document.execCommand("copy"); ok(); }); else { document.execCommand("copy"); ok(); } } catch (e) {}
        });
        const retry = result.querySelector("[data-kt-retry]");
        if (retry) retry.addEventListener("click", () => {
          setBusy(false);
          swap(result, form, () => { result.innerHTML = ""; $("message").focus({ preventScroll: true }); });
        });
      });
      if (mode === "ok") form.reset(); // keep the text in all other states so nothing is lost
      if (mode === "ok" || mode === "mailto") track("Contact Form Submitted");
    }

    function setBusy(on) {
      form.classList.toggle("is-busy", on);
      if (on) { submitBtn.setAttribute("aria-disabled", "true"); submitLabel.textContent = "Wird gesendet …"; }
      else { submitBtn.removeAttribute("aria-disabled"); submitLabel.textContent = defaultLabel; }
    }

    function track(name) {
      try { if (window.plausible) window.plausible(name); if (window.gtag) window.gtag("event", name.toLowerCase().replace(/\s+/g, "_")); window.dataLayer && window.dataLayer.push({ event: name }); } catch (e) {}
    }

    async function submit(e) {
      e.preventDefault();
      if (form.classList.contains("is-busy")) return;
      const d = read();
      if (!validate(d)) return;
      if (d.company) { show("ok", d); return; } // honeypot: silently drop bot submissions

      let attribution = null; try { attribution = JSON.parse(sessionStorage.getItem("pm_attribution") || "null"); } catch (err) {}
      const now = new Date().toISOString();
      const payload = {
        type: "contact",
        name: d.name, email: d.email, topic: d.topic, message: d.message,
        consent: d.consent, consentAt: now,
        page: location.href, submittedAt: now, attribution, summary: plain(d)
      };
      setBusy(true);

      if (C.formEndpoint) {
        try {
          const res = await fetch(C.formEndpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(payload) });
          if (!res.ok) throw new Error("HTTP " + res.status);
          setBusy(false); show("ok", d);
        } catch (err) { setBusy(false); show("error", d); }
        return;
      }
      if (C.contactEmail) {
        const subject = encodeURIComponent("Kontaktanfrage: " + d.topic + " – " + d.name);
        const body = encodeURIComponent(plain(d) + "\n\nQuelle: " + location.href);
        window.location.href = `mailto:${C.contactEmail}?subject=${subject}&body=${body}`;
        setBusy(false); show("mailto", d);
        return;
      }
      setBusy(false); show("setup", d);
    }

    form.addEventListener("submit", submit);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
