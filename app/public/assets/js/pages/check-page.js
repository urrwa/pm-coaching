/* PERFORMANCE-CHECK PAGE — jump-to-check, floating chips, timeline drawing */
(function () {
  "use strict";
  function run() {
    const PM = window.PM, gsap = window.gsap, ST = window.ScrollTrigger;
    if (!gsap || !ST) return;
    const reduced = PM.reduced;
    const stage = document.querySelector("[data-cp-stage]");

    /* ---------- Jump to the check (#start / #check hash or [data-check-jump] links) ---------- */
    (function jumpToCheck() {
      if (!stage) return;
      const navH = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) || 84;
      const jump = () => {
        PM.scrollTo(stage, { offset: -(navH() + 16) });
        const shell = stage.querySelector(".check__shell");
        if (shell) setTimeout(() => shell.focus({ preventScroll: true }), reduced ? 0 : 900);
      };
      if (/^#(start|check|performance-check)$/.test(location.hash)) {
        const go = () => setTimeout(jump, 80);
        if (PM.revealed) go(); else document.addEventListener("pm:reveal", go, { once: true });
      }
      document.addEventListener("click", (e) => {
        const a = e.target.closest("[data-check-jump]");
        if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        jump();
        try { history.replaceState(null, "", "#check"); } catch (err) {}
      });
    })();

    /* ---------- Atmosphere: drifting glow + floating chips ---------- */
    (function atmosphere() {
      if (reduced) return;
      const glow = document.querySelector("[data-cp-glow]");
      if (glow) gsap.to(glow, { x: 50, y: 36, duration: 9, yoyo: true, repeat: -1, ease: "sine.inOut" });
      document.querySelectorAll("[data-cp-chip]").forEach((chip, i) => {
        gsap.fromTo(chip, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 1, ease: "expo.out", delay: 0.4 + i * 0.12, scrollTrigger: { trigger: chip, start: "top 95%", once: true } });
        gsap.to(chip, { y: "+=" + (7 + i * 3), duration: 3.2 + i * 0.5, yoyo: true, repeat: -1, ease: "sine.inOut", delay: 1.6 + i * 0.3 });
      });
    })();

    /* ---------- "Was danach passiert": line draws on scroll, nodes light up ---------- */
    (function timeline() {
      const list = document.querySelector("[data-cp-timeline]");
      if (!list) return;
      const steps = Array.from(list.querySelectorAll("[data-cp-step]"));
      const nodes = steps.map((s) => s.querySelector("[data-cp-node]"));
      const fills = Array.from(list.querySelectorAll("[data-cp-fill]"));
      if (reduced) { steps.forEach((s) => s.classList.add("is-active")); return; }

      const mm = gsap.matchMedia();
      mm.add({ desktop: "(min-width: 900px)", mobile: "(max-width: 899px)" }, (ctx) => {
        const desktop = ctx.conditions.desktop;
        const prop = desktop ? "scaleX" : "scaleY";
        gsap.set(fills, { scaleX: 1, scaleY: 1, [prop]: 0, transformOrigin: desktop ? "left center" : "center top" });
        gsap.set(nodes, { clearProps: "all" });

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: list, start: "top 72%", end: desktop ? "top 28%" : "bottom 68%", scrub: 0.6 }
        });
        const active = { backgroundColor: "#2764E8", borderColor: "#2764E8", color: "#FFFFFF", boxShadow: "0 0 0 8px rgba(39,100,232,.16)", duration: 0.25 };
        steps.forEach((step, i) => {
          tl.to(nodes[i], active, i === 0 ? 0 : ">");
          if (fills[i]) tl.to(fills[i], { [prop]: 1, duration: 1 }, ">");
        });
        return () => { tl.scrollTrigger && tl.scrollTrigger.kill(); tl.kill(); };
      });
    })();
  }
  if (window.PM && window.PM.ready) run(); else document.addEventListener("pm:ready", run, { once: true });
})();
