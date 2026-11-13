/* METHODE PAGE — section choreography (/methode/) */
(function () {
  "use strict";
  function run() {
    const PM = window.PM, gsap = window.gsap, ST = window.ScrollTrigger;
    if (!gsap || !ST) return;
    const reduced = PM.reduced;
    const pad = (n) => String(n).padStart(2, "0");

    /* ---------- a) Hero: intro + scroll-scrubbed fill of the outlined phase names ---------- */
    (function hero() {
      const hero = document.querySelector("[data-me-hero]");
      if (!hero) return;
      const title = hero.querySelector("h1");
      const words = title ? PM.splitWords(title) : [];
      const intro = hero.querySelectorAll(".me-hero__intro [data-reveal]:not(h1)");
      const rows = Array.from(hero.querySelectorAll("[data-me-row]"));
      const fills = hero.querySelectorAll("[data-me-fill]");
      const counter = hero.querySelector("[data-me-counter]");
      const stack = hero.querySelector("[data-me-stack]");
      const n = rows.length;
      const STEP = 0.85; // overlap between consecutive fills
      const setCount = (i) => { if (counter) counter.textContent = pad(i + 1) + " / " + pad(n); };

      if (reduced) {
        gsap.set(fills, { clipPath: "inset(0 0% 0 0)" });
        rows.forEach((r) => r.classList.add("is-filled"));
        setCount(n - 1);
        return;
      }

      // intro choreography (plays once the page veil lifts)
      gsap.set(words, { yPercent: 115 });
      gsap.set(intro, { opacity: 0, y: 24 });
      gsap.set(rows, { opacity: 0, y: 40 });
      const tl = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } })
        .to(rows, { opacity: 1, y: 0, duration: 1.2, stagger: 0.08 }, 0)
        .to(words, { yPercent: 0, duration: 1.1, stagger: 0.04 }, 0.2)
        .to(intro, { opacity: 1, y: 0, duration: 1, stagger: 0.1 }, 0.45);
      const play = () => tl.play();
      if (PM.revealed) play(); else document.addEventListener("pm:reveal", play, { once: true });

      // fill timeline, driven by scroll
      const fillTl = gsap.timeline({ paused: true, defaults: { ease: "none" } });
      fills.forEach((f, i) => fillTl.fromTo(f, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 1 }, i * STEP));
      const update = (self) => {
        const t = self.progress * fillTl.duration();
        rows.forEach((r, k) => r.classList.toggle("is-filled", t >= k * STEP + 0.5));
        setCount(Math.min(n - 1, Math.floor(t / STEP)));
      };
      const pinMode = () => window.matchMedia("(min-width: 1024px)").matches && window.innerHeight >= 700;
      let st = null;
      const build = () => {
        if (st) { st.kill(); st = null; }
        st = ST.create(pinMode()
          ? { trigger: hero, start: "top top", end: () => "+=" + Math.round(window.innerHeight * 1.1), pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true, animation: fillTl, onUpdate: update }
          : { trigger: stack, start: "top 70%", end: "bottom 45%", scrub: 0.6, animation: fillTl, onUpdate: update });
      };
      build();
      let mode = pinMode();
      window.addEventListener("resize", () => { const m = pinMode(); if (m !== mode) { mode = m; build(); ST.refresh(); } });
    })();

    /* ---------- b) Comparison: rows reveal staggered, G5 cell slides in last ---------- */
    (function compare() {
      const rows = document.querySelectorAll("[data-me-crow]");
      if (!rows.length || reduced) return;
      rows.forEach((row) => {
        const cells = Array.from(row.children);
        const g5 = row.querySelector(".me-table__cell--g5");
        const others = cells.filter((c) => c !== g5);
        gsap.set(others, { opacity: 0, y: 22 });
        if (g5) gsap.set(g5, { opacity: 0, x: 18 });
        ST.create({
          trigger: row, start: "top 88%", once: true,
          onEnter: () => {
            gsap.to(others, { opacity: 1, y: 0, duration: 0.9, stagger: 0.08, ease: "expo.out" });
            if (g5) gsap.to(g5, { opacity: 1, x: 0, duration: 1, delay: 0.15, ease: "expo.out" });
          }
        });
      });
    })();

    /* ---------- c) Phases: sticky tracker (odometer number, steps, progress) follows the blocks ---------- */
    (function phases() {
      const sec = document.querySelector("[data-me-phases]");
      if (!sec) return;
      const blocks = Array.from(sec.querySelectorAll("[data-me-block]"));
      const steps = Array.from(sec.querySelectorAll("[data-me-step]"));
      const numTrack = sec.querySelector("[data-me-num-track]");
      const curName = sec.querySelector("[data-me-cur-name]");
      const curDe = sec.querySelector("[data-me-cur-de]");
      const progress = sec.querySelector("[data-me-progress]");
      const barName = sec.querySelector("[data-me-bar-name]");
      const barCount = sec.querySelector("[data-me-bar-count]");
      const dots = sec.querySelectorAll("[data-me-bar-dots] > span");
      const list = sec.querySelector(".me-phases__list");
      const n = blocks.length;
      if (!n) return;
      let active = -1, swapTl = null;

      const setActive = (i) => {
        if (i === active) return;
        active = i;
        const b = blocks[i];
        steps.forEach((s, k) => { s.classList.toggle("is-active", k === i); s.classList.toggle("is-done", k < i); if (k === i) s.setAttribute("aria-current", "step"); else s.removeAttribute("aria-current"); });
        dots.forEach((d, k) => { d.classList.toggle("is-active", k === i); d.classList.toggle("is-done", k < i); });
        if (barName) barName.textContent = b.dataset.name || "";
        if (barCount) barCount.textContent = pad(i + 1) + " / " + pad(n);
        if (numTrack) {
          if (reduced) gsap.set(numTrack, { yPercent: -i * (100 / n) });
          else gsap.to(numTrack, { yPercent: -i * (100 / n), duration: 0.9, ease: "expo.out", overwrite: true });
        }
        if (curName && curDe) {
          const apply = () => { curName.textContent = b.dataset.name || ""; curDe.textContent = b.dataset.de || ""; };
          if (reduced) { apply(); return; }
          if (swapTl) swapTl.kill();
          swapTl = gsap.timeline()
            .to([curName, curDe], { opacity: 0, y: -6, duration: 0.2, ease: "power2.in" })
            .add(apply)
            .to([curName, curDe], { opacity: 1, y: 0, duration: 0.55, stagger: 0.05, ease: "expo.out" });
        }
      };

      blocks.forEach((b, i) => ST.create({ trigger: b, start: "top 55%", end: "bottom 55%", onEnter: () => setActive(i), onEnterBack: () => setActive(i) }));
      setActive(0);

      if (progress && list) {
        if (reduced) gsap.set(progress, { scaleX: 1 });
        else gsap.fromTo(progress, { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { trigger: list, start: "top 55%", end: "bottom 55%", scrub: 0.5 } });
      }

      steps.forEach((s) => s.addEventListener("click", () => {
        const i = parseInt(s.dataset.meStep, 10);
        if (blocks[i]) PM.scrollTo(blocks[i], { offset: -(parseInt(getComputedStyle(document.documentElement).getPropertyValue("--nav-h"), 10) || 84) - 16 });
      }));
    })();

    /* ---------- d) Prinzipien: giant numerals drift at a different speed ---------- */
    (function principles() {
      const nums = document.querySelectorAll("[data-me-numeral]");
      if (!nums.length || reduced) return;
      nums.forEach((el) => {
        const card = el.closest(".me-principle") || el;
        gsap.fromTo(el, { y: 36 }, { y: -36, ease: "none", scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: true } });
      });
    })();
  }
  if (window.PM && window.PM.ready) run(); else document.addEventListener("pm:ready", run, { once: true });
})();
