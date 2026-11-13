(() => {
  const gallery = document.querySelector("[data-er-loop]");
  const viewport = gallery.querySelector(".er-loop__viewport");
  const track = viewport.querySelector(".er-loop__track");
  const originals = Array.from(track.children);
  const repeats = originals.map((card) => {
    const copy = card.cloneNode(true);
    copy.setAttribute("data-er-repeat", "");
    return copy;
  });
  track.append(...repeats);
  const cards = [...originals, ...repeats];
  const pause = gallery.querySelector("[data-er-pause]");
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  let frame = 0, previous = null, position = 0, paused = false, visible = false;
  let step = 0, cardWidth = 0;

  function render() {
    const count = cards.length;
    cards.forEach((card, i) => {
      const slot = ((i - position + count / 2) % count + count) % count - count / 2;
      const edge = Math.min(1, Math.abs(slot) / 3.5);
      const scale = 0.84 + edge * edge * 0.58;
      const offset = slot * step;
      // Reveal the color photo only where the card has passed the viewport center.
      const split = Math.max(0, Math.min(100, 50 - offset / (cardWidth * scale) * 100));
      card.style.transform = `translate(-50%, -50%) translateX(${offset}px) perspective(680px) rotateY(${slot * -8}deg) scale(${scale})`;
      card.style.setProperty("--er-split", `${split}%`);
      card.style.opacity = Math.min(1, count / 2 - Math.abs(slot));
    });
  }

  function tick(now) {
    if (previous !== null) {
      const distance = Math.min(now - previous, 64) / 2400;
      position = (position + cards.length - distance) % cards.length;
    }
    previous = now;
    render();
    frame = requestAnimationFrame(tick);
  }

  function sync() {
    cancelAnimationFrame(frame);
    previous = null;
    const curved = !motion.matches;
    gallery.classList.toggle("is-curved", curved);
    pause.parentElement.hidden = !curved;
    if (!curved) {
      cards.forEach((card) => card.removeAttribute("style"));
      return;
    }
    cardWidth = cards[0].offsetWidth;
    step = Math.max(cardWidth * 1.24, viewport.clientWidth / 7);
    render();
    if (visible && !paused) frame = requestAnimationFrame(tick);
  }

  pause.addEventListener("click", () => {
    paused = !paused;
    pause.textContent = paused ? "Bildlauf fortsetzen" : "Bildlauf pausieren";
    sync();
  });
  motion.addEventListener("change", sync);
  new ResizeObserver(sync).observe(viewport);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  }).observe(viewport);
  sync();
})();
