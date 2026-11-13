/* COACHING PAGE — section choreography (/coaching/) */
(function () {
  "use strict";
  function run() {
    const PM = window.PM, gsap = window.gsap, ST = window.ScrollTrigger;
    if (!gsap || !ST) return;
    const reduced = PM.reduced;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    /* ---------- a) Hero intro (elements inside [data-hero] are left to the page script) ---------- */
    (function hero() {
      const hero = document.querySelector("[data-co-hero]");
      if (!hero) return;
      const title = hero.querySelector('[data-reveal="words"]');
      const words = title ? PM.splitWords(title) : [];
      const els = hero.querySelectorAll('[data-reveal="up"]');
      const frame = hero.querySelector('[data-reveal="clip"]');
      const chips = hero.querySelectorAll(".co-hero__chip");
      if (reduced) return;
      gsap.set(words, { yPercent: 115 });
      gsap.set(els, { opacity: 0, y: 26 });
      gsap.set(chips, { opacity: 0, y: 16, scale: 0.92 });
      const tl = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } })
        .to(words, { yPercent: 0, duration: 1.2, stagger: 0.045 }, 0.1)
        .to(els, { opacity: 1, y: 0, duration: 1, stagger: 0.1 }, 0.35);
      if (frame) tl.to(frame, { clipPath: "inset(0 0 0% 0)", duration: 1.4, ease: "expo.inOut" }, 0.2);
      tl.to(chips, { opacity: 1, y: 0, scale: 1, duration: 0.9, stagger: 0.12 }, 1.0)
        .add(() => chips.forEach((c, i) => gsap.to(c, { y: "+=" + (6 + i * 3), duration: 3 + i * 0.5, yoyo: true, repeat: -1, ease: "sine.inOut" })));
      const play = () => tl.play();
      if (PM.revealed) play(); else document.addEventListener("pm:reveal", play, { once: true });
    })();

    /* ---------- b) Leistungen: tabs with sliding ink + panel choreography ---------- */
    (function tabs() {
      const root = document.querySelector("[data-co-tabs]");
      if (!root) return;
      const bar = root.querySelector('[role="tablist"]');
      const tabs = Array.from(root.querySelectorAll('[role="tab"]'));
      const panels = tabs.map((t) => document.getElementById(t.getAttribute("aria-controls")));
      const ink = root.querySelector(".co-tabs__ink");
      let current = Math.max(0, tabs.findIndex((t) => t.classList.contains("is-active")));
      let busy = false;

      const moveInk = (animate) => {
        const t = tabs[current];
        if (!ink || !t) return;
        const x = t.offsetLeft, w = t.offsetWidth;
        if (!animate || reduced) gsap.set(ink, { x, width: w });
        else gsap.to(ink, { x, width: w, duration: 0.7, ease: "expo.out" });
      };
      const centerTab = (t) => {
        if (bar.scrollWidth <= bar.clientWidth + 2) return;
        const left = t.offsetLeft - (bar.clientWidth - t.offsetWidth) / 2;
        bar.scrollTo({ left: Math.max(0, left), behavior: reduced ? "auto" : "smooth" });
      };
      const applyState = () => tabs.forEach((t, k) => {
        const on = k === current;
        t.classList.toggle("is-active", on);
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
      });
      const animateIn = (panel, done) => {
        if (reduced) { done(); return; }
        const anims = panel.querySelectorAll("[data-co-anim]");
        const media = panel.querySelector("[data-co-media]");
        const img = media && media.querySelector("img");
        const tl = gsap.timeline({ onComplete: done });
        if (media) tl.fromTo(media, { clipPath: "inset(0 0 0 100%)" }, { clipPath: "inset(0 0 0 0%)", duration: 0.95, ease: "expo.inOut", clearProps: "clipPath" }, 0);
        if (img) tl.fromTo(img, { scale: 1.16 }, { scale: 1, duration: 1.4, ease: "expo.out" }, 0.05);
        tl.fromTo(anims, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.07, ease: "expo.out", clearProps: "opacity,transform" }, 0.2);
      };
      const activate = (idx, focus) => {
        idx = (idx + tabs.length) % tabs.length;
        if (focus) tabs[idx].focus({ preventScroll: true });
        if (busy || idx === current) return;
        busy = true;
        const out = panels[current], inn = panels[idx];
        current = idx;
        applyState(); moveInk(true); centerTab(tabs[idx]);
        const show = () => {
          out.hidden = true; inn.hidden = false;
          animateIn(inn, () => { busy = false; ST.refresh(); });
        };
        if (reduced) { show(); return; }
        const outEls = out.querySelectorAll("[data-co-anim], [data-co-media]");
        gsap.to(outEls, { opacity: 0, y: -10, duration: 0.28, stagger: 0.025, ease: "power2.in", onComplete: () => { gsap.set(outEls, { clearProps: "opacity,transform" }); show(); } });
      };

      tabs.forEach((t, k) => {
        t.addEventListener("click", () => activate(k, false));
        t.addEventListener("keydown", (e) => {
          const map = { ArrowRight: k + 1, ArrowLeft: k - 1, Home: 0, End: tabs.length - 1 };
          if (!(e.key in map)) return;
          e.preventDefault();
          activate(map[e.key], true);
        });
      });
      applyState();
      panels.forEach((p, k) => { if (p) p.hidden = k !== current; });
      moveInk(false);
      window.addEventListener("resize", () => moveInk(false));
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => moveInk(false));
    })();

    /* ---------- c) Beispielwoche: click/keyboard pins a day (hover + focus handled in CSS) ---------- */
    (function week() {
      const days = document.querySelectorAll("[data-co-week] .co-week__day");
      if (!days.length) return;
      const pin = (d) => days.forEach((o) => o.classList.toggle("is-active", o === d));
      days.forEach((d) => {
        d.addEventListener("click", () => pin(d));
        d.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pin(d); } });
      });
    })();

    /* ---------- e) Investition: pointer spotlight on the card ---------- */
    (function spotlight() {
      const card = document.querySelector("[data-co-spot]");
      if (!card || !finePointer || reduced) return;
      const setX = gsap.quickSetter(card, "--mx", "%");
      const setY = gsap.quickSetter(card, "--my", "%");
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        setX(((e.clientX - r.left) / r.width) * 100);
        setY(((e.clientY - r.top) / r.height) * 100);
      });
      card.addEventListener("pointerleave", () => { setX(85); setY(0); });
    })();
  }
  if (window.PM && window.PM.ready) run(); else document.addEventListener("pm:ready", run, { once: true });
})();
