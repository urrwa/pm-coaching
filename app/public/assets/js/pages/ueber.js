/* ÜBER — page choreography (hero parallax, scrubbed manifest, ledger activation) */
(function () {
  "use strict";
  function run() {
    const PM = window.PM, gsap = window.gsap, ST = window.ScrollTrigger;
    if (!gsap || !ST) return;
    const reduced = PM.reduced;

    /* ---------- Hero: settle-in + subtle parallax ---------- */
    (function hero() {
      const sec = document.querySelector("[data-ab-hero]");
      const img = sec && sec.querySelector("[data-ab-hero-img]");
      if (!img || reduced) return;
      gsap.fromTo(img, { opacity: 0, scale: 1.18 }, { opacity: 1, scale: 1.1, duration: 2.4, ease: "expo.out" });
      gsap.to(img, { yPercent: 12, ease: "none", scrollTrigger: { trigger: sec, start: "top top", end: "bottom top", scrub: true } });
      gsap.to(sec.querySelector(".ab-hero__copy"), { y: -60, opacity: 0, ease: "none", scrollTrigger: { trigger: sec, start: "45% top", end: "bottom top", scrub: true } });
      const glow = sec.querySelector(".ab-hero__glow");
      if (glow) gsap.to(glow, { x: -50, y: -30, duration: 10, yoyo: true, repeat: -1, ease: "sine.inOut" });
    })();

    /* ---------- Manifest: each line fills grey -> navy across the viewport centre ---------- */
    (function manifest() {
      const lines = document.querySelectorAll("[data-ab-line]");
      if (!lines.length) return;
      lines.forEach((line) => {
        const words = PM.splitWords(line);
        if (reduced) { gsap.set(words, { color: "#07111F" }); return; }
        gsap.to(words, { color: "#07111F", stagger: 0.06, ease: "none", scrollTrigger: { trigger: line, start: "top 75%", end: "bottom 45%", scrub: 0.4 } });
      });
    })();

    /* ---------- Ledger: activate row at viewport centre ---------- */
    (function ledger() {
      const rows = document.querySelectorAll("[data-ab-row]");
      if (!rows.length) return;
      const setActive = (row) => rows.forEach((r) => r.classList.toggle("is-active", r === row));
      rows.forEach((r) => {
        r.addEventListener("mouseenter", () => setActive(r));
        ST.create({ trigger: r, start: "top 60%", end: "bottom 60%", onEnter: () => setActive(r), onEnterBack: () => setActive(r) });
      });
      if (reduced) return;
      rows.forEach((r) => {
        const num = r.querySelector(".ab-ledger__num");
        gsap.fromTo(num, { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: r, start: "top 85%", once: true } });
        gsap.fromTo(r.querySelector(".ab-ledger__body"), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: "expo.out", delay: 0.1, scrollTrigger: { trigger: r, start: "top 85%", once: true } });
      });
    })();
  }
  if (window.PM && window.PM.ready) run(); else document.addEventListener("pm:ready", run, { once: true });
})();
