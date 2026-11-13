/* =====================================================================
   PM COACHING — shared motion system & behaviours
   Depends on: gsap, ScrollTrigger, Lenis (loaded via CDN, deferred)
   Page scripts listen for `pm:ready` (DOM + libs ready) and `pm:reveal` (veil lifted).
   ===================================================================== */
(function () {
  "use strict";

  const html = document.documentElement;
  const C = window.PM_CONFIG || {};
  const reduced = html.classList.contains("reduced-motion");
  const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  const PM = (window.PM = { reduced, isTouch, ready: false, revealed: false, lenis: null });

  // ---------- Wait for libs ----------
  function libsReady() { return !!(window.gsap && window.ScrollTrigger); }
  function whenReady(cb) {
    if (libsReady()) return cb();
    let tries = 0;
    const t = setInterval(() => { if (libsReady() || ++tries > 200) { clearInterval(t); cb(); } }, 25);
  }

  // ---------- Config-driven links ----------
  function applyConfig() {
    const map = {
      email: C.contactEmail ? "mailto:" + C.contactEmail : "",
      whatsapp: C.whatsapp ? "https://wa.me/" + String(C.whatsapp).replace(/[^0-9]/g, "") : "",
      instagram: C.instagram || "",
      youtube: C.youtube || "",
      booking: C.bookingUrl || ""
    };
    Object.keys(map).forEach((k) => {
      document.querySelectorAll("[data-href-" + k + "]").forEach((a) => { if (map[k]) a.setAttribute("href", map[k]); });
    });
    document.querySelectorAll("[data-requires]").forEach((el) => {
      const keys = el.dataset.requires.split("|");
      const ok = keys.some((k) => !!map[k.trim()]);
      el.hidden = !ok;
    });
    document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
    document.querySelectorAll("[data-email-text]").forEach((el) => { if (C.contactEmail) el.textContent = C.contactEmail; });

    // Analytics (only if configured)
    if (C.analytics && C.analytics.plausibleDomain) {
      const s = document.createElement("script"); s.defer = true; s.dataset.domain = C.analytics.plausibleDomain; s.src = "https://plausible.io/js/script.js"; document.head.appendChild(s);
    } else if (C.analytics && C.analytics.gtagId) {
      const s = document.createElement("script"); s.async = true; s.src = "https://www.googletagmanager.com/gtag/js?id=" + C.analytics.gtagId; document.head.appendChild(s);
      window.dataLayer = window.dataLayer || []; window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag("js", new Date()); window.gtag("config", C.analytics.gtagId, { anonymize_ip: true });
    }

    // Source tracking: remember first-touch attribution for the Performance Check
    try {
      if (!sessionStorage.getItem("pm_attribution")) {
        const q = new URLSearchParams(location.search);
        const att = {
          landing: location.pathname, referrer: document.referrer || "", ts: new Date().toISOString(),
          utm_source: q.get("utm_source") || "", utm_medium: q.get("utm_medium") || "", utm_campaign: q.get("utm_campaign") || "",
          utm_content: q.get("utm_content") || "", utm_term: q.get("utm_term") || ""
        };
        sessionStorage.setItem("pm_attribution", JSON.stringify(att));
      }
    } catch (e) { /* storage unavailable */ }
  }

  // ---------- Text splitting ----------
  function splitWords(el) {
    if (el.dataset.split) return el.querySelectorAll(".w");
    const walk = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === 3) {
          const parts = child.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach((p) => {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(" ")); return; }
            const mask = document.createElement("span"); mask.className = "w-mask";
            const w = document.createElement("span"); w.className = "w"; w.textContent = p;
            mask.appendChild(w); frag.appendChild(mask);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1 && child.tagName !== "BR" && !child.classList.contains("w-mask")) {
          walk(child);
        }
      });
    };
    walk(el);
    el.dataset.split = "1";
    return el.querySelectorAll(".w");
  }
  PM.splitWords = splitWords;

  // ---------- Smooth scroll ----------
  function setupLenis() {
    if (reduced || !window.Lenis) return null;
    const lenis = new window.Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.95 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    PM.lenis = lenis;
    return lenis;
  }
  PM.scrollTo = function (target, opts) {
    const o = Object.assign({ offset: -20 }, opts || {});
    if (PM.lenis) PM.lenis.scrollTo(target, o);
    else { const el = typeof target === "string" ? document.querySelector(target) : target; if (el) el.scrollIntoView({ behavior: reduced ? "auto" : "smooth" }); }
  };

  // ---------- Page veil: intro + transitions ----------
  function setupVeil() {
    const veil = document.querySelector(".page-veil");
    const mark = veil && veil.querySelector(".page-veil__mark");
    const lift = () => {
      PM.revealed = true;
      document.dispatchEvent(new CustomEvent("pm:reveal"));
      if (!veil) return;
      if (reduced) { veil.classList.add("is-done"); return; }
      gsap.timeline()
        .to(mark, { opacity: 0, y: -10, duration: 0.3, ease: "power2.in" }, 0)
        .to(veil, { scaleY: 0, transformOrigin: "top", duration: 0.9, ease: "expo.inOut" }, 0.05)
        .add(() => veil.classList.add("is-done"));
    };
    let firstVisit = false;
    try { firstVisit = !sessionStorage.getItem("pm_seen"); sessionStorage.setItem("pm_seen", "1"); } catch (e) {}
    if (reduced || !veil) { lift(); }
    else if (firstVisit) {
      gsap.timeline()
        .fromTo(mark, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.6, ease: "expo.out" })
        .add(lift, "+=0.35");
    } else {
      gsap.set(mark, { opacity: 0 });
      setTimeout(lift, 60);
    }
    window.addEventListener("pageshow", (e) => { if (e.persisted && veil) { gsap.set(veil, { scaleY: 0 }); veil.classList.add("is-done"); } });

    // Transitions on internal links
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a) return;
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.target && a.target !== "_self") return;
      if (a.hasAttribute("download") || a.getAttribute("href").startsWith("#")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.hash) return;
      if (url.protocol === "mailto:" || url.protocol === "tel:") return;
      e.preventDefault();
      if (reduced || !veil) { location.href = url.href; return; }
      closeMenu(true);
      veil.classList.remove("is-done");
      gsap.timeline({ onComplete: () => (location.href = url.href) })
        .fromTo(veil, { scaleY: 0, transformOrigin: "bottom" }, { scaleY: 1, duration: 0.7, ease: "expo.inOut" })
        .to(mark, { opacity: 1, y: 0, duration: 0.3 }, "-=0.25");
    });
  }

  // ---------- Navigation ----------
  let menuOpen = false, menuTl = null;
  function closeMenu(instant) {
    if (!menuOpen) return;
    menuOpen = false;
    const menu = document.querySelector("[data-menu]"), burger = document.querySelector("[data-menu-toggle]");
    burger && burger.setAttribute("aria-expanded", "false");
    burger && burger.setAttribute("aria-label", "Menü öffnen");
    burger && (burger.querySelector(".nav__burger-text").textContent = "Menü");
    if (menu.contains(document.activeElement)) burger?.focus();
    menu.querySelector(".menu__video")?.pause();
    menu.inert = true;
    menu.setAttribute("aria-hidden", "true");
    if (instant || reduced || !menuTl || menuTl.progress() === 0) {
      menuTl?.pause(0);
      menu.classList.remove("is-open");
      document.body.classList.remove("menu-open");
      return;
    }
    menuTl.timeScale(1.15).reverse();
  }
  function setupNav() {
    const nav = document.getElementById("nav");
    const menu = document.querySelector("[data-menu]");
    const burger = document.querySelector("[data-menu-toggle]");
    if (!nav) return;

    // topbar hide + nav shift on scroll
    const topbar = document.getElementById("topbar");
    let lastY = window.scrollY;
    const TOPBAR_THRESHOLD = 60;
    const onScroll = () => {
      const y = window.scrollY;
      // hide topbar after scrolling past threshold
      if (topbar) {
        const hide = y > TOPBAR_THRESHOLD;
        topbar.classList.toggle("topbar--scrolled", hide);
        nav.classList.toggle("nav--topbar-hidden", hide);
      }
      nav.classList.toggle("nav--solid", y > 40);
      if (!menuOpen) nav.classList.toggle("nav--hidden", y > lastY && y > 300 && y - lastY > 2);
      lastY = y;
    };
    if (PM.lenis) PM.lenis.on("scroll", onScroll); else window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // adaptive theme: pick up the theme of the section under the nav
    const sections = Array.from(document.querySelectorAll("main [data-theme], footer[data-theme]"));
    sections.forEach((sec) => {
      ScrollTrigger.create({
        trigger: sec, start: "top 44px", end: "bottom 44px",
        onToggle: (self) => { if (self.isActive) nav.setAttribute("data-theme", sec.getAttribute("data-theme") === "dark" ? "dark" : "light"); }
      });
    });

    // menu
    if (menu && burger) {
      const links = menu.querySelectorAll(".menu__nav a");
      const label = burger.querySelector(".nav__burger-text");
      const video = menu.querySelector("[data-menu-video]");
      menu.inert = true;
      menuTl = gsap.timeline({ paused: true, onReverseComplete: () => {
        menu.classList.remove("is-open");
        document.body.classList.remove("menu-open");
      } })
        .fromTo(menu, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 0.55, ease: "power3.inOut" })
        .fromTo(links, { y: -10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.38, ease: "power2.out", stagger: 0.028 }, 0.21);
      const open = () => {
        menuOpen = true;
        menu.inert = false;
        menu.classList.add("is-open");
        menu.setAttribute("aria-hidden", "false");
        document.body.classList.add("menu-open");
        nav.classList.remove("nav--hidden");
        burger.setAttribute("aria-expanded", "true");
        burger.setAttribute("aria-label", "Menü schließen");
        label.textContent = "Schließen";
        if (reduced) menuTl.progress(1).pause();
        else menuTl.timeScale(1).play();
        if (video && !reduced && window.matchMedia("(min-width: 1024px)").matches) {
          if (!video.getAttribute("src")) video.src = video.dataset.menuVideo;
          video.play().catch(() => {});
        }
        links[0]?.focus({ preventScroll: true });
      };
      burger.addEventListener("click", () => (menuOpen ? closeMenu() : open()));
      document.addEventListener("keydown", (e) => { if (e.key === "Escape" && menuOpen) closeMenu(); });
      document.addEventListener("click", (e) => {
        if (menuOpen && !menu.contains(e.target) && !burger.contains(e.target)) closeMenu();
      });

    }

    // smooth anchors
    document.addEventListener("click", (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      closeMenu();
      PM.scrollTo(target, { offset: -70 });
      history.pushState(null, "", id);
    });
  }

  // ---------- Reveal system ----------
  function setupReveals() {
    const els = document.querySelectorAll("[data-reveal]");
    els.forEach((el) => {
      if (el.closest("[data-hero]")) { el.classList.add("is-revealed"); return; } // hero handled by page script
      const type = el.dataset.reveal || "up";
      const delay = parseFloat(el.dataset.delay || "0");
      const start = el.dataset.start || "top 88%";
      if (reduced) { el.classList.add("is-revealed"); return; }
      let tween;
      switch (type) {
        case "words": {
          const words = splitWords(el);
          tween = gsap.from(words, { yPercent: 115, duration: 1.1, ease: "expo.out", stagger: { each: 0.03, from: "start" }, delay, paused: true });
          break;
        }
        case "chars-fade":
        case "fade": tween = gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 1.2, ease: "power2.out", delay, paused: true }); break;
        case "clip": tween = gsap.to(el, { clipPath: "inset(0 0 0% 0)", duration: 1.3, ease: "expo.inOut", delay, paused: true }); break;
        case "clip-left": tween = gsap.to(el, { clipPath: "inset(0 0% 0 0)", duration: 1.3, ease: "expo.inOut", delay, paused: true }); break;
        case "scale": tween = gsap.fromTo(el, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 1.2, ease: "expo.out", delay, paused: true }); break;
        case "left": tween = gsap.fromTo(el, { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 1.1, ease: "expo.out", delay, paused: true }); break;
        case "right": tween = gsap.fromTo(el, { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 1.1, ease: "expo.out", delay, paused: true }); break;
        case "line": tween = gsap.fromTo(el, { scaleX: 0, transformOrigin: "left" }, { scaleX: 1, opacity: 1, duration: 1.2, ease: "expo.inOut", delay, paused: true }); break;
        default: tween = gsap.fromTo(el, { opacity: 0, y: 48 }, { opacity: 1, y: 0, duration: 1.1, ease: "expo.out", delay, paused: true });
      }
      ScrollTrigger.create({ trigger: el, start, once: true, onEnter: () => { el.classList.add("is-revealed"); tween.play(); } });
    });

    // staggered children
    document.querySelectorAll("[data-reveal-children]").forEach((parent) => {
      const kids = Array.from(parent.children);
      if (reduced) { parent.classList.add("is-revealed"); return; }
      const type = parent.dataset.revealChildren || "up";
      const stagger = parseFloat(parent.dataset.stagger || "0.09");
      const from = type === "scale" ? { opacity: 0, scale: 0.94 } : { opacity: 0, y: 40 };
      gsap.set(kids, from);
      ScrollTrigger.create({
        trigger: parent, start: parent.dataset.start || "top 85%", once: true,
        onEnter: () => { parent.classList.add("is-revealed"); gsap.to(kids, { opacity: 1, y: 0, scale: 1, duration: 1, ease: "expo.out", stagger }); }
      });
    });

    // parallax
    if (!reduced) {
      document.querySelectorAll("[data-parallax]").forEach((el) => {
        const amt = parseFloat(el.dataset.parallax || "0.15");
        const target = el.querySelector("img, video") || el;
        gsap.fromTo(target, { yPercent: -amt * 50 }, { yPercent: amt * 50, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
      });
      document.querySelectorAll("[data-speed]").forEach((el) => {
        const s = parseFloat(el.dataset.speed || "0.5");
        gsap.to(el, { y: () => (1 - s) * -200, ease: "none", scrollTrigger: { trigger: el.closest("section") || el, start: "top bottom", end: "bottom top", scrub: true } });
      });
    }

    // counters (only for verified values placed in markup)
    document.querySelectorAll("[data-count]").forEach((el) => {
      const end = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || "";
      if (reduced) { el.textContent = end + suffix; return; }
      const obj = { v: 0 };
      ScrollTrigger.create({ trigger: el, start: "top 90%", once: true, onEnter: () => gsap.to(obj, { v: end, duration: 1.6, ease: "expo.out", onUpdate: () => (el.textContent = Math.round(obj.v) + suffix) }) });
    });
  }

  // ---------- Magnetic buttons ----------
  function setupMagnetic() {
    if (isTouch || reduced) return;
    document.querySelectorAll("[data-magnetic]").forEach((el) => {
      const strength = parseFloat(el.dataset.magnetic) || 0.35;
      const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "expo.out" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "expo.out" });
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * strength);
        yTo((e.clientY - (r.top + r.height / 2)) * strength);
      });
      el.addEventListener("mouseleave", () => { xTo(0); yTo(0); });
    });
  }

  // ---------- Cursor ----------
  function setupCursor() {
    const cur = document.querySelector(".cursor");
    if (!cur || isTouch || reduced) { cur && cur.remove(); return; }
    const dot = cur.querySelector(".cursor__dot"), ring = cur.querySelector(".cursor__ring");
    const label = document.createElement("span"); label.className = "cursor__label"; ring.appendChild(label);
    const dx = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3.out" }), dy = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3.out" });
    const rx = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3.out" }), ry = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3.out" });
    let shown = false;
    window.addEventListener("mousemove", (e) => {
      if (!shown) { gsap.set([dot, ring], { x: e.clientX, y: e.clientY }); shown = true; }
      dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
      const t = e.target.closest("a, button, [data-cursor], input, select, textarea, label");
      cur.classList.toggle("is-link", !!t && !(t.dataset && t.dataset.cursor === "drag"));
      const drag = e.target.closest('[data-cursor="drag"]');
      cur.classList.toggle("is-drag", !!drag);
      label.textContent = drag ? (drag.dataset.cursorLabel || "Drag") : "";
    });
    document.addEventListener("mouseleave", () => cur.classList.add("is-hidden"));
    document.addEventListener("mouseenter", () => cur.classList.remove("is-hidden"));
  }

  // ---------- Accordion ----------
  function setupAccordions() {
    document.querySelectorAll(".accordion").forEach((acc) => {
      const single = acc.dataset.single !== "false";
      const items = acc.querySelectorAll(".accordion__item");
      items.forEach((item, i) => {
        const btn = item.querySelector(".accordion__trigger"), panel = item.querySelector(".accordion__panel");
        if (!btn || !panel) return;
        const id = panel.id || ("acc-" + Math.random().toString(36).slice(2, 8));
        panel.id = id; btn.setAttribute("aria-controls", id); btn.setAttribute("aria-expanded", "false");
        const toggle = (openIt) => {
          item.classList.toggle("is-open", openIt);
          btn.setAttribute("aria-expanded", String(openIt));
          if (reduced) { panel.style.height = openIt ? "auto" : "0px"; return; }
          if (openIt) gsap.fromTo(panel, { height: 0 }, { height: "auto", duration: 0.7, ease: "expo.out", onComplete: () => ScrollTrigger.refresh() });
          else gsap.to(panel, { height: 0, duration: 0.5, ease: "expo.inOut", onComplete: () => ScrollTrigger.refresh() });
        };
        btn.addEventListener("click", () => {
          const isOpen = item.classList.contains("is-open");
          if (single) items.forEach((o) => { if (o !== item && o.classList.contains("is-open")) { o.classList.remove("is-open"); o.querySelector(".accordion__trigger").setAttribute("aria-expanded", "false"); gsap.to(o.querySelector(".accordion__panel"), { height: 0, duration: 0.5, ease: "expo.inOut" }); } });
          toggle(!isOpen);
        });
        if (item.dataset.open === "true") { item.classList.add("is-open"); btn.setAttribute("aria-expanded", "true"); panel.style.height = "auto"; }
      });
    });
  }

  // ---------- Marquee ----------
  function setupMarquees() {
    document.querySelectorAll(".marquee").forEach((m) => {
      const track = m.querySelector(".marquee__track");
      if (!track) return;
      const minW = m.clientWidth * 1.1;
      let guard = 0;
      while (track.scrollWidth < minW && guard++ < 6) Array.from(track.children).forEach((c) => track.appendChild(c.cloneNode(true)));
      const clone = track.cloneNode(true); clone.setAttribute("aria-hidden", "true"); m.appendChild(clone);
    });
  }

  // ---------- Videos ----------
  function setupVideos() {
    const vids = document.querySelectorAll("video[data-autoplay]");
    if (!vids.length) return;
    if (reduced) { vids.forEach((v) => { v.removeAttribute("autoplay"); v.pause(); }); return; }
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      const v = en.target;
      if (en.isIntersecting) { const p = v.play(); if (p && p.catch) p.catch(() => {}); } else v.pause();
    }), { rootMargin: "100px" });
    vids.forEach((v) => { v.muted = true; v.playsInline = true; v.loop = true; io.observe(v); });
  }

  // ---------- Footer wordmark ----------
  function setupFooter() {
    const w = document.querySelector("[data-footer-word]");
    if (!w || reduced) return;
    gsap.fromTo(w, { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: w, start: "top 95%", once: true } });
  }

  // ---------- Boot ----------
  function init() {
    gsap.registerPlugin(ScrollTrigger);
    gsap.defaults({ ease: "expo.out" });
    applyConfig();
    setupLenis();
    setupNav();
    setupMarquees();
    setupReveals();
    setupMagnetic();
    setupCursor();
    setupAccordions();
    setupVideos();
    setupFooter();
    PM.ready = true;
    html.classList.add("is-ready");
    document.dispatchEvent(new CustomEvent("pm:ready"));
    setupVeil();
    // refresh after fonts/images settle
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
    window.addEventListener("load", () => ScrollTrigger.refresh());
  }

  function start() {
    whenReady(() => {
      if (!window.gsap || !window.ScrollTrigger) {
        // Graceful degradation: libraries missing → show everything, lift the veil, keep the site usable.
        document.querySelectorAll("[data-reveal], [data-reveal-children]").forEach((el) => el.classList.add("is-revealed"));
        const veil = document.querySelector(".page-veil"); if (veil) veil.classList.add("is-done");
        html.classList.add("is-ready", "reduced-motion");
        applyConfig();
        PM.ready = true; PM.revealed = true;
        document.dispatchEvent(new CustomEvent("pm:ready"));
        document.dispatchEvent(new CustomEvent("pm:reveal"));
        return;
      }
      init();
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
