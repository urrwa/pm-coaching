/* HOMEPAGE — section choreography */
(function () {
  "use strict";
  function run() {
    const PM = window.PM, gsap = window.gsap, ST = window.ScrollTrigger;
    if (!gsap || !ST) return;
    const reduced = PM.reduced;
    const desktop = () => window.matchMedia("(min-width: 1024px)").matches;

    /* ---------- Hero ---------- */
    (function hero() {
      const hero = document.querySelector("[data-hero]");
      if (!hero || reduced || window.matchMedia("(max-width: 767px)").matches) return;
      const img = hero.querySelector(".hero__picture img");
      const title = hero.querySelector("[data-hero-title]");
      const els = hero.querySelectorAll("[data-hero-el]");
      const chips = hero.querySelectorAll("[data-hero-chip]");
      const glow = hero.querySelector(".hero__glow");
      const words = PM.splitWords(title);
      gsap.set(img, { scale: 1.18, opacity: 0 });
      gsap.set(words, { yPercent: 115 });
      gsap.set(els, { opacity: 0, y: 28 });
      gsap.set(chips, { opacity: 0, y: 20, scale: 0.9 });
      const tl = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } })
        .to(img, { opacity: 1, duration: 1.6, ease: "power2.out" }, 0)
        .to(img, { scale: 1, duration: 2.6, ease: "expo.out" }, 0)
        .to(words, { yPercent: 0, duration: 1.3, stagger: 0.045 }, 0.25)
        .to(els, { opacity: 1, y: 0, duration: 1.1, stagger: 0.12 }, 0.75)
        .to(chips, { opacity: 1, y: 0, scale: 1, duration: 1, stagger: 0.12 }, 1.1);
      const play = () => tl.play();
      if (PM.revealed) play(); else document.addEventListener("pm:reveal", play, { once: true });
      // scroll parallax & fade
      gsap.to(img, { yPercent: 14, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
      gsap.to(hero.querySelector(".hero__copy"), { y: -80, opacity: 0, ease: "none", scrollTrigger: { trigger: hero, start: "40% top", end: "bottom top", scrub: true } });
      gsap.to(glow, { x: 60, y: 40, duration: 9, yoyo: true, repeat: -1, ease: "sine.inOut" });
      chips.forEach((c, i) => gsap.to(c, { y: "+=" + (8 + i * 4), duration: 3 + i * 0.6, yoyo: true, repeat: -1, ease: "sine.inOut", delay: 2 }));
    })();

    if (!reduced) {
      const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(({ target, intersectionRatio }) => {
          if (intersectionRatio < 0.6) return;
          counterObserver.unobserve(target);
          const count = Number(target.dataset.trustCount);
          const value = { current: 0 };
          gsap.to(value, {
            current: count,
            duration: 2.2,
            ease: "none",
            onUpdate: () => { target.textContent = Math.floor(value.current); },
            onComplete: () => { target.textContent = count; },
          });
        });
      }, { threshold: 0.6 });
      document.querySelectorAll("[data-trust-count]").forEach((number) => {
        number.textContent = "0";
        counterObserver.observe(number);
      });
    }

    /* ---------- Problem: image swap ---------- */
    (function problem() {
      const rows = document.querySelectorAll("[data-problem]");
      const imgs = document.querySelectorAll("[data-problem-img]");
      const cap = document.querySelector("[data-problem-caption]");
      if (!rows.length) return;
      const setActive = (id) => {
        rows.forEach((r) => r.classList.toggle("is-active", r.dataset.problem === id));
        imgs.forEach((im) => im.classList.toggle("is-active", im.dataset.problemImg === id));
        const row = Array.from(rows).find((r) => r.dataset.problem === id);
        if (cap && row) cap.textContent = row.dataset.caption || "";
      };
      setActive("1");
      rows.forEach((r) => {
        r.addEventListener("mouseenter", () => setActive(r.dataset.problem));
        r.addEventListener("focusin", () => setActive(r.dataset.problem));
        ST.create({ trigger: r, start: "top 55%", end: "bottom 55%", onEnter: () => setActive(r.dataset.problem), onEnterBack: () => setActive(r.dataset.problem) });
      });
    })();

    /* ---------- Problem: scrubbed statement ---------- */
    (function statement() {
      const el = document.querySelector("[data-statement] .problem__statement-text");
      if (!el) return;
      const words = PM.splitWords(el);
      if (reduced) { gsap.set(words, { color: "#fff" }); return; }
      gsap.to(words, { color: "#ffffff", stagger: 0.08, ease: "none", scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: 0.4 } });
    })();

    /* ---------- Audience toggle ---------- */
    (function audience() {
      const toggle = document.querySelector(".audience__toggle");
      if (!toggle) return;
      const tabs = toggle.querySelectorAll("[data-audience-tab]");
      const panels = document.querySelectorAll("[data-audience-panel]");
      const imgs = document.querySelectorAll("[data-audience-img]");
      let busy = false;
      const activate = (key) => {
        if (busy) return;
        const current = toggle.dataset.active || "yes";
        if (current === key) return;
        busy = true;
        toggle.dataset.active = key;
        tabs.forEach((t) => { const on = t.dataset.audienceTab === key; t.classList.toggle("is-active", on); t.setAttribute("aria-selected", String(on)); });
        imgs.forEach((im) => im.classList.toggle("is-active", im.dataset.audienceImg === key));
        const out = Array.from(panels).find((p) => p.dataset.audiencePanel === current);
        const inn = Array.from(panels).find((p) => p.dataset.audiencePanel === key);
        const show = () => {
          out.hidden = true; inn.hidden = false;
          if (reduced) { busy = false; return; }
          gsap.fromTo(inn.children, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.07, ease: "expo.out", onComplete: () => { busy = false; ST.refresh(); } });
        };
        if (reduced) show(); else gsap.to(out.children, { opacity: 0, y: -10, duration: 0.3, stagger: 0.03, ease: "power2.in", onComplete: show });
      };
      tabs.forEach((t) => t.addEventListener("click", () => activate(t.dataset.audienceTab)));
      toggle.addEventListener("keydown", (e) => { if (e.key === "ArrowRight") activate("no"); if (e.key === "ArrowLeft") activate("yes"); });
    })();

    /* ---------- G5: pinned horizontal journey ---------- */
    (function g5() {
      const section = document.querySelector("[data-g5]");
      if (!section) return;
      const pin = section.querySelector(".g5__pin");
      const track = section.querySelector("[data-g5-track]");
      const stages = section.querySelectorAll("[data-g5-stage]");
      const navBtns = section.querySelectorAll("[data-g5-go]");
      const nodes = section.querySelectorAll(".g5__node");
      const line = section.querySelector("[data-g5-line]");
      let active = -1;
      const setActive = (i) => {
        i = Math.max(0, Math.min(stages.length - 1, i));
        if (i === active) return; active = i;
        navBtns.forEach((b, k) => b.classList.toggle("is-active", k === i));
        nodes.forEach((n, k) => n.classList.toggle("is-active", k <= i));
      };
      setActive(0);
      let st = null;
      const build = () => {
        if (st) { st.kill(); st = null; gsap.set(track, { clearProps: "x" }); }
        if (!desktop() || reduced) {
          // vertical mode: activate by scroll position
          stages.forEach((s, i) => ST.create({ trigger: s, start: "top 60%", end: "bottom 60%", onEnter: () => setActive(i), onEnterBack: () => setActive(i) }));
          return;
        }
        const dist = () => track.scrollWidth - window.innerWidth;
        const tween = gsap.to(track, {
          x: () => -dist(), ease: "none",
          scrollTrigger: {
            trigger: pin, start: "top top", end: () => "+=" + dist(), pin: true, scrub: 0.7, anticipatePin: 1, invalidateOnRefresh: true,
            onUpdate: (self) => { setActive(Math.round(self.progress * (stages.length - 1))); if (line) line.style.strokeDashoffset = String(1000 * (1 - self.progress)); }
          }
        });
        st = tween.scrollTrigger;
        // depth: subtle scale settle per stage (no horizontal shift, so the subject framing stays exact)
        stages.forEach((s) => {
          const media = s.querySelector(".g5__stage-media img");
          gsap.fromTo(media, { scale: 1.06 }, { scale: 1, ease: "none", scrollTrigger: { trigger: s, containerAnimation: tween, start: "left right", end: "center center", scrub: true } });
        });
      };
      build();
      let mode = desktop();
      window.addEventListener("resize", () => { const d = desktop(); if (d !== mode) { mode = d; ST.getAll().forEach((t) => { if (t.trigger && section.contains(t.trigger)) t.kill(); }); build(); ST.refresh(); } });
      navBtns.forEach((b, i) => b.addEventListener("click", () => {
        if (st && desktop() && !reduced) { const y = st.start + (st.end - st.start) * (i / (stages.length - 1)); PM.scrollTo(y, { offset: 0, duration: 1.4 }); }
        else PM.scrollTo(stages[i], { offset: -90 });
      }));
    })();

    /* ---------- Final CTA: mask reveal ---------- */
    (function finalCta() {
      const sec = document.querySelector("[data-final]");
      const media = sec && sec.querySelector("[data-final-media]");
      if (!media || reduced) return;
      const img = media.querySelector("img");
      gsap.timeline({ scrollTrigger: { trigger: sec, start: "top 85%", end: "top 15%", scrub: 0.6 } })
        .to(media, { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "none" }, 0)
        .to(img, { scale: 1, ease: "none" }, 0);
      gsap.to(img, { yPercent: 8, ease: "none", scrollTrigger: { trigger: sec, start: "top bottom", end: "bottom top", scrub: true } });
    })();
  }
  if (window.PM && window.PM.ready) run(); else document.addEventListener("pm:ready", run, { once: true });
})();
