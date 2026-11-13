/* HOMEPAGE — section choreography */
(function () {
  "use strict";
  /* ---------- Hero: play while the video is on screen ---------- */
  (function hero() {
    const section = document.querySelector("[data-hero]");
    const video = section?.querySelector("[data-hero-video]");
    if (!video) return;

    const button = section.querySelector("[data-hero-playback]");
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = matchMedia("(max-width: 767px)");
    let paused = motion.matches || navigator.connection?.saveData === true;
    let visible = false;
    let showResume = paused;
    let pending = false;

    function updateButton() {
      button.textContent = video.paused ? "Video abspielen" : "Video pausieren";
      button.hidden = video.paused && !showResume;
    }

    function sync() {
      if (paused || !visible || document.hidden) {
        video.pause();
        updateButton();
        return;
      }
      if (!video.paused || pending) return;
      if (!video.hasAttribute("src")) {
        video.src = mobile.matches ? video.dataset.heroVideoMobile : video.dataset.heroVideo;
      }
      pending = true;
      video.play().catch((error) => {
        if (error.name === "NotAllowedError") {
          paused = true;
          showResume = true;
        }
      }).finally(() => {
        pending = false;
        updateButton();
      });
    }

    video.addEventListener("playing", () => {
      section.classList.add("is-video-ready");
      updateButton();
    });
    video.addEventListener("pause", updateButton);
    video.addEventListener("error", () => {
      section.classList.remove("is-video-ready");
      showResume = false;
      updateButton();
    });
    button.addEventListener("click", () => {
      paused = !video.paused;
      showResume = paused;
      sync();
    });
    motion.addEventListener("change", () => {
      if (!motion.matches) return;
      paused = true;
      showResume = true;
      sync();
    });
    document.addEventListener("visibilitychange", sync);
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    }, { threshold: .15 }).observe(video);
    updateButton();
  })();

  function run() {
    const PM = window.PM, gsap = window.gsap, ST = window.ScrollTrigger;
    if (!gsap || !ST) return;
    const reduced = PM.reduced;

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
      if (!el || reduced) return;
      const words = PM.splitWords(el);
      gsap.from(words, { color: "#8793A3", stagger: 0.08, ease: "none", scrollTrigger: { trigger: el, start: "top 85%", end: "bottom 50%", scrub: 0.35 } });
    })();

    /* ---------- Audience toggle ---------- */
    (function audience() {
      const toggle = document.querySelector(".audience__toggle");
      if (!toggle) return;
      const tabs = toggle.querySelectorAll("[data-audience-tab]");
      const panels = document.querySelectorAll("[data-audience-panel]");
      const imgs = document.querySelectorAll("[data-audience-img]");
      const activate = (key) => {
        if ((toggle.dataset.active || "yes") === key) return;
        toggle.dataset.active = key;
        tabs.forEach((tab) => {
          const active = tab.dataset.audienceTab === key;
          tab.classList.toggle("is-active", active);
          tab.setAttribute("aria-selected", String(active));
          tab.tabIndex = active ? 0 : -1;
        });
        imgs.forEach((img) => img.classList.toggle("is-active", img.dataset.audienceImg === key));
        panels.forEach((panel) => {
          const active = panel.dataset.audiencePanel === key;
          gsap.killTweensOf(panel.children);
          panel.hidden = !active;
          if (active && !reduced) {
            gsap.fromTo(panel.children, { opacity: 0, y: 10 }, {
              opacity: 1, y: 0, duration: 0.5, stagger: 0.055, ease: "power2.out", clearProps: "opacity,transform",
            });
          }
        });
        ST.refresh();
      };
      tabs.forEach((tab) => tab.addEventListener("click", () => activate(tab.dataset.audienceTab)));
      toggle.addEventListener("keydown", (e) => {
        if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)) return;
        e.preventDefault();
        const key = e.key === "Home" ? "yes" : e.key === "End" ? "no" : toggle.dataset.active === "no" ? "yes" : "no";
        activate(key);
        toggle.querySelector('[aria-selected="true"]').focus();
      });
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
      let pinned = null;
      const setActive = (index) => {
        if (index === active) return;
        active = index;
        navBtns.forEach((button, i) => {
          button.classList.toggle("is-active", i === index);
          if (i === index) button.setAttribute("aria-current", "step");
          else button.removeAttribute("aria-current");
        });
        nodes.forEach((node, i) => node.classList.toggle("is-active", i <= index));
      };
      setActive(0);
      gsap.matchMedia().add({
        horizontal: "(min-width: 1024px) and (min-height: 540px) and (prefers-reduced-motion: no-preference)",
        vertical: "(width < 1024px), (height < 540px), (prefers-reduced-motion: reduce)",
      }, ({ conditions }) => {
        if (!conditions.horizontal) {
          stages.forEach((stage, i) => ST.create({
            trigger: stage, start: "top 60%", end: "bottom 60%",
            onEnter: () => setActive(i), onEnterBack: () => setActive(i),
          }));
          return;
        }
        section.classList.add("is-horizontal");
        const distance = () => track.clientWidth * (stages.length - 1);
        const tween = gsap.to(track, {
          x: () => -distance(), ease: "none",
          onUpdate() {
            const progress = this.progress();
            setActive(Math.round(progress * (stages.length - 1)));
            line.style.strokeDashoffset = String(1000 * (1 - progress));
          },
          scrollTrigger: {
            trigger: pin, start: "top top", end: () => "+=" + distance(),
            pin: true, scrub: 0.5, anticipatePin: 1, invalidateOnRefresh: true,
          },
        });
        pinned = tween.scrollTrigger;
        return () => {
          pinned = null;
          section.classList.remove("is-horizontal");
          line.style.removeProperty("stroke-dashoffset");
        };
      });
      navBtns.forEach((button, i) => button.addEventListener("click", () => {
        if (pinned) {
          const target = pinned.start + (pinned.end - pinned.start) * i / (stages.length - 1);
          if (PM.lenis) PM.scrollTo(target, { offset: 0, duration: 1.1 });
          else window.scrollTo({ top: target, behavior: "smooth" });
        } else {
          setActive(i);
          PM.scrollTo(stages[i], { offset: -90 });
        }
      }));
    })();

    /* ---------- Process: pinned step transitions ---------- */
    (function process() {
      const section = document.getElementById("ablauf");
      if (!section) return;
      const scroll = section.querySelector(".process__scroll");
      const stage = section.querySelector(".process__stage");
      const status = section.querySelector(".process__status");
      const current = status.querySelector("[data-process-current]");
      const total = status.querySelector("[data-process-total]");
      const cards = [...stage.querySelectorAll(".pcard")];
      const format = (number) => String(number).padStart(2, "0");

      gsap.matchMedia().add("(prefers-reduced-motion: no-preference) and (min-height: 570px)", () => {
        let active = -1;
        function render(progress) {
          const phase = Math.max(.5, Math.min(cards.length - .5, progress * cards.length));
          const step = Math.floor(phase);
          cards.forEach((card, index) => {
            const offset = index + .5 - phase;
            const blend = Math.max(0, Math.min(1, (Math.abs(offset) - .32) / .36));
            const fade = blend * blend * (3 - 2 * blend);
            card.style.setProperty("--process-opacity", String(1 - fade));
            card.style.setProperty("--process-shift", `${Math.sign(offset) * fade * 22}px`);
          });
          if (active === step) return;
          cards[active]?.classList.remove("is-current");
          cards[step].classList.add("is-current");
          current.textContent = format(step + 1);
          active = step;
        }

        section.classList.add("is-scroll-driven");
        scroll.style.setProperty("--process-steps", cards.length);
        total.textContent = format(cards.length);
        status.hidden = false;
        render(0);
        ST.create({
          trigger: scroll,
          start: () => `top ${getComputedStyle(stage).top}`,
          end: () => `+=${scroll.offsetHeight - stage.offsetHeight}`,
          onUpdate: ({ progress }) => render(progress),
          onRefresh: ({ progress }) => render(progress),
        });

        return () => {
          section.classList.remove("is-scroll-driven");
          status.hidden = true;
          scroll.style.removeProperty("--process-steps");
          cards.forEach((card) => {
            card.classList.remove("is-current");
            card.style.removeProperty("--process-opacity");
            card.style.removeProperty("--process-shift");
          });
        };
      });
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
