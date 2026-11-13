/* FAQ — sticky category nav with scroll-spy marker */
(function () {
  "use strict";
  function run() {
    const PM = window.PM, gsap = window.gsap, ST = window.ScrollTrigger;
    if (!gsap || !ST) return;
    const reduced = PM.reduced;
    const root = document.querySelector("[data-fq]");
    if (!root) return;
    const links = Array.from(root.querySelectorAll("[data-fq-link]"));
    const groups = Array.from(root.querySelectorAll("[data-fq-group]"));
    const marker = root.querySelector("[data-fq-marker]");
    const list = root.querySelector("[data-fq-nav]");
    const desktop = () => window.matchMedia("(min-width: 1024px)").matches;
    if (!links.length || !groups.length) return;

    let activeId = null;
    const moveMarker = (link) => {
      if (!marker || !desktop() || !link) return;
      const lr = link.getBoundingClientRect(), nr = marker.parentElement.getBoundingClientRect();
      const y = lr.top - nr.top;
      if (reduced) { marker.style.transform = "translateY(" + y + "px)"; marker.style.height = lr.height + "px"; return; }
      gsap.to(marker, { y, height: lr.height, duration: 0.6, ease: "expo.out" });
    };
    const setActive = (id) => {
      if (id === activeId) return; activeId = id;
      let active = null;
      links.forEach((a) => { const on = a.dataset.fqLink === id; a.classList.toggle("is-active", on); if (on) { active = a; a.setAttribute("aria-current", "true"); } else a.removeAttribute("aria-current"); });
      moveMarker(active);
      // keep the active chip visible in the horizontal strip on mobile
      if (active && list && !desktop()) {
        const lr = active.getBoundingClientRect(), sr = list.getBoundingClientRect();
        if (lr.left < sr.left || lr.right > sr.right) list.scrollTo({ left: active.offsetLeft - 16, behavior: reduced ? "auto" : "smooth" });
      }
    };

    groups.forEach((g) => {
      ST.create({
        trigger: g, start: "top 45%", end: "bottom 45%",
        onEnter: () => setActive(g.dataset.fqGroup), onEnterBack: () => setActive(g.dataset.fqGroup)
      });
    });
    // initial state: first group (or hash target)
    const hash = location.hash.replace("#", "");
    setActive(groups.some((g) => g.dataset.fqGroup === hash) ? hash : groups[0].dataset.fqGroup);
    ST.addEventListener("refresh", () => moveMarker(links.find((a) => a.classList.contains("is-active"))));
    window.addEventListener("resize", () => moveMarker(links.find((a) => a.classList.contains("is-active"))));

    // click: smooth scroll handled by main.js anchors; just set active immediately for snappier feedback
    links.forEach((a) => a.addEventListener("click", () => setActive(a.dataset.fqLink)));

    // Hash deep-link: open the group's first question so the answer is visible
    if (hash) {
      const g = groups.find((x) => x.dataset.fqGroup === hash);
      const first = g && g.querySelector(".accordion__trigger");
      if (first && first.getAttribute("aria-expanded") !== "true") setTimeout(() => first.click(), 400);
    }
  }
  if (window.PM && window.PM.ready) run(); else document.addEventListener("pm:ready", run, { once: true });
})();
