/* ÜBER — page choreography */
(function () {
  "use strict";
  function run() {
    const PM = window.PM, gsap = window.gsap, ST = window.ScrollTrigger;
    if (!gsap || !ST) return;
    const reduced = PM.reduced;

    /* ---------- Hero: training reel opens into a media collage ---------- */
    (function hero() {
      const section = document.querySelector("[data-ab-hero]");
      if (!section) return;
      const reel = section.querySelector(".ab-hero__reel");
      const stage = section.querySelector(".ab-hero__stage");
      const feature = section.querySelector("[data-ab-feature]");
      const tiles = [...section.querySelectorAll("[data-ab-reveal]")];
      const captions = feature.querySelectorAll("[data-ab-caption]");
      const videos = [...section.querySelectorAll("[data-ab-video]")];
      const button = section.querySelector("[data-ab-playback]");
      const motion = matchMedia("(prefers-reduced-motion: reduce)");
      const visible = new Set();
      let paused = motion.matches;
      let collageVisible = true;

      function syncVideos() {
        button.textContent = paused ? "Videos abspielen" : "Videos pausieren";
        videos.forEach((video) => {
          const canPlay = !paused && !document.hidden && visible.has(video) && (collageVisible || feature.contains(video));
          if (!canPlay) {
            video.pause();
            return;
          }
          if (!video.hasAttribute("src")) video.src = video.dataset.abVideo;
          if (video.paused) video.play().catch(() => {});
        });
      }

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(({ target, isIntersecting }) => {
          if (isIntersecting) visible.add(target);
          else visible.delete(target);
        });
        syncVideos();
      }, { threshold: .18 });
      videos.forEach((video) => observer.observe(video));
      button.addEventListener("click", () => { paused = !paused; syncVideos(); });
      motion.addEventListener("change", () => { paused = motion.matches; syncVideos(); });
      document.addEventListener("visibilitychange", syncVideos);
      syncVideos();
      button.hidden = false;

      gsap.matchMedia().add("(prefers-reduced-motion: no-preference) and (min-height: 540px)", () => {
        section.classList.add("is-animated");
        collageVisible = false;
        syncVideos();
        const featureWidth = () => Math.min(stage.clientWidth * .88, stage.clientHeight * .67, 570);
        const openingOffset = () => stage.clientWidth < 768 ? -Math.max(0, (stage.clientHeight - featureWidth() * 1.22) / 2 - 52) : 0;
        gsap.timeline({
          scrollTrigger: {
            trigger: reel,
            start: () => `top ${getComputedStyle(stage).top}`,
            end: () => `+=${reel.offsetHeight - stage.offsetHeight}`,
            scrub: true,
            invalidateOnRefresh: true,
            onUpdate({ progress }) {
              const showCollage = progress > .59;
              if (showCollage === collageVisible) return;
              collageVisible = showCollage;
              syncVideos();
            },
          },
        })
          .fromTo(feature, {
            width: featureWidth,
            height: () => featureWidth() * 1.22,
            marginTop: openingOffset,
          }, {
            width: "100%", height: "100%", marginTop: 0,
            duration: .49, ease: "power2.inOut",
          }, .34)
          .fromTo(captions[0], { opacity: 1, y: 0 }, { opacity: 0, y: -14, duration: .15 }, .15)
          .fromTo(captions[1], { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .17 }, .24)
          .fromTo(tiles, { opacity: 0, scale: .72, y: 32 }, {
            opacity: 1, scale: 1, y: 0, duration: .26, ease: "power2.out",
            stagger: { amount: .25, from: "center" },
          }, .49);

        return () => {
          section.classList.remove("is-animated");
          collageVisible = true;
          syncVideos();
        };
      });
    })();

    /* ---------- Manifest: readable blue text brightens as it scrolls into view ---------- */
    (function manifest() {
      if (reduced) return;
      const manifest = document.querySelector("[data-ab-manifest]");
      if (!manifest) return;
      const blue = getComputedStyle(manifest).getPropertyValue("--blue-200").trim();
      manifest.querySelectorAll("[data-ab-line]").forEach((line) => {
        const words = PM.splitWords(line);
        gsap.from(words, { color: blue, stagger: 0.06, ease: "none", scrollTrigger: { trigger: line, start: "top 75%", end: "bottom 45%", scrub: 0.4 } });
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
