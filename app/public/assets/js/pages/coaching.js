/* COACHING PAGE — section choreography (/coaching/) */
(function () {
  "use strict";
  function run() {
    const PM = window.PM, gsap = window.gsap;
    if (!gsap) return;
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
