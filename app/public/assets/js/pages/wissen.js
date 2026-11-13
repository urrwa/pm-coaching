/* WISSEN — Knowledge Hub & Artikelseiten (ein Script für beide; jede Funktion prüft ihr Markup) */
(function () {
  "use strict";
  function run() {
    const PM = window.PM || {}, gsap = window.gsap, ST = window.ScrollTrigger;
    if (!gsap || !ST) return;
    const reduced = !!PM.reduced;
    const finePointer = () => window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 1024px)").matches;
    const navH = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) || 84;

    /* =====================================================================
       HUB — Artikel-Index: gestaffelter Reveal + Kategorie-Filter (FLIP)
       ===================================================================== */
    (function hubIndex() {
      const list = document.querySelector("[data-wi-list]");
      if (!list) return;
      const rows = Array.from(list.querySelectorAll("[data-wi-cat]"));
      const chips = Array.from(document.querySelectorAll("[data-wi-filter]"));
      const empty = document.querySelector("[data-wi-empty]");
      const counter = document.querySelector("[data-wi-count]");
      let revealed = reduced;
      let busy = false;

      const visible = () => rows.filter((r) => !r.hidden);
      const updateCount = () => {
        if (!counter) return;
        const n = visible().length;
        counter.textContent = n === 1 ? "1 Eintrag" : n + " Einträge";
      };

      // Reveal: Zeilen laufen gestaffelt ein, sobald der Index ins Bild kommt
      if (!reduced) {
        gsap.set(rows, { opacity: 0, y: 36 });
        ST.create({
          trigger: list, start: "top 85%", once: true,
          onEnter: () => {
            revealed = true;
            gsap.to(visible(), { opacity: 1, y: 0, duration: 1, ease: "expo.out", stagger: 0.09, clearProps: "transform" });
          }
        });
      }

      const applyFilter = (cat) => {
        if (busy) return;
        const match = (r) => cat === "alle" || r.dataset.wiCat === cat;
        const entering = rows.filter((r) => match(r) && r.hidden);
        const leaving = rows.filter((r) => !match(r) && !r.hidden);
        const staying = rows.filter((r) => match(r) && !r.hidden);
        chips.forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.wiFilter === cat)));
        const count = entering.length + staying.length;
        if (empty) empty.hidden = count > 0;
        if (counter) counter.textContent = count === 1 ? "1 Eintrag" : count + " Einträge";

        // Ohne Animation: nur ein-/ausblenden
        if (reduced || !revealed) {
          leaving.forEach((r) => { r.hidden = true; });
          entering.forEach((r) => { r.hidden = false; });
          ST.refresh();
          return;
        }

        busy = true;
        const finish = () => {
          // FLIP: Positionen der bleibenden Zeilen merken, Layout ändern, Differenz animieren
          const before = new Map(staying.map((r) => [r, r.getBoundingClientRect().top]));
          leaving.forEach((r) => { r.hidden = true; });
          entering.forEach((r) => { r.hidden = false; });
          gsap.set(entering, { opacity: 0, y: 24 });
          staying.forEach((r) => {
            const d = before.get(r) - r.getBoundingClientRect().top;
            if (Math.abs(d) > 1) gsap.fromTo(r, { y: d }, { y: 0, duration: 0.8, ease: "expo.out", clearProps: "transform" });
          });
          const done = () => { busy = false; ST.refresh(); };
          if (entering.length) gsap.to(entering, { opacity: 1, y: 0, duration: 0.8, ease: "expo.out", stagger: 0.06, clearProps: "transform", onComplete: done });
          else done();
        };
        if (leaving.length) gsap.to(leaving, { opacity: 0, y: -12, duration: 0.3, ease: "power2.in", stagger: 0.02, onComplete: finish });
        else finish();
      };

      chips.forEach((c, i) => {
        c.addEventListener("click", () => applyFilter(c.dataset.wiFilter || "alle"));
        // Pfeiltasten innerhalb der Chip-Gruppe
        c.addEventListener("keydown", (e) => {
          if (e.key !== "ArrowRight" && e.key !== "ArrowLeft" && e.key !== "Home" && e.key !== "End") return;
          e.preventDefault();
          let n = i;
          if (e.key === "ArrowRight") n = (i + 1) % chips.length;
          if (e.key === "ArrowLeft") n = (i - 1 + chips.length) % chips.length;
          if (e.key === "Home") n = 0;
          if (e.key === "End") n = chips.length - 1;
          chips[n].focus();
        });
      });
      updateCount();
    })();

    /* =====================================================================
       HUB — Vorschaubild folgt dem Cursor (nur Desktop mit Maus)
       ===================================================================== */
    (function hoverThumb() {
      const thumb = document.querySelector("[data-wi-thumb]");
      const list = document.querySelector("[data-wi-list]");
      if (!thumb || !list || reduced || PM.isTouch || !finePointer()) return;
      const img = thumb.querySelector("img");
      const rows = Array.from(list.querySelectorAll("[data-wi-thumb-src]"));
      if (!img || !rows.length) return;

      // Bilder vorladen
      rows.forEach((r) => { const pre = new Image(); pre.src = r.dataset.wiThumbSrc; });

      gsap.set(thumb, { yPercent: -50, scale: 0.85, opacity: 0 });
      const xTo = gsap.quickTo(thumb, "x", { duration: 0.55, ease: "power3.out" });
      const yTo = gsap.quickTo(thumb, "y", { duration: 0.55, ease: "power3.out" });
      const rTo = gsap.quickTo(thumb, "rotation", { duration: 0.7, ease: "power3.out" });
      let active = null, lastX = 0;
      const settle = gsap.delayedCall(0.15, () => rTo(0)).pause();
      const place = (e) => {
        const w = thumb.offsetWidth || 280;
        const x = Math.min(e.clientX + 32, window.innerWidth - w - 16);
        xTo(x); yTo(e.clientY);
      };
      const show = (row, e) => {
        if (!finePointer()) return;
        const src = row.dataset.wiThumbSrc;
        if (!src) return;
        if (img.getAttribute("src") !== src) img.setAttribute("src", src);
        active = row; lastX = e.clientX;
        // sofort an den Cursor springen, dann weich folgen
        const w = thumb.offsetWidth || 280;
        gsap.set(thumb, { x: Math.min(e.clientX + 32, window.innerWidth - w - 16), y: e.clientY });
        gsap.to(thumb, { opacity: 1, scale: 1, duration: 0.5, ease: "expo.out", overwrite: "auto" });
      };
      const hide = () => {
        active = null;
        gsap.to(thumb, { opacity: 0, scale: 0.85, duration: 0.35, ease: "power2.out", overwrite: "auto" });
      };
      rows.forEach((row) => {
        row.addEventListener("mouseenter", (e) => show(row, e));
        row.addEventListener("mouseleave", hide);
      });
      list.addEventListener("mousemove", (e) => {
        if (!active) return;
        const dx = e.clientX - lastX; lastX = e.clientX;
        place(e);
        rTo(gsap.utils.clamp(-7, 7, dx * 0.4));
        settle.restart(true);
      });
      window.addEventListener("blur", hide);
    })();

    /* =====================================================================
       ARTIKEL — Inhaltsverzeichnis aus h2, aktiver Abschnitt, Fortschritt, Teilen
       ===================================================================== */
    (function article() {
      const content = document.querySelector("[data-wi-content]");
      if (!content) return;
      const h2s = Array.from(content.querySelectorAll("h2"));
      const toc = document.querySelector("[data-wi-toc]");
      const tocList = document.querySelector("[data-wi-toc-list]");
      const links = [];

      const slug = (s) => s.toLowerCase()
        .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
        .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

      const setActive = (i) => {
        links.forEach((a, k) => {
          const on = k === i;
          a.classList.toggle("is-active", on);
          if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
        });
        // Auf kleinen Screens (horizontale Liste): aktiven Link in Sicht schieben
        const a = links[i];
        if (a && tocList && tocList.scrollWidth > tocList.clientWidth + 2) {
          tocList.scrollLeft = a.offsetLeft - tocList.clientWidth / 2 + a.offsetWidth / 2;
        }
      };

      // TOC aufbauen
      if (tocList && h2s.length) {
        const used = {};
        h2s.forEach((h, i) => {
          if (!h.id) {
            let id = slug(h.textContent) || "abschnitt-" + (i + 1);
            while (used[id] || document.getElementById(id)) id += "-2";
            h.id = id;
          }
          used[h.id] = true;
          const li = document.createElement("li");
          const a = document.createElement("a");
          a.className = "wi-toc__link"; a.href = "#" + h.id;
          const n = document.createElement("span");
          n.className = "wi-toc__num"; n.setAttribute("aria-hidden", "true"); n.textContent = String(i + 1).padStart(2, "0");
          a.appendChild(n); a.appendChild(document.createTextNode(h.textContent.trim()));
          li.appendChild(a); tocList.appendChild(li); links.push(a);
          a.addEventListener("click", (e) => {
            e.preventDefault(); e.stopPropagation(); // main.js-Anker-Handler nicht doppelt auslösen
            if (PM.scrollTo) PM.scrollTo(h, { offset: -(navH() + 28) }); else h.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
            history.replaceState(null, "", "#" + h.id);
            setActive(i);
          });
        });
        // aktiver Abschnitt: von h2 bis zur nächsten h2
        h2s.forEach((h, i) => {
          const next = h2s[i + 1];
          ST.create({
            trigger: h, start: "top 45%",
            endTrigger: next || content, end: next ? "top 45%" : "bottom 45%",
            onToggle: (self) => { if (self.isActive) setActive(i); }
          });
        });
      } else if (toc) {
        toc.hidden = true;
      }

      // Lese-Fortschritt: dünne Linie unter der Navigation, scaleX = Scrollfortschritt des Artikels
      const article = content.closest("article") || content;
      const bar = document.createElement("div");
      bar.className = "wi-progress"; bar.setAttribute("aria-hidden", "true");
      document.body.appendChild(bar);
      ST.create({
        trigger: article, start: "top top", end: "bottom bottom",
        onUpdate: (self) => gsap.set(bar, { scaleX: self.progress }),
        onRefresh: (self) => gsap.set(bar, { scaleX: self.progress })
      });

      // Teilen / Link kopieren
      const share = document.querySelector("[data-wi-share]");
      const msg = document.querySelector("[data-wi-share-msg]");
      if (share) {
        let timer = null;
        const say = (t) => {
          if (!msg) return;
          msg.textContent = t;
          clearTimeout(timer); timer = setTimeout(() => { msg.textContent = ""; }, 2800);
        };
        const legacyCopy = (text) => {
          const ta = document.createElement("textarea");
          ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
          document.body.appendChild(ta); ta.select();
          let ok = false;
          try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
          document.body.removeChild(ta);
          return ok;
        };
        share.addEventListener("click", async () => {
          const url = location.origin + location.pathname;
          const title = document.title;
          try {
            if (navigator.share && PM.isTouch) { await navigator.share({ title, url }); return; }
            if (navigator.clipboard && navigator.clipboard.writeText) { await navigator.clipboard.writeText(url); say("Link kopiert"); return; }
            say(legacyCopy(url) ? "Link kopiert" : "Kopieren nicht möglich");
          } catch (e) {
            if (e && e.name === "AbortError") return;
            say(legacyCopy(url) ? "Link kopiert" : "Kopieren nicht möglich");
          }
        });
      }

      // Hero-Bild: sanfte Entzoomung beim Scrollen (zusätzlich zum Clip-Reveal)
      const heroImg = document.querySelector("[data-wi-hero-img]");
      if (heroImg && !reduced) {
        gsap.fromTo(heroImg, { scale: 1.08 }, { scale: 1, ease: "none", scrollTrigger: { trigger: heroImg, start: "top 90%", end: "bottom 30%", scrub: 0.6 } });
      }
    })();

    /* =====================================================================
       GEMEINSAM — Pull-Quotes: Linie wächst, Text fährt ein
       ===================================================================== */
    (function pulls() {
      const pulls = document.querySelectorAll(".wi-pull");
      if (!pulls.length || reduced) return;
      pulls.forEach((q) => {
        const inner = Array.from(q.children);
        if (!inner.length) return;
        gsap.fromTo(inner, { opacity: 0, x: 24 }, {
          opacity: 1, x: 0, duration: 1.1, ease: "expo.out", stagger: 0.1,
          scrollTrigger: { trigger: q, start: "top 85%", once: true }
        });
      });
    })();
  }
  if (window.PM && window.PM.ready) run(); else document.addEventListener("pm:ready", run, { once: true });
})();
